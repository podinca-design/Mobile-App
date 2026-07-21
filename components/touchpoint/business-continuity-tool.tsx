"use client";

import { ArrowLeft, BriefcaseBusiness, CalendarDays, ChevronRight, RotateCcw, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type QuestionType = "choice" | "money" | "number" | "yesno";
type Answers = Record<string, string>;
type SaveState = "idle" | "saving" | "saved" | "error";

type ContinuityQuestion = {
  id: string;
  label: string;
  sub?: string;
  type: QuestionType;
  options?: Array<{ label: string; value: string; score: number }>;
  when?: (answers: Answers) => boolean;
};

const questions: ContinuityQuestion[] = [
  {
    id: "business_type",
    label: "Which best describes your business?",
    sub: "This determines which continuity branch appears next.",
    type: "choice",
    options: [
      { label: "Self-employed / solo", value: "solo", score: 18 },
      { label: "Owner-led business", value: "owner_led", score: 16 },
      { label: "Partners or co-owners", value: "partners", score: 12 },
      { label: "Team with key personnel", value: "key_team", score: 10 }
    ]
  },
  {
    id: "monthly_revenue",
    label: "About how much monthly revenue would be exposed if work slowed down?",
    sub: "A rounded estimate is enough for this first review.",
    type: "money"
  },
  {
    id: "monthly_commitments",
    label: "What monthly payroll, contractor, and fixed business costs must keep going?",
    sub: "Include payroll, rent, software, insurance, debt, lease payments, and other recurring business commitments.",
    type: "money"
  },
  {
    id: "reserve_months",
    label: "How many months could the business carry those commitments from reserves?",
    type: "number"
  },
  {
    id: "owner_absence_days",
    label: "How long could the business operate without you before revenue or service delivery is materially affected?",
    sub: "Enter days, not months.",
    type: "number",
    when: (answers) => answers.business_type === "solo" || answers.business_type === "owner_led"
  },
  {
    id: "partner_buyout",
    label: "If a partner became disabled or passed away, is there a funded buy-sell or transition plan?",
    type: "yesno",
    when: (answers) => answers.business_type === "partners"
  },
  {
    id: "key_person_count",
    label: "How many people other than you could materially disrupt revenue or operations if unavailable?",
    type: "number",
    when: (answers) => answers.business_type === "key_team"
  },
  {
    id: "coverage_status",
    label: "What continuity funding or coverage is already in place?",
    type: "choice",
    options: [
      { label: "Not sure", value: "unknown", score: 16 },
      { label: "No dedicated coverage", value: "none", score: 20 },
      { label: "Personal coverage only", value: "personal", score: 12 },
      { label: "Business or key-person coverage", value: "business", score: 3 }
    ]
  },
  {
    id: "operating_docs",
    label: "Could someone else quickly find the instructions, contacts, passwords, and operating details needed to keep things moving?",
    type: "yesno"
  }
];

function money(value: string) {
  return Number(value.replace(/[^\d.]/g, "")) || 0;
}

function numeric(value: string) {
  return Math.max(0, Number(value.replace(/[^\d.]/g, "")) || 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" }).format(value);
}

function visibleQuestions(answers: Answers) {
  return questions.filter((question) => !question.when || question.when(answers));
}

function calculateContinuity(answers: Answers, activeQuestions: ContinuityQuestion[]) {
  const revenue = money(answers.monthly_revenue ?? "");
  const commitments = money(answers.monthly_commitments ?? "");
  const reserveMonths = numeric(answers.reserve_months ?? "");
  const absenceDays = numeric(answers.owner_absence_days ?? "");
  const keyPeople = numeric(answers.key_person_count ?? "");

  const choiceScore = activeQuestions.reduce((sum, question) => {
    if (!answers[question.id]) return sum;
    if (question.type === "yesno") return sum + (answers[question.id] === "yes" ? 0 : 12);
    const selected = question.options?.find((option) => option.value === answers[question.id]);
    return sum + (selected?.score ?? 0);
  }, 0);

  const reserveScore = answers.reserve_months ? (reserveMonths >= 6 ? 0 : reserveMonths >= 3 ? 6 : reserveMonths >= 1 ? 12 : 18) : 10;
  const ratio = revenue > 0 ? commitments / revenue : 0;
  const commitmentsScore = answers.monthly_commitments ? (ratio >= 0.75 ? 18 : ratio >= 0.5 ? 12 : ratio >= 0.3 ? 7 : 3) : 8;
  const absenceScore = answers.owner_absence_days ? (absenceDays <= 7 ? 18 : absenceDays <= 30 ? 12 : absenceDays <= 60 ? 7 : 3) : 0;
  const keyScore = answers.key_person_count ? (keyPeople >= 4 ? 16 : keyPeople >= 2 ? 11 : keyPeople >= 1 ? 7 : 2) : 0;
  const score = Math.min(100, Math.round(choiceScore + reserveScore + commitmentsScore + absenceScore + keyScore));
  const reserveGap = Math.max(0, commitments * Math.max(0, 3 - reserveMonths));
  const dailyRevenue = revenue / 30;
  const interruptionWindow = absenceDays || (answers.business_type === "partners" ? 45 : answers.business_type === "key_team" ? 30 : 21);
  const interruptionExposure = dailyRevenue * interruptionWindow;
  const exposure = Math.round(reserveGap + interruptionExposure);
  const label = score >= 72 ? "High continuity exposure" : score >= 45 ? "Moderate continuity exposure" : "Lower visible continuity exposure";
  const body =
    score >= 72
      ? "The answers point to a business that may need funded continuity planning before an owner, partner, or key-person event forces decisions."
      : score >= 45
        ? "The answers show visible continuity gaps. A review can clarify which gaps matter most and what funding or documentation may be missing."
        : "The first view looks more stable, but business continuity assumptions should still be confirmed before they are needed.";

  return { body, commitments, exposure, label, reserveGap, score };
}

export function BusinessContinuityTool({
  calendlyUrl = "#",
  onTelemetry,
  standalone = false
}: {
  calendlyUrl?: string;
  onTelemetry?: (eventName: string) => void;
  standalone?: boolean;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [leadOpen, setLeadOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [savedCalendlyUrl, setSavedCalendlyUrl] = useState(calendlyUrl);
  const activeQuestions = useMemo(() => visibleQuestions(answers), [answers]);
  const [stepIndex, setStepIndex] = useState(0);
  const summaryRef = useRef<HTMLElement | null>(null);
  const currentQuestion = activeQuestions[Math.min(stepIndex, activeQuestions.length - 1)];
  const answeredCount = activeQuestions.filter((question) => answers[question.id]).length;
  const progress = Math.round((answeredCount / Math.max(activeQuestions.length, 1)) * 100);
  const result = useMemo(() => calculateContinuity(answers, activeQuestions), [answers, activeQuestions]);
  const complete = answeredCount >= activeQuestions.length;
  const started = answeredCount > 0;

  useEffect(() => {
    if (complete) {
      window.setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
    }
  }, [complete]);

  useEffect(() => {
    if (saveState !== "saving") return;
    const timer = window.setTimeout(() => {
      setSaveMessage("Still working. Your continuity review is being saved now.");
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [saveState]);

  function setAnswer(question: ContinuityQuestion, value: string) {
    setAnswers((current) => {
      const next = { ...current, [question.id]: value };
      return next;
    });
    window.setTimeout(() => {
      setStepIndex((index) => Math.min(index + 1, visibleQuestions({ ...answers, [question.id]: value }).length - 1));
    }, 110);
  }

  function updateAnswer(question: ContinuityQuestion, value: string) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  }

  function reset() {
    setAnswers({});
    setStepIndex(0);
    setLeadOpen(false);
    setSaveState("idle");
    setSaveMessage("");
  }

  async function submitContinuityReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saveState === "saving") return;
    const form = new FormData(event.currentTarget);
    const lead = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      preferredContactMethod: String(form.get("preferredContactMethod") ?? "email"),
      consentService: form.get("consentService") === "on",
      consentEducation: form.get("consentEducation") === "on"
    };
    const payload = {
      eventName: "business_continuity_review_submitted",
      lead,
      tool: {
        type: "business_continuity",
        source: "business_continuity_check",
        entry_point: "business-continuity",
        campaign_type: "business_continuity",
        snapshot_type: "business_continuity_review",
        analysis_ready: true,
        answers,
        readableAnswers: activeQuestions.map((question) => ({
          id: question.id,
          label: question.label,
          answer: question.options?.find((option) => option.value === answers[question.id])?.label ?? answers[question.id] ?? ""
        })),
        result: {
          score: result.score,
          label: result.label,
          body: result.body,
          exposure: result.exposure,
          commitments: result.commitments,
          reserveGap: result.reserveGap,
          branch: branchLabel(answers.business_type)
        }
      },
      metadata: {
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    setSaveState("saving");
    setSaveMessage("Saving your continuity review now.");
    onTelemetry?.("business_continuity_review_submit_started");

    const response = await fetch("/api/touchpoint/diagnostic-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      setSaveState("error");
      setSaveMessage(data?.message ?? "We could not save your continuity review. Please try again.");
      onTelemetry?.("business_continuity_review_submit_failed");
      return;
    }

    setSavedCalendlyUrl(String(data?.calendlyUrl || calendlyUrl));
    setSaveState("saved");
    setSaveMessage("Saved. Your continuity review is ready for the next step.");
    onTelemetry?.("business_continuity_review_submitted");
  }

  const content = (
      <div className="mx-auto max-w-6xl">
        {standalone ? (
          <div className="mb-5 flex flex-wrap gap-3">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 font-bold text-slate-100" href="/">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </a>
          </div>
        ) : null}

        <section className="rounded-[2rem] border border-cyan-300/20 bg-[#07151c]/95 p-5 shadow-2xl sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">Business owner continuity check</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <h1 className="font-serif text-4xl leading-none text-white sm:text-6xl">If your business had to run without you, what would break first?</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
                A configured continuity exposure check for owners, self-employed professionals, partners, and key-person dependent teams.
              </p>
            </div>
            <aside className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-200/80">Live readout</p>
              <p className="mt-3 text-4xl font-black">{progress}%</p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-300">Answered {answeredCount} of {activeQuestions.length}</p>
            </aside>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.82fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-[#0a2029] p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">Question {Math.min(stepIndex + 1, activeQuestions.length)} of {activeQuestions.length}</p>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${((Math.min(stepIndex + 1, activeQuestions.length)) / activeQuestions.length) * 100}%` }} />
                </div>
              </div>
              <BriefcaseBusiness className="h-8 w-8 shrink-0 text-emerald-200" aria-hidden />
            </div>

            {currentQuestion ? (
              <div className="mt-7">
                <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">{currentQuestion.label}</h2>
                {currentQuestion.sub ? <p className="mt-3 text-lg leading-8 text-slate-300">{currentQuestion.sub}</p> : null}
                <QuestionInput
                  question={currentQuestion}
                  value={answers[currentQuestion.id] ?? ""}
                  onAnswer={(value) => setAnswer(currentQuestion, value)}
                  onDraft={(value) => updateAnswer(currentQuestion, value)}
                />
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full border border-white/15 px-4 py-3 font-bold disabled:opacity-40" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => Math.max(0, index - 1))} type="button">
                <ArrowLeft className="mr-2 inline h-4 w-4" /> Back
              </button>
              <button className="inline-flex items-center rounded-full border border-white/15 px-4 py-3 font-bold" onClick={reset} type="button">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </button>
            </div>
          </div>

          <aside ref={summaryRef} className="rounded-[1.5rem] border border-emerald-200/30 bg-[#06151d] p-4 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-200/80">Review direction</p>
            <p className="mt-3 text-4xl font-black">{started ? result.label : "Not started yet"}</p>
            <p className="mt-3 text-lg leading-8 text-slate-300">
              {started ? result.body : "Answer the first question to begin the business continuity exposure readout."}
            </p>
            <HeatGauge value={started ? result.score : null} />
            <div className="mt-5 grid gap-3">
              <Metric label="Estimated continuity gap" value={formatCurrency(result.exposure)} />
              <Metric label="Monthly commitments at risk" value={formatCurrency(result.commitments)} />
              <Metric label="Reserve gap to 3 months" value={formatCurrency(result.reserveGap)} />
            </div>
            <div className="mt-5 rounded-[1rem] border border-white/10 bg-white/[0.035] p-4">
              <p className="text-base font-bold text-slate-300">Branch selected</p>
              <p className="mt-1 text-xl font-black text-white">{branchLabel(answers.business_type)}</p>
            </div>
            <div className="mt-5 grid gap-3">
              <button
                className="min-h-14 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-3 text-lg font-extrabold text-[#051016] disabled:opacity-50"
                disabled={!complete}
                onClick={() => {
                  setLeadOpen(true);
                  setSaveState("idle");
                  setSaveMessage("");
                  onTelemetry?.("business_continuity_save_cta_clicked");
                }}
                type="button"
              >
                Save continuity review <ChevronRight className="ml-1 inline h-5 w-5" />
              </button>
              <a
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-center text-lg font-extrabold"
                href={calendlyUrl}
                onClick={() => onTelemetry?.("business_continuity_schedule_cta_clicked")}
              >
                <CalendarDays className="mr-2 h-5 w-5" /> Schedule continuity review
              </a>
            </div>
          </aside>
        </section>
        {leadOpen ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur sm:items-center">
            <section aria-modal="true" className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] border border-cyan-300/20 bg-[#07151c] p-5 shadow-2xl sm:p-7" role="dialog">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">Save your review</p>
                  <h2 className="mt-2 text-3xl font-extrabold">Save my continuity review</h2>
                </div>
                <button aria-label="Close continuity save form" className="rounded-full border border-white/15 p-3" onClick={() => setLeadOpen(false)} type="button">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="mt-6 grid gap-4" onSubmit={submitContinuityReview}>
                <label className="grid gap-2 text-base font-bold">
                  Name
                  <input autoComplete="name" className="min-h-14 rounded-2xl border border-white/15 bg-slate-100 px-4 text-[#06121a]" name="name" required />
                </label>
                <label className="grid gap-2 text-base font-bold">
                  Email
                  <input autoComplete="email" className="min-h-14 rounded-2xl border border-white/15 bg-slate-100 px-4 text-[#06121a]" name="email" required type="email" />
                </label>
                <label className="grid gap-2 text-base font-bold">
                  Phone optional
                  <input autoComplete="tel" className="min-h-14 rounded-2xl border border-white/15 bg-slate-100 px-4 text-[#06121a]" name="phone" type="tel" />
                </label>
                <label className="grid gap-2 text-base font-bold">
                  Preferred contact method
                  <select className="min-h-14 rounded-2xl border border-white/15 bg-slate-100 px-4 text-[#06121a]" defaultValue="email" name="preferredContactMethod">
                    <option value="email">Email</option>
                    <option value="phone">Phone call</option>
                    <option value="text">Text message</option>
                  </select>
                </label>
                <label className="flex items-start gap-3 text-base leading-7 text-slate-200">
                  <input className="mt-1 h-5 w-5 accent-emerald-300" defaultChecked name="consentService" required type="checkbox" />
                  I agree to receive my review and related service communications.
                </label>
                <label className="flex items-start gap-3 text-base leading-7 text-slate-200">
                  <input className="mt-1 h-5 w-5 accent-emerald-300" defaultChecked name="consentEducation" type="checkbox" />
                  Optional: I agree to receive educational content and updates.
                </label>
                {saveMessage ? <p className={saveState === "error" ? "text-red-200" : "text-emerald-200"}>{saveMessage}</p> : null}
                <button className="min-h-14 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-3 text-lg font-extrabold text-[#051016] disabled:opacity-60" disabled={saveState === "saving" || saveState === "saved"} type="submit">
                  {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save continuity review"}
                </button>
                {saveState === "saved" ? (
                  <a className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-center text-lg font-extrabold" href={savedCalendlyUrl}>
                    Schedule continuity review
                  </a>
                ) : null}
                <p className="tp-copy text-sm leading-6 text-slate-400">
                  By submitting your information, you agree to be contacted by TouchPoint or a licensed insurance professional via call, text, or email regarding your financial strategy and related services. Message and data rates may apply. You can opt out at any time.
                </p>
                <p className="tp-copy text-sm leading-6 text-slate-400">
                  Educational planning tool only. Not legal, tax, or insurance advice. TouchPoint provides financial education and planning support. We do not provide tax or legal advice. Insurance products are offered through licensed professionals.
                </p>
              </form>
            </section>
          </div>
        ) : null}
      </div>
  );

  if (!standalone) return content;

  return (
    <main className="min-h-screen bg-[#061018] px-4 py-8 text-white sm:px-6 lg:px-10">
      {content}
    </main>
  );
}

function QuestionInput({
  onAnswer,
  onDraft,
  question,
  value
}: {
  onAnswer: (value: string) => void;
  onDraft: (value: string) => void;
  question: ContinuityQuestion;
  value: string;
}) {
  if (question.type === "choice") {
    return (
      <div className="mt-6 grid gap-3">
        {question.options?.map((option) => (
          <button
            aria-pressed={value === option.value}
            className={`min-h-16 rounded-2xl border px-4 py-3 text-left text-lg font-bold transition ${value === option.value ? "border-emerald-200 bg-emerald-200/10 shadow-[inset_6px_0_0_rgba(110,231,183,0.7)]" : "border-white/15 bg-white/[0.035]"}`}
            key={option.value}
            onClick={() => onAnswer(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "yesno") {
    return (
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          { label: "Yes", value: "yes" },
          { label: "No / not sure", value: "no" }
        ].map((option) => (
          <button
            aria-pressed={value === option.value}
            className={`min-h-16 rounded-2xl border px-4 py-3 text-left text-lg font-bold transition ${value === option.value ? "border-emerald-200 bg-emerald-200/10 shadow-[inset_6px_0_0_rgba(110,231,183,0.7)]" : "border-white/15 bg-white/[0.035]"}`}
            key={option.value}
            onClick={() => onAnswer(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <label className="block">
        <span className="sr-only">{question.label}</span>
        <span className="flex min-h-16 items-center rounded-2xl border border-white/15 bg-[#06151d] px-4 text-2xl font-bold text-white focus-within:border-emerald-200">
          {question.type === "money" ? <span className="mr-3 text-slate-300">$</span> : null}
          <input
            className="w-full bg-transparent outline-none"
            inputMode={question.type === "money" ? "decimal" : "numeric"}
            onChange={(event) => onDraft(event.target.value)}
            placeholder={question.type === "money" ? "0" : "0"}
            value={value}
          />
        </span>
      </label>
      <button className="mt-4 min-h-14 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-6 py-3 text-lg font-extrabold text-[#051016] disabled:opacity-50" disabled={!value} onClick={() => onAnswer(value)} type="button">
        Continue <ChevronRight className="ml-1 inline h-5 w-5" />
      </button>
    </div>
  );
}

function branchLabel(value?: string) {
  if (value === "solo") return "Self-employed / solo";
  if (value === "owner_led") return "Owner-led business";
  if (value === "partners") return "Partners or co-owners";
  if (value === "key_team") return "Team with key personnel";
  return "Not selected yet";
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/[0.035] p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function HeatGauge({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-300">Business continuity heat gauge</p>
        <p className="mt-3 text-3xl font-black text-slate-200">Not scored yet</p>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-white/10" />
        <div className="mt-3 flex justify-between text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          <span>Green</span>
          <span>Yellow</span>
          <span>Red</span>
        </div>
        <p className="mt-3 text-base font-extrabold text-slate-100">Start with the first answer.</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">The exposure score appears after the first selection and updates as the review continues.</p>
      </div>
    );
  }

  const color = value >= 72 ? "bg-rose-300" : value >= 45 ? "bg-amber-200" : "bg-emerald-300";
  const label = value >= 72 ? "High continuity risk" : value >= 45 ? "Continuity watch zone" : "Lower visible continuity risk";
  const guidance =
    value >= 72
      ? "Review owner, partner, key-person, and funding gaps before the business has to respond under pressure."
      : value >= 45
        ? "Several assumptions should be verified so the business has a clearer path if work is interrupted."
        : "The first view is steadier, but the plan should still be documented and reviewed before it is needed.";

  return (
    <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-300">Business continuity heat gauge</p>
      <p className="mt-3 text-4xl font-black">{value} / 100</p>
      <div className="relative mt-4 h-4 overflow-hidden rounded-full bg-gradient-to-r from-emerald-300 via-amber-200 to-rose-300">
        <div className="absolute inset-y-0 right-0 bg-[#233844]/85" style={{ width: `${Math.max(0, 100 - value)}%` }} />
        <div className={`absolute inset-y-0 left-0 h-4 rounded-full ${color} shadow-[0_0_18px_rgba(255,255,255,0.18)]`} style={{ width: `${Math.max(4, value)}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        <span>Green</span>
        <span>Yellow</span>
        <span>Red</span>
      </div>
      <p className="mt-3 text-base font-extrabold text-slate-100">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{guidance}</p>
    </div>
  );
}
