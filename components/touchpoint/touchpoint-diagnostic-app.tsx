"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, Check, ChevronRight, Download, Mail, Menu, RotateCcw, ShieldCheck, X } from "lucide-react";
import { BusinessContinuityTool } from "./business-continuity-tool";

export type BrandConfig = {
  corporateLogoUrl: string;
  calendlyUrl: string;
};

type PathKey = "csp" | "protection" | "retirement" | "trust" | "learning" | "business";
type Stage = "entry" | "selected" | "tool";
type LeadSubmitState = "idle" | "saving" | "saved" | "error";
type Frequency = "monthly" | "annual";
type CspSectionKey = "Assets" | "Liabilities" | "Goals" | "Protection notes";
type InfoView = "about" | "privacy" | "terms";
type PreferredContactMethod = "email" | "phone" | "text";

type ExpenseItem = {
  id: string;
  group: string;
  label: string;
  value: number;
  frequency?: Frequency;
};

type DiagnosticQuestion = {
  id: string;
  label: string;
  sub?: string;
  options: Array<{ label: string; value: string; score: number }>;
};

type OptionalProfile = Record<CspSectionKey, Record<string, string>>;

type Snapshot = {
  monthlyIncome: number;
  monthlyExpenses: number;
  goppi: number;
  ratio: number;
  score: number;
  topCategories: Array<{ label: string; value: number }>;
};

type CspCoverage = {
  coverageId: string;
  insured: string;
  type: string;
  carrier: string;
  status: string;
  faceAmount: number;
  monthlyPremium: number;
  cashValue: number;
  policyNumber: string;
  issueDate: string;
  annualPremium: number;
  productDetails: string;
  ridersSummary: string;
  sourceDocument: string;
  verificationStatus: string;
  sourceConfidence: string;
  notes: string;
};

type CspReviewBaseline = {
  sessionId: string;
  household: string;
  snapshotId: string;
  monthlyIncome: number;
  expenseCategories: Record<string, number>;
  assets: Record<string, number>;
  liabilities: Record<string, number>;
  goals: Record<string, string | number>;
  protectionNotes: string;
  coverage: CspCoverage[];
  baselineState: string;
  advisorSummary: string;
};

type PdfDoc = {
  addImage: (imageData: string, format: string, x: number, y: number, width: number, height: number) => void;
  setFont: (fontName: string, fontStyle?: string) => void;
  setFontSize: (size: number) => void;
  setTextColor: (r: number, g: number, b: number) => void;
  setDrawColor: (r: number, g: number, b: number) => void;
  setFillColor: (r: number, g: number, b: number) => void;
  roundedRect: (x: number, y: number, width: number, height: number, rx: number, ry: number, style?: string) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  text: (text: string | string[], x: number, y: number, options?: Record<string, unknown>) => void;
  splitTextToSize: (text: string, maxWidth: number) => string[];
  addPage: () => void;
  save: (filename: string) => void;
};

type JsPdfConstructor = new (options?: Record<string, unknown>) => PdfDoc;

const paths: Record<PathKey, {
  label: string;
  prompt: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  primary: string;
  toolTitle: string;
}> = {
  csp: {
    label: "Money keeps slipping away",
    prompt: "Conscious Spending Tool",
    eyebrow: "",
    title: "TouchPoint Conscious Spending Tool",
    body: "Find your monthly financial flexibility in minutes, surface the biggest concerns, and leave with an advisor-ready GOPPI™ snapshot that leads directly into your TOPPI™ strategy review.",
    points: ["GOPPI™ snapshot", "TOPPI™ review path", "No account, credit card, or personal document upload", "Advisor-ready next step"],
    primary: "Start My GOPPI™ Snapshot",
    toolTitle: "TouchPoint Conscious Spending Tool"
  },
  protection: {
    label: "My family depends on my income",
    prompt: "60-second risk check",
    eyebrow: "PROTECT WHAT MATTERS MOST",
    title: "If your income stopped tomorrow... what would break first?",
    body: "Most families don't see the risks coming - income gaps, protection gaps, and estate exposure that may not become obvious until it's too late.",
    points: ["Income continuity", "Household obligations", "Family dependency", "Coverage gaps"],
    primary: "Start My Risk Check",
    toolTitle: "60-Second Risk Check"
  },
  retirement: {
    label: "Retirement and taxes worry me",
    prompt: "60-second exposure check",
    eyebrow: "RETIREMENT & TAX EXPOSURE",
    title: "You may not have an income problem... you may have a tax and timing problem.",
    body: "Most plans look fine on the surface - until taxes, timing, and distribution pressure start working against you.",
    points: ["Savings starting point", "Retirement timeline", "Contribution consistency", "Hidden fees and management costs"],
    primary: "Reveal My Exposure",
    toolTitle: "60-Second Exposure Check"
  },
  trust: {
    label: "I need to protect my family and estate",
    prompt: "Trust exposure check",
    eyebrow: "Estate Guru / Trust Readiness",
    title: "Your family should not have to guess what you meant.",
    body: "Check whether the people you love would know what to do, who can speak for you, and how the plan is protected if life changes suddenly.",
    points: ["Probate exposure", "Family decision clarity", "Life protection and coverage", "Funding alignment"],
    primary: "Check my trust readiness",
    toolTitle: "Trust Readiness Check"
  },
  business: {
    label: "My business depends on me or a key person",
    prompt: "Business continuity check",
    eyebrow: "BUSINESS OWNER CONTINUITY",
    title: "If your business had to run without you, what would break first?",
    body: "For business owners, self-employed professionals, partners, and key-person dependent teams, continuity risk can show up before anyone is ready.",
    points: ["Owner dependency", "Partner continuity", "Key-person exposure", "Business commitments"],
    primary: "Check Business Continuity Exposure",
    toolTitle: "Business Continuity Check"
  },
  learning: {
    label: "I'm not sure where to start",
    prompt: "Infinite Learning Corridor",
    eyebrow: "INFINITE LEARNING CORRIDOR",
    title: "Learn. Simplify. Take the next step - without pressure.",
    body: "Start with one small check, then keep learning at your own pace.",
    points: ["Mini-Snapshot", "Educational videos", "TouchPoint blogs"],
    primary: "Start the Check",
    toolTitle: "Mini-Snapshot"
  }
};

const toolRoutes: Record<PathKey, string> = {
  csp: "/csp-tool",
  protection: "/risk-exposure",
  retirement: "/retirement-exposure",
  trust: "/trust-readiness",
  learning: "/mini-goppi",
  business: "/business-continuity"
};

type HelpKey =
  | "goppi"
  | "toppi"
  | "consciousSpending"
  | "miniSnapshot"
  | "financialHealth"
  | "heatGauge"
  | "optionalDetails"
  | "noAccountLinking"
  | "privacy"
  | "reviewDirection";

const helpText: Record<HelpKey, { label: string; body: string }> = {
  goppi: {
    label: "GOPPI™",
    body: "Gross Opportunity Income: a monthly view of what remains after visible income, recurring commitments, and flexible spending are considered."
  },
  toppi: {
    label: "TOPPI™",
    body: "TouchPoint Opportunity Planning Path: the guided review that turns a GOPPI™ snapshot into practical next steps."
  },
  consciousSpending: {
    label: "Conscious Spending Tool",
    body: "A manual planning check designed to show where money is committed, where flexibility remains, and which next step may deserve attention."
  },
  miniSnapshot: {
    label: "Mini-Snapshot",
    body: "A quick three-number estimate for income, fixed expenses, and variable spending. It is a starting point, not the full Conscious Spending Tool."
  },
  financialHealth: {
    label: "Financial health",
    body: "A directional score that weighs visible income flexibility, spending pressure, and optional balance-sheet details when provided."
  },
  heatGauge: {
    label: "Heat gauge",
    body: "A visual range that helps show whether the current answers point to lower, watch-zone, or higher planning pressure."
  },
  optionalDetails: {
    label: "Optional details",
    body: "Extra sections such as assets, liabilities, goals, and protection notes can deepen the review after the first snapshot is calculated."
  },
  noAccountLinking: {
    label: "No account linking",
    body: "You do not need to connect a bank account, share passwords, upload documents, or enter a credit card to use these planning checks."
  },
  privacy: {
    label: "Why contact details",
    body: "Contact details let TouchPoint send your snapshot and follow up when requested. Phone is optional unless a tool clearly says otherwise."
  },
  reviewDirection: {
    label: "Review direction",
    body: "A summary of what your answers suggest should be reviewed next. It is educational guidance, not legal, tax, or insurance advice."
  }
};

function InlineTermHelp({ term }: { term: "goppi" | "toppi" }) {
  const item = helpText[term];
  const [open, setOpen] = useState(false);
  return (
    <span className="group/tp-help relative inline-block align-baseline">
      <button
        aria-expanded={open}
        aria-describedby={`tp-help-${term}`}
        aria-label={`Show help for ${item.label}`}
        className="inline rounded-md border-0 bg-transparent p-0 font-inherit text-inherit underline decoration-emerald-200/50 decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07151c]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {item.label}
      </button>
      <span
        className={`pointer-events-none absolute left-0 top-[calc(100%+0.5rem)] z-40 w-[min(22rem,calc(100vw-3rem))] rounded-2xl border border-emerald-200/35 bg-[#071923] p-4 text-left text-sm font-medium leading-6 text-slate-200 shadow-2xl shadow-black/40 group-hover/tp-help:block ${open ? "block" : "hidden"}`}
        id={`tp-help-${term}`}
        role="tooltip"
      >
        <strong className="block text-white">{item.label}</strong>
        <span className="mt-2 block">{item.body}</span>
      </span>
    </span>
  );
}

const defaultExpenses: ExpenseItem[] = [
  { id: "housing", group: "Household essentials", label: "Housing", value: 0 },
  { id: "utilities", group: "Household essentials", label: "Utilities", value: 0 },
  { id: "food_household", group: "Household essentials", label: "Food and household", value: 0 },
  { id: "subscriptions", group: "Recurring lifestyle", label: "Subscriptions", value: 0 },
  { id: "childcare_support", group: "Recurring lifestyle", label: "Childcare, school, or support", value: 0 },
  { id: "auto_payment", group: "Transportation", label: "Auto payment", value: 0 },
  { id: "auto_registration", group: "Transportation", label: "Auto registration", value: 0 },
  { id: "fuel_maintenance", group: "Transportation", label: "Fuel and maintenance", value: 0 },
  { id: "auto_insurance", group: "Insurance", label: "Auto insurance", value: 0 },
  { id: "medical_dental_vision", group: "Insurance", label: "Medical, dental, and vision insurance", value: 0 },
  { id: "life_insurance", group: "Insurance", label: "Life insurance", value: 0 },
  { id: "debt_payments", group: "Debt and obligations", label: "Debt payments", value: 0 },
  { id: "other_recurring", group: "Debt and obligations", label: "Other recurring costs", value: 0 }
];

const categoryThumbs: Record<string, string> = {
  housing: "H",
  utilities: "U",
  food_household: "F",
  subscriptions: "S",
  childcare_support: "C",
  auto_payment: "A",
  auto_registration: "R",
  fuel_maintenance: "T",
  auto_insurance: "AI",
  medical_dental_vision: "M",
  life_insurance: "L",
  debt_payments: "D",
  other_recurring: "O"
};

const localLogoUrl = "/brand/touchpoint-logo-final-384.png";

const partnerLogos: Array<{ name: string; src: string }> = [
  { name: "Aflac", src: "/brand/partners/aflac.svg" },
  { name: "Lincoln Financial Group", src: "/brand/partners/lincoln-financial-group.svg" },
  { name: "Mutual of Omaha", src: "/brand/partners/mutual-of-omaha.svg" },
  { name: "American Equity", src: "/brand/partners/american-equity.svg" },
  { name: "Americo", src: "/brand/partners/americo.png" },
  { name: "Farmers Insurance", src: "/brand/partners/farmers-insurance.svg" },
  { name: "Allstate Insurance", src: "/brand/partners/allstate.svg" },
  { name: "F&G", src: "/brand/partners/fg.svg" },
  { name: "Foresters Financial", src: "/brand/partners/foresters-financial.svg" }
];

const lifeEvents: Array<{ label: string; path: PathKey }> = [
  { label: "Job change, layoff, or retirement decision", path: "retirement" },
  { label: "New baby or newly married", path: "trust" },
  { label: "New home purchase", path: "csp" },
  { label: "Income interruption concern", path: "protection" },
  { label: "Business ownership or self-employment change", path: "business" },
  { label: "Starting over or not sure", path: "learning" }
];

const fullCspSections: CspSectionKey[] = ["Assets", "Liabilities", "Goals", "Protection notes"];

const optionalCspFields: Record<CspSectionKey, Array<{ id: string; label: string; type: "money" | "text" }>> = {
  Assets: [
    { id: "checking", label: "Checking and cash reserves", type: "money" },
    { id: "savings", label: "Savings", type: "money" },
    { id: "brokerage", label: "Brokerage / non-retirement investments", type: "money" },
    { id: "retirement", label: "Retirement accounts", type: "money" },
    { id: "home_equity", label: "Estimated home equity", type: "money" },
    { id: "vehicles_boats_rvs", label: "Automobiles, boats, RVs, and other vehicles", type: "money" }
  ],
  Liabilities: [
    { id: "credit_cards", label: "Credit card balances", type: "money" },
    { id: "auto_loans", label: "Auto loans", type: "money" },
    { id: "student_loans", label: "Student loans", type: "money" },
    { id: "mortgage", label: "Mortgage balance", type: "money" },
    { id: "other_debt", label: "Other debt", type: "money" }
  ],
  Goals: [
    { id: "priority_goal", label: "Highest-priority goal", type: "text" },
    { id: "target_monthly_savings", label: "Target monthly savings", type: "money" },
    { id: "debt_payoff_target", label: "Debt payoff target", type: "money" }
  ],
  "Protection notes": [
    { id: "income_protection", label: "Current income protection / disability coverage", type: "text" },
    { id: "emergency_months", label: "Emergency reserve months", type: "text" },
    { id: "insurance_review_notes", label: "Protection or insurance notes", type: "text" }
  ]
};

const emptyOptionalProfile: OptionalProfile = {
  Assets: {},
  Liabilities: {},
  Goals: {},
  "Protection notes": {}
};

