"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CalendarDays, ChevronRight, Menu } from "lucide-react";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export type HubKind = "blog" | "vlog";

export type BlogItem = {
  title: string;
  slug: string;
  summary: string;
  tag: string;
  image: string;
  alt: string;
  author?: string;
  intro?: string;
  sections?: Array<{ heading: string; body: string }>;
  comparisons?: Array<{ label: string; detail: string }>;
  disclosure?: string;
};

export type VideoItem = {
  title: string;
  slug: string;
  summary: string;
  tag: string;
  image: string;
  alt: string;
  videoUrl?: string;
  externalUrl?: string;
  ctaLabel?: string;
};

const featuredChildFutureArticle = {
  title: "Why Wait to Build Your Child's Financial Foundation?",
  author: "N. Caruthers",
  tag: "Child future planning",
  image: "/learning-hub/black-couple-finance-review.jpg",
  alt: "Parents reviewing long-term financial options for a child's future.",
  intro:
    "Parents already plan for the moments they can see: school, first cars, college visits, weddings, and the day a child needs help stepping into adulthood. The harder question is whether the foundation is being built before those moments arrive.",
  sections: [
    {
      heading: "The usual options matter, but they do different jobs.",
      body:
        "A 529 plan can be a strong education tool. Trump Accounts may give eligible children an early federal starting point. Custodial accounts can create investment flexibility. Each option can help, but none of them should be treated as the whole plan by default."
    },
    {
      heading: "A properly structured life protection strategy adds another layer.",
      body:
        "For families who want flexibility beyond school-only planning, permanent life protection can create lifelong coverage and potential cash value. When structured and maintained properly, that cash value may be accessed later through withdrawals or policy loans for education, a first home, a wedding, business funding, or life events that do not fit neatly into one account category."
    },
    {
      heading: "The quiet question is not whether you love your child. It is whether the structure is already in motion.",
      body:
        "The best plan may not be one account. It may be a coordinated mix: education savings where it fits, a child savings account where eligible, and life protection when the family wants optionality, future insurability, and a protected financial starting point. TouchPoint can help compare the options so the decision is not driven by confusion, headlines, or a one-size-fits-all recommendation."
    }
  ],
  comparisons: [
    {
      label: "529 plan",
      detail: "Tax-advantaged for qualified education costs, but primarily built around school-related use."
    },
    {
      label: "Trump Account",
      detail: "A new early savings option for eligible children, useful as a starting point but not a complete family protection plan."
    },
    {
      label: "Life protection strategy",
      detail: "May provide lifelong coverage, potential tax-advantaged access to cash value, and a flexible future-use layer when designed correctly."
    }
  ],
  disclosure:
    "Policy loans and withdrawals reduce cash value and death benefit, may cause a policy to lapse, and can create tax consequences if the policy is not properly structured or maintained. Guarantees depend on the claims-paying ability of the issuing carrier. This article is educational only and is not tax, legal, investment, or insurance advice."
};

