import { NextResponse } from "next/server";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";

const LEAD_ALERT_TO = "admin@touchpointgroup.co";
const LEAD_ALERT_CC = "nikkic@alum.mit.edu";
const QA_RULE_VERSION = "tp-qa-hmac-v1";
const PARTNER_CONTRACT_VERSION = "tp-partner-v1";
const SAFE_ATTRIBUTION_PARAMS = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]);

export async function GET() {
  return NextResponse.json({ ok: true, service: "touchpoint-diagnostic-capture", contract: PARTNER_CONTRACT_VERSION });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const incoming = parsePayload(rawBody);

  if (!incoming) {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  delete incoming.qa_auth;
  delete incoming.webhook_token;
  delete incoming.shared_secret;

  const qaRequest = authorizeQaRequest(request, incoming);
  const partnerPayload = normalizeForRev183(incoming);

  if (qaRequest) {
    partnerPayload.qa_auth = issueQaAuthorization(partnerPayload, qaRequest);
  }

  const webhookSecret =
    process.env.TP_WEBHOOK_SHARED_SECRET ||
    process.env.TOUCHPOINT_WEBHOOK_SHARED_SECRET ||
    "";

  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, message: "Capture service is not fully configured.", code: "WEBHOOK_SECRET_UNAVAILABLE" },
      { status: 503 }
    );
  }

  const endpoint = process.env.TOUCHPOINT_APPS_SCRIPT_URL || "";
  if (!endpoint) {
    return NextResponse.json(
      { ok: false, message: "Capture endpoint is not configured.", code: "APPS_SCRIPT_URL_UNAVAILABLE" },
      { status: 503 }
    );
  }

  try {
    const outboundPayload = { ...partnerPayload, webhook_token: webhookSecret };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(outboundPayload),
      cache: "no-store"
    });

    const text = await response.text();
    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    const resultRecord = asRecord(data);
    const applicationSuccess = response.ok && cleanText(resultRecord.status).toLowerCase() === "success";

    if (!applicationSuccess) {
      const code = cleanText(resultRecord.code) || cleanText(resultRecord.error_code) || "DOWNSTREAM_REJECTED";
      const retryable = resultRecord.retryable === true;
      return NextResponse.json(
        {
          ok: false,
          message: cleanText(resultRecord.message) || "TouchPoint capture was not accepted.",
          code,
          retryable,
          downstreamStatus: response.status
        },
        { status: retryable ? 503 : 422 }
      );
    }

    await sendLeadNotification(incoming, data, Boolean(qaRequest));

    return NextResponse.json({
      ok: true,
      data,
      recordClass: qaRequest ? "qa" : "production",
      leadId: cleanText(resultRecord.leadId) || cleanText(resultRecord.lead_id) || cleanText(resultRecord.submission_id),
      calendlyUrl: cleanText(resultRecord.calendlyUrl) || cleanText(resultRecord.calendly_url)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown capture error";
    return NextResponse.json({ ok: false, message, code: "CAPTURE_TRANSPORT_ERROR", retryable: true }, { status: 502 });
  }
}

