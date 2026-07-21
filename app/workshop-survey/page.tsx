"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Check, Clock, Mail, MessageSquare, Phone } from "lucide-react";

const topicOptions = [
  "Market loss and recovery timing",
  "Fees compounding quietly",
  "Taxes in retirement",
  "Income protection",
  "Family protection",
  "I am not sure yet"
];

const focusOptions = [
  "Protecting retirement money from large losses",
  "Understanding what I am paying in fees",
  "Reducing tax surprises later",
  "Creating a more predictable income plan",
  "Adding protection for my family"
];

const methodOptions = [
  { value: "phone", label: "Call", icon: Phone },
  { value: "text", label: "Text", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
  { value: "zoom", label: "Zoom", icon: Clock }
];

type Status = "idle" | "submitting" | "success" | "error";

export default function WorkshopSurveyPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [focus, setFocus] = useState<string[]>([]);

  const traffic = useMemo(() => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    return {
      page_url: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer,
      landing_url: window.location.href,
      user_agent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || ""
    };
  }, []);

  function toggleFocus(option: string) {
    setFocus((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option].slice(0, 3)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      lead: {
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        preferred_contact_method: String(form.get("preferred_contact_method") || ""),
        preferred_contact_time: String(form.get("preferred_contact_time") || ""),
        preferred_follow_up_window: String(form.get("preferred_follow_up_window") || ""),
        consent_primary: form.get("consent_primary") === "on"
      },
      workshop: {
        primary_topic: String(form.get("primary_topic") || ""),
        topic_reason: String(form.get("topic_reason") || ""),
        follow_up_focus: focus,
        personal_question: String(form.get("personal_question") || "")
      },
      meta: {
        traffic
      }
    };

    const response = await fetch("/api/touchpoint/workshop-survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { ok?: boolean; message?: string };
    if (!response.ok || !result.ok) {
      setError(result.message || "We could not save the survey. Please try again.");
      setStatus("error");
      return;
    }

    setStatus("success");
  }

  return (
    <main className="min-h-dvh bg-[#f4efe5] text-[#172a3f]">
      <section className="relative isolate min-h-dvh overflow-hidden px-5 py-6 sm:px-8 lg:px-14">
        <div className="absolute inset-0 -z-30 bg-[url('/brand/touchpoint-hero-pressure.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(115deg,rgba(244,239,229,0.96),rgba(238,246,246,0.89)_48%,rgba(255,255,255,0.72))]" />
        <div className="absolute bottom-0 right-0 -z-10 h-1/2 w-3/4 opacity-45 [background:repeating-linear-gradient(165deg,transparent_0,transparent_13px,rgba(28,117,188,0.18)_14px,transparent_16px)]" />

        <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl flex-col">
          <header className="flex items-center justify-between border-b border-[#1c75bc]/55 pb-4">
            <Image
              src="/brand/touchpoint-logo-transparent.png"
              alt="TouchPoint Group"
              width={132}
              height={72}
              priority
              className="h-14 w-auto object-contain"
            />
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#1c5f91]">
              Workshop Survey
            </span>
          </header>

          <div className="grid flex-1 gap-8 py-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-10">
            <aside className="space-y-7">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#237b83]">
                Five questions
              </p>
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.04] tracking-normal text-[#112338] sm:text-5xl lg:text-6xl">
                What stood out?
              </h1>
              <p className="max-w-lg text-lg leading-8 text-[#293b52]">
                Your answers help prepare a more useful individual review.
              </p>
              <div className="h-px w-28 bg-[#36b0a9]" />
            </aside>

            <form
              onSubmit={handleSubmit}
              className="rounded-[10px] border border-white/70 bg-white/82 p-5 shadow-[0_24px_80px_rgba(17,35,56,0.16)] backdrop-blur-md sm:p-7"
            >
              {status === "success" ? (
                <div className="flex min-h-[34rem] flex-col justify-center text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0d7d75] text-white">
                    <Check aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 text-3xl font-semibold text-[#112338]">Thank you.</h2>
                  <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#405166]">
                    Your response was received. We will use it to prepare the next conversation around what matters most to you.
                  </p>
                </div>
              ) : (
                <div className="space-y-7">
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-bold uppercase tracking-[0.2em] text-[#1c5f91]">
                      1. Contact information
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input required name="name" autoComplete="name" placeholder="Name" className="w-full rounded-md border border-[#b7c8d5] bg-white px-4 py-3 text-[#112338] placeholder:text-[#6a7788] focus:border-[#237b83]" />
                      <input required type="email" name="email" autoComplete="email" placeholder="Email" className="w-full rounded-md border border-[#b7c8d5] bg-white px-4 py-3 text-[#112338] placeholder:text-[#6a7788] focus:border-[#237b83]" />
                      <input required type="tel" name="phone" autoComplete="tel" placeholder="Phone" className="w-full rounded-md border border-[#b7c8d5] bg-white px-4 py-3 text-[#112338] placeholder:text-[#6a7788] focus:border-[#237b83]" />
                    </div>
                  </fieldset>

                  <fieldset className="space-y-3">
                    <legend className="text-sm font-bold uppercase tracking-[0.2em] text-[#1c5f91]">
                      2. Which topic stayed with you?
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {topicOptions.map((option) => (
                        <label key={option} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-[#bfd0da] bg-white/86 px-3 py-2 text-sm font-semibold text-[#1d3148] has-[:checked]:border-[#0d7d75] has-[:checked]:bg-[#e6f5f3]">
                          <input required type="radio" name="primary_topic" value={option} className="h-4 w-4 accent-[#0d7d75]" />
                          {option}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="block space-y-3">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#1c5f91]">
                      3. What made it stand out?
                    </span>
                    <textarea required name="topic_reason" rows={3} placeholder="Share the moment, concern, or question that came up." className="w-full resize-none rounded-md border border-[#b7c8d5] bg-white px-4 py-3 text-[#112338] placeholder:text-[#6a7788] focus:border-[#237b83]" />
                  </label>

                  <fieldset className="space-y-3">
                    <legend className="text-sm font-bold uppercase tracking-[0.2em] text-[#1c5f91]">
                      4. What should we review next?
                    </legend>
                    <p className="text-sm text-[#536173]">Choose up to three.</p>
                    <div className="grid gap-2">
                      {focusOptions.map((option) => (
                        <label key={option} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[#bfd0da] bg-white/86 px-3 py-2 text-sm font-semibold text-[#1d3148] has-[:checked]:border-[#0d7d75] has-[:checked]:bg-[#e6f5f3]">
                          <input type="checkbox" checked={focus.includes(option)} onChange={() => toggleFocus(option)} className="h-4 w-4 accent-[#0d7d75]" />
                          {option}
                        </label>
                      ))}
                    </div>
                    <input name="personal_question" placeholder="One question you want answered in the next meeting" className="w-full rounded-md border border-[#b7c8d5] bg-white px-4 py-3 text-[#112338] placeholder:text-[#6a7788] focus:border-[#237b83]" />
                  </fieldset>

                  <fieldset className="space-y-3">
                    <legend className="text-sm font-bold uppercase tracking-[0.2em] text-[#1c5f91]">
                      5. Best follow-up
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-4">
                      {methodOptions.map(({ value, label, icon: Icon }) => (
                        <label key={value} className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#bfd0da] bg-white/86 px-3 py-2 text-sm font-bold text-[#1d3148] has-[:checked]:border-[#0d7d75] has-[:checked]:bg-[#e6f5f3]">
                          <input required type="radio" name="preferred_contact_method" value={value} className="sr-only" />
                          <Icon aria-hidden="true" className="h-4 w-4" />
                          {label}
                        </label>
                      ))}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select required name="preferred_contact_time" className="w-full rounded-md border border-[#b7c8d5] bg-white px-4 py-3 text-[#112338] focus:border-[#237b83]" defaultValue="">
                        <option value="" disabled>Best time</option>
                        <option>Morning</option>
                        <option>Afternoon</option>
                        <option>Evening</option>
                      </select>
                      <input name="preferred_follow_up_window" placeholder="Preferred day or window" className="w-full rounded-md border border-[#b7c8d5] bg-white px-4 py-3 text-[#112338] placeholder:text-[#6a7788] focus:border-[#237b83]" />
                    </div>
                    <label className="flex items-start gap-3 rounded-md border border-[#bfd0da] bg-white/86 px-3 py-3 text-sm leading-6 text-[#34465b]">
                      <input required name="consent_primary" type="checkbox" className="mt-1 h-4 w-4 accent-[#0d7d75]" />
                      I agree that TouchPoint Group may contact me about my workshop response and individual review.
                    </label>
                  </fieldset>

                  {error ? (
                    <p className="rounded-md border border-[#b64242] bg-[#fff1f1] px-4 py-3 text-sm font-semibold text-[#8a2424]">
                      {error}
                    </p>
                  ) : null}

                  <button type="submit" disabled={status === "submitting"} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md bg-[#112338] px-5 py-3 text-base font-bold text-white shadow-[0_16px_32px_rgba(17,35,56,0.2)] transition hover:bg-[#1c5f91] disabled:cursor-wait disabled:opacity-70">
                    {status === "submitting" ? "Sending" : "Submit response"}
                    <ArrowRight aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