export function TouchPointDiagnosticApp({
  brand,
  initialPath = null,
  initialStage = "entry"
}: {
  brand: BrandConfig;
  initialPath?: PathKey | null;
  initialStage?: Stage;
}) {
  const safeInitialStage = initialPath && initialStage !== "entry" ? "tool" : "entry";
  const [stage, setStage] = useState<Stage>(safeInitialStage);
  const [activePath, setActivePath] = useState<PathKey | null>(initialPath);
  const [infoView, setInfoView] = useState<InfoView | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sessionId] = useState(() => createSessionId());
  const mainRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    track(initialPath ? "direct_tool_link_loaded" : "app_loaded", sessionId, initialPath ?? undefined);
  }, [initialPath, sessionId]);

  function choosePath(path: PathKey) {
    setMobileNavOpen(false);
    setInfoView(null);
    setActivePath(path);
    setStage("selected");
    track("path_selected", sessionId, path);
    setTimeout(() => mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  function openTool() {
    setMobileNavOpen(false);
    if (!activePath) return;
    const nextRoute = toolRoutes[activePath];
    if (typeof window !== "undefined" && nextRoute && window.location.pathname !== nextRoute) {
      window.history.pushState({ touchpointPath: activePath, stage: "tool" }, "", nextRoute);
    }
    setStage("tool");
    track("tool_opened", sessionId, activePath);
    setTimeout(() => mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  function clearSelection() {
    setMobileNavOpen(false);
    setInfoView(null);
    setActivePath(null);
    setStage("entry");
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.history.pushState({ touchpointPath: null, stage: "entry" }, "", "/");
    }
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 30);
  }

  function openInfo(view: InfoView) {
    setMobileNavOpen(false);
    setInfoView(view);
    setActivePath(null);
    setStage("entry");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 30);
  }

  const selected = activePath ? paths[activePath] : null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#06121a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(67,209,198,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(67,209,198,0.08)_1px,transparent_1px)] bg-[size:96px_96px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(104,220,194,0.14),transparent_30rem),radial-gradient(circle_at_78%_38%,rgba(24,156,202,0.12),transparent_26rem)]" />

      <header className="relative z-20 border-b border-cyan-200/10 bg-[#07141e]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-1.5 sm:px-5 sm:py-2.5">
          <button aria-label="Return to entry" className="inline-flex h-16 w-[124px] shrink-0 items-center justify-center overflow-hidden rounded-xl" onClick={clearSelection} type="button">
            <img alt="TouchPoint" className="h-full w-full object-contain" src={localLogoUrl} />
          </button>
          <nav aria-label="TouchPoint navigation" className="hidden items-center gap-2 text-[13px] font-extrabold text-slate-200 lg:flex">
            <button className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" onClick={clearSelection} type="button">Home</button>
            <button className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" onClick={() => openInfo("about")} type="button">About</button>
            <button className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" onClick={() => choosePath("csp")} type="button">CSP Tool</button>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/learning-hub-blog/">Blogs</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/learning-hub-vlog/">Vlogs</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/privacy-policy/">Privacy Policy</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/terms-disclosures/">Terms / Legal</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="mailto:admin@touchpointgroup.co">Contact</a>
            <a className="rounded-full border border-emerald-200/30 bg-teal-700/40 px-4 py-2 text-white hover:bg-teal-700/70" href={brand.calendlyUrl}>Schedule Now</a>
          </nav>
          <details className="relative lg:hidden" open={mobileNavOpen} onToggle={(event) => setMobileNavOpen(event.currentTarget.open)}>
            <summary aria-label="Open navigation menu" className="list-none rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-lg font-black text-white marker:hidden">
              <Menu aria-hidden="true" className="h-6 w-6" />
            </summary>
            <nav aria-label="Mobile navigation" className="absolute right-0 top-14 grid w-[calc(100vw-2rem)] max-w-sm grid-cols-2 gap-2 rounded-2xl border border-cyan-200/15 bg-[#0b2030] p-3 shadow-2xl">
              <button className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" onClick={clearSelection} type="button">Home</button>
              <button className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" onClick={() => openInfo("about")} type="button">About</button>
              <button className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" onClick={() => choosePath("csp")} type="button">CSP Tool</button>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href={brand.calendlyUrl}>Schedule Now</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/learning-hub-blog/">Blogs</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/learning-hub-vlog/">Vlogs</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/privacy-policy/">Privacy Policy</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/terms-disclosures/">Terms / Legal</a>
              <a className="col-span-2 rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="mailto:admin@touchpointgroup.co">Contact</a>
            </nav>
          </details>
        </div>
      </header>

      {infoView ? (
        <InfoSections brand={brand} onHome={clearSelection} view={infoView} />
      ) : (
        <>
      <section className="relative z-10 mx-auto grid max-w-6xl gap-2 px-4 py-2 sm:px-5 sm:py-4 md:grid-cols-[0.92fr_1.08fr] md:gap-7 md:py-6">
        <div className="order-2 self-center md:order-1">
          <h1 className="max-w-3xl font-serif text-[1.26rem] leading-[0.98] text-white sm:text-5xl md:text-5xl">
            When life changes, money questions get louder.
          </h1>
        </div>

        <div className="order-1 overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#0b2028] shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:order-2">
          <div className="relative h-[178px] bg-[#07141e] sm:h-[260px] md:aspect-[4/3] md:h-auto md:min-h-[280px]">
            <img
              alt="A household reviewing financial papers together"
              className="pointer-events-none h-full w-full object-cover object-[50%_58%] opacity-90 motion-safe:animate-[tp-image-drift_14s_ease-in-out_infinite]"
              src="/brand/touchpoint-hero-pressure.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06121a] via-[#06121a]/35 to-transparent" />
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.10)_45%,transparent_60%)] opacity-0 motion-safe:animate-[tp-photo-light_8s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      <section id="tp-diagnostic-main" ref={mainRef} className="relative z-10 mx-auto max-w-6xl px-5 pb-12">
        {stage === "entry" ? (
          <EntrySelector activePath={activePath} onChoose={choosePath} />
        ) : selected && activePath ? (
          <SelectedPath
            activePath={activePath}
            brand={brand}
            onBack={() => setStage("entry")}
            onClear={clearSelection}
            onOpenTool={openTool}
            selected={selected}
            sessionId={sessionId}
            stage={stage}
          />
        ) : null}
      </section>

      {stage === "entry" ? <PartnerBand /> : null}
        </>
      )}

      <style jsx global>{`
        @keyframes tp-image-drift {
          0%, 100% { transform: scale(1.045) translate3d(0, 0, 0); filter: saturate(0.9) brightness(0.9) contrast(1.02); }
          44% { transform: scale(1.005) translate3d(0, 0.7%, 0); filter: saturate(1.03) brightness(0.98) contrast(1.08); }
          72% { transform: scale(1.025) translate3d(-0.8%, -0.5%, 0); filter: saturate(0.96) brightness(0.92) contrast(1.06); }
        }
        @keyframes tp-photo-light {
          0%, 70%, 100% { opacity: 0; transform: translateX(-35%); }
          82% { opacity: 0.22; transform: translateX(35%); }
        }
        .tp-copy {
          hyphens: auto;
          text-wrap: pretty;
        }
        @media (min-width: 700px) {
          .tp-copy {
            text-align: justify;
          }
        }
      `}</style>
    </main>
  );
}

function EntrySelector({ activePath, onChoose }: { activePath: PathKey | null; onChoose: (path: PathKey) => void }) {
  const [selectorMode, setSelectorMode] = useState<"concerns" | "life-events">("concerns");
  const showingLifeEvents = selectorMode === "life-events";

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#07151c]/90 p-2.5 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-200/80 sm:text-sm">
            {showingLifeEvents ? "Choose the life event" : "Choose the first concern"}
          </p>
          <h2 className="mt-1 text-xl font-extrabold leading-tight sm:mt-3 sm:text-5xl">
            {showingLifeEvents ? "What changed recently?" : "What concerns you most right now?"}
          </h2>
        </div>
        {showingLifeEvents ? (
          <button
            className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-xs font-extrabold text-slate-100 transition hover:border-emerald-200/70 hover:bg-emerald-200/10 sm:text-sm"
            onClick={() => setSelectorMode("concerns")}
            type="button"
          >
            Back
          </button>
        ) : null}
      </div>
      <div className="mt-3 grid gap-1.5 sm:mt-7 sm:gap-3">
        {showingLifeEvents
          ? lifeEvents.map((event) => (
              <button
                className="group flex min-h-9 items-center justify-between rounded-2xl border border-white/15 bg-white/[0.045] px-3.5 py-1.5 text-left text-[0.9rem] font-extrabold leading-tight transition hover:border-emerald-200/70 hover:bg-emerald-200/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 sm:min-h-20 sm:px-5 sm:py-4 sm:text-lg"
                key={event.label}
                onClick={() => onChoose(event.path)}
                type="button"
              >
                <span>{event.label}</span>
                <ChevronRight className="h-6 w-6 text-emerald-200 transition group-hover:translate-x-1" />
              </button>
            ))
          : (Object.keys(paths) as PathKey[]).map((path) => (
              <button
                aria-pressed={activePath === path}
                className="group flex min-h-9 items-center justify-between rounded-2xl border border-white/15 bg-white/[0.045] px-3.5 py-1.5 text-left text-[0.9rem] font-extrabold leading-tight transition hover:border-emerald-200/70 hover:bg-emerald-200/10 sm:min-h-20 sm:px-5 sm:py-4 sm:text-lg"
                key={path}
                onClick={() => onChoose(path)}
                type="button"
              >
                <span>{paths[path].label}</span>
                <ChevronRight className="h-6 w-6 text-emerald-200 transition group-hover:translate-x-1" />
              </button>
            ))}
      </div>
      {!showingLifeEvents ? (
        <div className="mt-3 border-t border-white/10 pt-3 sm:mt-6 sm:pt-5">
        <button
          aria-label="Switch to life event selector"
          className="group flex w-full items-center justify-between rounded-2xl border border-emerald-200/25 bg-emerald-200/[0.07] px-3.5 py-3 text-left transition hover:border-emerald-200/70 hover:bg-emerald-200/12 sm:px-5 sm:py-4"
          onClick={() => setSelectorMode("life-events")}
          type="button"
        >
          <span>
            <span className="block text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-emerald-100/80 sm:text-xs">Different starting point?</span>
            <span className="mt-1 block text-base font-extrabold text-white sm:text-2xl">Start with a life event instead</span>
          </span>
          <ChevronRight className="h-6 w-6 text-emerald-200 transition group-hover:translate-x-1" />
        </button>
      </div>
      ) : null}
    </div>
  );
}

