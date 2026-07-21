"use client";

import { ArrowLeft, CalendarDays, Menu } from "lucide-react";
import { touchPointBrand } from "@/lib/touchpoint-brand";

type GovernanceKind = "privacy" | "terms";

const privacySections = [
  {
    heading: "Information We Collect",
    body: [
      "We may collect information you choose to provide, including your name, email address, phone number, contact preferences, and messages you submit through our forms.",
      "When you use our planning tools, including the Conscious Spending Tool, GOPPI™ snapshots, quizzes, or related calculators, we may collect financial inputs you enter, such as income, expenses, goals, assets, liabilities, protection concerns, retirement timing, savings ranges, and other planning-related responses."
    ]
  },
  {
    heading: "How We Use Information",
    body: [
      "We use your information to provide requested snapshots, tool results, educational content, scheduling support, follow-up communications, and financial strategy discussions. We may also use your information to improve our tools, organize submissions, maintain records, and support compliance and security."
    ]
  },
  {
    heading: "Contact and Communications",
    body: [
      "By submitting your information, you agree to be contacted by TouchPoint or a licensed insurance professional via call, text, or email regarding your financial strategy and related services. Message and data rates may apply. You can opt out at any time."
    ]
  },
  {
    heading: "Third-Party Tools",
    body: [
      "We may use third-party tools to operate our website and services, including Google Sheets and Google Apps Script for form routing and data organization, Calendly for scheduling, and email systems for sending requested snapshots, confirmations, and follow-up communications.",
      "These third-party providers may process information according to their own privacy policies and security practices."
    ]
  },
  {
    heading: "Data Security",
    body: [
      "We use reasonable administrative, technical, and organizational safeguards to protect the information we collect. No online transmission or storage system can be guaranteed to be completely secure, but we work to limit access and use information only for appropriate business and service purposes."
    ]
  },
  {
    heading: "How Long We Keep Information",
    body: [
      "We keep information for as long as reasonably necessary to provide services, maintain records, comply with legal obligations, resolve disputes, and support legitimate business purposes."
    ]
  },
  {
    heading: "California Privacy Rights",
    body: [
      "If you are a California resident, you may have rights under the California Consumer Privacy Act as amended by the California Privacy Rights Act, including the right to know what personal information we collect, request deletion, request correction, limit certain uses of sensitive personal information, and opt out of certain sharing where applicable.",
      "We do not sell your personal information. To exercise your California privacy rights, contact us using the contact information provided on this website. We may need to verify your identity before processing certain requests."
    ]
  },
  {
    heading: "Children's Privacy",
    body: ["Our website and tools are intended for adults. We do not knowingly collect personal information from children under 13."]
  },
  {
    heading: "Changes to This Policy",
    body: ["We may update this Privacy Policy from time to time. Updates will be posted on this page with the revised effective date."]
  },
  {
    heading: "Contact",
    body: ["If you have questions about this Privacy Policy or how your information is used, please contact TouchPoint through the contact options provided on this website."]
  }
];

const termsSections = [
  {
    heading: "Educational Use Only",
    body: ["TouchPoint provides financial education and planning support. Website content, quizzes, calculators, GOPPI™ snapshots, TOPPI™ concepts, and Conscious Spending Tool outputs are for educational and informational purposes only."]
  },
  {
    heading: "Not Tax or Legal Advice",
    body: ["TouchPoint does not provide tax or legal advice. You should consult a qualified tax professional, attorney, or other appropriate advisor regarding your specific circumstances before making financial, tax, estate, legal, or insurance decisions."]
  },
  {
    heading: "No Guarantee of Results",
    body: ["Tool outputs, projections, scores, estimates, and planning observations are not guarantees of future results. Outcomes depend on your personal circumstances, market conditions, tax rules, product availability, carrier requirements, underwriting, and other factors outside TouchPoint's control."]
  },
  {
    heading: "Insurance Licensing Disclosure",
    body: ["Insurance products are offered through licensed insurance professionals. Any insurance recommendation, application, or purchase must be handled by an appropriately licensed professional in the applicable state."]
  },
  {
    heading: "Product Availability and Variability",
    body: ["Insurance product availability, features, benefits, costs, limitations, exclusions, underwriting requirements, and terms vary by carrier and state. Not all products are available to all individuals or in all locations."]
  },
  {
    heading: "Lead Forms and Communications",
    body: ["When you submit your information through a TouchPoint form or tool, you authorize TouchPoint or a licensed insurance professional to contact you via call, text, or email regarding your financial strategy and related services. Message and data rates may apply. You can opt out at any time."]
  },
  {
    heading: "Third-Party Links and Tools",
    body: ["Our website may link to or use third-party services, including scheduling, email, and data routing tools. TouchPoint is not responsible for the content, policies, or practices of third-party websites or services."]
  },
  {
    heading: "Limitation of Liability",
    body: ["To the fullest extent permitted by law, TouchPoint is not liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from your use of this website, educational materials, tools, forms, or related services."]
  },
  {
    heading: "No Professional Relationship Created by Website Use",
    body: ["Using this website, completing a tool, or submitting a form does not by itself create a client, advisory, legal, tax, or insurance relationship. Any formal relationship or product transaction requires appropriate review, documentation, and applicable licensing."]
  },
  {
    heading: "Updates",
    body: ["TouchPoint may update these Terms and Disclosures from time to time. Continued use of the website after updates are posted means you accept the revised terms."]
  }
];