export const blogItems: BlogItem[] = [
  {
    title: "Conscious Spending vs. Budgeting: A Better Starting Point",
    slug: "conscious-spending-vs-budgeting",
    summary: "Budgeting can show where money went. Conscious spending helps you see what is committed, what is flexible, and what next step can create room.",
    tag: "Conscious spending",
    image: "/learning-hub/thumbs/blog-conscious-spending-vs-budgeting.jpg",
    alt: "Family reviewing household spending choices, savings, and planning priorities together.",
    author: "N. Caruthers",
    intro:
      "Most people do not need another rigid budget that makes every purchase feel like a mistake. They need a clearer way to see what is already spoken for, what still has room to move, and which next step would bring relief first.",
    sections: [
      {
        heading: "Traditional budgeting often starts with restriction.",
        body:
          "A budget can be useful, but it often feels like a list of limits. It may tell you what you spent after the fact without explaining why the month still felt tight, which costs are truly fixed, or where a small change would make the biggest difference."
      },
      {
        heading: "Conscious spending starts with awareness.",
        body:
          "Conscious spending looks at your money in layers: income, recurring commitments, flexible choices, savings goals, debt pressure, and protection needs. The goal is not to spend less on everything. The goal is to see what matters, what is draining energy, and what deserves a better structure."
      },
      {
        heading: "A better baseline makes every next decision clearer.",
        body:
          "Before choosing a debt strategy, protection plan, retirement move, or estate step, it helps to understand the monthly picture. When the baseline is clear, planning becomes less about guessing and more about choosing the next right move with confidence."
      },
      {
        heading: "The best plan should still feel like your life.",
        body:
          "Families need room for joy, stability, emergencies, and future goals. Conscious spending helps separate what is necessary from what is negotiable, so the plan supports real life instead of turning every conversation into a sacrifice."
      }
    ],
    comparisons: [
      {
        label: "Budgeting",
        detail: "Often tracks categories after money is spent and can feel like a pass-or-fail discipline exercise."
      },
      {
        label: "Conscious spending",
        detail: "Shows what is committed, what is flexible, and which decision can create the most useful breathing room."
      },
      {
        label: "Planning baseline",
        detail: "Creates a practical starting point before savings, debt, protection, retirement, or estate choices are layered in."
      }
    ],
    disclosure:
      "This article is educational only and is not tax, legal, investment, or insurance advice. Financial decisions should be reviewed in the context of your household, goals, and professional guidance."
  },
  {
    title: "Why Wait to Build Your Child's Financial Foundation?",
    slug: "child-financial-foundation",
    summary: "Compare 529 plans, Trump Accounts, and life protection strategies for families who want more than a one-purpose savings plan.",
    tag: "Child future planning",
    image: "/learning-hub/black-couple-finance-review.jpg",
    alt: "Parents reviewing long-term financial options for a child's future.",
    author: featuredChildFutureArticle.author,
    intro: featuredChildFutureArticle.intro,
    sections: featuredChildFutureArticle.sections,
    comparisons: featuredChildFutureArticle.comparisons,
    disclosure: featuredChildFutureArticle.disclosure
  },
  {
    title: "Who Takes Care of the Plan If You Need Care?",
    slug: "long-term-care-planning",
    summary: "A practical look at long-term care risk for independent, successful adults who want choices, dignity, and fewer decisions pushed onto family later.",
    tag: "Long-term care planning",
    image: "/learning-hub/thumbs/financial-risk-review.webp",
    alt: "A woman reviewing care and planning documents in a calm home setting.",
    author: "N. Caruthers",
    intro:
      "Independence is powerful, especially when you have built a life, career, family, or household through your own decisions. The hidden risk is that a future care need can turn independence into a rushed family logistics problem if the plan is not discussed early.",
    sections: [
      {
        heading: "The risk is not only needing care. It is needing care before the plan is ready.",
        body:
          "Federal long-term care planning resources estimate that about 70% of people who reach age 65 will need some form of long-term services or support. Women tend to need care longer than men, with average needs often cited around 3.7 years for women and 2.2 years for men. For single, widowed, divorced, and highly independent adults, the question becomes practical: who helps make decisions, where would care happen, and what assets or income would be interrupted first?"
      },
      {
        heading: "The monthly cost can change the choices fast.",
        body:
          "Recent national cost-of-care surveys put median assisted living near $6,200 per month, in-home care around $6,700 per month at a common weekly-hours benchmark, and a private nursing home room around $10,800 per month. Local costs vary, but the point is clear: a one-year care need can easily become a $74,000 to $130,000 event before family travel, home changes, lost work time, or care coordination are included."
      },
      {
        heading: "The time horizon is different for men and women.",
        body:
          "The averages matter because they change the size of the decision. Men who need care are often projected around 2.2 years of support; women are often projected closer to 3.7 years. At today's national medians, that can turn assisted living into roughly a $164,000 planning problem for a man and about a $275,000 planning problem for a woman before extra care, inflation, or family disruption is added. If private nursing care is needed, the same comparison can move closer to $285,000 versus $480,000. Those are not scare numbers. They are a reminder that care planning is really family cash-flow planning."
      },
      {
        heading: "Coverage is less common than the risk.",
        body:
          "Many households have auto, home, health, and life coverage, but long-term care planning is often delayed because it feels uncomfortable or far away. That delay can be expensive. Health insurance and Medicare generally do not function like long-term custodial care plans, so assuming the gap is already handled can create a false sense of security."
      },
      {
        heading: "Case study: the successful professional who waited and had to self-fund.",
        body:
          "A 59-year-old divorced professional has $240,000 in liquid savings, retirement accounts she wants to protect, and adult children who live in different states. A neurological diagnosis creates an immediate need for in-home help, then assisted living, then skilled care. At roughly $6,700 per month for home support and $6,200 per month for assisted living, the first 18 months can consume more than $115,000 before medical copays, home modifications, and family travel. If skilled nursing becomes necessary, the same savings can disappear much faster. The hardest part is not only the money. It is watching family members make rushed decisions while assets built over decades begin funding care by default."
      },
      {
        heading: "Case study: the widow who chose coverage before the decision was urgent.",
        body:
          "A 61-year-old widow decides to review care preferences, trusted contacts, income sources, and potential coverage while she is healthy enough to choose. Several years later, a care need appears. Instead of asking her family to liquidate savings first, the plan gives them a funding source, instructions, and time to make decisions. Coverage does not remove every emotional burden, but it can reduce the financial scramble and protect more of the assets she wanted to preserve for income, independence, and family."
      },
      {
        heading: "The point is control.",
        body:
          "Long-term care planning is not about expecting the worst. It is about protecting choices: where you live, who helps, how family is involved, and which assets remain available for the life you still want. A review can help decide whether savings, income, family support, coverage, or a blended strategy should carry the risk."
      }
    ],
    comparisons: [
      {
        label: "Self-funding",
        detail: "Can preserve flexibility, but the monthly cost of care may force asset sales or reduce legacy goals if the need lasts longer than expected."
      },
      {
        label: "Family support",
        detail: "May feel natural, but unpaid caregiving can create emotional, career, travel, and financial strain for adult children or relatives."
      },
      {
        label: "Coverage strategy",
        detail: "May help protect choices and reduce the burden shifted to family, depending on health, age, budget, and available options."
      }
    ],
    disclosure:
      "This article is educational only and is not tax, legal, investment, health, or insurance advice. Long-term care planning options, underwriting, benefits, costs, and availability vary by carrier, state, age, and health."
  },
  {
    title: "If Your Business Depends on You, What Happens When You Cannot Be There?",
    slug: "business-continuity-owner-risk",
    summary: "Business owners often plan for growth before they plan for interruption. This article helps identify where owner, partner, and key-person dependency can create quiet continuity risk.",
    tag: "Business continuity",
    image: "/learning-hub/thumbs/blog-business-continuity-owner.jpg",
    alt: "Minority female business owner reviewing continuity documents and planning notes at her desk.",
    author: "N. Caruthers",
    intro:
      "A business can look healthy on paper and still depend too heavily on one person being available every day. For owners, partners, and self-employed professionals, continuity planning begins by asking what would slow down, stop, or become financially exposed if the person carrying the most responsibility could not show up.",
    sections: [
      {
        heading: "Growth plans need a backup plan.",
        body:
          "Most owners know their revenue, customers, and work pipeline. Fewer have written down who can approve decisions, serve clients, cover payroll, access operating details, or keep commitments moving if an owner or key person is suddenly unavailable."
      },
      {
        heading: "Continuity risk is not always obvious.",
        body:
          "The first warning sign may not be a disaster. It may be a delayed job, missed invoice, payroll gap, partner dispute, or client relationship that only one person knows how to manage. Those small dependencies can become expensive quickly."
      },
      {
        heading: "Funding matters as much as instructions.",
        body:
          "Written procedures help, but they do not pay contractors, replace lost revenue, support a buy-sell obligation, or stabilize a family while business decisions are made. A continuity review can help separate documentation gaps from funding gaps."
      },
      {
        heading: "The goal is to protect the business without overcomplicating it.",
        body:
          "A practical continuity plan may include reserves, delegated access, operating instructions, key-person planning, partner agreements, and life or disability protection where appropriate. The right starting point is identifying which gap would create the most pressure first."
      }
    ],
    comparisons: [
      {
        label: "Owner dependency",
        detail: "If revenue, decisions, or customer confidence depend on one person, the business may need a continuity path that does not rely on best-case timing."
      },
      {
        label: "Partner continuity",
        detail: "A funded transition or buy-sell plan can help prevent an already difficult event from becoming a business conflict."
      },
      {
        label: "Key-person exposure",
        detail: "If one employee, producer, or operator drives a meaningful share of revenue, the business should understand the cost of losing that capacity."
      }
    ],
    disclosure:
      "This article is educational only and is not tax, legal, investment, or insurance advice. Business continuity, buy-sell, key-person, life, and disability planning should be reviewed with qualified professionals based on the business structure and state-specific requirements."
  },
  {
    title: "What Is Life Insurance and How Does It Work?",
    slug: "what-is-life-insurance",
    summary: "Life insurance protects the people you love by replacing income, covering expenses, and creating long-term financial stability.",
    tag: "Life insurance",
    image: "/learning-hub/thumbs/blog-what-is-life-insurance.jpg",
    alt: "Family reviewing life protection options with a financial professional.",
    author: "N. Caruthers",
    intro:
      "Life insurance is one of the most powerful tools for protecting the people you love, yet it is also one of the most misunderstood.",
    sections: [
      {
        heading: "What life insurance is designed to do.",
        body:
          "At its core, life insurance is a contract: you pay a premium, and in return, the insurer promises to pay a generally tax-free benefit to your beneficiaries when you pass away. Beyond that definition, it is really about stability, dignity, and giving your family room to breathe during one of the hardest moments of their lives."
      },
      {
        heading: "Term and permanent coverage work differently.",
        body:
          "Term life insurance covers you for a set number of years, often 10, 20, or 30. It is affordable, straightforward, and often used during high-responsibility years. Permanent life insurance is designed to last your entire life and may build cash value over time, which can support legacy planning, supplemental income strategies, or final expenses when structured properly."
      },
      {
        heading: "The value is not only the payout.",
        body:
          "The real value is the peace of mind that comes from knowing your family will not face financial hardship on top of emotional loss. Whether you are starting a family, building wealth, or planning your legacy, understanding how life insurance works is a first step toward making a confident decision."
      }
    ],
    disclosure:
      "This article is educational only and is not tax, legal, investment, or insurance advice. Product availability, costs, features, and guarantees vary by carrier and state."
  },
  {
    title: "Understanding Financial Risk",
    slug: "understanding-financial-risk",
    summary: "Understanding financial risk helps you protect your income, savings, and long-term goals with more confidence.",
    tag: "Risk management",
    image: "/learning-hub/thumbs/blog-understanding-financial-risk.jpg",
    alt: "Minority family reviewing household protection and financial risk planning.",
    author: "N. Caruthers",
    intro:
      "Financial risk is a natural part of life, but when you can name it, you can make decisions from clarity instead of fear.",
    sections: [
      {
        heading: "Risk is not one thing.",
        body:
          "Income risk is the chance of losing a paycheck because of job loss, illness, or a life change. Debt risk comes from carrying obligations that become hard to manage. Market risk affects investments when the economy shifts. Longevity risk is the possibility of outliving savings in retirement."
      },
      {
        heading: "Awareness creates options.",
        body:
          "Managing financial risk starts with seeing where your household may be exposed. That might mean building cash reserves, reducing high-interest debt, reviewing life protection and coverage, or making sure retirement income does not depend on one fragile assumption."
      },
      {
        heading: "The goal is resilience.",
        body:
          "A plan does not remove uncertainty. It gives you a way to respond. With the right tools and education, financial risk becomes something you can navigate instead of something that quietly controls the next decision."
      }
    ],
    disclosure:
      "This article is educational only and is not tax, legal, investment, or insurance advice. Review your personal situation with a qualified professional before making decisions."
  },
  {
    title: "Building Trust in Your Financial Plan",
    slug: "building-trust-financial-plan",
    summary: "Trust grows when your financial plan is clear, aligned with your goals, and easy to follow.",
    tag: "Trust and clarity",
    image: "/learning-hub/thumbs/blog-building-trust-financial-plan.jpg",
    alt: "Hands holding planning blocks labeled protection, growth, legacy, and love.",
    author: "N. Caruthers",
    intro:
      "Trust is the foundation of every strong financial plan. Without it, even the most detailed strategy can still feel overwhelming.",
    sections: [
      {
        heading: "Trust begins with clarity.",
        body:
          "A financial plan should be understandable enough that you know what each step is doing. You should be able to see where money is going, which priorities come first, and how each tool supports the bigger picture."
      },
      {
        heading: "A trusted plan reflects your life.",
        body:
          "Your plan should not feel copied from someone else's goals. It should reflect your family, obligations, comfort level, and timeline. When the strategy connects to what matters most, follow-through becomes easier."
      },
      {
        heading: "Consistency keeps trust alive.",
        body:
          "Regular check-ins, small adjustments, and continued learning keep a plan from becoming a forgotten document. Life changes, and your plan should be able to move with it."
      }
    ],
    disclosure:
      "This article is educational only and is not tax, legal, investment, or insurance advice."
  },
  {
    title: "How Much Life Insurance Do You Really Need?",
    slug: "financial-foundations",
    summary: "A practical look at income needs, debts, and long-term goals so your family stays protected.",
    tag: "Coverage planning",
    image: "/learning-hub/thumbs/blog-how-much-life-insurance.jpg",
    alt: "Family looking at a financial storm scene while considering coverage needs.",
    author: "N. Caruthers",
    intro:
      "Determining how much life insurance you need can feel overwhelming, but the goal is simple: make sure your loved ones can maintain stability if something happens to you.",
    sections: [
      {
        heading: "Start with the income your household depends on.",
        body:
          "A common guideline is to multiply annual income by 10 to 15, but that is only a starting point. The better question is how long your family would need support and what your income currently protects."
      },
      {
        heading: "Add the obligations that should not become someone else's burden.",
        body:
          "Mortgage payments, rent, car loans, student loans, credit cards, childcare, and daily living expenses can all create pressure. Life protection can help keep those responsibilities from landing on loved ones at the worst possible time."
      },
      {
        heading: "Then consider future goals.",
        body:
          "College, retirement support for a spouse, caregiving, or a first home goal may all affect the coverage amount. Subtract existing savings and current coverage so the final number reflects a real gap instead of a guess."
      }
    ],
    disclosure:
      "Coverage needs vary by household. This article is educational only and is not tax, legal, investment, or insurance advice."
  },
  {
    title: "Making Informed Financial Decisions",
    slug: "informed-financial-decisions",
    summary: "A guide to evaluating options, understanding risks, and aligning financial choices with long-term goals.",
    tag: "Financial education",
    image: "/learning-hub/thumbs/blog-informed-financial-decisions.jpg",
    alt: "Minority woman reviewing financial documents at a desk.",
    author: "N. Caruthers",
    intro:
      "Every financial choice you make, big or small, shapes your long-term stability. The point is not perfection; it is knowing enough to choose with confidence.",
    sections: [
      {
        heading: "Know where you stand first.",
        body:
          "A clear snapshot of income, expenses, savings, debt, and priorities helps you stop reacting to pressure and start choosing intentionally. Without that snapshot, even good options can feel confusing."
      },
      {
        heading: "Compare benefits, risks, and trade-offs.",
        body:
          "Whether you are reviewing coverage, savings tools, retirement decisions, or debt priorities, each choice has a purpose. Understanding what a tool does and what it does not do helps keep the decision aligned with your goals."
      },
      {
        heading: "Keep learning as life changes.",
        body:
          "Informed decisions are not one-time events. As income, family needs, market conditions, and goals change, your plan should be reviewed and adjusted with the same level of care."
      }
    ],
    disclosure:
      "This article is educational only and is not tax, legal, investment, or insurance advice."
  },
  {
    title: "What to Know Before Buying Life Insurance",
    slug: "before-buying-life-insurance",
    summary: "What to consider before choosing coverage, including purpose, budget, policy type, and family needs.",
    tag: "Life protection",
    image: "/learning-hub/thumbs/blog-before-buying-life-insurance.jpg",
    alt: "Family comparing life insurance options before choosing coverage.",
    author: "N. Caruthers",
    intro:
      "Buying life insurance is one of the most meaningful financial decisions you can make. Being prepared helps you choose coverage that actually fits your family.",
    sections: [
      {
        heading: "Be clear on the purpose.",
        body:
          "Most people buy coverage to protect income, support loved ones, pay off debt, leave a legacy, or create room for future planning. The purpose should drive the policy type and coverage amount."
      },
      {
        heading: "Understand the policy type.",
        body:
          "Term coverage may fit a temporary protection need. Permanent coverage may support lifelong protection and potential cash value. Neither is automatically better; the right fit depends on the need, budget, and long-term objective."
      },
      {
        heading: "Review the details before signing.",
        body:
          "Ask about premiums, riders, exclusions, future changes, and how the policy is expected to perform. A strong decision should feel clear before it feels urgent."
      }
    ],
    disclosure:
      "Policy features, costs, guarantees, and availability vary. This article is educational only and is not tax, legal, investment, or insurance advice."
  },
  {
    title: "Financial Growth Through Collaboration",
    slug: "financial-growth-collaboration",
    summary: "How shared support, trusted guidance, and clearer conversations can strengthen financial growth.",
    tag: "Collaboration",
    image: "/learning-hub/thumbs/blog-financial-growth-collaboration.jpg",
    alt: "Minority family reviewing a laptop and financial notes together.",
    author: "N. Caruthers",
    intro:
      "Financial growth rarely happens in isolation. It is strengthened by shared knowledge, supportive conversations, and the willingness to ask better questions.",
    sections: [
      {
        heading: "Collaboration adds perspective.",
        body:
          "A partner may help you stay accountable. A financial professional can explain options that feel complex. A trusted community can help normalize conversations about money, protection, and long-term goals."
      },
      {
        heading: "Support reduces stress.",
        body:
          "Money decisions can feel heavy when you are carrying them alone. Collaboration creates room to talk through trade-offs, define priorities, and make choices that reflect the life you are actually building."
      },
      {
        heading: "Inclusive planning creates stronger outcomes.",
        body:
          "Different experiences can reveal risks and opportunities that a single viewpoint might miss. A stronger plan is not only technical; it is human, practical, and built around the people it is meant to serve."
      }
    ],
    disclosure:
      "This article is educational only and is not tax, legal, investment, or insurance advice."
  },
  {
    title: "Retirement Risk, Taxes, and RMDs",
    slug: "retirement-risk-taxes-rmds",
    summary: "How retirement risk, taxes, and required minimum distributions can shape long-term income decisions.",
    tag: "Retirement",
    image: "/learning-hub/thumbs/blog-retirement-risk-taxes.jpg",
    alt: "Couple reviewing retirement tax and RMD planning materials.",
    author: "N. Caruthers",
    intro:
      "Retirement planning is about more than saving money. It is also about understanding the risks, tax rules, hidden fees, and timing decisions that can quietly reduce spendable income.",
    sections: [
      {
        heading: "Retirement risk can show up after the saving years.",
        body:
          "Market volatility, inflation, healthcare costs, longevity, and sequence-of-return risk can affect how long money lasts. A plan should account for what happens when withdrawals begin, not only what happens while assets are growing."
      },
      {
        heading: "Taxes and RMDs can change the picture.",
        body:
          "Traditional retirement accounts are generally tax-deferred, not tax-free. Required minimum distributions may force taxable withdrawals later, which can affect tax brackets, Social Security taxation, and cash-flow flexibility."
      },
      {
        heading: "Fees and management costs matter too.",
        body:
          "Hidden fees, management costs, and inefficient account placement can create drag over time. Reviewing the structure can help you see whether your retirement income plan is working as hard as it should."
      }
    ],
    disclosure:
      "This article is educational only and is not tax, legal, investment, or insurance advice. Tax rules can change; consult qualified tax and financial professionals for your situation."
  }
];