function normalizeForRev183(incoming: Record<string, unknown>): Record<string, unknown> {
  const lead = asRecord(incoming.lead);
  const tool = asRecord(incoming.tool);
  const metadata = asRecord(incoming.metadata);
  const eventName = cleanText(incoming.event_name) || cleanText(incoming.eventName) || "traffic_event";
  const eventType = partnerEventType(incoming, eventName, tool);
  const source = cleanText(incoming.source) || cleanText(tool.source) || "touchpointgroup.co";
  const entryPoint =
    cleanText(incoming.entry_point) ||
    cleanText(tool.entry_point) ||
    cleanText(metadata.path) ||
    "touchpointgroup.co";
  const toolType =
    cleanText(incoming.tool_type) ||
    cleanText(tool.type) ||
    cleanText(tool.selectedPath) ||
    "";
  const snapshotType =
    cleanText(incoming.snapshot_type) ||
    cleanText(tool.snapshot_type) ||
    cleanText(tool.snapshotType) ||
    "";

  const safePageUrl = sanitizeTelemetryUrl(
    cleanText(metadata.page_url) || cleanText(metadata.pageUrl) || ""
  );
  const safeReferrer = sanitizeTelemetryUrl(cleanText(metadata.referrer));
  const urlAttribution = attributionFromUrl(safePageUrl);

  const normalizedLead: Record<string, unknown> = {
    name: cleanText(lead.name),
    email: cleanText(lead.email),
    phone: cleanText(lead.phone),
    preferred_contact_method:
      cleanText(lead.preferred_contact_method) || cleanText(lead.preferredContactMethod)
  };
  if (Object.prototype.hasOwnProperty.call(lead, "consentService")) {
    normalizedLead.consent_service = lead.consentService === true;
  }
  if (Object.prototype.hasOwnProperty.call(lead, "consent_service")) {
    normalizedLead.consent_service = lead.consent_service === true;
  }
  if (Object.prototype.hasOwnProperty.call(lead, "consentEducation")) {
    normalizedLead.consent_education = lead.consentEducation === true;
  }

  const topSnapshot = Object.keys(asRecord(incoming.snapshot)).length
    ? asRecord(incoming.snapshot)
    : asRecord(tool.snapshot);

  const normalized: Record<string, unknown> = {
    contract_version: PARTNER_CONTRACT_VERSION,
    submission_id:
      cleanText(incoming.submission_id) ||
      cleanText(incoming.submissionId) ||
      `TPW-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    event_type: eventType,
    event_name: eventName,
    source,
    entry_point: entryPoint,
    tool_type: toolType,
    snapshot_type: snapshotType,
    lead: normalizedLead,
    snapshot: topSnapshot,
    tool,
    traffic: {
      source,
      entry_point: entryPoint,
      page_path: cleanText(metadata.path) || safePath(safePageUrl),
      page_url: safePageUrl,
      landing_url: safePageUrl,
      referrer: safeReferrer,
      user_agent: cleanText(metadata.user_agent) || cleanText(metadata.userAgent),
      viewport: cleanText(metadata.viewport),
      utm_source: cleanText(metadata.utm_source) || urlAttribution.utm_source,
      utm_medium: cleanText(metadata.utm_medium) || urlAttribution.utm_medium,
      utm_campaign: cleanText(metadata.utm_campaign) || urlAttribution.utm_campaign,
      utm_content: cleanText(metadata.utm_content) || urlAttribution.utm_content,
      utm_term: cleanText(metadata.utm_term) || urlAttribution.utm_term,
      event_category: cleanText(incoming.event_category),
      traffic_class: cleanText(incoming.traffic_class),
      conversion_stage: cleanText(incoming.conversion_stage)
    }
  };

  if (eventType === "diagnostic_completed") {
    normalized.diagnostic = {
      tool_type: toolType || "touchpoint_diagnostic",
      status: "completed",
      score: asRecord(tool.result).score ?? asRecord(incoming.diagnostic).score ?? "",
      result: asRecord(tool.result),
      answers: tool.answers ?? asRecord(incoming.diagnostic).answers ?? {},
      readable_answers: tool.readableAnswers ?? []
    };
  }

  return normalized;
}

function partnerEventType(
  incoming: Record<string, unknown>,
  eventName: string,
  tool: Record<string, unknown>
) {
  const supplied = cleanText(incoming.event_type).toLowerCase();
  const allowed = new Set([
    "lead_created",
    "lead_updated",
    "lead_submitted",
    "diagnostic_completed",
    "workshop_registered",
    "traffic_event"
  ]);
  if (allowed.has(supplied)) return supplied;
  if (eventName === "business_continuity_review_submitted") return "diagnostic_completed";
  if (eventName === "lead_submitted") return "lead_submitted";
  if (/diagnostic_completed|assessment_completed|review_completed/i.test(eventName) && cleanText(tool.type)) {
    return "diagnostic_completed";
  }
  return "traffic_event";
}

function sanitizeTelemetryUrl(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value, "https://touchpointgroup.co");
    const safe = new URL(`${url.origin}${url.pathname}`);
    for (const key of SAFE_ATTRIBUTION_PARAMS) {
      const found = url.searchParams.get(key);
      if (found) safe.searchParams.set(key, found.slice(0, 256));
    }
    return safe.toString();
  } catch {
    return "";
  }
}

function attributionFromUrl(value: string) {
  const result = { utm_source: "", utm_medium: "", utm_campaign: "", utm_content: "", utm_term: "" };
  if (!value) return result;
  try {
    const url = new URL(value);
    for (const key of Object.keys(result) as Array<keyof typeof result>) {
      result[key] = url.searchParams.get(key) || "";
    }
  } catch {
    return result;
  }
  return result;
}

function safePath(value: string) {
  if (!value) return "";
  try {
    return new URL(value).pathname;
  } catch {
    return "";
  }
}

async function sendLeadNotification(payload: Record<string, unknown>, captureResult: unknown, authorizedQa: boolean) {
  if (!isLeadSubmission(payload) || authorizedQa) return;

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
    // Capture success must not be reversed by a notification-sidecar failure.
  }
}

function isLeadSubmission(payload: Record<string, unknown>) {
  const eventName = cleanText(payload.eventName).toLowerCase();
  return eventName === "lead_submitted" || eventName === "business_continuity_review_submitted";
}

type QaRequest = {
  timestamp: string;
  test_run_id: string;
  correlation_id: string;
};

function authorizeQaRequest(request: Request, payload: Record<string, unknown>): QaRequest | null {
  const secret = process.env.TOUCHPOINT_QA_SHARED_SECRET;
  if (!secret) return null;
  const timestamp = cleanText(request.headers.get("x-touchpoint-qa-timestamp"));
  const testRunId = cleanText(request.headers.get("x-touchpoint-qa-run-id"));
  const correlationId = cleanText(request.headers.get("x-touchpoint-qa-correlation-id"));
  const signature = cleanText(request.headers.get("x-touchpoint-qa-signature")).toLowerCase();
  const receivedAt = Date.parse(timestamp);
  if (!timestamp || !testRunId || !correlationId || !signature || !Number.isFinite(receivedAt)) return null;
  if (Math.abs(Date.now() - receivedAt) > 10 * 60 * 1000) return null;
  const payloadHash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const message = [timestamp, testRunId, correlationId, payloadHash].join("\n");
  const expected = createHmac("sha256", secret).update(message).digest("hex");
  if (!safeEqual(signature, expected)) return null;
  return { timestamp, test_run_id: testRunId, correlation_id: correlationId };
}

function issueQaAuthorization(payload: Record<string, unknown>, qa: QaRequest) {
  const secret = process.env.TOUCHPOINT_QA_SHARED_SECRET || "";
  const payloadHash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const message = [qa.timestamp, qa.test_run_id, qa.correlation_id, payloadHash].join("\n");
  const signature = createHmac("sha256", secret).update(message).digest("hex");
  return {
    timestamp: qa.timestamp,
    test_run_id: qa.test_run_id,
    correlation_id: qa.correlation_id,
    payload_hash: payloadHash,
    signature,
    authorization_method: "hmac-sha256",
    classification_rule_version: QA_RULE_VERSION
  };
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

function parsePayload(rawBody: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(rawBody);
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, any>) : {};
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