function PartnerBand({ compact = false }: { compact?: boolean }) {
  if (!partnerLogos.length) return null;
  const logos = [...partnerLogos, ...partnerLogos];
  return (
    <section aria-label="Strategic carrier and planning partners" className={compact ? "pt-5" : "relative z-10 mx-auto max-w-6xl px-5 pb-12"}>
      <div className={`overflow-hidden rounded-[1.25rem] border border-cyan-300/15 bg-[#07151c]/85 ${compact ? "p-3 opacity-85" : "p-4"}`}>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200/80">Strategic Carrier & Planning Partners</p>
        <div className={compact ? "mt-3 overflow-hidden" : "mt-4 overflow-hidden"} role="list">
          <div className="flex w-max min-w-full gap-3 motion-safe:animate-[tp-partner-scroll_34s_linear_infinite]">
            {logos.map((logo, index) => (
              <div
                className={`${compact ? "h-10 min-w-[104px] px-3" : "h-14 min-w-[132px] px-4"} flex items-center justify-center rounded-xl border border-white/10 bg-white shadow-sm`}
                key={`${logo.name}-${index}`}
                role="listitem"
              >
                <img
                  alt={logo.name}
                  className={`${compact ? "max-h-6 max-w-[86px]" : "max-h-8 max-w-[108px]"} object-contain`}
                  decoding="async"
                  loading="eager"
                  src={logo.src}
                />
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[0.64rem] leading-4 text-slate-400">
          Logos and trademarks are the property of their respective owners and are shown for carrier and planning relationship context only.
        </p>
      </div>
      <style jsx>{`
        @keyframes tp-partner-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[role="list"] > div { animation: none !important; flex-wrap: wrap; width: 100%; }
        }
      `}</style>
    </section>
  );
}

function InfoSections({ brand, onHome, view }: { brand: BrandConfig; onHome: () => void; view: InfoView }) {
  const showAbout = view === "about";
  const showPrivacy = view === "privacy";
  const showTerms = view === "terms";
  return (
    <section className="relative z-10 mx-auto grid max-w-6xl gap-5 px-5 py-8">
      <div className="flex flex-wrap gap-3">
        <button className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-bold text-slate-100" onClick={onHome} type="button">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>
        <a className="inline-flex items-center justify-center rounded-full border border-emerald-200/30 bg-teal-700/30 px-4 py-2 font-bold text-slate-100" href={brand.calendlyUrl}>
          Schedule now
        </a>
      </div>
      {showAbout ? (
      <article id="tp-about" className="rounded-[1.5rem] border border-white/10 bg-[#07151c]/90 p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">About TouchPoint</p>
            <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl">When the weight gets real, clarity has to become practical.</h2>
            <div className="tp-copy mt-4 grid gap-4 leading-7 text-slate-300">
              <p>TouchPoint exists for the moment when money, family, work, and responsibility start pressing in at the same time. The goal is not to overwhelm people with products or jargon. It is to help uncover what feels exposed, name the next decision, and make the path forward easier to understand.</p>
              <p>Nikki Caruthers built TouchPoint from both lived perspective and a career spent simplifying complex decisions. His background includes a Bachelor of Science from MIT, an MBA in International Finance with a focus in Global Marketing from Thunderbird School of Global Management, and years inside large corporate environments where pricing, operations, strategy, and financial tradeoffs had to be made clear for executive action.</p>
              <p>That experience now serves families, professionals, and business owners who want practical guidance around income protection, business continuity, retirement timing, estate readiness, and conscious spending. TouchPoint is designed to help people see the pressure before it becomes a crisis, then move with more confidence and less isolation.</p>
            </div>
            <a className="mt-4 inline-flex font-extrabold text-emerald-200" href={brand.calendlyUrl}>Schedule a strategy session</a>
          </div>
          <figure className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-3">
            <img
              alt="TouchPoint founder"
              className="aspect-[4/5] w-full rounded-2xl object-cover"
              loading="lazy"
              src="/brand/touchpoint-founder.webp"
            />
            <figcaption className="tp-copy mt-3 text-sm leading-6 text-slate-300">Built from real-world pressure, corporate discipline, and the belief that the truth is often already there—it just hasn&apos;t been connected into a clear picture.</figcaption>
          </figure>
        </div>
      </article>
      ) : null}
      {showPrivacy ? (
      <article id="tp-privacy" className="rounded-[1.5rem] border border-white/10 bg-[#07151c]/90 p-5 sm:p-7">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">Privacy</p>
        <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl">Privacy Policy</h2>
        <div className="tp-copy mt-4 grid gap-4 leading-7 text-slate-300">
          <p>TouchPoint respects your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have when you use our website, tools, forms, scheduling links, and related services.</p>
          <h3 className="text-xl font-extrabold text-white">Information We Collect</h3>
          <p>We may collect information you choose to provide, including your name, email address, phone number, contact preferences, and messages you submit through our forms.</p>
          <p>When you use our planning tools, including the Conscious Spending Tool, GOPPI™ snapshots, quizzes, or related calculators, we may collect financial inputs you enter, such as income, expenses, goals, assets, liabilities, protection concerns, retirement timing, savings ranges, and other planning-related responses.</p>
          <h3 className="text-xl font-extrabold text-white">How We Use Information</h3>
          <p>We use your information to provide requested snapshots, tool results, educational content, scheduling support, follow-up communications, and financial strategy discussions. We may also use your information to improve our tools, organize submissions, maintain records, and support compliance and security.</p>
          <h3 className="text-xl font-extrabold text-white">Contact and Communications</h3>
          <p>By submitting your information, you agree to be contacted by TouchPoint or a licensed insurance professional via call, text, or email regarding your financial strategy and related services. Message and data rates may apply. You can opt out at any time.</p>
          <h3 className="text-xl font-extrabold text-white">Third-Party Tools</h3>
          <p>We may use third-party tools to operate our website and services, including Google Sheets and Google Apps Script for form routing and data organization, Calendly for scheduling, and email systems for sending requested snapshots, confirmations, and follow-up communications.</p>
          <p>These third-party providers may process information according to their own privacy policies and security practices.</p>
          <h3 className="text-xl font-extrabold text-white">Data Security</h3>
          <p>We use reasonable administrative, technical, and organizational safeguards to protect the information we collect. No online transmission or storage system can be guaranteed to be completely secure, but we work to limit access and use information only for appropriate business and service purposes.</p>
          <h3 className="text-xl font-extrabold text-white">How Long We Keep Information</h3>
          <p>We keep information for as long as reasonably necessary to provide services, maintain records, comply with legal obligations, resolve disputes, and support legitimate business purposes.</p>
          <h3 className="text-xl font-extrabold text-white">California Privacy Rights</h3>
          <p>If you are a California resident, you may have rights under the California Consumer Privacy Act as amended by the California Privacy Rights Act, including the right to know what personal information we collect, request deletion, request correction, limit certain uses of sensitive personal information, and opt out of certain sharing where applicable.</p>
          <p>We do not sell your personal information.</p>
          <p>To exercise your California privacy rights, contact us using the contact information provided on this website. We may need to verify your identity before processing certain requests.</p>
          <h3 className="text-xl font-extrabold text-white">Children's Privacy</h3>
          <p>Our website and tools are intended for adults. We do not knowingly collect personal information from children under 13.</p>
          <h3 className="text-xl font-extrabold text-white">Changes to This Policy</h3>
          <p>We may update this Privacy Policy from time to time. Updates will be posted on this page with the revised effective date.</p>
          <h3 className="text-xl font-extrabold text-white">Contact</h3>
          <p>If you have questions about this Privacy Policy or how your information is used, please contact TouchPoint through the contact options provided on this website.</p>
        </div>
      </article>
      ) : null}
      {showTerms ? (
      <article id="tp-terms" className="rounded-[1.5rem] border border-white/10 bg-[#07151c]/90 p-5 sm:p-7">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">Terms</p>
        <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl">Terms and Disclosures</h2>
        <div className="tp-copy mt-4 grid gap-4 leading-7 text-slate-300">
          <p>These Terms and Disclosures apply to your use of TouchPoint websites, educational content, forms, scheduling links, planning tools, and related services.</p>
          <h3 className="text-xl font-extrabold text-white">Educational Use Only</h3>
          <p>TouchPoint provides financial education and planning support. Website content, quizzes, calculators, GOPPI™ snapshots, TOPPI™ concepts, and Conscious Spending Tool outputs are for educational and informational purposes only.</p>
          <h3 className="text-xl font-extrabold text-white">Not Tax or Legal Advice</h3>
          <p>TouchPoint does not provide tax or legal advice. You should consult a qualified tax professional, attorney, or other appropriate advisor regarding your specific circumstances before making financial, tax, estate, legal, or insurance decisions.</p>
          <h3 className="text-xl font-extrabold text-white">No Guarantee of Results</h3>
          <p>Tool outputs, projections, scores, estimates, and planning observations are not guarantees of future results. Outcomes depend on your personal circumstances, market conditions, tax rules, product availability, carrier requirements, underwriting, and other factors outside TouchPoint's control.</p>
          <h3 className="text-xl font-extrabold text-white">Insurance Licensing Disclosure</h3>
          <p>Insurance products are offered through licensed insurance professionals. Any insurance recommendation, application, or purchase must be handled by an appropriately licensed professional in the applicable state.</p>
          <h3 className="text-xl font-extrabold text-white">Product Availability and Variability</h3>
          <p>Insurance product availability, features, benefits, costs, limitations, exclusions, underwriting requirements, and terms vary by carrier and state. Not all products are available to all individuals or in all locations.</p>
          <h3 className="text-xl font-extrabold text-white">Lead Forms and Communications</h3>
          <p>When you submit your information through a TouchPoint form or tool, you authorize TouchPoint or a licensed insurance professional to contact you via call, text, or email regarding your financial strategy and related services. Message and data rates may apply. You can opt out at any time.</p>
          <h3 className="text-xl font-extrabold text-white">Third-Party Links and Tools</h3>
          <p>Our website may link to or use third-party services, including scheduling, email, and data routing tools. TouchPoint is not responsible for the content, policies, or practices of third-party websites or services.</p>
          <h3 className="text-xl font-extrabold text-white">Limitation of Liability</h3>
          <p>To the fullest extent permitted by law, TouchPoint is not liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from your use of this website, educational materials, tools, forms, or related services.</p>
          <h3 className="text-xl font-extrabold text-white">No Professional Relationship Created by Website Use</h3>
          <p>Using this website, completing a tool, or submitting a form does not by itself create a client, advisory, legal, tax, or insurance relationship. Any formal relationship or product transaction requires appropriate review, documentation, and applicable licensing.</p>
          <h3 className="text-xl font-extrabold text-white">Updates</h3>
          <p>TouchPoint may update these Terms and Disclosures from time to time. Continued use of the website after updates are posted means you accept the revised terms.</p>
        </div>
      </article>
      ) : null}
    </section>
  );
}

function SelectedPath({
  activePath,
  brand,
  onBack,
  onClear,
  onOpenTool,
  selected,
  sessionId,
  stage
}: {
  activePath: PathKey;
  brand: BrandConfig;
  onBack: () => void;
  onClear: () => void;
  onOpenTool: () => void;
  selected: typeof paths[PathKey];
  sessionId: string;
  stage: Stage;
}) {
  if (stage === "tool") {
    return (
      <ToolSurface activePath={activePath} brand={brand} onClear={onClear} onPathBack={onBack} selected={selected} sessionId={sessionId} />
    );
  }

  return (
    <section className="rounded-[2rem] border border-cyan-300/20 bg-[#07151c]/95 p-5 shadow-2xl sm:p-8">
      <div className="flex flex-wrap gap-3">
        <button className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-bold text-slate-100" onClick={onBack} type="button">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button className="rounded-full border border-white/15 px-4 py-2 font-bold text-slate-100" onClick={onClear} type="button">Clear selection</button>
      </div>
      {selected.eyebrow ? <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-emerald-200/80">{selected.eyebrow}</p> : null}
      <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-none text-white sm:text-6xl">{selected.title}</h2>
      <p className="tp-copy mt-5 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl sm:leading-9">{selected.body}</p>
      {activePath === "learning" ? (
        <div className="mt-8 grid max-w-full grid-cols-[minmax(0,1fr)] gap-3 overflow-hidden">
          <button className="inline-flex min-h-16 w-full min-w-0 max-w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-4 text-center text-base font-extrabold leading-tight text-[#051016] sm:px-6 sm:text-lg" onClick={onOpenTool} type="button">
            Start Mini-Snapshot <ChevronRight className="ml-1 inline h-5 w-5" />
          </button>
          <a className="inline-flex min-h-16 w-full min-w-0 max-w-full items-center justify-center rounded-full border border-white/25 px-5 py-4 text-center text-base font-extrabold leading-tight sm:px-6 sm:text-lg" href="/learning-hub-vlog/">
            Watch educational videos <ChevronRight className="ml-1 h-5 w-5" />
          </a>
          <a className="inline-flex min-h-16 w-full min-w-0 max-w-full items-center justify-center rounded-full border border-white/25 px-5 py-4 text-center text-base font-extrabold leading-tight sm:px-6 sm:text-lg" href="/learning-hub-blog/">
            Read the blogs <ChevronRight className="ml-1 h-5 w-5" />
          </a>
          <PartnerBand compact />
        </div>
      ) : (
        <>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {selected.points.map((point) => (
              <div className="flex items-center gap-3 border-b border-white/10 px-1 py-3 text-lg text-slate-100" key={point}>
                <span className="h-2 w-8 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" />
                <span>{point}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr]">
            <button className="min-h-16 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-4 text-lg font-extrabold text-[#051016]" onClick={onOpenTool} type="button">
              {selected.primary} <ChevronRight className="ml-1 inline h-5 w-5" />
            </button>
            <a className="inline-flex min-h-16 items-center justify-center rounded-full border border-white/25 px-6 py-4 text-center text-lg font-extrabold" href={brand.calendlyUrl}>
              <CalendarDays className="mr-2 h-5 w-5" /> Schedule strategy session
            </a>
          </div>
        </>
      )}
    </section>
  );
}

function ToolSurface({
  activePath,
  brand,
  onClear,
  onPathBack,
  selected,
  sessionId
}: {
  activePath: PathKey;
  brand: BrandConfig;
  onClear: () => void;
  onPathBack: () => void;
  selected: typeof paths[PathKey];
  sessionId: string;
}) {
  return (
    <section className="rounded-[2rem] border border-cyan-300/20 bg-[#07151c]/95 p-4 shadow-2xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {selected.eyebrow ? <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">{selected.eyebrow}</p> : null}
          <h2 className="mt-2 text-2xl font-extrabold sm:text-5xl">{selected.toolTitle}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 font-bold" onClick={onPathBack} type="button">
            <ArrowLeft className="h-4 w-4" /> Path
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 font-bold" onClick={onClear} type="button">
            <X className="h-4 w-4" /> Clear
          </button>
        </div>
      </div>

      <div className="mt-7">
        {activePath === "csp" ? (
          <CspTool brand={brand} sessionId={sessionId} />
        ) : activePath === "learning" ? (
          <LearningCorridorTool brand={brand} sessionId={sessionId} />
        ) : activePath === "business" ? (
          <BusinessContinuityTool
            calendlyUrl={brand.calendlyUrl}
            onTelemetry={(eventName) => track(eventName, sessionId, "business")}
          />
        ) : (
          <QuestionTool activePath={activePath} brand={brand} sessionId={sessionId} />
        )}
      </div>
    </section>
  );
}

function CspTool({ brand, sessionId }: { brand: BrandConfig; sessionId: string }) {
  const [income, setIncome] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [expenses, setExpenses] = useState(defaultExpenses);
  const [activeExpenseGroup, setActiveExpenseGroup] = useState(defaultExpenses[0]?.group ?? "");
  const [showFull, setShowFull] = useState(false);
  const [activeOptionalSection, setActiveOptionalSection] = useState<CspSectionKey | null>(null);
  const [enabledSections, setEnabledSections] = useState<Record<CspSectionKey, boolean>>({
    Assets: false,
    Liabilities: false,
    Goals: false,
    "Protection notes": false
  });
  const [optionalProfile, setOptionalProfile] = useState<OptionalProfile>(emptyOptionalProfile);
  const [leadOpen, setLeadOpen] = useState(false);
  const [savedLead, setSavedLead] = useState<{ leadId: string; calendlyUrl: string } | null>(null);
  const [readyForCapture, setReadyForCapture] = useState(false);
  const [reviewBaseline, setReviewBaseline] = useState<CspReviewBaseline | null>(null);
  const [reviewCoverage, setReviewCoverage] = useState<CspCoverage[]>([]);
  const [reviewToken, setReviewToken] = useState("");
  const [reviewState, setReviewState] = useState<"idle" | "loading" | "loaded" | "saving" | "saved" | "error">("idle");
  const [reviewMessage, setReviewMessage] = useState("");
  const optionalRef = useRef<HTMLElement | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);
  const finalRef = useRef<HTMLElement | null>(null);
  const valuesTrackedRef = useRef(false);

  const optionalTotals = useMemo(() => calculateOptionalTotals(optionalProfile), [optionalProfile]);
  const expenseGroups = useMemo(() => groupExpenses(expenses), [expenses]);
  const snapshot = useMemo(() => calculateSnapshot(income, frequency, expenses, optionalTotals, optionalProfile), [income, frequency, expenses, optionalTotals, optionalProfile]);
  const normalizedMonthlyExpenses = useMemo(() => normalizeExpenses(expenses), [expenses]);
  const advisorInsights = useMemo(
    () => buildAdvisorInsights(snapshot, normalizedMonthlyExpenses, optionalProfile, optionalTotals, enabledSections),
    [snapshot, normalizedMonthlyExpenses, optionalProfile, optionalTotals, enabledSections]
  );
  const afterGoals = Math.max(0, snapshot.goppi - optionalTotals.targetSavings);
  const scoreTone = getScoreTone(snapshot.score);

  useEffect(() => {
    if (valuesTrackedRef.current) return;
    const hasEnteredValues = snapshot.monthlyIncome > 0 || expenses.some((item) => item.value > 0);
    if (!hasEnteredValues) return;
    valuesTrackedRef.current = true;
    track("csp_values_entered", sessionId, "csp");
  }, [expenses, sessionId, snapshot.monthlyIncome]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get("review") || "";
    const token = params.get("token") || "";
    if (!session || !token) return;
    let active = true;
    setReviewState("loading");
    fetch(`/api/touchpoint/client-csp-review?session=${encodeURIComponent(session)}&token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        if (!active) return;
        if (!result?.ok || !result.review) throw new Error(result?.message || "Review link unavailable.");
        const baseline = result.review as CspReviewBaseline;
        const assets = baseline.assets || {};
        const liabilities = baseline.liabilities || {};
        const goals = baseline.goals || {};
        setReviewBaseline(baseline);
        setReviewCoverage(baseline.coverage || []);
        setReviewToken(token);
        setIncome(String(baseline.monthlyIncome || ""));
        setFrequency("monthly");
        setExpenses((current) => current.map((item) => ({ ...item, value: Number(baseline.expenseCategories?.[item.id] || 0), frequency: "monthly" })));
        setOptionalProfile({
          Assets: Object.fromEntries(Object.entries(assets).map(([key, value]) => [key, String(value)])),
          Liabilities: Object.fromEntries(Object.entries(liabilities).map(([key, value]) => [key, String(value)])),
          Goals: Object.fromEntries(Object.entries(goals).map(([key, value]) => [key, String(value)])),
          "Protection notes": { insurance_review_notes: baseline.protectionNotes || "" }
        });
        setEnabledSections({ Assets: Object.keys(assets).length > 0, Liabilities: Object.keys(liabilities).length > 0, Goals: Object.keys(goals).length > 0, "Protection notes": Boolean(baseline.protectionNotes) });
        setShowFull(true);
        setReviewState("loaded");
        setReviewMessage("Historical baseline loaded. Confirm and update every value with the client before saving this review.");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setReviewState("error");
        setReviewMessage(error instanceof Error ? error.message : "Unable to load review.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (showFull) {
      window.setTimeout(() => optionalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    }
  }, [showFull]);

  function calculateAndShowSummary() {
    setReadyForCapture(true);
    window.setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    window.setTimeout(() => finalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 650);
  }

  function updateExpense(id: string, value: string) {
    setReadyForCapture(false);
    setExpenses((current) => current.map((item) => item.id === id ? { ...item, value: parseMoney(value) } : item));
  }

  function updateExpenseFrequency(id: string, nextFrequency: Frequency) {
    setReadyForCapture(false);
    setExpenses((current) => current.map((item) => item.id === id ? { ...item, frequency: nextFrequency } : item));
  }

  function updateOptional(section: CspSectionKey, fieldId: string, value: string) {
    setReadyForCapture(false);
    setOptionalProfile((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [fieldId]: value
      }
    }));
  }

  function toggleSection(section: CspSectionKey) {
    setShowFull(true);
    setEnabledSections((current) => {
      const nextEnabled = !current[section];
      setActiveOptionalSection(nextEnabled ? section : null);
      return { ...current, [section]: nextEnabled };
    });
    window.setTimeout(() => optionalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  function updateReviewCoverage(index: number, field: keyof CspCoverage, value: string) {
    const numericFields: Array<keyof CspCoverage> = ["faceAmount", "monthlyPremium", "cashValue", "annualPremium"];
    setReviewCoverage((current) => {
      const next = current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: numericFields.includes(field) ? parseMoney(value) : value } : item);
      if (field === "monthlyPremium") {
        const premiumTotal = next.reduce((sum, item) => sum + Number(item.monthlyPremium || 0), 0);
        setExpenses((currentExpenses) => currentExpenses.map((item) => item.id === "life_insurance" ? { ...item, value: premiumTotal, frequency: "monthly" } : item));
      }
      setReadyForCapture(false);
      return next;
    });
  }

  function focusOptionalSection(section: CspSectionKey) {
    setShowFull(true);
    setEnabledSections((current) => ({ ...current, [section]: true }));
    setActiveOptionalSection(section);
    window.setTimeout(() => optionalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  function reset() {
    setIncome("");
    setExpenses(defaultExpenses);
    setActiveExpenseGroup(defaultExpenses[0]?.group ?? "");
    setEnabledSections({ Assets: false, Liabilities: false, Goals: false, "Protection notes": false });
    setOptionalProfile(emptyOptionalProfile);
    setShowFull(false);
    setActiveOptionalSection(null);
    setReadyForCapture(false);
  }

  async function saveAdvisorReview() {
    if (!reviewBaseline || !reviewToken) return;
    setReviewState("saving");
    setReviewMessage("Saving the reviewed snapshot to the client review history.");
    try {
      const response = await fetch("/api/touchpoint/client-csp-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: reviewBaseline.sessionId,
          token: reviewToken,
          snapshot: {
            monthlyIncome: snapshot.monthlyIncome,
            monthlyExpenses: snapshot.monthlyExpenses,
            goppi: snapshot.goppi,
            goppiRatio: snapshot.ratio,
            goppiScore: snapshot.score,
            expenseCategories: Object.fromEntries(expenses.map((item) => [item.id, item.value])),
            assets: optionalProfile.Assets,
            liabilities: optionalProfile.Liabilities,
            goals: optionalProfile.Goals,
            protectionNotes: optionalProfile["Protection notes"].insurance_review_notes || "",
            coverage: reviewCoverage
          }
        })
      });
      const result = await response.json();
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Unable to save review.");
      setReviewState("saved");
      setReviewMessage("Reviewed values saved to the client CSP review history.");
    } catch (error) {
      setReviewState("error");
      setReviewMessage(error instanceof Error ? error.message : "Unable to save review.");
    }
  }

  const payload = {
    monthlyIncome: snapshot.monthlyIncome,
    monthlyExpenses: snapshot.monthlyExpenses,
    goppi: snapshot.goppi,
    goppiRatio: snapshot.ratio,
    goppiScore: snapshot.score,
    topCategories: snapshot.topCategories,
    frequency,
    enteredExpenses: expenses,
    normalizedMonthlyExpenses,
    optionalSectionsEnabled: enabledSections,
    optionalProfile,
    optionalTotals,
    afterGoals,
    advisorInsights,
    hasDebtConsultationOpportunity: hasDebtOpportunity(expenses, optionalProfile, optionalTotals)
  };
  const debtOpportunity = hasDebtOpportunity(expenses, optionalProfile, optionalTotals);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="rounded-[1.5rem] border border-white/10 bg-[#0a2029] p-4 sm:p-6">
        {reviewState !== "idle" ? (
          <div className="mb-5 rounded-2xl border border-cyan-200/30 bg-cyan-200/10 p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-100">Advisor Review Mode{reviewBaseline ? ` - ${reviewBaseline.household}` : ""}</p>
            <p className="mt-2 text-sm leading-6 text-slate-100">{reviewState === "loading" ? "Loading saved CSP baseline..." : reviewMessage}</p>
          </div>
        ) : null}
        {reviewBaseline && reviewCoverage.length ? (
          <div className="mb-5 rounded-2xl border border-emerald-200/30 bg-emerald-200/10 p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-100">Coverage In Force - Review With Client</p>
            <div className="mt-3 grid gap-3">
              {reviewCoverage.map((coverage, coverageIndex) => (
                <div className="rounded-xl border border-white/10 bg-[#06151d]/70 p-3" key={`${coverage.insured}-${coverage.carrier}`}>
                  <p className="font-extrabold text-white">{coverage.insured}: {coverage.carrier}</p>
                  <p className="mt-1 text-sm text-slate-200">{coverage.type} - {coverage.status}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-xs font-bold text-slate-200">Policy number
                      <input className="min-h-11 rounded-xl border border-white/15 bg-[#0a2029] px-3 text-sm text-white" onChange={(event) => updateReviewCoverage(coverageIndex, "policyNumber", event.target.value)} value={coverage.policyNumber || ""} />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-slate-200">Issue date
                      <input className="min-h-11 rounded-xl border border-white/15 bg-[#0a2029] px-3 text-sm text-white" onChange={(event) => updateReviewCoverage(coverageIndex, "issueDate", event.target.value)} type="date" value={coverage.issueDate || ""} />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-slate-200">Death benefit
                      <MoneyInput ariaLabel={`${coverage.insured} death benefit`} value={coverage.faceAmount ? formatNumber(coverage.faceAmount) : ""} onChange={(value) => updateReviewCoverage(coverageIndex, "faceAmount", value)} />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-slate-200">Monthly premium
                      <MoneyInput ariaLabel={`${coverage.insured} monthly premium`} value={coverage.monthlyPremium ? formatNumber(coverage.monthlyPremium) : ""} onChange={(value) => updateReviewCoverage(coverageIndex, "monthlyPremium", value)} />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-slate-200">Annual planned premium
                      <MoneyInput ariaLabel={`${coverage.insured} annual premium`} value={coverage.annualPremium ? formatNumber(coverage.annualPremium) : ""} onChange={(value) => updateReviewCoverage(coverageIndex, "annualPremium", value)} />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-slate-200">Cash value
                      <MoneyInput ariaLabel={`${coverage.insured} cash value`} value={coverage.cashValue ? formatNumber(coverage.cashValue) : ""} onChange={(value) => updateReviewCoverage(coverageIndex, "cashValue", value)} />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-slate-200 sm:col-span-2">Coverage status
                      <select className="min-h-11 rounded-xl border border-white/15 bg-[#0a2029] px-3 text-sm text-white" onChange={(event) => updateReviewCoverage(coverageIndex, "status", event.target.value)} value={coverage.status || "Unknown - verify"}>
                        <option>Current TouchPoint policy - issued policy reviewed</option>
                        <option>Current TouchPoint policy - annual statement verified</option>
                        <option>Current TouchPoint policy - advisor confirmed; verify carrier record</option>
                        <option>Current TouchPoint policy - confirm current values</option>
                        <option>Unknown - verify</option>
                        <option>Lapsed / replaced</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-slate-200 sm:col-span-2">Product details
                      <textarea className="min-h-20 rounded-xl border border-white/15 bg-[#0a2029] p-3 text-sm leading-5 text-white" onChange={(event) => updateReviewCoverage(coverageIndex, "productDetails", event.target.value)} value={coverage.productDetails || ""} />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-slate-200 sm:col-span-2">Riders and living benefits
                      <textarea className="min-h-20 rounded-xl border border-white/15 bg-[#0a2029] p-3 text-sm leading-5 text-white" onChange={(event) => updateReviewCoverage(coverageIndex, "ridersSummary", event.target.value)} value={coverage.ridersSummary || ""} />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-slate-200 sm:col-span-2">Verification notes
                      <textarea className="min-h-20 rounded-xl border border-white/15 bg-[#0a2029] p-3 text-sm leading-5 text-white" onChange={(event) => updateReviewCoverage(coverageIndex, "notes", event.target.value)} value={coverage.notes || ""} />
                    </label>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-400">Source: {coverage.sourceDocument || "Manual record"}. Confidence: {coverage.sourceConfidence || coverage.verificationStatus || "Verify with carrier"}.</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-300">The CSP life-insurance expense updates automatically when a monthly policy premium changes. Save the reviewed CSP snapshot to write confirmed policy details back to the CRM coverage record and review history.</p>
          </div>
        ) : null}
        <p className="tp-copy text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
          Start with income, add recurring expenses, and immediately see what remains as <InlineTermHelp term="goppi" />. Values normalize to a monthly lens so the snapshot stays easy to compare and easy to explain.
        </p>
        <div className="mt-4 grid gap-3 rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200/80">Snapshot Readiness</p>
              <p className="tp-copy mt-1 text-sm leading-6 text-slate-200">{getReadinessCopy(snapshot, expenses)}</p>
            </div>
            <strong className="text-2xl">{getReadinessPercent(snapshot, expenses)}%</strong>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${getReadinessPercent(snapshot, expenses)}%` }} />
          </div>
          <p className="text-xs font-bold text-slate-300">Income ${formatNumber(snapshot.monthlyIncome)} - Expenses ${formatNumber(snapshot.monthlyExpenses)} - GOPPI™ ${formatNumber(snapshot.goppi)}</p>
        </div>
        <div className="mt-5 grid gap-5">
          <label className="grid gap-2 text-base font-bold">
            Household income
            <MoneyInput ariaLabel="Monthly household income" value={income} onChange={(value) => {
              setReadyForCapture(false);
              setIncome(value);
            }} />
          </label>
          <FrequencyControl frequency={frequency} onChange={setFrequency} />
          <div className="grid gap-3">
            {expenseGroups.map((group) => {
              const isOpen = activeExpenseGroup === group.name;
              const sectionId = `csp-expense-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
              const monthlyTotal = group.items.reduce((sum, item) => sum + ((item.frequency ?? "monthly") === "annual" ? item.value / 12 : item.value), 0);
              return (
                <section className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-3 sm:p-4" key={group.name}>
                  <button
                    aria-controls={sectionId}
                    aria-expanded={isOpen}
                    className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl px-2 py-2 text-left"
                    onClick={() => setActiveExpenseGroup(isOpen ? "" : group.name)}
                    type="button"
                  >
                    <span>
                      <span className="block text-sm font-extrabold uppercase tracking-[0.16em] text-emerald-200/80">{group.name}</span>
                      <span className="mt-1 block text-sm font-bold text-slate-300">{monthlyTotal ? `$${formatNumber(monthlyTotal)} monthly` : "Add values as they apply"}</span>
                    </span>
                    <ChevronRight aria-hidden="true" className={`h-5 w-5 shrink-0 text-emerald-200 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>
                  {isOpen ? (
                    <div className="mt-3 grid gap-4" id={sectionId}>
                      {group.items.map((item) => (
                        <label className="grid gap-2 text-base font-bold" key={item.id}>
                          <span className="flex items-center gap-3">
                            <span aria-hidden="true" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-200/30 bg-white/10 text-xs font-black text-emerald-100">{categoryThumbs[item.id]}</span>
                            <span>{item.label}</span>
                          </span>
                          <MoneyInput ariaLabel={`${item.label} amount`} value={item.value ? formatNumber(item.value) : ""} onChange={(value) => updateExpense(item.id, value)} />
                          <CompactFrequencyControl frequency={item.frequency ?? "monthly"} label={`${item.label} frequency`} onChange={(nextFrequency) => updateExpenseFrequency(item.id, nextFrequency)} />
                        </label>
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
          <button className="min-h-14 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-lg font-extrabold text-[#051016]" onClick={calculateAndShowSummary} type="button">
            Calculate GOPPI™ snapshot
          </button>
          {reviewBaseline ? (
            <button className="min-h-14 rounded-full border border-cyan-200/50 bg-cyan-200/10 px-5 py-3 text-lg font-extrabold text-cyan-50 disabled:opacity-60" disabled={reviewState === "saving"} onClick={() => void saveAdvisorReview()} type="button">
              {reviewState === "saving" ? "Saving reviewed values..." : reviewState === "saved" ? "Reviewed values saved" : "Save reviewed CSP snapshot"}
            </button>
          ) : null}
          <button className="min-h-14 rounded-full border border-emerald-200/40 bg-emerald-200/10 px-5 py-3 text-lg font-extrabold text-emerald-50" onClick={() => {
            setShowFull(true);
            window.setTimeout(() => optionalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
          }} type="button">
            Add optional CSP details
          </button>
          <button className="min-h-14 rounded-full border border-white/20 px-5 py-3 text-lg font-extrabold" onClick={reset} type="button">
            <RotateCcw className="mr-2 inline h-5 w-5" /> Reset
          </button>
        </div>
      </section>

      <section ref={summaryRef} className="rounded-[1.5rem] border border-emerald-200/30 bg-[#06151d] p-4 sm:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">Your GOPPI™ snapshot</p>
        <div className="mt-5 text-6xl font-black">${formatNumber(snapshot.goppi)}</div>
        <p className="mt-3 text-lg text-slate-300">GOPPI™: {Math.round(snapshot.ratio * 100)}% of monthly income</p>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-300">Financial health</p>
          <p className={`mt-2 text-4xl font-black ${scoreTone.text}`}>{snapshot.score} / 100</p>
          <HeatGauge value={snapshot.score} mode="health" label="GOPPI financial health" />
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="text-xl font-extrabold">Top spending categories</h3>
          <div className="mt-3 grid gap-2 text-lg text-slate-200">
            {snapshot.topCategories.length ? snapshot.topCategories.map((item, index) => (
              <p key={item.label}>{index + 1}. {item.label} - ${formatNumber(item.value)}</p>
            )) : <p>Add recurring expenses to see the top monthly concerns.</p>}
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="text-xl font-extrabold">Advisor insights</h3>
          <ul className="mt-3 grid gap-3 text-lg leading-8 text-slate-200">
            {advisorInsights.map((insight) => (
              <li className="flex gap-3" key={insight}>
                <span aria-hidden="true" className="mt-3 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
        {Object.values(enabledSections).some(Boolean) ? (
          <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-lg text-slate-200 sm:grid-cols-2">
            <p>Assets: <strong className="text-white">${formatNumber(optionalTotals.assets)}</strong></p>
            <p>Liabilities: <strong className="text-white">${formatNumber(optionalTotals.liabilities)}</strong></p>
            <p>Net position: <strong className="text-white">${formatNumber(optionalTotals.netPosition)}</strong></p>
            <p>Target savings: <strong className="text-white">${formatNumber(optionalTotals.targetSavings)}</strong></p>
            <p>After target savings: <strong className="text-white">${formatNumber(afterGoals)}</strong></p>
          </div>
        ) : null}
        {debtOpportunity ? (
          <div className="mt-5 rounded-2xl border border-amber-200/30 bg-amber-200/10 p-4">
            <h3 className="text-xl font-extrabold text-amber-100">Debt payoff opportunity</h3>
            <p className="tp-copy mt-2 text-base leading-7 text-slate-200">
              Credit card debt, debt payments, or a payoff target is included in this snapshot. A free debt elimination consultation can help decide whether this should be addressed before adding new commitments.
            </p>
            <a className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full border border-amber-100/40 px-5 py-3 text-center font-extrabold text-amber-50" href={brand.calendlyUrl}>
              Schedule a free debt elimination consultation
            </a>
          </div>
        ) : null}
        {!readyForCapture ? (
          <div className="mt-5 rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-4">
            <h3 className="text-xl font-extrabold">Next step</h3>
          <p className="tp-copy mt-2 text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
              Review GOPPI™, your health score, and the recommended next move. Optional sections can deepen the review.
            </p>
            <button className="mt-4 min-h-14 w-full rounded-full border border-emerald-200/40 px-5 py-3 text-lg font-extrabold" onClick={calculateAndShowSummary} type="button">
              Use this snapshot
            </button>
          </div>
        ) : null}
      </section>

      {showFull ? (
        <section ref={optionalRef} className="rounded-[1.5rem] border border-white/10 bg-[#0a2029] p-4 sm:p-6 lg:col-span-2">
          <h3 className="text-2xl font-extrabold">Optional full CSP profile</h3>
          <p className="tp-copy mt-2 text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">Choose one section at a time. The selected section opens here, can be collapsed, and recalculates the GOPPI™ snapshot without changing the underlying logic.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {fullCspSections.map((section) => (
              <button
                className={`min-h-16 rounded-2xl border px-4 py-3 text-left text-lg font-extrabold ${enabledSections[section] ? "border-emerald-200 bg-emerald-200/10" : "border-white/15 bg-white/[0.035]"}`}
                key={section}
                onClick={() => enabledSections[section] && activeOptionalSection === section ? toggleSection(section) : focusOptionalSection(section)}
                type="button"
              >
                {enabledSections[section] ? <Check className="mr-2 inline h-5 w-5 text-emerald-200" /> : null}
                {section}
                {enabledSections[section] ? <span className="ml-2 text-sm font-bold text-emerald-100/80">{activeOptionalSection === section ? "Open" : "Added"}</span> : null}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {fullCspSections.filter((section) => enabledSections[section] && activeOptionalSection === section).map((section) => (
              <section className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4" key={section}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-extrabold uppercase tracking-[0.16em] text-emerald-200/80">{section}</h4>
                  <button className="rounded-full border border-white/15 px-3 py-2 text-sm font-extrabold text-slate-200" onClick={() => setActiveOptionalSection(null)} type="button">
                    Collapse
                  </button>
                </div>
                <div className="mt-4 grid gap-4">
                  {optionalCspFields[section].map((field) => (
                    <label className="grid gap-2 text-base font-bold" key={field.id}>
                      {field.label}
                      {field.type === "money" ? (
                        <MoneyInput ariaLabel={`${field.label} optional amount`} value={optionalProfile[section][field.id] ?? ""} onChange={(value) => updateOptional(section, field.id, value)} />
                      ) : (
                        <input
                          className="min-h-14 rounded-2xl border border-white/15 bg-[#06151d] px-4 text-lg font-bold text-white outline-none"
                          onChange={(event) => updateOptional(section, field.id, event.target.value)}
                          type="text"
                          value={optionalProfile[section][field.id] ?? ""}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <button className="mt-6 min-h-14 w-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-3 text-lg font-extrabold text-[#051016]" onClick={calculateAndShowSummary} type="button">
            Recalculate with optional details
          </button>
        </section>
      ) : null}

      {readyForCapture ? (
        <section ref={finalRef} className="rounded-[1.5rem] border border-emerald-200/30 bg-[#06151d] p-4 sm:p-6 lg:col-span-2">
          <h3 className="text-2xl font-extrabold">Final step</h3>
          <p className="tp-copy mt-2 text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
            Finish the GOPPI™ snapshot, email your PDF, and use the review to build your <InlineTermHelp term="toppi" /> strategy with a TouchPoint advisor.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button className="min-h-14 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-3 text-lg font-extrabold text-[#051016]" onClick={() => setLeadOpen(true)} type="button">
              <Mail className="mr-2 inline h-5 w-5" /> Email my GOPPI™ snapshot
            </button>
            <a className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-center text-lg font-extrabold" href={savedLead?.calendlyUrl ?? brand.calendlyUrl}>
              Put GOPPI™ into my TOPPI™ plan
            </a>
          </div>
        </section>
      ) : null}

      <LeadModal
        brand={brand}
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        onSaved={setSavedLead}
        sessionId={sessionId}
        tool={{
          type: "csp",
          snapshotType: "goppi_snapshot",
          entryPoint: "standalone_diagnostic",
          selectedPath: "csp",
          leadSegment: snapshot.score >= 70 ? "strong_capacity" : snapshot.score >= 40 ? "pressure_visible" : "needs_priority_review",
          segmentation: {
            goppiScore: snapshot.score,
            goppiRatio: snapshot.ratio,
            topCategories: snapshot.topCategories
          },
          payload
        }}
      />
    </div>
  );
}

function LearningCorridorTool({ brand, sessionId }: { brand: BrandConfig; sessionId: string }) {
  const [income, setIncome] = useState("");
  const [fixed, setFixed] = useState("");
  const [variable, setVariable] = useState("");
  const [leadOpen, setLeadOpen] = useState(false);
  const [savedLead, setSavedLead] = useState<{ leadId: string; calendlyUrl: string } | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const valuesTrackedRef = useRef(false);

  const mini = useMemo(() => {
    const monthlyIncome = parseMoney(income);
    const fixedExpenses = parseMoney(fixed);
    const variableSpending = parseMoney(variable);
    const goppi = Math.max(0, monthlyIncome - fixedExpenses - variableSpending);
    const ratio = monthlyIncome > 0 ? goppi / monthlyIncome : 0;
    const score = Math.round(clamp(ratio * 100, 0, 100));
    const note = ratio >= 0.45
      ? "You have strong monthly flexibility. With the right structure, this can support wealth building and protection strategies."
      : ratio >= 0.2
        ? "You have visible monthly flexibility, but recurring costs should be reviewed before adding new commitments."
        : "Your mini-snapshot shows limited flexibility. The next review should focus on recurring costs and prioritization.";
    return { monthlyIncome, fixedExpenses, variableSpending, goppi, ratio, score, note };
  }, [fixed, income, variable]);

  const payload = {
    source: "tile3_mini_goppi",
    entry_point: "tile3",
    analysis_ready: mini.monthlyIncome > 0,
    tool_type: "mini_goppi_snapshot",
    snapshot_type: "mini_goppi",
    version: "tile3-mini-goppi-source-flow",
    monthlyIncome: mini.monthlyIncome,
    monthlyFixedExpenses: mini.fixedExpenses,
    monthlyVariableSpending: mini.variableSpending,
    goppi: mini.goppi,
    goppiRatio: mini.ratio,
    miniScore: mini.score,
    advisorNote: mini.note
  };

  const hasMiniInput = mini.monthlyIncome > 0 || mini.fixedExpenses > 0 || mini.variableSpending > 0;
  useEffect(() => {
    if (valuesTrackedRef.current || !hasMiniInput) return;
    valuesTrackedRef.current = true;
    track("mini_goppi_values_entered", sessionId, "learning");
  }, [hasMiniInput, sessionId]);

  const reviewMiniSnapshot = () => {
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-[1.5rem] border border-white/10 bg-[#0a2029] p-4 sm:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">Start here</p>
        <h3 className="mt-3 text-3xl font-extrabold">Mini-Snapshot</h3>
        <p className="tp-copy mt-3 text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
          Enter three monthly estimates to see what may still be flexible. No account linking, credit card, or document upload is needed.
        </p>
        <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm font-bold text-slate-200">
          <span><Check className="mr-2 inline h-4 w-4 text-emerald-200" />Income</span>
          <span><Check className="mr-2 inline h-4 w-4 text-emerald-200" />Fixed monthly commitments</span>
          <span><Check className="mr-2 inline h-4 w-4 text-emerald-200" />Everyday variable spending</span>
        </div>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-base font-bold">
            <span>Monthly household income</span>
            <MoneyInput ariaLabel="Mini-Snapshot monthly household income" value={income} onChange={setIncome} />
            <span className="text-sm font-medium leading-6 text-slate-400">Use your best monthly take-home estimate.</span>
          </label>
          <label className="grid gap-2 text-base font-bold">
            <span>Monthly fixed expenses</span>
            <MoneyInput ariaLabel="Mini-Snapshot monthly fixed expenses" value={fixed} onChange={setFixed} />
            <span className="text-sm font-medium leading-6 text-slate-400">Housing, utilities, insurance, debt payments, and recurring bills.</span>
          </label>
          <label className="grid gap-2 text-base font-bold">
            <span>Monthly variable spending</span>
            <MoneyInput ariaLabel="Mini-Snapshot monthly variable spending" value={variable} onChange={setVariable} />
            <span className="text-sm font-medium leading-6 text-slate-400">Food, fuel, household spending, subscriptions, and other flexible costs.</span>
          </label>
        </div>
        <div className="mt-6 grid gap-3">
          <button className="min-h-14 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-lg font-extrabold text-[#051016]" onClick={reviewMiniSnapshot} type="button">
            Review my Mini-Snapshot
          </button>
          <button className="min-h-14 rounded-full border border-white/20 px-5 py-3 text-lg font-extrabold" onClick={() => setLeadOpen(true)} type="button">
            <Mail className="mr-2 inline h-5 w-5" /> Email my Mini-Snapshot
          </button>
          <button className="min-h-14 rounded-full border border-white/20 px-5 py-3 text-lg font-extrabold" onClick={() => {
            setIncome("");
            setFixed("");
            setVariable("");
          }} type="button">
            <RotateCcw className="mr-2 inline h-5 w-5" /> Reset
          </button>
        </div>
      </section>

      <section aria-live="polite" className="rounded-[1.5rem] border border-emerald-200/30 bg-[#06151d] p-4 sm:p-6" ref={resultRef}>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">Mini-Snapshot</p>
        <h3 className="mt-3 text-3xl font-extrabold">Your quick view</h3>
        <p className="tp-copy mt-3 text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
          {hasMiniInput
            ? "This quick view estimates what remains after the monthly costs you entered."
            : "Add your first estimate to begin. Your result updates automatically as values are entered."}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Income</p>
            <p className="mt-2 text-2xl font-black">${formatNumber(mini.monthlyIncome)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Fixed</p>
            <p className="mt-2 text-2xl font-black">${formatNumber(mini.fixedExpenses)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Variable</p>
            <p className="mt-2 text-2xl font-black">${formatNumber(mini.variableSpending)}</p>
          </div>
        </div>
        <div className="mt-5 text-6xl font-black">${formatNumber(mini.goppi)}</div>
        <p className="mt-3 text-lg text-slate-300">Available flexibility: {Math.round(mini.ratio * 100)}% of income</p>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-300">Mini-Snapshot health</p>
          <p className={`mt-2 text-4xl font-black ${getScoreTone(mini.score).text}`}>{mini.score} / 100</p>
          <HeatGauge value={mini.score} mode="health" label="Mini-Snapshot health" />
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-300">Mini-Snapshot</p>
          <p className="mt-3 text-lg leading-8 text-slate-200">
            This short snapshot estimates what remains after essential and lifestyle expenses - the money you can intentionally direct toward growth, protection, and long-term strategy.
          </p>
          <p className="mt-4 text-lg leading-8 text-slate-200">{mini.note}</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button className="min-h-14 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-3 text-lg font-extrabold text-[#051016]" onClick={() => setLeadOpen(true)} type="button">
            <Mail className="mr-2 inline h-5 w-5" /> Email my snapshot
          </button>
          <a className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-center text-lg font-extrabold" href={savedLead?.calendlyUrl ?? brand.calendlyUrl}>
            Optional strategy session
          </a>
          <a className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-center text-lg font-extrabold sm:col-span-2" href="/csp-tool/">
            Open full Conscious Spending Tool <ChevronRight className="ml-2 h-5 w-5" />
          </a>
        </div>
        <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <a className="font-extrabold text-emerald-200" href="/learning-hub-vlog/">Watch educational videos</a>
          <a className="font-extrabold text-emerald-200" href="/learning-hub-blog/">Read the TouchPoint blogs</a>
        </div>
      </section>

      <LeadModal
        brand={brand}
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        onSaved={setSavedLead}
        sessionId={sessionId}
        tool={{
          type: "learning",
          snapshotType: "mini_goppi",
          entryPoint: "tile3",
          selectedPath: "learning",
          leadSegment: mini.ratio >= 0.45 ? "strong_capacity" : mini.ratio >= 0.2 ? "visible_goppi" : "priority_review",
          segmentation: {
            goppi: mini.goppi,
            goppiRatio: mini.ratio,
            monthlyIncome: mini.monthlyIncome
          },
          payload
        }}
      />
    </div>
  );
}

function QuestionTool({ activePath, brand, sessionId }: { activePath: PathKey; brand: BrandConfig; sessionId: string }) {
  const config = paths[activePath];
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [leadOpen, setLeadOpen] = useState(false);
  const [savedLead, setSavedLead] = useState<{ leadId: string; calendlyUrl: string } | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);
  const answersTrackedRef = useRef(false);
  const questions = getQuestions(activePath);
  const currentQuestion = questions[stepIndex];
  const answeredCount = questions.filter((question) => answers[question.id]).length;
  const score = questions.reduce((sum, question) => {
    const selected = question.options.find((option) => option.value === answers[question.id]);
    return sum + (selected?.score ?? 0);
  }, 0);
  const result = getDiagnosticResult(activePath, score, answeredCount, questions.length);
  const complete = answeredCount >= questions.length;

  useEffect(() => {
    if (complete) {
      window.setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
    }
  }, [complete]);

  useEffect(() => {
    if (answersTrackedRef.current || answeredCount < 1) return;
    answersTrackedRef.current = true;
    track(`${activePath}_answers_started`, sessionId, activePath);
  }, [activePath, answeredCount, sessionId]);

  function chooseAnswer(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    if (stepIndex < questions.length - 1) {
      window.setTimeout(() => setStepIndex((index) => Math.min(index + 1, questions.length - 1)), 120);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.82fr]">
      <section className="rounded-[1.5rem] border border-white/10 bg-[#0a2029] p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg leading-8 text-slate-200">{config.prompt}</p>
          <span className="rounded-full border border-white/15 px-3 py-1 text-sm font-bold text-slate-300">Question {stepIndex + 1} of {questions.length}</span>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }} />
        </div>
        {currentQuestion ? (
          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">{activePath === "trust" ? "Trust exposure check" : activePath === "retirement" ? "Retirement exposure check" : "Trust exposure check".replace("Trust", "Risk")}</p>
            <h3 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{currentQuestion.label}</h3>
            {currentQuestion.sub ? <p className="mt-3 text-lg leading-8 text-slate-300">{currentQuestion.sub}</p> : null}
            <div className="mt-6 grid gap-3">
              {currentQuestion.options.map((option) => (
                <button
                  aria-pressed={answers[currentQuestion.id] === option.value}
                  className={`min-h-16 rounded-2xl border px-4 py-3 text-left text-lg font-bold transition ${answers[currentQuestion.id] === option.value ? "border-emerald-200 bg-emerald-200/10 shadow-[inset_6px_0_0_rgba(110,231,183,0.7)]" : "border-white/15 bg-white/[0.035]"}`}
                  key={option.value}
                  onClick={() => chooseAnswer(currentQuestion.id, option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full border border-white/15 px-4 py-3 font-bold disabled:opacity-40" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => Math.max(0, index - 1))} type="button">
                <ArrowLeft className="mr-2 inline h-4 w-4" /> Back
              </button>
            </div>
          </div>
        ) : null}
      </section>
      <aside ref={summaryRef} className="rounded-[1.5rem] border border-emerald-200/30 bg-[#06151d] p-4 sm:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-200/80">Review direction</p>
        <p className="mt-3 text-4xl font-black">{result.label}</p>
        <p className="mt-3 text-lg leading-8 text-slate-300">{result.body}</p>
        <HeatGauge value={result.heatScore} mode="risk" label={`${config.toolTitle} heat gauge`} />
        <p className="mt-4 text-base font-bold text-slate-300">Answered {answeredCount} of {questions.length}</p>
        <div className="mt-5 grid gap-3">
          <button className="min-h-14 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-3 text-lg font-extrabold text-[#051016] disabled:opacity-50" disabled={!complete} onClick={() => setLeadOpen(true)} type="button">
            Save and schedule review
          </button>
          <a className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-center text-lg font-extrabold" href={savedLead?.calendlyUrl ?? brand.calendlyUrl}>
            Schedule strategy session
          </a>
        </div>
      </aside>
      <LeadModal
        brand={brand}
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        onSaved={setSavedLead}
        sessionId={sessionId}
        tool={{
          type: activePath,
          snapshotType: `${activePath}_review`,
          entryPoint: "standalone_diagnostic",
          selectedPath: activePath,
          leadSegment: result.segment,
          segmentation: { answeredCount, totalQuestions: questions.length, score, result },
          payload: buildModularPayload(activePath, answers, questions, score, result)
        }}
      />
    </div>
  );
}

function buildModularPayload(activePath: PathKey, answers: Record<string, string>, questions: DiagnosticQuestion[], score: number, result: ReturnType<typeof getDiagnosticResult>) {
  if (activePath === "protection") {
    return {
      source: "tile1_risk",
      entry_point: "tile1",
      analysis_ready: true,
      tool_type: "risk_exposure_analysis",
      snapshot_type: "risk_summary_snapshot",
      version: "tile1-risk-fintech-v1",
      campaign_type: "tile1_risk",
      concern: "Risk Assessment",
      risk_score: score,
      risk_level: result.label,
      income_protection_status: answers.income_protection ?? "",
      emergency_buffer: answers.buffer ?? "",
      dependents_status: answers.dependents ?? "",
      obligations_status: answers.obligations ?? "",
      confidence_status: answers.confidence ?? "",
      answers,
      questions,
      originalQuestionSet: "tile1_source_script"
    };
  }
  if (activePath === "retirement") {
    return {
      source: "tile2_exposure_analysis",
      entry_point: "tile2",
      analysis_ready: true,
      tool_type: "exposure_risk_analysis",
      snapshot_type: "exposure_risk_snapshot",
      version: "tile2-exposure-v1",
      campaign_type: "tile2_exposure_analysis",
      concern: "Economic Exposure",
      exposure_score: score,
      exposure_level: result.label,
      advisorNotes: [{ title: "Advisor focus", body: result.body }],
      advisory_focus: "retirement_tax_exposure",
      savings_status: answers.savings_status ?? "",
      savings_amount: answers.savings_amount ?? "",
      time_horizon: answers.time_horizon ?? "",
      birth_year: answers.birth_year ?? "",
      contribution_level: answers.contribution_level ?? "",
      income_goal: answers.income_goal ?? "",
      management_type: answers.management_type ?? "",
      answers,
      questions,
      originalQuestionSet: "tile2_source_script"
    };
  }
  if (activePath === "trust") {
    return {
      source: "trust_readiness_diagnostic",
      entry_point: "trust-readiness",
      analysis_ready: true,
      tool_type: "trust_readiness_diagnostic",
      snapshot_type: "trust_readiness_result",
      campaign_type: "trust_readiness",
      readiness: { answers: questionsToReadableAnswers(questions, answers) },
      answers,
      questions,
      originalQuestionSet: "trust_readiness_source_script"
    };
  }
  return {
            answers,
            questions,
            originalQuestionSet: "touchpoint_standalone_approved"
  };
}

function LeadModal({
  brand,
  isOpen,
  onClose,
  onSaved,
  sessionId,
  tool
}: {
  brand: BrandConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (value: { leadId: string; calendlyUrl: string }) => void;
  sessionId: string;
  tool: Record<string, unknown>;
}) {
  const [state, setState] = useState<LeadSubmitState>("idle");
  const [message, setMessage] = useState("");
  const [downloadPayload, setDownloadPayload] = useState<Record<string, unknown> | null>(null);
  const toolType = String(tool.type ?? "");
  const snapshotLabel = toolType === "csp" ? "GOPPI™ snapshot" : toolType === "learning" ? "Mini-Snapshot" : "exposure summary";
  const submitLabel = toolType === "csp" ? "Download & Send GOPPI™ PDF" : toolType === "learning" ? "Download & Send Mini-Snapshot PDF" : "Download & Send Summary PDF";
  const isMiniSnapshot = toolType === "learning";

  useEffect(() => {
    if (state !== "saving") return;
    const timer = window.setTimeout(() => {
      setMessage("Still working. The snapshot is being saved and emailed now.");
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [state]);

  if (!isOpen) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "saving") return;
    const form = new FormData(event.currentTarget);
    const payload = {
      eventName: "lead_submitted",
      sessionId,
      lead: {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        preferredContactMethod: String(form.get("preferredContactMethod") ?? "email") as PreferredContactMethod,
        consentService: form.get("consentService") === "on",
        consentEducation: form.get("consentEducation") === "on"
      },
      tool,
      metadata: {
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    setState("saving");
    setMessage("Saving your snapshot and sending the email now.");

    const response = await fetch("/api/touchpoint/diagnostic-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) {
      setState("error");
      setMessage(result?.message ?? "We could not save your snapshot. Please try again.");
      return;
    }

    const saved = {
      leadId: String(result.leadId),
      calendlyUrl: String(result.calendlyUrl || brand.calendlyUrl)
    };
    onSaved(saved);
    setDownloadPayload({ ...payload, leadId: saved.leadId, savedAt: new Date().toISOString() });
    setState("saved");
    setMessage("Saved. Your snapshot is ready, and the review link now includes your contact details.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur sm:items-center">
      <section aria-modal="true" className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] border border-cyan-300/20 bg-[#07151c] p-5 shadow-2xl sm:p-7" role="dialog">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/80">Save your snapshot</p>
            <h2 className="mt-2 text-3xl font-extrabold">Email me my {snapshotLabel} (PDF)</h2>
          </div>
          <button aria-label="Close lead form" className="rounded-full border border-white/15 p-3" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
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
            <input className="mt-1 h-5 w-5 accent-emerald-300" name="consentService" required type="checkbox" />
            I agree to receive my snapshot and related service communications.
          </label>
          <label className="flex items-start gap-3 text-base leading-7 text-slate-200">
            <input className="mt-1 h-5 w-5 accent-emerald-300" name="consentEducation" type="checkbox" />
            Optional: I agree to receive educational content and updates.
          </label>
          {message ? <p className={state === "error" ? "text-red-200" : "text-emerald-200"}>{message}</p> : null}
          <button className="min-h-14 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-3 text-lg font-extrabold text-[#051016] disabled:opacity-60" disabled={state === "saving" || state === "saved"} type="submit">
            {state === "saving" ? "Saving and sending..." : state === "saved" ? "Saved" : submitLabel}
          </button>
          {state === "saved" ? (
            <div className="grid gap-3">
              <button className="min-h-14 rounded-full border border-white/20 px-5 py-3 text-lg font-extrabold" onClick={() => void downloadSnapshotPdf(downloadPayload)} type="button">
                <Download className="mr-2 inline h-5 w-5" /> Download PDF snapshot
              </button>
              <a className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-center text-lg font-extrabold" href={brand.calendlyUrl}>
                {isMiniSnapshot ? "Schedule optional review" : "Schedule strategy session"}
              </a>
            </div>
          ) : null}
          <p className="tp-copy text-sm leading-6 text-slate-400">
            By submitting your information, you agree to be contacted by TouchPoint or a licensed insurance professional via call, text, or email regarding your financial strategy and related services. Message and data rates may apply. You can opt out at any time.
          </p>
          <p className="tp-copy text-sm leading-6 text-slate-400">
            Educational planning tool only. Not legal, tax, or insurance advice. TouchPoint provides financial education and planning support. We do not provide tax or legal advice. Insurance products are offered through licensed professionals. Product availability and terms vary by carrier and state.
          </p>
        </form>
      </section>
    </div>
  );
}

function MoneyInput({ ariaLabel = "Dollar amount", value, onChange }: { ariaLabel?: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/15 bg-[#06151d] px-4">
      <span className="text-xl font-extrabold text-slate-300">$</span>
      <input
        aria-label={ariaLabel}
        className="min-h-12 w-full bg-transparent text-xl font-bold text-white outline-none"
        inputMode="decimal"
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => {
          const amount = parseMoney(event.currentTarget.value);
          onChange(amount > 0 ? formatNumber(amount) : "");
        }}
        placeholder="0"
        type="text"
        value={value}
      />
    </div>
  );
}

function FrequencyControl({ frequency, onChange }: { frequency: Frequency; onChange: (frequency: Frequency) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#06151d] p-2">
      {(["monthly", "annual"] as Frequency[]).map((option) => (
        <button
          aria-pressed={frequency === option}
          className={`min-h-12 rounded-xl text-base font-extrabold capitalize ${frequency === option ? "bg-cyan-300 text-[#06121a]" : "text-slate-300"}`}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function CompactFrequencyControl({ frequency, label, onChange }: { frequency: Frequency; label: string; onChange: (frequency: Frequency) => void }) {
  return (
    <div aria-label={label} className="grid max-w-xs grid-cols-2 gap-1 rounded-full border border-white/10 bg-[#06151d] p-1" role="group">
      {(["monthly", "annual"] as Frequency[]).map((option) => (
        <button
          aria-pressed={frequency === option}
          className={`min-h-9 rounded-full text-xs font-extrabold capitalize ${frequency === option ? "bg-cyan-300 text-[#06121a]" : "text-slate-300"}`}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function HeatGauge({ value, mode, label }: { value: number; mode: "health" | "risk"; label: string }) {
  const safeValue = clamp(Math.round(value), 0, 100);
  const displayValue = mode === "health" ? safeValue : safeValue;
  const color =
    mode === "health"
      ? safeValue < 35 ? "bg-rose-400" : safeValue < 70 ? "bg-amber-300" : "bg-emerald-400"
      : safeValue < 35 ? "bg-emerald-400" : safeValue < 70 ? "bg-amber-300" : "bg-rose-400";
  const text =
    mode === "health"
      ? safeValue < 35 ? "Needs attention" : safeValue < 70 ? "Watch zone" : "Stronger position"
      : safeValue < 35 ? "Lower visible exposure" : safeValue < 70 ? "Moderate exposure" : "Higher exposure";

  return (
    <div className="mt-4" aria-label={label}>
      <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-300">
        <span>{text}</span>
        <span>{displayValue}/100</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-white/10">
        <div className={`h-3 rounded-full ${color}`} style={{ width: `${safeValue}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400">
        <span>Green</span>
        <span className="text-center">Yellow</span>
        <span className="text-right">Red</span>
      </div>
      <p className="sr-only">Gauge scale: Green, Yellow, Red.</p>
    </div>
  );
}

function groupExpenses(expenses: ExpenseItem[]) {
  return expenses.reduce<Array<{ name: string; items: ExpenseItem[] }>>((groups, item) => {
    const existing = groups.find((group) => group.name === item.group);
    if (existing) {
      existing.items.push(item);
      return groups;
    }
    groups.push({ name: item.group, items: [item] });
    return groups;
  }, []);
}

function calculateSnapshot(
  income: string,
  frequency: Frequency,
  expenses: ExpenseItem[],
  optionalTotals: ReturnType<typeof calculateOptionalTotals>,
  optionalProfile: OptionalProfile
): Snapshot {
  const rawIncome = parseMoney(income);
  const monthlyIncome = frequency === "annual" ? rawIncome / 12 : rawIncome;
  const normalizedExpenses = normalizeExpenses(expenses);
  const monthlyExpenses = normalizedExpenses.reduce((sum, item) => sum + item.value, 0);
  const goppi = monthlyIncome - monthlyExpenses;
  const ratio = monthlyIncome > 0 ? goppi / monthlyIncome : 0;
  const score = calculateGoppiScore(monthlyIncome, monthlyExpenses, goppi, normalizedExpenses, optionalTotals, optionalProfile);
  const topCategories = normalizedExpenses.filter((item) => item.value > 0).sort((a, b) => b.value - a.value).slice(0, 3);
  return { monthlyIncome, monthlyExpenses, goppi, ratio, score, topCategories };
}

function normalizeExpenses(expenses: ExpenseItem[]) {
  return expenses.map((item) => ({
    ...item,
    value: (item.frequency ?? "monthly") === "annual" ? item.value / 12 : item.value
  }));
}

function calculateGoppiScore(
  monthlyIncome: number,
  monthlyExpenses: number,
  goppi: number,
  expenses: ExpenseItem[],
  optionalTotals: ReturnType<typeof calculateOptionalTotals>,
  optionalProfile: OptionalProfile
) {
  if (monthlyIncome <= 0) return 0;
  const ratioScore = clamp((goppi / monthlyIncome) * 100, 0, 100);
  const expenseScore = clamp((1 - monthlyExpenses / monthlyIncome) * 100, 0, 100);
  const debtPayment = expenses.find((item) => item.id === "debt_payments")?.value ?? 0;
  const variableExpense = ["subscriptions", "food_household", "fuel_maintenance", "other_recurring"]
    .reduce((sum, id) => sum + (expenses.find((item) => item.id === id)?.value ?? 0), 0);
  const variableScore = clamp(100 - (variableExpense / monthlyIncome) * 100, 0, 100);
  const assetScore = optionalTotals.assets > 0 ? clamp((optionalTotals.assets / Math.max(monthlyIncome * 3, 1)) * 100, 0, 100) : 55;
  const liabilityScore = optionalTotals.liabilities > 0 ? clamp(100 - (optionalTotals.liabilities / Math.max(optionalTotals.assets, monthlyIncome * 6, 1)) * 100, 0, 100) : 62;
  const lifeInsurance = expenses.find((item) => item.id === "life_insurance")?.value ?? 0;
  const protectionNote = Object.values(optionalProfile["Protection notes"]).some(Boolean);
  const protectionScore = lifeInsurance > 0 || protectionNote ? 82 : 45;
  const debtPenalty = debtPayment > 0 || optionalTotals.debtPayoffTarget > 0 || parseMoney(optionalProfile.Liabilities.credit_cards ?? "") > 0 ? 8 : 0;
  const score = ratioScore * 0.38 + expenseScore * 0.18 + variableScore * 0.12 + assetScore * 0.12 + liabilityScore * 0.12 + protectionScore * 0.08 - debtPenalty;
  return Math.round(clamp(score, 0, 100));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function calculateOptionalTotals(optionalProfile: OptionalProfile) {
  const assets = sumOptionalMoney(optionalProfile.Assets);
  const liabilities = sumOptionalMoney(optionalProfile.Liabilities);
  const targetSavings = parseMoney(optionalProfile.Goals.target_monthly_savings ?? "");
  const debtPayoffTarget = parseMoney(optionalProfile.Goals.debt_payoff_target ?? "");
  return {
    assets,
    liabilities,
    netPosition: assets - liabilities,
    targetSavings,
    debtPayoffTarget
  };
}

function sumOptionalMoney(values: Record<string, string>) {
  return Object.values(values).reduce((sum, value) => sum + parseMoney(value), 0);
}

function buildAdvisorInsights(
  snapshot: Snapshot,
  expenses: ExpenseItem[],
  optionalProfile: OptionalProfile,
  optionalTotals: ReturnType<typeof calculateOptionalTotals>,
  enabledSections: Record<CspSectionKey, boolean>
) {
  const insights: string[] = [];
  const expenseById = Object.fromEntries(expenses.map((item) => [item.id, item.value]));

  if (!snapshot.monthlyIncome) {
    insights.push("Start with household income. That anchors the entire GOPPI™ snapshot.");
  } else if (snapshot.goppi <= 0) {
    insights.push("Monthly commitments appear to absorb all current income. The first review should focus on recurring costs and cash-flow triage.");
  } else if (snapshot.score >= 70) {
    insights.push("Monthly flexibility looks strong. The next planning move is deciding where that capacity should go first.");
  } else {
    insights.push("Some monthly flexibility is visible, but review priorities should be ordered before new commitments are added.");
  }

  if (snapshot.topCategories[0]) {
    insights.push(`${snapshot.topCategories[0].label} is the largest visible monthly concern in this snapshot.`);
  }

  const transportation = (expenseById.auto_payment || 0) + (expenseById.auto_registration || 0) + (expenseById.fuel_maintenance || 0) + (expenseById.auto_insurance || 0);
  if (transportation > 0) {
    insights.push(`Transportation-related costs total about $${formatNumber(transportation)} monthly in this view.`);
  }

  if ((expenseById.subscriptions || 0) > 0) {
    insights.push("Subscriptions are visible as a recurring drag. This is a good category to verify before the review.");
  }

  if (!(expenseById.life_insurance || 0)) {
    insights.push("No life protection premium is showing in the snapshot. Coverage planning may deserve a closer look.");
  }

  if (enabledSections.Assets || enabledSections.Liabilities) {
    if (optionalTotals.netPosition < 0) {
      insights.push("Optional asset and liability details currently show a negative net position. Debt strategy should be part of the review.");
    } else if (optionalTotals.assets > 0 && optionalTotals.liabilities > 0) {
      insights.push(`The optional balance-sheet view shows an estimated net position of $${formatNumber(optionalTotals.netPosition)}. This helps connect monthly GOPPI™ to long-term TOPPI™ strategy.`);
    } else if (optionalTotals.assets > 0) {
      insights.push("Optional asset details are captured, which can help turn GOPPI™ into a broader TOPPI™ strategy.");
    }
  }

  const vehicles = parseMoney(optionalProfile.Assets.vehicles_boats_rvs ?? "");
  if (vehicles > 0) {
    insights.push(`Vehicle, boat, or RV equity of about $${formatNumber(vehicles)} is included. This can matter when separating lifestyle assets from liquid reserves.`);
  }

  const cashReserves = parseMoney(optionalProfile.Assets.checking ?? "") + parseMoney(optionalProfile.Assets.savings ?? "");
  if (cashReserves > 0 && snapshot.monthlyExpenses > 0) {
    const reserveMonths = cashReserves / snapshot.monthlyExpenses;
    if (reserveMonths < 3) {
      insights.push("Cash reserves appear below a three-month expense cushion. Liquidity should be reviewed before adding new commitments.");
    } else {
      insights.push(`Cash reserves cover roughly ${reserveMonths.toFixed(1)} months of visible expenses, before protection and debt priorities are confirmed.`);
    }
  }

  const creditCards = parseMoney(optionalProfile.Liabilities.credit_cards ?? "");
  if (creditCards > 0) {
    insights.push(`Credit card balances of about $${formatNumber(creditCards)} are included. A debt elimination review may be a high-value next step.`);
  }

  if (optionalTotals.targetSavings > 0 && snapshot.goppi > 0) {
    const savingsShare = optionalTotals.targetSavings / snapshot.goppi;
    if (savingsShare > 1) {
      insights.push("The target monthly savings goal is higher than current GOPPI™, so the plan needs prioritization before execution.");
    } else {
      insights.push("The target monthly savings goal fits inside current GOPPI™, pending protection and debt priorities.");
    }
  }

  if (hasDebtOpportunity(expenses, optionalProfile, optionalTotals)) {
    insights.push("Debt or credit card balances are visible. A free debt elimination consultation may help clarify the next move before adding new commitments.");
  }

  if (optionalProfile["Protection notes"].emergency_months) {
    insights.push(`Emergency reserve note captured: ${optionalProfile["Protection notes"].emergency_months}.`);
  }

  return insights.slice(0, 8);
}

function hasDebtOpportunity(expenses: ExpenseItem[], optionalProfile: OptionalProfile, optionalTotals: ReturnType<typeof calculateOptionalTotals>) {
  const debtPayment = expenses.find((item) => item.id === "debt_payments")?.value ?? 0;
  const creditCards = parseMoney(optionalProfile.Liabilities.credit_cards ?? "");
  return debtPayment > 0 || creditCards > 0 || optionalTotals.debtPayoffTarget > 0 || optionalTotals.liabilities > optionalTotals.assets;
}

function getScoreTone(score: number) {
  if (score < 35) return { text: "text-rose-200", bar: "bg-rose-400" };
  if (score < 70) return { text: "text-amber-200", bar: "bg-amber-300" };
  return { text: "text-emerald-200", bar: "bg-emerald-400" };
}

function getReadinessPercent(snapshot: Snapshot, expenses: ExpenseItem[]) {
  const expenseEntryCount = expenses.filter((item) => item.value > 0).length;
  if (!snapshot.monthlyIncome) return 0;
  if (expenseEntryCount < 2) return 35;
  if (expenseEntryCount < 5) return 70;
  return 100;
}

function getReadinessCopy(snapshot: Snapshot, expenses: ExpenseItem[]) {
  const expenseEntryCount = expenses.filter((item) => item.value > 0).length;
  if (!snapshot.monthlyIncome) return "Add income and a few recurring expenses to unlock your snapshot.";
  if (expenseEntryCount < 2) return "Good start. Add a couple of recurring expenses so the snapshot becomes meaningful.";
  if (expenseEntryCount < 5) return "Your snapshot is taking shape. Add a few more monthly expenses to sharpen the recommendations.";
  return "Your snapshot is advisor-ready. Review the recommended next move and export your PDF when ready.";
}

function getQuestions(path: PathKey): DiagnosticQuestion[] {
  if (path === "trust") {
    return [
      {
        id: "trust_status",
        label: "Do you currently have a properly funded living trust that keeps your family out of probate court?",
        options: [
          { label: "Yes, I have a trust and believe it is current", value: "current_trust", score: 0 },
          { label: "I have a will, but not a trust", value: "will_no_trust", score: 3 },
          { label: "I started the process but never completed it", value: "unfinished", score: 3 },
          { label: "No, and I know I need to address it", value: "none", score: 3 },
          { label: "I am not sure", value: "not_sure", score: 2 }
        ]
      },
      {
        id: "documents",
        label: "Have your estate documents been reviewed or updated in the last three years?",
        options: [
          { label: "Yes", value: "updated", score: 0 },
          { label: "No", value: "outdated", score: 2 },
          { label: "I am not sure", value: "not_sure", score: 2 }
        ]
      },
      {
        id: "family_clarity",
        label: "Would your family know who should act, where documents are, and what you want?",
        options: [
          { label: "Yes, roles and documents are clear", value: "clear", score: 0 },
          { label: "Somewhat, but there are gaps", value: "some_gaps", score: 2 },
          { label: "No, this would create confusion", value: "unclear", score: 3 }
        ]
      },
      {
        id: "funding",
        label: "Are major assets titled or beneficiary-aligned with your estate plan?",
        options: [
          { label: "Yes, I believe they are aligned", value: "aligned", score: 0 },
          { label: "Some are, but not all", value: "partial", score: 2 },
          { label: "No or I am not sure", value: "not_sure", score: 3 }
        ]
      },
      {
        id: "medical_decisions",
        label: "If you could not speak for yourself, would someone know your medical wishes and who can help make decisions?",
        options: [
          { label: "Yes, that is clear", value: "clear", score: 0 },
          { label: "Some parts are clear", value: "partial", score: 2 },
          { label: "No or I am not sure", value: "not_sure", score: 3 }
        ]
      },
      {
        id: "life_insurance_coverage",
        label: "Do you have Life Protection and Coverage in place for people who depend on you?",
        options: [
          { label: "Yes, I believe it is enough", value: "covered", score: 0 },
          { label: "I have some, but I am not sure it is enough", value: "partial", score: 2 },
          { label: "No or I am not sure", value: "not_sure", score: 3 },
          { label: "No one depends on my income", value: "no_dependents", score: 0 }
        ]
      },
      {
        id: "next_step",
        label: "What feels like the right next step?",
        options: [
          { label: "Confirm my current plan is still aligned", value: "confirm", score: 0 },
          { label: "Understand where my family may be exposed", value: "exposure", score: 2 },
          { label: "Start from the beginning", value: "start", score: 3 }
        ]
      }
    ];
  }
  if (path === "retirement") {
    return [
      {
        id: "savings_status",
        label: "Do you currently have retirement savings in place?",
        sub: "This helps determine your starting point - not your final outcome.",
        options: [
          { label: "Yes - I've started saving", value: "yes", score: 0 },
          { label: "No - I'm just getting started", value: "no", score: 3 },
          { label: "I'm not sure", value: "unsure", score: 2 }
        ]
      },
      {
        id: "savings_amount",
        label: "Roughly how much have you saved so far?",
        sub: "A general estimate is fine - this helps identify efficiency gaps.",
        options: [
          { label: "Under $100K", value: "low", score: 3 },
          { label: "$100K - $250K", value: "midlow", score: 2 },
          { label: "$250K - $750K", value: "midhigh", score: 1 },
          { label: "$750K+", value: "high", score: 0 }
        ]
      },
      {
        id: "time_horizon",
        label: "How many years until you plan to retire?",
        sub: "Time is the biggest driver of efficiency.",
        options: [
          { label: "Less than 10 years", value: "short", score: 3 },
          { label: "10-20 years", value: "mid", score: 2 },
          { label: "20+ years", value: "long", score: 0 },
          { label: "Already Retired", value: "retired", score: 3 }
        ]
      },
      {
        id: "birth_year",
        label: "What year were you born?",
        sub: "Used to estimate timeline and tax exposure.",
        options: [
          { label: "1985 or later", value: "1985+", score: 0 },
          { label: "1970-1984", value: "1970-1984", score: 1 },
          { label: "1960-1969", value: "1960-1969", score: 2 },
          { label: "Before 1960", value: "1959-", score: 3 }
        ]
      },
      {
        id: "contribution_level",
        label: "How consistently are you contributing? (Monthly Contribution Estimate)",
        sub: "Consistency matters more than timing.",
        options: [
          { label: "Not contributing", value: "0", score: 3 },
          { label: "$1 - $500 / month", value: "250", score: 2 },
          { label: "$500 - $1,000 / month", value: "750", score: 2 },
          { label: "$1,000 - $2,000 / month", value: "1500", score: 1 },
          { label: "$2,000 - $5,000 / month", value: "3000", score: 1 },
          { label: "$5,000+ / month", value: "5000", score: 0 }
        ]
      },
      {
        id: "income_goal",
        label: "What level of monthly income will you need in retirement?",
        sub: "This defines the finish line.",
        options: [
          { label: "Under $5K/month", value: "low", score: 1 },
          { label: "$5K - $10K/month", value: "medium", score: 2 },
          { label: "$10K+/month", value: "high", score: 3 }
        ]
      },
      {
        id: "management_type",
        label: "How is your money currently managed?",
        sub: "This helps estimate hidden cost exposure.",
        options: [
          { label: "Self-managed", value: "self", score: 0 },
          { label: "Financial advisor", value: "advisor", score: 2 },
          { label: "Not sure", value: "unsure", score: 3 }
        ]
      }
    ];
  }
  if (path === "protection") {
    return [
      {
        id: "income_protection",
        label: "If you couldn't work due to illness or injury, would income still come in?",
        sub: "This is about continuity under real-life conditions, not best-case scenarios.",
        options: [
          { label: "Yes - I have income protection", value: "yes", score: 0 },
          { label: "No - income stops if I stop", value: "no", score: 3 },
          { label: "Not sure", value: "unsure", score: 2 }
        ]
      },
      {
        id: "buffer",
        label: "If income paused, how long before financial pressure shows up?",
        sub: "Think in terms of how long your current setup can absorb disruption.",
        options: [
          { label: "Under 3 months", value: "lt3", score: 3 },
          { label: "3-6 months", value: "3to6", score: 2 },
          { label: "6+ months", value: "gt6", score: 0 }
        ]
      },
      {
        id: "dependents",
        label: "If your income stopped, would others feel it immediately?",
        sub: "The more people relying on you, the faster pressure builds.",
        options: [
          { label: "Yes", value: "yes", score: 2 },
          { label: "No", value: "no", score: 0 }
        ]
      },
      {
        id: "obligations",
        label: "If something unexpected happened, would financial responsibilities continue uninterrupted?",
        sub: "Think about commitments that don't pause - even if income does.",
        options: [
          { label: "Yes", value: "yes", score: 2 },
          { label: "No", value: "no", score: 0 }
        ]
      },
      {
        id: "confidence",
        label: "How confident are you your plan actually works under pressure?",
        sub: "Most plans look good on paper - fewer hold up in real situations.",
        options: [
          { label: "High", value: "high", score: 0 },
          { label: "Medium", value: "medium", score: 1 },
          { label: "Low", value: "low", score: 2 }
        ]
      }
    ];
  }
  return [
    {
      id: "starting_point",
      label: "Start the TouchPoint Conscious Spending Tool GOPPI snapshot?",
      options: [{ label: "Yes", value: "yes", score: 0 }, { label: "Not yet", value: "not_yet", score: 1 }]
    }
  ];
}

function getDiagnosticResult(path: PathKey, score: number, answeredCount: number, totalQuestions: number) {
  const maxScore = path === "retirement" ? 21 : path === "trust" ? 19 : path === "protection" ? 12 : Math.max(totalQuestions, 1);
  const heatScore = answeredCount < totalQuestions ? Math.round((answeredCount / Math.max(totalQuestions, 1)) * 30) : Math.round(clamp((score / maxScore) * 100, 0, 100));
  if (answeredCount < totalQuestions) {
    return { label: "In progress", body: "Complete the source question set before saving this review direction.", segment: `${path}_partial`, heatScore };
  }
  if (path === "protection") {
    if (score >= 8) return { label: "High", body: "The original risk exposure scoring indicates a high-priority protection review.", segment: "tile1_high_risk", heatScore };
    if (score >= 4) return { label: "Moderate", body: "The original risk exposure scoring indicates visible gaps worth reviewing.", segment: "tile1_moderate_risk", heatScore };
    return { label: "Low", body: "The original risk exposure scoring indicates fewer visible gaps, but review timing still matters.", segment: "tile1_low_risk", heatScore };
  }
  if (path === "retirement") {
    if (score >= 12) return { label: "High", body: "The original exposure answers point to elevated timing, tax, or income-design pressure.", segment: "tile2_high_exposure", heatScore };
    if (score >= 6) return { label: "Moderate", body: "The original exposure answers show planning pressure that may benefit from a review.", segment: "tile2_moderate_exposure", heatScore };
    return { label: "Low", body: "The original exposure answers show lower visible pressure, with room to confirm the strategy.", segment: "tile2_low_exposure", heatScore };
  }
  if (path === "trust") {
    if (score >= 13) return { label: "High attention", body: "The trust readiness answers indicate estate clarity, protection, funding, or family-role gaps.", segment: "trust_high_attention", heatScore };
    if (score >= 6) return { label: "Review recommended", body: "The trust readiness answers show areas that should be confirmed before a family needs them.", segment: "trust_review_recommended", heatScore };
    return { label: "Confirm alignment", body: "The trust readiness answers look more settled, but a review session can confirm alignment.", segment: "trust_confirm_alignment", heatScore };
  }
  return { label: "Ready", body: "The first step is ready to save.", segment: `${path}_complete`, heatScore };
}

function questionsToReadableAnswers(questions: DiagnosticQuestion[], answers: Record<string, string>) {
  return questions.map((question) => {
    const value = answers[question.id] ?? "";
    const selected = question.options.find((option) => option.value === value);
    return {
      id: question.id,
      question: question.label,
      value,
      answer: selected?.label ?? value,
      score: selected?.score ?? 0
    };
  });
}

function parseMoney(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

function createSessionId() {
  return `tpd-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function track(eventName: string, sessionId: string, selectedPath?: PathKey) {
  const traffic = classifyTrafficEvent(eventName);
  fetch("/api/touchpoint/diagnostic-capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      event_category: traffic.eventCategory,
      traffic_class: traffic.trafficClass,
      conversion_stage: traffic.conversionStage,
      sessionId,
      source: "touchpointgroup.co",
      entry_point: selectedPath ? toolRoutes[selectedPath] ?? window.location.pathname : window.location.pathname,
      tool_type: selectedPath ?? "diagnostic_selector",
      campaign_type: selectedPath ? `${selectedPath}_path` : "touchpoint_home",
      tool: {
        selectedPath,
        engagementType: traffic.engagementType,
        trafficClass: traffic.trafficClass,
        conversionStage: traffic.conversionStage
      },
      metadata: {
        path: window.location.pathname,
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      }
    })
  }).catch(() => undefined);
}

function classifyTrafficEvent(eventName: string) {
  if (eventName === "app_loaded" || eventName === "direct_tool_link_loaded") {
    return {
      conversionStage: "visit",
      engagementType: "page_visit",
      eventCategory: "traffic",
      trafficClass: "page_visit"
    };
  }
  if (eventName === "path_selected" || eventName === "tool_opened") {
    return {
      conversionStage: "tool_interest",
      engagementType: "landing_or_tool_start",
      eventCategory: "engagement",
      trafficClass: "engagement"
    };
  }
  if (eventName.includes("values_entered") || eventName.includes("answers_started")) {
    return {
      conversionStage: "qualified_engagement",
      engagementType: "prospect_entered_values_or_answers",
      eventCategory: "engagement",
      trafficClass: "engagement"
    };
  }
  if (eventName.includes("lead") || eventName.includes("submitted") || eventName.includes("save_cta")) {
    return {
      conversionStage: "lead_or_cta",
      engagementType: "lead_capture_or_cta",
      eventCategory: "conversion",
      trafficClass: "conversion"
    };
  }
  return {
    conversionStage: "interaction",
    engagementType: "interaction",
    eventCategory: "engagement",
    trafficClass: "engagement"
  };
}

async function downloadSnapshotPdf(payload: Record<string, unknown> | null) {
  if (!payload) return;
  const jsPDF = await loadJsPdf();
  if (!jsPDF) {
    window.alert("The PDF engine could not load. Please try again.");
    return;
  }

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = 612;
  const margin = 48;
  let y = 44;
  const tool = asClientRecord(payload.tool);
  const lead = asClientRecord(payload.lead);
  const toolPayload = asClientRecord(tool.payload);
  const toolType = String(tool.type ?? "");
  const isFullCsp = toolType === "csp";
  const title = isFullCsp ? "TouchPoint Conscious Spending Tool" : toolType === "learning" ? "TouchPoint Mini-Snapshot" : "TouchPoint Review Snapshot";
  const subtitle = isFullCsp
    ? "Full GOPPI™ snapshot for TOPPI™ strategy review"
    : toolType === "learning"
      ? "Short monthly flexibility snapshot"
      : "Diagnostic review direction";

  addConfidentialWatermark(doc, pageWidth);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(218, 232, 234);
  doc.roundedRect(28, 28, pageWidth - 56, 92, 18, 18, "FD");
  const logo = await loadLogoPng("/brand/touchpoint-logo-final.png");
  if (logo) doc.addImage(logo, "PNG", margin, 44, 92, 52);
  doc.setTextColor(5, 35, 44);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text(title, logo ? 148 : margin, 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(53, 69, 78);
  doc.text(subtitle, logo ? 148 : margin, 82);
  doc.text(`Prepared for ${String(lead.name ?? "TouchPoint visitor")}`, logo ? 148 : margin, 100);
  y = 150;

  function heading(text: string) {
    if (y > 680) {
      doc.addPage();
      addConfidentialWatermark(doc, pageWidth);
      y = 52;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(6, 61, 70);
    doc.text(text, margin, y);
    y += 18;
  }

  function body(text: string) {
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(44, 55, 65);
    lines.forEach((line) => {
      if (y > 760) {
        doc.addPage();
        addConfidentialWatermark(doc, pageWidth);
        y = 52;
      }
      doc.text(line, margin, y);
      y += 15;
    });
    y += 7;
  }

  function metric(label: string, value: string) {
    doc.setFillColor(239, 248, 248);
    doc.setDrawColor(200, 228, 229);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 38, 8, 8, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(53, 69, 78);
    doc.text(label, margin + 14, y + 24);
    doc.setFontSize(15);
    doc.setTextColor(5, 35, 44);
    doc.text(value, pageWidth - margin - 14, y + 24, { align: "right" });
    y += 48;
  }

  if (isFullCsp) {
    heading("Your GOPPI™ Snapshot");
    metric("Monthly income", `$${formatNumber(Number(toolPayload.monthlyIncome ?? 0))}`);
    metric("Monthly expenses", `$${formatNumber(Number(toolPayload.monthlyExpenses ?? 0))}`);
    metric("GOPPI™", `$${formatNumber(Number(toolPayload.goppi ?? 0))}`);
    metric("GOPPI™ Financial Health", `${Number(toolPayload.goppiScore ?? 0)} / 100`);
    const topCategories = Array.isArray(toolPayload.topCategories) ? toolPayload.topCategories : [];
    heading("Top Spending Categories");
    topCategories.length
      ? topCategories.slice(0, 5).forEach((item, index) => body(`${index + 1}. ${String(asClientRecord(item).label ?? "Category")} - $${formatNumber(Number(asClientRecord(item).value ?? 0))}`))
      : body("Add recurring expenses to see the top monthly concerns.");
    heading("Advisor Insights");
    const insights = Array.isArray(toolPayload.advisorInsights) ? toolPayload.advisorInsights : [];
    insights.forEach((insight) => body(`- ${String(insight)}`));
    const optionalTotals = asClientRecord(toolPayload.optionalTotals);
    if (Object.keys(optionalTotals).length) {
      heading("Optional CSP Profile");
      body(`Assets: $${formatNumber(Number(optionalTotals.assets ?? 0))}`);
      body(`Liabilities: $${formatNumber(Number(optionalTotals.liabilities ?? 0))}`);
      body(`Net position: $${formatNumber(Number(optionalTotals.netPosition ?? 0))}`);
      body(`Target savings: $${formatNumber(Number(optionalTotals.targetSavings ?? 0))}`);
    }
  } else if (toolType === "learning") {
    heading("Mini-Snapshot");
    metric("Monthly income", `$${formatNumber(Number(toolPayload.monthlyIncome ?? 0))}`);
    metric("Fixed expenses", `$${formatNumber(Number(toolPayload.monthlyFixedExpenses ?? toolPayload.fixedExpenses ?? 0))}`);
    metric("Variable spending", `$${formatNumber(Number(toolPayload.monthlyVariableSpending ?? toolPayload.variableSpending ?? 0))}`);
    metric("Estimated flexibility", `$${formatNumber(Number(toolPayload.goppi ?? 0))}`);
    body(String(toolPayload.note ?? "Use this short snapshot as a starting point before a full TOPPI™ review."));
  } else {
    heading("Review Direction");
    const result = asClientRecord(toolPayload.result);
    body(`${String(result.label ?? "Ready")}: ${String(result.body ?? "Your review direction is ready.")}`);
    const answers = Array.isArray(toolPayload.answers) ? toolPayload.answers : [];
    answers.forEach((answer) => {
      const record = asClientRecord(answer);
      body(`${String(record.question ?? "")} Answer: ${String(record.answer ?? "")}`);
    });
  }

  heading("Important Disclosures");
  body("Educational planning tool only. Not legal, tax, or insurance advice. TouchPoint provides financial education and planning support. We do not provide tax or legal advice. Insurance products are offered through licensed professionals. Product availability and terms vary by carrier and state.");
  doc.save(isFullCsp ? "touchpoint-full-goppi-csp-snapshot.pdf" : toolType === "learning" ? "touchpoint-mini-snapshot.pdf" : "touchpoint-review-snapshot.pdf");
}

function addConfidentialWatermark(doc: PdfDoc, pageWidth: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(54);
  doc.setTextColor(235, 241, 242);
  doc.text("CONFIDENTIAL", pageWidth / 2, 430, { align: "center", angle: 35 });
}

async function loadJsPdf(): Promise<JsPdfConstructor | null> {
  const current = (window as Window & { jspdf?: { jsPDF?: JsPdfConstructor } }).jspdf?.jsPDF;
  if (current) return current;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("jsPDF failed to load"));
    document.head.appendChild(script);
  }).catch(() => undefined);
  return (window as Window & { jspdf?: { jsPDF?: JsPdfConstructor } }).jspdf?.jsPDF ?? null;
}

async function loadLogoPng(path = localLogoUrl) {
  try {
    const response = await fetch(path);
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function asClientRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