export const videoItems: VideoItem[] = [
  {
    title: "Personal Finance Basics",
    slug: "personal-finance-basics-khan",
    summary: "A neutral explainer covering personal finance, budgeting, and spending decisions.",
    tag: "Personal finance",
    image: "/learning-hub/thumbs/vlog-personal-finance-basics.jpg",
    alt: "Minority couple learning personal finance basics on a laptop.",
    videoUrl: "https://www.youtube.com/embed/UcAY6qRHlw0"
  },
  {
    title: "Budgeting and Saving",
    slug: "budgeting-saving-khan",
    summary: "A clear overview of budgeting, saving, and spending decisions.",
    tag: "Budgeting",
    image: "/learning-hub/thumbs/vlog-budgeting-saving.jpg",
    alt: "Couple reviewing budgeting and saving concepts together.",
    videoUrl: "https://www.youtube.com/embed/GtaoP0skPWc"
  },
  {
    title: "Understanding Indexed Universal Life",
    slug: "understanding-iul-carrier",
    summary: "An educational overview of how indexed universal life insurance works.",
    tag: "Life insurance education",
    image: "/learning-hub/thumbs/vlog-understanding-iul.jpg",
    alt: "Couple reviewing life insurance education visuals.",
    videoUrl: "https://www.youtube.com/embed/25cqIKPEYqk"
  },
  {
    title: "How Indexed Universal Life Works",
    slug: "how-iul-works-carrier",
    summary: "A compliance-friendly explanation of indexed universal life mechanics.",
    tag: "Carrier education",
    image: "/learning-hub/thumbs/vlog-how-iul-works.jpg",
    alt: "Illustration of legacy, growth, and protection planning concepts.",
    videoUrl: "https://www.youtube.com/embed/ZK2gE5Z2nVI"
  },
  {
    title: "An Introduction to Indexed Universal Life Insurance",
    slug: "mutual-of-omaha-introduction-to-iul",
    summary: "Mutual of Omaha education on indexed universal life insurance, family protection, and supplemental retirement planning.",
    tag: "Mutual of Omaha",
    image: "/learning-hub/thumbs/vlog-child-future-planning.jpg",
    alt: "Financial balance scale representing protection and income planning.",
    externalUrl: "https://www.mutualofomaha.com/video/an-introduction-to-indexed-universal-life"
  },
  {
    title: "How IUL Credits Interest",
    slug: "mutual-of-omaha-how-iul-credits-interest",
    summary: "Mutual of Omaha explains how indexed universal life credits interest and how index-linked crediting differs from direct market investing.",
    tag: "Mutual of Omaha",
    image: "/learning-hub/thumbs/vlog-iul-credits-interest.jpg",
    alt: "Balance scale showing coverage, debt, income, and services.",
    externalUrl: "https://www.mutualofomaha.com/video/how-iul-credits-interest"
  },
  {
    title: "An Example of How IUL Can Work for Retirement",
    slug: "mutual-of-omaha-iul-retirement-example",
    summary: "A Mutual of Omaha example of how IUL may support retirement planning conversations.",
    tag: "Mutual of Omaha",
    image: "/learning-hub/thumbs/vlog-iul-retirement-example.jpg",
    alt: "Retirement planning objects with a home, clock, and savings blocks.",
    externalUrl: "https://www.mutualofomaha.com/video/an-example-of-how-iul-can-work"
  },
  {
    title: "Investing in Your Child's Future",
    slug: "mutual-of-omaha-child-future",
    summary: "A short educational resource on planning for future college costs and how life insurance can fit into a broader family conversation.",
    tag: "Child future planning",
    image: "/learning-hub/thumbs/vlog-mutual-iul-intro.jpg",
    alt: "Parents reviewing future planning documents for their child.",
    externalUrl: "https://www.mutualofomaha.com/video/are-you-worried-about-future-college-costs"
  },
  {
    title: "529 Plans and Education Savings",
    slug: "529-education-savings-explained",
    summary: "A plain-language video resource on how 529 education savings plans can help families prepare for qualified school expenses.",
    tag: "Education savings",
    image: "/learning-hub/thumbs/vlog-529-education-savings.jpg",
    alt: "Family comparing education savings options at a kitchen table.",
    externalUrl: "https://theeducationplan.com/videos/the-529-savings-plan-explained-in-1-minute",
    ctaLabel: "Watch 529 explainer"
  },
  {
    title: "Living Benefits and Family Protection",
    slug: "national-life-living-benefits",
    summary: "Stories and resources that explain how living benefits can support families during serious life events.",
    tag: "Living benefits",
    image: "/learning-hub/thumbs/vlog-living-benefits-family-protection.jpg",
    alt: "Family seated with a financial professional discussing protection planning.",
    externalUrl: "https://www.nationallife.com/Individuals-Families-Living-Benefits"
  }
];

