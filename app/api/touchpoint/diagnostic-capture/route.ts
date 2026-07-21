import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzXWRYSwReHDzVjd2Nlcl_GSYVBygHvTcYk6i-TDDoMUFdIJmaH7IM751tj8IrJXoXeCQ/exec";

const LEAD_ALERT_TO = "admin@touchpointgroup.co";
const LEAD_ALERT_CC = "nikkic@alum.mit.edu";
const QA_EMAILS = new Set(["nikkic@alum.mit.edu", "podinca@gmail.com"]);

export async function GET() {
  return NextResponse.json({ ok: true, service: "touchpoint-diagnostic-capture" });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  const endpoint = process.env.TOUCHPOINT_APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    const text = await response.text();
    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return NextResponse.json({ ok: false, status: response.status, data }, { status: 502 });
    }

    await sendLeadNotification(payload, data);

    const resultRecord = asRecord(data);
    return NextResponse.json({
      ok: true,
      data,
      leadId: cleanText(resultRecord.leadId) || cleanText(resultRecord.lead_id) || cleanText(resultRecord.submission_id),
      calendlyUrl: cleanText(resultRecord.calendlyUrl) || cleanText(resultRecord.calendly_url)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown capture error";
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}

async function sendLeadNotification(payload: Record<string, unknown>, captureResult: unknown) {
  if (!isLeadSubmission(payload) || isQaLead(payload)) return;

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  const lead = asRecord(payload.lead);
  const tool = asRecord(payload.tool);
  const metadata = asRecord(payload.metadata);
  const name = cleanText(lead.name) || "New TouchPoint lead";
  const email = cleanText(lead.email);
  const phone = cleanText(lead.phone);
  const preferredContactMethod = cleanText(lead.preferredContactMethod) || "not specified";
  const toolType = cleanText(tool.type) || cleanText(payload.tool_type) || cleanText(payload.eventName) || "TouchPoint capture";
  const sourcePath = cleanText(metadata.path) || cleanText(metadata.page_path) || "not captured";
  const result = asRecord(captureResult);
  const leadId =
    cleanText(result.leadId) ||
    cleanText(result.lead_id) ||
    cleanText(result.submission_id) ||
    cleanText(asRecord(result.data).leadId) ||
    cleanText(asRecord(result.data).lead_id);

  const subject = `New TouchPoint lead: ${name}`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
      <h2 style="margin:0 0 12px">New TouchPoint lead received</h2>
      <p style="margin:0 0 16px">A new non-QA lead was captured from touchpointgroup.co.</p>
      <table style="border-collapse:collapse;width:100%;max-width:680px">
        ${row("Name", name)}
        ${row("Email", email || "Not provided")}
        ${row("Phone", phone || "Not provided")}
        ${row("Preferred contact", preferredContactMethod)}
        ${row("Tool / source", toolType)}
        ${row("Page path", sourcePath)}
        ${row("Lead ID", leadId || "Pending workbook value")}
      </table>
      <p style="margin-top:18px;color:#475569;font-size:13px">This alert excludes QA/test leads and does not replace the workbook capture.</p>
    </div>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "TouchPoint Group <admin@touchpointgroup.co>",
        to: [LEAD_ALERT_TO],
        cc: [LEAD_ALERT_CC],
        subject,
        html
      }),
      cache: "no-store"
    });
  } catch {
    // Lead capture must not fail because the notification sidecar failed.
  }
}

function isLeadSubmission(payload: Record<string, unknown>) {
  const eventName = cleanText(payload.eventName).toLowerCase();
  return eventName === "lead_submitted" || eventName === "business_continuity_review_submitted";
}

function isQaLead(payload: Record<string, unknown>) {
  const lead = asRecord(payload.lead);
  const values = [
    cleanText(lead.name),
    cleanText(lead.email),
    cleanText(lead.phone),
    cleanText(payload.sessionId)
  ].map((value) => value.toLowerCase());
  const email = cleanText(lead.email).toLowerCase();
  if (QA_EMAILS.has(email)) return true;
  return values.some((value) => /\b(qa|test|codex|sample|demo|dummy)\b/.test(value));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function row(label: string, value: string) {
  return `
    <tr>
      <th style="border:1px solid #dbe4ea;background:#eef8f6;text-align:left;padding:8px 10px;width:180px">${escapeHtml(label)}</th>
      <td style="border:1px solid #dbe4ea;padding:8px 10px">${escapeHtml(value)}</td>
    </tr>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