export function GovernancePage({ kind }: { kind: GovernanceKind }) {
  const isPrivacy = kind === "privacy";
  const sections = isPrivacy ? privacySections : termsSections;
  const title = isPrivacy ? "Privacy Policy" : "Terms and Disclosures";
  const eyebrow = isPrivacy ? "Privacy" : "Terms / Legal";
  const intro = isPrivacy
    ? "TouchPoint respects your privacy. This policy explains what information we collect, how we use it, and the choices you have when you use our website, tools, forms, scheduling links, and related services."
    : "These Terms and Disclosures apply to your use of TouchPoint websites, educational content, forms, scheduling links, planning tools, and related services.";

  return (
    <main className="min-h-screen overflow-hidden bg-[#06121a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(67,209,198,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(67,209,198,0.08)_1px,transparent_1px)] bg-[size:96px_96px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(104,220,194,0.14),transparent_30rem),radial-gradient(circle_at_78%_38%,rgba(24,156,202,0.12),transparent_26rem)]" />

      <header className="relative z-20 border-b border-cyan-200/10 bg-[#07141e]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-1.5 sm:px-5 sm:py-2.5">
          <a aria-label="TouchPoint home" className="inline-flex h-16 w-[124px] shrink-0 items-center justify-center overflow-hidden rounded-xl" href="/">
            <img alt="TouchPoint" className="h-full w-full object-contain" src="/brand/touchpoint-logo-final-384.webp" />
          </a>
          <nav aria-label="TouchPoint navigation" className="hidden items-center gap-2 text-[13px] font-extrabold text-slate-200 lg:flex">
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/">Home</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/#about">About</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/#tp-diagnostic-main">CSP Tool</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/learning-hub-vlog/">Vlogs</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/learning-hub-blog/">Blogs</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/privacy-policy/">Privacy Policy</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/terms-disclosures/">Terms / Legal</a>
            <a className="rounded-full border border-emerald-200/30 bg-teal-700/40 px-4 py-2 text-white hover:bg-teal-700/70" href={touchPointBrand.calendlyUrl}>Schedule Now</a>
          </nav>
          <details className="relative lg:hidden">
            <summary aria-label="Open navigation menu" className="list-none rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-lg font-black text-white marker:hidden">
              <Menu aria-hidden="true" className="h-6 w-6" />
            </summary>
            <nav aria-label="Mobile navigation" className="absolute right-0 top-14 grid w-[calc(100vw-2rem)] max-w-sm grid-cols-2 gap-2 rounded-2xl border border-cyan-200/15 bg-[#0b2030] p-3 shadow-2xl">
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/">Home</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/#about">About</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/#tp-diagnostic-main">CSP Tool</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href={touchPointBrand.calendlyUrl}>Schedule Now</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/learning-hub-vlog/">Vlogs</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/learning-hub-blog/">Blogs</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/privacy-policy/">Privacy Policy</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/terms-disclosures/">Terms / Legal</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-5 py-8 sm:py-12">
        <div className="mb-5 flex flex-wrap gap-3">
          <a className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-bold text-slate-100" href="/">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </a>
          <a className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200/30 bg-teal-700/40 px-4 py-2 font-bold text-white" href={touchPointBrand.calendlyUrl}>
            <CalendarDays className="h-4 w-4" /> Schedule now
          </a>
        </div>

        <article className="rounded-[2rem] border border-cyan-300/20 bg-[#07151c]/95 p-5 shadow-2xl sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-200/80">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight text-white sm:text-6xl">{title}</h1>
          <p className="tp-copy mt-6 text-lg leading-8 text-slate-200">{intro}</p>
          <div className="tp-copy mt-8 grid gap-6 leading-7 text-slate-300">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-extrabold text-white">{section.heading}</h2>
                <div className="mt-3 grid gap-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
