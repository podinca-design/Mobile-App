import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ReviewRecord = {
  payload?: {
    kind?: string;
    tokenHash?: string;
    expiresAt?: string;
    review?: Record<string, unknown>;
    latestSnapshot?: Record<string, unknown>;
    advisorNotes?: string;
    updatedAt?: string;
    reviewHistory?: Array<{ savedAt: string; advisorNotes: string; snapshot: Record<string, unknown> }>;
  };
};

function normalizedHash(value: string) {
  return value.replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function validToken(token: string, expectedHash: string) {
  const actual = Buffer.from(normalizedHash(createHash("sha256").update(token).digest("base64")));
  const expected = Buffer.from(normalizedHash(expectedHash));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { url, key };
}

function webhookSecret() {
  return process.env.TP_WEBHOOK_SHARED_SECRET || process.env.TOUCHPOINT_WEBHOOK_SHARED_SECRET || "";
}

async function loadMirrorRecord(session: string, token: string) {
  const { url, key } = supabaseConfig();
  if (!url || !key) return null;
  const submissionId = `TP-CSP-${session}`;
  const response = await fetch(
    `${url}/rest/v1/registration_tracking_sync_events?submission_id=eq.${encodeURIComponent(submissionId)}&select=payload,created_at&order=created_at.desc&limit=50`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
  );
  if (!response.ok) return null;
  const records = (await response.json().catch(() => [])) as ReviewRecord[];
  const baseline = records.find((record) => record.payload?.kind === "touchpoint_csp_review_baseline");
  const metadata = baseline?.payload || {};
  if (!baseline || !metadata.tokenHash || !metadata.review) return null;
  if (metadata.expiresAt && new Date(metadata.expiresAt).getTime() < Date.now()) return null;
  if (!validToken(token, metadata.tokenHash)) return null;
  return { metadata };
}

function mergedReview(metadata: NonNullable<ReviewRecord["payload"]>) {
  const baseline = metadata.review || {};
  const latest = metadata.latestSnapshot || {};
  return {
    ...baseline,
    ...latest,
    coverage: (latest as Record<string, any>).coverage || (baseline as Record<string, any>).coverage || []
  };
}

async function loadFromAppsScript(session: string, token: string) {
  const endpoint = process.env.TOUCHPOINT_APPS_SCRIPT_URL || "";
  if (!endpoint) return null;
  const response = await fetch(
    `${endpoint}?action=loadCspReview&session=${encodeURIComponent(session)}&token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  );
  const data = (await response.json().catch(() => null)) as { status?: string; review?: Record<string, unknown> } | null;
  return response.ok && data?.status === "success" && data.review ? data.review : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const session = url.searchParams.get("session") || "";
  const token = url.searchParams.get("token") || "";
  if (!session || !token) {
    return NextResponse.json({ ok: false, message: "Missing review credentials." }, { status: 400 });
  }

  try {
    const review = await loadFromAppsScript(session, token).catch(() => null);
    if (review) return NextResponse.json({ ok: true, review }, { headers: { "Cache-Control": "no-store" } });
    const mirror = await loadMirrorRecord(session, token);
    if (!mirror) return NextResponse.json({ ok: false, message: "Review link unavailable." }, { status: 403 });
    return NextResponse.json(
      { ok: true, review: mergedReview(mirror.metadata), storage: "secure-mirror-read" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to load this review." }, { status: 502 });
  }
}

async function saveToAppsScript(body: Record<string, unknown>) {
  const secret = webhookSecret();
  if (!secret) return false;
  const endpoint = process.env.TOUCHPOINT_APPS_SCRIPT_URL || "";
  if (!endpoint) return false;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "saveCspReview",
      review_session_id: body.session,
      review_token: body.token,
      snapshot: body.snapshot,
      advisor_notes: body.advisorNotes || "",
      webhook_token: secret
    }),
    cache: "no-store"
  });
  const data = (await response.json().catch(() => null)) as { ok?: boolean; status?: string } | null;
  return response.ok && data?.ok === true;
}

async function saveToMirror(session: string, token: string, snapshot: Record<string, unknown>, advisorNotes: string) {
  const mirror = await loadMirrorRecord(session, token);
  if (!mirror) return false;
  const { url, key } = supabaseConfig();
  if (!url || !key) return false;
  const createdAt = new Date().toISOString();
  const metadata = {
    ...mirror.metadata,
    kind: "touchpoint_csp_review_baseline",
    latestSnapshot: snapshot,
    advisorNotes,
    updatedAt: createdAt,
    reviewHistory: [
      ...(mirror.metadata.reviewHistory || []),
      { savedAt: createdAt, advisorNotes, snapshot }
    ].slice(-50)
  };
  const response = await fetch(
    `${url}/rest/v1/registration_tracking_sync_events?submission_id=eq.${encodeURIComponent(`TP-CSP-${session}`)}`,
    {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ payload: metadata, sync_status: "synced" }),
      cache: "no-store"
    }
  );
  return response.ok;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (
    !body ||
    typeof body.session !== "string" ||
    typeof body.token !== "string" ||
    !body.snapshot ||
    typeof body.snapshot !== "object"
  ) {
    return NextResponse.json({ ok: false, message: "Invalid review save request." }, { status: 400 });
  }

  try {
    const savedToGoogle = await saveToAppsScript(body).catch(() => false);
    const savedToMirror = await saveToMirror(
      body.session,
      body.token,
      body.snapshot as Record<string, unknown>,
      typeof body.advisorNotes === "string" ? body.advisorNotes : ""
    ).catch(() => false);

    if (!savedToGoogle) {
      return NextResponse.json(
        {
          ok: false,
          message: savedToMirror
            ? "Your review was preserved in the secure recovery mirror, but the authoritative workbook save did not confirm. Please retry."
            : "Unable to save review.",
          storage: savedToMirror ? "mirror-degraded" : "none",
          recoveryStored: savedToMirror
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      storage: savedToMirror ? "google-and-mirror" : "google",
      degraded: false
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to save this review." }, { status: 502 });
  }
}
