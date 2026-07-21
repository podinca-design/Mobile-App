import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzXWRYSwReHDzVjd2Nlcl_GSYVBygHvTcYk6i-TDDoMUFdIJmaH7IM751tj8IrJXoXeCQ/exec";

type WorkshopSurveyPayload = {
  lead?: {
    name?: string;
    email?: string;
    phone?: string;
    preferred_contact_method?: string;
    preferred_contact_time?: string;
    preferred_follow_up_window?: string;
    consent_primary?: boolean;
  };
  workshop?: {
    primary_topic?: string;
    topic_reason?: string;
    follow_up_focus?: string[];
    personal_question?: string;
  };
  meta?: Record<string, unknown>;
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function hasRequiredContact(payload: WorkshopSurveyPayload) {
  const lead = payload.lead || {};
  return Boolean(clean(lead.name) && clean(lead.email) && clean(lead.phone));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WorkshopSurveyPayload;

    if (!hasRequiredContact(body)) {
      return NextResponse.json(
        { ok: false, message: "Name, email, and phone are required." },
        { status: 400 }
      );
    }

    if (!body.lead?.consent_primary) {
      return NextResponse.json(
        { ok: false, message: "Consent to follow up is required." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const endpoint =
      process.env.TOUCHPOINT_LEAD_CAPTURE_URL ||
      process.env.TOUCHPOINT_APPS_SCRIPT_URL ||
      DEFAULT_APPS_SCRIPT_URL;
    const workshop = body.workshop || {};
    const focus = Array.isArray(workshop.follow_up_focus)
      ? workshop.follow_up_focus.filter(Boolean).slice(0, 3)
      : [];

    const crmPayload = {
      eventName: "lead_submitted",
      source: "workshop_survey",
      entry_point: "workshop_final_slide_qr",
      tool_type: "workshop_survey",
      snapshot_type: "workshop_pain_point_triage",
      campaign_type: "financial_literacy_workshop",
      submission_id: `TP-WORKSHOP-${Date.now()}`,
      lead: {
        ...body.lead,
        consent_marketing: false,
        consent_affiliates: false,
        schedule_interest: true
      },
      meta: {
        ...(body.meta || {}),
        source: "workshop_survey",
        entry_point: "workshop_final_slide_qr",
        tool_type: "workshop_survey",
        snapshot_type: "workshop_pain_point_triage",
        campaign_type: "financial_literacy_workshop",
        lead_temperature: "Warm",
        lead_score: 72,
        priority_flag: "Workshop Follow-Up",
        product_focus: "Workshop Follow-Up",
        segment: "Workshop Pain Point Triage",
        cta: "Prepare individual review meeting",
        submitted_at: now,
        primary_topic: clean(workshop.primary_topic),
        topic_reason: clean(workshop.topic_reason),
        follow_up_focus: focus.join(" | "),
        personal_question: clean(workshop.personal_question),
        preferred_contact_method: clean(body.lead?.preferred_contact_method),
        preferred_contact_time: clean(body.lead?.preferred_contact_time),
        preferred_follow_up_window: clean(body.lead?.preferred_follow_up_window)
      },
      workshop: {
        primary_topic: clean(workshop.primary_topic),
        topic_reason: clean(workshop.topic_reason),
        follow_up_focus: focus,
        personal_question: clean(workshop.personal_question)
      },
      next_step: "Prepare individual review meeting around stated workshop pain points",
      cta: "Prepare individual review meeting"
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(crmPayload),
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
      return NextResponse.json(
        { ok: false, message: "Survey received, but CRM capture did not confirm.", data },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Survey submission failed."
      },
      { status: 500 }
    );
  }
}