export function LearningHubPage({ kind }: { kind: HubKind }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null);
  const isBlog = kind === "blog";
  const items: Array<BlogItem | VideoItem> = isBlog ? blogItems : videoItems;
  const displayItems = items;
  const activeBlog = isBlog ? blogItems.find((item) => item.slug === activeBlogSlug) ?? null : null;
  const sessionId = useMemo(() => createLearningSessionId(), []);

  useEffect(() => {
    trackLearningEvent("learning_page_view", {
      sessionId,
      kind,
      contentSlug: isBlog ? "learning-hub-blog" : "learning-hub-vlog",
      contentTitle: isBlog ? "TouchPoint Learning Hub Blog" : "TouchPoint Learning Hub VLOG",
      contentTag: "Learning Hub"
    });
  }, [isBlog, kind, sessionId]);

  function trackClick(action: string, item?: Partial<BlogItem & VideoItem>, destination?: string) {
    trackLearningEvent("learning_content_click", {
      sessionId,
      kind,
      action,
      contentSlug: item?.slug ?? (isBlog ? "learning-hub-blog" : "learning-hub-vlog"),
      contentTitle: item?.title ?? (isBlog ? "TouchPoint Learning Hub Blog" : "TouchPoint Learning Hub VLOG"),
      contentTag: item?.tag ?? "Learning Hub",
      destination
    });
  }

  function openBlogArticle(item: BlogItem) {
    setActiveBlogSlug(item.slug);
    trackClick("blog_article_open", item, `/learning-hub-blog/#${item.slug}`);
    window.setTimeout(() => document.getElementById("tp-blog-article")?.scrollIntoView({ behavior: "smooth", block: "start" }), 25);
  }

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
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/" onClick={() => trackClick("nav_home", undefined, "/")}>Home</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/#about" onClick={() => trackClick("nav_about", undefined, "/#about")}>About</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/#tp-diagnostic-main" onClick={() => trackClick("nav_csp_tool", undefined, "/#tp-diagnostic-main")}>CSP Tool</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/learning-hub-vlog/" onClick={() => trackClick("nav_videos", undefined, "/learning-hub-vlog/")}>Vlogs</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/learning-hub-blog/" onClick={() => trackClick("nav_blogs", undefined, "/learning-hub-blog/")}>Blogs</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/privacy-policy/" onClick={() => trackClick("nav_privacy", undefined, "/privacy-policy/")}>Privacy Policy</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/terms-disclosures/" onClick={() => trackClick("nav_terms", undefined, "/terms-disclosures/")}>Terms / Legal</a>
            <a className="rounded-full border border-emerald-200/30 bg-teal-700/40 px-4 py-2 text-white hover:bg-teal-700/70" href={touchPointBrand.calendlyUrl} onClick={() => trackClick("schedule_now", undefined, touchPointBrand.calendlyUrl)}>Schedule Now</a>
          </nav>
          <details className="relative lg:hidden" open={mobileNavOpen} onToggle={(event) => setMobileNavOpen(event.currentTarget.open)}>
            <summary aria-label="Open navigation menu" className="list-none rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-lg font-black text-white marker:hidden">
              <Menu aria-hidden="true" className="h-6 w-6" />
            </summary>
            <nav aria-label="Mobile navigation" className="absolute right-0 top-14 grid w-[calc(100vw-2rem)] max-w-sm grid-cols-2 gap-2 rounded-2xl border border-cyan-200/15 bg-[#0b2030] p-3 shadow-2xl">
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/" onClick={() => trackClick("mobile_nav_home", undefined, "/")}>Home</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/#about" onClick={() => trackClick("mobile_nav_about", undefined, "/#about")}>About</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/#tp-diagnostic-main" onClick={() => trackClick("mobile_nav_csp_tool", undefined, "/#tp-diagnostic-main")}>CSP Tool</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href={touchPointBrand.calendlyUrl} onClick={() => trackClick("mobile_nav_schedule_now", undefined, touchPointBrand.calendlyUrl)}>Schedule Now</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/learning-hub-vlog/" onClick={() => trackClick("mobile_nav_videos", undefined, "/learning-hub-vlog/")}>Vlogs</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/learning-hub-blog/" onClick={() => trackClick("mobile_nav_blogs", undefined, "/learning-hub-blog/")}>Blogs</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/privacy-policy/" onClick={() => trackClick("mobile_nav_privacy", undefined, "/privacy-policy/")}>Privacy Policy</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/terms-disclosures/" onClick={() => trackClick("mobile_nav_terms", undefined, "/terms-disclosures/")}>Terms / Legal</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:py-12">
        <div className="mb-5 flex flex-wrap gap-3">
          <a className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-bold text-slate-100" href="/" onClick={() => trackClick("back_to_home", undefined, "/")}>
            <ArrowLeft className="h-4 w-4" /> Back to home
          </a>
          <a className="inline-flex items-center gap-2 rounded-full border border-emerald-200/30 bg-teal-700/40 px-4 py-2 font-bold text-white" href={touchPointBrand.calendlyUrl} onClick={() => trackClick("schedule_now_top", undefined, touchPointBrand.calendlyUrl)}>
            <CalendarDays className="h-4 w-4" /> Schedule now
          </a>
        </div>

        <div className="rounded-[2rem] border border-cyan-300/20 bg-[#07151c]/95 p-5 shadow-2xl sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-200/80">TouchPoint Learning Hub</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-none text-white sm:text-6xl">
            {isBlog ? "Read the TouchPoint blogs." : "Watch TouchPoint learning videos."}
          </h1>
          <p className="tp-copy mt-5 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl sm:leading-9">
            {isBlog
              ? "Educational articles for families comparing protection, savings, tax exposure, and next-step planning decisions."
              : "Selected Learning Hub videos migrated from the original TouchPoint video page."}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {displayItems.map((item, index) => (
              <article className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.045]" key={item.slug}>
                {isBlog && "image" in item ? (
                  <div className="h-56 overflow-hidden border-b border-white/10 bg-[#0c2634] sm:h-60">
                    <img alt={item.alt} className="h-full w-full object-cover object-center" loading={index < 2 ? "eager" : "lazy"} src={item.image} />
                  </div>
                ) : null}
                {!isBlog && "image" in item ? (
                  <div className="h-56 overflow-hidden border-b border-white/10 bg-[#07151c] p-1 sm:h-60">
                    <img alt={item.alt} className="h-full w-full rounded-xl object-contain" loading={index < 2 ? "eager" : "lazy"} src={item.image} />
                  </div>
                ) : null}
                <div className="p-5">
                  {isBlog ? (
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/20 bg-emerald-200/10 text-emerald-100">
                      <BookOpen className="h-6 w-6" />
                    </div>
                  ) : null}
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200/80">{item.tag}</p>
                  <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">{item.title}</h2>
                  <p className="tp-copy mt-4 text-base leading-7 text-slate-300">{item.summary}</p>
                  {isBlog && "summary" in item ? (
                    <Link
                      href={`/learning-hub-blog/${item.slug}/`}
                      className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-extrabold text-emerald-100 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
                      onClick={() => trackClick("blog_article_open", item, `/learning-hub-blog/${item.slug}/`)}
                    >
                      Read article <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  ) : null}
                  {!isBlog ? (
                    <Link
                      className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-extrabold text-emerald-100 hover:bg-white/10"
                      href={`/learning-hub-vlog/${item.slug}/`}
                      onClick={() => trackClick("vlog_detail_open", item, `/learning-hub-vlog/${item.slug}/`)}
                    >
                      Open video <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          {activeBlog ? (
            <article className="mt-8 overflow-hidden rounded-3xl border border-emerald-200/20 bg-[#091922] shadow-2xl" id="tp-blog-article">
              <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="relative min-h-64 bg-[#0c2634] lg:min-h-full">
                  <img alt={activeBlog.alt} className="h-full min-h-64 w-full object-cover" src={activeBlog.image} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06121a]/60 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-5 right-5 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-100 drop-shadow">{activeBlog.tag}</p>
                </div>
                <div className="p-5 sm:p-7">
                  <button
                    className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 py-2 text-sm font-extrabold text-slate-100 hover:bg-white/10"
                    onClick={() => setActiveBlogSlug(null)}
                    type="button"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to articles
                  </button>
                  <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-200/80">TouchPoint article</p>
                  <h2 className="mt-3 max-w-3xl font-serif text-3xl leading-tight text-white sm:text-5xl">{activeBlog.title}</h2>
                  {activeBlog.author ? <p className="mt-3 text-sm font-bold text-slate-200">By {activeBlog.author}</p> : null}
                  <p className="tp-copy mt-5 text-lg leading-8 text-slate-100">{activeBlog.intro ?? activeBlog.summary}</p>
                  {activeBlog.sections?.length ? (
                    <div className="mt-6 space-y-5">
                      {activeBlog.sections.map((section) => (
                        <section key={section.heading}>
                          <h3 className="text-xl font-extrabold leading-snug text-white">{section.heading}</h3>
                          <p className="tp-copy mt-2 text-base leading-7 text-slate-300">{section.body}</p>
                        </section>
                      ))}
                    </div>
                  ) : null}
                  {activeBlog.comparisons?.length ? (
                    <aside className="mt-6 rounded-2xl border border-white/12 bg-white/[0.045] p-5">
                      <h3 className="text-lg font-extrabold text-white">Compare the tools before choosing the path.</h3>
                      <div className="mt-5 space-y-4">
                        {activeBlog.comparisons.map((comparison) => (
                          <div className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0" key={comparison.label}>
                            <p className="font-extrabold text-emerald-100">{comparison.label}</p>
                            <p className="tp-copy mt-1 text-sm leading-6 text-slate-300">{comparison.detail}</p>
                          </div>
                        ))}
                      </div>
                    </aside>
                  ) : null}
                  {activeBlog.disclosure ? <p className="tp-copy mt-5 text-xs leading-5 text-slate-400">{activeBlog.disclosure}</p> : null}
                  <a
                    className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-center text-base font-extrabold text-[#051016]"
                    href={touchPointBrand.calendlyUrl}
                    onClick={() => trackClick("blog_article_schedule_review", activeBlog, touchPointBrand.calendlyUrl)}
                  >
                    Review my options <ChevronRight className="ml-2 h-5 w-5" />
                  </a>
                </div>
              </div>
            </article>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a className="inline-flex min-h-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-4 text-center text-lg font-extrabold text-[#051016]" href="/#tp-diagnostic-main">
              Start with the diagnostic <ChevronRight className="ml-1 h-5 w-5" />
            </a>
            <a className="inline-flex min-h-16 items-center justify-center rounded-full border border-white/25 px-6 py-4 text-center text-lg font-extrabold" href={isBlog ? "/learning-hub-vlog/" : "/learning-hub-blog/"} onClick={() => trackClick(isBlog ? "cross_link_to_vlog" : "cross_link_to_blog", undefined, isBlog ? "/learning-hub-vlog/" : "/learning-hub-blog/")}>
              {isBlog ? "Watch educational videos" : "Read the blogs"} <ChevronRight className="ml-1 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export function LearningHubDetailPage({ kind, slug }: { kind: HubKind; slug: string }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const sessionId = useMemo(() => createLearningSessionId(), []);
  const isBlog = kind === "blog";
  const item = isBlog ? blogItems.find((entry) => entry.slug === slug) : videoItems.find((entry) => entry.slug === slug);
  const blogItem = isBlog ? (item as BlogItem | undefined) : undefined;
  const videoItem = !isBlog ? (item as VideoItem | undefined) : undefined;
  const hubPath = isBlog ? "/learning-hub-blog/" : "/learning-hub-vlog/";

  useEffect(() => {
    trackLearningEvent("learning_page_view", {
      sessionId,
      kind,
      contentSlug: item?.slug ?? slug,
      contentTitle: item?.title ?? "Learning resource not found",
      contentTag: item?.tag ?? "Learning Hub"
    });
  }, [item, kind, sessionId, slug]);

  function trackDetailClick(action: string, destination?: string) {
    trackLearningEvent("learning_content_click", {
      sessionId,
      kind,
      action,
      contentSlug: item?.slug ?? slug,
      contentTitle: item?.title ?? "Learning resource not found",
      contentTag: item?.tag ?? "Learning Hub",
      destination
    });
  }

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
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/learning-hub-vlog/">Vlogs</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/learning-hub-blog/">Blogs</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/privacy-policy/">Privacy Policy</a>
            <a className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white" href="/terms-disclosures/">Terms / Legal</a>
            <a className="rounded-full border border-emerald-200/30 bg-teal-700/40 px-4 py-2 text-white hover:bg-teal-700/70" href={touchPointBrand.calendlyUrl}>Schedule Now</a>
          </nav>
          <details className="relative lg:hidden" open={mobileNavOpen} onToggle={(event) => setMobileNavOpen(event.currentTarget.open)}>
            <summary aria-label="Open navigation menu" className="list-none rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-lg font-black text-white marker:hidden">
              <Menu aria-hidden="true" className="h-6 w-6" />
            </summary>
            <nav aria-label="Mobile navigation" className="absolute right-0 top-14 grid w-[calc(100vw-2rem)] max-w-sm grid-cols-2 gap-2 rounded-2xl border border-cyan-200/15 bg-[#0b2030] p-3 shadow-2xl">
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/">Home</a>
              <a className="rounded-xl px-3 py-3 text-center text-sm font-extrabold text-slate-100 hover:bg-white/10" href="/#about">About</a>
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
          <Link className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-bold text-slate-100" href={hubPath} onClick={() => trackDetailClick("back_to_hub", hubPath)}>
            <ArrowLeft className="h-4 w-4" /> Back to {isBlog ? "blogs" : "videos"}
          </Link>
          <a className="inline-flex items-center gap-2 rounded-full border border-emerald-200/30 bg-teal-700/40 px-4 py-2 font-bold text-white" href={touchPointBrand.calendlyUrl} onClick={() => trackDetailClick("schedule_now", touchPointBrand.calendlyUrl)}>
            <CalendarDays className="h-4 w-4" /> Schedule now
          </a>
        </div>

        {!item ? (
          <article className="rounded-[2rem] border border-cyan-300/20 bg-[#07151c]/95 p-6 shadow-2xl sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-200/80">TouchPoint Learning Hub</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-6xl">Learning resource not found.</h1>
            <p className="tp-copy mt-5 text-lg leading-8 text-slate-200">Return to the Learning Hub to choose an available article or video.</p>
          </article>
        ) : null}

        {blogItem ? (
          <article className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#07151c]/95 shadow-2xl">
            <div className="h-64 bg-[#0c2634] sm:h-80">
              <img alt={blogItem.alt} className="h-full w-full object-cover object-center" src={blogItem.image} />
            </div>
            <div className="p-5 sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-200/80">{blogItem.tag}</p>
              <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-tight text-white sm:text-6xl">{blogItem.title}</h1>
              {blogItem.author ? <p className="mt-3 text-sm font-bold text-slate-200">By {blogItem.author}</p> : null}
              <p className="tp-copy mt-6 text-lg leading-8 text-slate-100">{blogItem.intro ?? blogItem.summary}</p>
              {blogItem.sections?.length ? (
                <div className="mt-8 space-y-6">
                  {blogItem.sections.map((section) => (
                    <section key={section.heading}>
                      <h2 className="text-2xl font-extrabold leading-snug text-white">{section.heading}</h2>
                      <p className="tp-copy mt-3 text-base leading-7 text-slate-300">{section.body}</p>
                    </section>
                  ))}
                </div>
              ) : null}
              {blogItem.comparisons?.length ? (
                <aside className="mt-8 rounded-2xl border border-white/12 bg-white/[0.045] p-5">
                  <h2 className="text-xl font-extrabold text-white">Compare the tools before choosing the path.</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {blogItem.comparisons.map((comparison) => (
                      <div className="rounded-xl border border-white/10 p-4" key={comparison.label}>
                        <p className="font-extrabold text-emerald-100">{comparison.label}</p>
                        <p className="tp-copy mt-2 text-sm leading-6 text-slate-300">{comparison.detail}</p>
                      </div>
                    ))}
                  </div>
                </aside>
              ) : null}
              {blogItem.disclosure ? <p className="tp-copy mt-6 text-xs leading-5 text-slate-400">{blogItem.disclosure}</p> : null}
              <a className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-center text-base font-extrabold text-[#051016]" href={touchPointBrand.calendlyUrl} onClick={() => trackDetailClick("article_schedule_review", touchPointBrand.calendlyUrl)}>
                Review my options <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </article>
        ) : null}

        {videoItem ? (
          <article className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#07151c]/95 shadow-2xl">
            <div className="p-5 sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-200/80">{videoItem.tag}</p>
              <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-tight text-white sm:text-6xl">{videoItem.title}</h1>
              <p className="tp-copy mt-5 max-w-3xl text-lg leading-8 text-slate-200">{videoItem.summary}</p>
              {videoItem.videoUrl ? (
                <div className="mt-7 overflow-hidden rounded-2xl border border-white/15 bg-black">
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="aspect-video w-full"
                    src={videoItem.videoUrl}
                    title={videoItem.title}
                  />
                </div>
              ) : (
                <div className="mt-7 overflow-hidden rounded-2xl border border-white/15 bg-[#07151c] p-2">
                  <img alt={videoItem.alt} className="max-h-[28rem] w-full rounded-xl object-contain" src={videoItem.image} />
                </div>
              )}
              {videoItem.externalUrl ? (
                <a className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-center text-base font-extrabold text-[#051016]" href={videoItem.externalUrl} onClick={() => trackDetailClick("external_video_open", videoItem.externalUrl)} rel="noreferrer" target="_blank">
                  {videoItem.ctaLabel ?? "Open video resource"} <ChevronRight className="ml-2 h-5 w-5" />
                </a>
              ) : null}
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}

function createLearningSessionId() {
  return `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function trackLearningEvent(
  eventName: "learning_page_view" | "learning_content_click",
  event: {
    sessionId: string;
    kind: HubKind;
    action?: string;
    contentSlug?: string;
    contentTitle?: string;
    contentTag?: string;
    destination?: string;
  }
) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const payload = {
    eventName,
    sessionId: event.sessionId,
    source: "touchpointgroup.co",
    entry_point: "learning_hub",
    tool_type: "traffic",
    campaign_type: "content_marketing",
    content_type: event.kind === "blog" ? "blog" : "vlog",
    content_slug: event.contentSlug ?? "",
    content_title: event.contentTitle ?? "",
    content_tag: event.contentTag ?? "",
    content: {
      content_type: event.kind === "blog" ? "blog" : "vlog",
      content_slug: event.contentSlug ?? "",
      content_title: event.contentTitle ?? "",
      content_tag: event.contentTag ?? "",
      action: event.action ?? (eventName === "learning_page_view" ? "page_view" : "click"),
      destination_url: event.destination ?? ""
    },
    metadata: {
      page_url: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer,
      landing_url: window.location.href,
      user_agent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      utm_source: url.searchParams.get("utm_source") ?? "",
      utm_medium: url.searchParams.get("utm_medium") ?? "",
      utm_campaign: url.searchParams.get("utm_campaign") ?? "",
      utm_content: url.searchParams.get("utm_content") ?? "",
      utm_term: url.searchParams.get("utm_term") ?? "",
      content_type: event.kind === "blog" ? "blog" : "vlog",
      content_slug: event.contentSlug ?? "",
      content_title: event.contentTitle ?? "",
      content_tag: event.contentTag ?? ""
    }
  };

  fetch("/api/touchpoint/diagnostic-capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => undefined);
}
