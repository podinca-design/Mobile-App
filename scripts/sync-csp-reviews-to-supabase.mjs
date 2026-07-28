import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { coverage as seedCoverage, sessions as seedSessions, snapshots as seedSnapshots } from "./csp-review-mirror-seed.mjs";

const SPREADSHEET_ID = "18gZYtjiHoGEqZnpFUW4e5aGxIhibR1WUGQhFFO9XmRA";
function readEnv(filePath) {
  return Object.fromEntries(
    fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
      })
  );
}

async function googleAccessToken() {
  const credentials = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".clasprc.json"), "utf8")).tokens.default;
  if (credentials.access_token && Number(credentials.expiry_date || 0) > Date.now() + 60_000) return credentials.access_token;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      refresh_token: credentials.refresh_token,
      grant_type: "refresh_token"
    })
  });
  if (!response.ok) throw new Error(`Unable to refresh Google access token: ${response.status}`);
  return (await response.json()).access_token;
}

async function sheetValues(token, range) {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Unable to read ${range}: ${response.status}`);
  return (await response.json()).values || [];
}

function rowsAsObjects(values) {
  const headers = (values[0] || []).map((value) => String(value || "").trim());
  return values.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function parseJson(value) {
  if (!value) return {};
  try { return JSON.parse(value); } catch { return {}; }
}

function numberValue(value) {
  const number = Number(String(value ?? "").replace(/[$,%\s,]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function dateIso(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function reviewEntityId(session) {
  const chars = createHash("sha256").update(`touchpoint-csp:${session}`).digest("hex").slice(0, 32).split("");
  chars[12] = "5";
  chars[16] = "8";
  const hex = chars.join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

function validateSnapshot(snapshot, coverage) {
  const errors = [];
  const categories = parseJson(snapshot["Expense Categories JSON"]);
  const state = String(snapshot["Snapshot State"] || "").toLowerCase();
  if (state.includes("calculated")) {
    const income = numberValue(snapshot["Monthly Household Income"]);
    const expenses = numberValue(snapshot["Monthly Expenses"]);
    const goppi = numberValue(snapshot["Historical GOPPI"]);
    const categoryTotal = Object.values(categories).reduce((sum, value) => sum + numberValue(value), 0);
    if (Math.abs(income - expenses - goppi) > 1) errors.push("GOPPI arithmetic mismatch");
    if (Math.abs(categoryTotal - expenses) > 1) errors.push("Expense category roll-up mismatch");
  }
  coverage.forEach((item) => {
    if (!item.coverageId || !item.insured) errors.push("Incomplete coverage record");
  });
  return errors;
}

async function main() {
  const env = readEnv(path.resolve(".env.local"));
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase server credentials are missing.");

  let sessions = seedSessions;
  let snapshots = seedSnapshots;
  let coverageRows = seedCoverage;
  try {
    const token = await googleAccessToken();
    const [sessionValues, snapshotValues, coverageValues] = await Promise.all([
      sheetValues(token, "'Client CSP Review Sessions'!A1:J100"),
      sheetValues(token, "'Legacy CSP Baseline Snapshots'!A1:Q100"),
      sheetValues(token, "'Client Coverage In Force'!A1:Z500")
    ]);
    sessions = rowsAsObjects(sessionValues);
    snapshots = rowsAsObjects(snapshotValues);
    coverageRows = rowsAsObjects(coverageValues);
  } catch (error) {
    console.warn(`Google Sheets API read unavailable; using QA-validated workbook mirror seed. ${error.message}`);
  }
  const snapshotById = new Map(snapshots.map((snapshot) => [snapshot["Snapshot ID"], snapshot]));
  const records = [];
  const validation = [];

  for (const session of sessions) {
    if (!session["Session ID"] || session.Status !== "Active") continue;
    const snapshot = snapshotById.get(session["Snapshot ID"]);
    if (!snapshot) throw new Error(`Missing snapshot ${session["Snapshot ID"]}`);
    const coverage = coverageRows.filter((row) => row["Snapshot ID"] === session["Snapshot ID"] && String(row["CSP Review Include"]).toUpperCase() === "Y")
      .map((row) => ({
        coverageId: row["Coverage ID"],
        insured: row["Insured / Household"],
        type: row["Coverage Type"],
        carrier: row.Carrier,
        status: row["Coverage Status"],
        faceAmount: numberValue(row["Face Amount"]),
        monthlyPremium: numberValue(row["Monthly Premium"]),
        cashValue: numberValue(row["Cash Value"]),
        policyNumber: row["Policy Number"],
        issueDate: row["Issue Date"],
        annualPremium: numberValue(row["Annual Premium"]),
        productDetails: row["Product Details"],
        ridersSummary: row["Riders Summary"],
        sourceDocument: row["Source Document"],
        verificationStatus: row["Verification Status"],
        sourceConfidence: row["Source Confidence"],
        notes: row["Coverage Notes"]
      }));
    const errors = validateSnapshot(snapshot, coverage);
    validation.push({ session: session["Session ID"], household: session.Household, errors });
    const tokenHash = session["Token Hash"];
    const review = {
      sessionId: session["Session ID"],
      household: snapshot.Household,
      snapshotId: snapshot["Snapshot ID"],
      monthlyIncome: numberValue(snapshot["Monthly Household Income"]),
      expenseCategories: parseJson(snapshot["Expense Categories JSON"]),
      assets: parseJson(snapshot["Assets JSON"]),
      liabilities: parseJson(snapshot["Liabilities JSON"]),
      goals: parseJson(snapshot["Goals JSON"]),
      protectionNotes: snapshot["Protection Notes"],
      coverage,
      baselineState: snapshot["Snapshot State"],
      advisorSummary: snapshot["Advisor Review Summary"]
    };
    const premiumTotal = coverage.reduce((sum, item) => sum + item.monthlyPremium, 0);
    if (premiumTotal > 0) review.expenseCategories.life_insurance = premiumTotal;
    records.push({
      id: reviewEntityId(`baseline:${session["Session ID"]}`),
      submission_id: `TP-CSP-${session["Session ID"]}`,
      payload: {
        kind: "touchpoint_csp_review_baseline",
        sessionId: session["Session ID"],
        snapshotId: session["Snapshot ID"],
        household: session.Household,
        tokenHash,
        expiresAt: dateIso(session["Expires At"]),
        review,
        source: "Lead CRM Tool",
        syncedAt: new Date().toISOString()
      },
      source_environment: "production",
      test_flag: false,
      sync_status: "synced",
      sheet_row_ref: `Client CSP Review Sessions | ${session["Snapshot ID"]}`,
      created_at: dateIso(session["Created At"])
    });
  }

  const failed = validation.filter((item) => item.errors.length);
  if (failed.length) throw new Error(`CSP validation failed: ${JSON.stringify(failed)}`);
  const response = await fetch(`${supabaseUrl}/rest/v1/registration_tracking_sync_events?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(records)
  });
  if (!response.ok) throw new Error(`Supabase mirror failed: ${response.status} ${await response.text()}`);
  console.log(JSON.stringify({ sessionsMirrored: records.length, validationPassed: validation.length }, null, 2));
}

await main();
