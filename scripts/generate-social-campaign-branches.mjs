import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = process.cwd();
const outRoot = path.join(root, "TOUCHPOINT_SOCIAL_CAMPAIGN_REVIEW_PACKAGE", "ads-ready-branches");
const logo = pathToFileURL(path.join(root, "public", "brand", "touchpoint-logo-final.png")).href;

const asset = (relativePath) => pathToFileURL(path.join(root, relativePath)).href;

const imageGovernance = {
  status: "superseded-draft-rule",
  requiredStyle:
    "Authentic, realistic premium lifestyle photography with diverse families, professionals, couples, individuals, and multigenerational scenes.",
  hardExclusions: [
    "charts",
    "graphs",
    "pie charts",
    "bar charts",
    "line charts",
    "stock market screens",
    "dashboards",
    "financial spreadsheets",
    "random numbers or data graphics",
    "calculator imagery",
    "fake app screenshots",
    "generic fintech UI overlays",
    "office whiteboards",
    "crypto or stock trading visuals",
    "floating icons",
    "abstract financial symbols",
    "text embedded in the source image",
  ],
  checklist: [
    "realistic human lifestyle photo",
    "diverse representation",
    "emotional connection",
    "clean negative space for copy",
    "zero charts, graphs, dashboards, calculators, fake financial screens, or abstract graphics",
    "premium and trustworthy, not sterile fintech",
  ],
};

const campaigns = [
  {
    id: "goppi-conscious-spending",
    label: "GOPPI / Conscious Spending",
    image: asset("public/learning-hub/thumbs/blog-conscious-spending-vs-budgeting.jpg"),
    slides: [
      {
        eyebrow: "MONEY KEEPS SLIPPING AWAY",
        headline: "You can be doing the work and still feel exposed.",
        body: "Start with one clear monthly snapshot before trying to solve the whole picture.",
      },
      {
        eyebrow: "START WITH GOPPI™",
        headline: "See what is committed, what is flexible, and what deserves attention first.",
        body: "No account linking. No credit card. No document upload.",
      },
      {
        eyebrow: "FREE PLANNING TOOL",
        headline: "Build your GOPPI™ snapshot, then decide the next step with more clarity.",
        body: "TouchPoint Conscious Spending Tool",
        cta: "Start the free GOPPI™ snapshot",
      },
    ],
  },
  {
    id: "income-continuity",
    label: "Income Continuity",
    image: asset("public/learning-hub/thumbs/blog-how-much-life-insurance.jpg"),
    slides: [
      {
        eyebrow: "MY FAMILY DEPENDS ON MY INCOME",
        headline: "If your income stopped tomorrow, what would break first?",
        body: "Most responsibilities do not pause when income does.",
      },
      {
        eyebrow: "PROTECTION GAPS",
        headline: "The gap is easier to find before life forces the question.",
        body: "Look at obligations, family dependency, and coverage alignment in minutes.",
      },
      {
        eyebrow: "CLEAR NEXT STEP",
        headline: "Check where your income continuity may be exposed.",
        body: "Educational planning support. Not legal, tax, or insurance advice.",
        cta: "Check protection gaps",
      },
    ],
  },
  {
    id: "retirement-tax-exposure",
    label: "Retirement & Tax Exposure",
    image: asset("public/learning-hub/thumbs/blog-retirement-risk-taxes.jpg"),
    slides: [
      {
        eyebrow: "RETIREMENT AND TAXES WORRY ME",
        headline: "You may not have an income problem. You may have a timing problem.",
        body: "Taxes, distributions, and hidden costs can change the retirement picture.",
      },
      {
        eyebrow: "TIMING DRAG",
        headline: "A plan can look fine on the surface and still leak quietly.",
        body: "Start by revealing where retirement exposure may be building.",
      },
      {
        eyebrow: "REVIEW DIRECTION",
        headline: "See the exposure before choosing the next move.",
        body: "Simple review path for savings, timing, and retirement planning questions.",
        cta: "Reveal retirement exposure",
      },
    ],
  },
  {
    id: "trust-readiness",
    label: "Trust Readiness",
    image: asset("public/learning-hub/thumbs/blog-building-trust-financial-plan.jpg"),
    slides: [
      {
        eyebrow: "PROTECT MY FAMILY AND ESTATE",
        headline: "Your family should not have to guess what you meant.",
        body: "A plan is only useful when decisions, documents, roles, and funding are clear.",
      },
      {
        eyebrow: "FAMILY CLARITY",
        headline: "Probate exposure and unclear roles can create pressure at the worst time.",
        body: "Start with a readiness check before documents are needed.",
      },
      {
        eyebrow: "READINESS CHECK",
        headline: "Find where family clarity may need attention.",
        body: "Educational readiness review. Not legal advice.",
        cta: "Check trust readiness",
      },
    ],
  },
  {
    id: "business-continuity",
    label: "Business Continuity",
    image: asset("public/learning-hub/thumbs/blog-business-continuity-owner.jpg"),
    slides: [
      {
        eyebrow: "BUSINESS OWNER / SELF-EMPLOYED",
        headline: "If the business had to run without you, what would break first?",
        body: "Owner dependency, key people, partners, and operating cash can all carry hidden exposure.",
      },
      {
        eyebrow: "CONTINUITY EXPOSURE",
        headline: "The strongest businesses still need a backup path.",
        body: "A short check can reveal where continuity planning deserves attention.",
      },
      {
        eyebrow: "OWNER READINESS",
        headline: "See the continuity exposure before it becomes urgent.",
        body: "For owners, partners, self-employed professionals, and key-person dependent teams.",
        cta: "Check Business Continuity Exposure",
      },
    ],
  },
  {
    id: "ltc-disability-later",
    label: "LTC / Disability Later Campaign",
    image: asset("public/learning-hub/thumbs/blog-financial-growth-collaboration.jpg"),
    slides: [
      {
        eyebrow: "LATER CAMPAIGN LANE",
        headline: "What if the biggest risk is needing help before the plan is ready?",
        body: "This concept is better aligned to long-term care, disability, and living-benefit education.",
      },
      {
        eyebrow: "PROTECTION CONVERSATION",
        headline: "Coverage is not only about what happens after life. It is also about what happens during life.",
        body: "Use this branch separately from GOPPI so the message stays clean.",
      },
      {
        eyebrow: "HUMAN REVIEW HOLD",
        headline: "Keep this as a later creative branch, not the GOPPI launch ad.",
        body: "Old Canva concept can be adapted here after the GOPPI family is approved.",
        cta: "Hold for LTC / disability campaign",
      },
    ],
  },
];

const formats = [
  { key: "instagram-square", width: 1080, height: 1080 },
  { key: "linkedin-feed", width: 1080, height: 1350 },
  { key: "story-reel", width: 1080, height: 1920 },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderCard(campaign, slide, format, index) {
  const tall = format.height > 1500;
  const imageHeight = tall ? 470 : 285;
  const titleSize = tall ? 78 : 64;
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: ${format.width}px; height: ${format.height}px; overflow: hidden; }
    body {
      background:
        linear-gradient(rgba(148, 242, 214, .08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148, 242, 214, .08) 1px, transparent 1px),
        radial-gradient(circle at 18% 18%, rgba(51, 218, 200, .2), transparent 32%),
        linear-gradient(135deg, #061116, #08252a 58%, #071219);
      background-size: 142px 142px, 142px 142px, 100% 100%, 100% 100%;
      color: #f7fbf8;
      font-family: Inter, Arial, sans-serif;
      padding: ${tall ? 70 : 54}px;
    }
    .frame {
      width: 100%;
      height: 100%;
      border: 2px solid rgba(151, 246, 217, .26);
      border-radius: ${tall ? 54 : 42}px;
      background: linear-gradient(180deg, rgba(5, 23, 28, .94), rgba(7, 20, 26, .98));
      box-shadow: 0 36px 90px rgba(0, 0, 0, .45), inset 0 0 80px rgba(65, 223, 203, .08);
      padding: ${tall ? 58 : 46}px;
      display: flex;
      flex-direction: column;
      gap: ${tall ? 34 : 26}px;
      overflow: hidden;
      position: relative;
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .logo {
      width: ${tall ? 156 : 136}px;
      background: #fff;
      border-radius: 8px;
      padding: 8px 12px;
    }
    .counter {
      color: #9beacb;
      font-size: ${tall ? 28 : 24}px;
      font-weight: 900;
      letter-spacing: 4px;
      text-transform: uppercase;
      text-align: right;
    }
    .image {
      height: ${imageHeight}px;
      border-radius: ${tall ? 38 : 30}px;
      border: 1px solid rgba(190, 249, 230, .28);
      overflow: hidden;
      background: rgba(18, 50, 59, .62);
      position: relative;
    }
    .image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 30%;
      filter: saturate(.92) contrast(1.05) brightness(.77);
      display: block;
    }
    .image:after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 35%, rgba(5, 17, 22, .65));
    }
    .eyebrow {
      color: #9beacb;
      font-size: ${tall ? 30 : 25}px;
      line-height: 1.25;
      font-weight: 900;
      letter-spacing: 7px;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      color: #fffaf3;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: ${titleSize}px;
      line-height: 1.04;
      font-weight: 700;
      letter-spacing: 0;
      text-wrap: balance;
    }
    p {
      margin: 0;
      color: #d6e4e5;
      font-size: ${tall ? 36 : 30}px;
      line-height: 1.42;
      font-weight: 650;
      max-width: 94%;
    }
    .cta {
      margin-top: auto;
      min-height: ${tall ? 124 : 98}px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 42px;
      color: #031318;
      background: linear-gradient(90deg, #0decab, #25c8f4);
      box-shadow: 0 24px 60px rgba(31, 213, 206, .28);
      font-size: ${tall ? 36 : 30}px;
      font-weight: 900;
      text-align: center;
    }
    .footer {
      margin-top: auto;
      color: rgba(215, 230, 231, .72);
      font-size: 22px;
      line-height: 1.35;
    }
  </style>
</head>
<body>
  <section class="frame">
    <div class="top">
      <img class="logo" src="${logo}" alt="">
      <div class="counter">${escapeHtml(campaign.label)}<br>${index + 1} / ${campaign.slides.length}</div>
    </div>
    <div class="image"><img src="${campaign.image}" alt=""></div>
    <div class="eyebrow">${escapeHtml(slide.eyebrow)}</div>
    <h1>${escapeHtml(slide.headline)}</h1>
    <p>${escapeHtml(slide.body)}</p>
    ${slide.cta ? `<div class="cta">${escapeHtml(slide.cta)}</div>` : `<div class="footer">TouchPoint provides financial education and planning support.</div>`}
  </section>
</body>
</html>`;
}

function renderIndex(manifest) {
  const cards = manifest
    .filter((item) => item.format === "linkedin-feed")
    .map(
      (item) => `<a class="card" href="${item.relativePng}" target="_blank">
        <img src="${item.relativePng}" alt="">
        <strong>${escapeHtml(item.campaignLabel)}</strong>
        <span>${escapeHtml(item.slideTitle)}</span>
      </a>`,
    )
    .join("\n");
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>TouchPoint Campaign Branch Review</title>
  <style>
    body { margin: 0; background: #061116; color: #eef8f5; font-family: Inter, Arial, sans-serif; padding: 34px; }
    h1 { font-family: Georgia, serif; font-size: 44px; margin: 0 0 10px; }
    p { color: #bfd2d4; margin: 0 0 26px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
    .card { color: inherit; text-decoration: none; border: 1px solid rgba(151, 246, 217, .24); border-radius: 18px; overflow: hidden; background: #0b1d23; }
    img { display: block; width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }
    strong, span { display: block; padding: 12px 16px 0; }
    span { padding-bottom: 16px; color: #bfd2d4; }
  </style>
</head>
<body>
  <h1>TouchPoint Campaign Branch Review</h1>
  <p>LinkedIn format preview grid. Instagram square and story/reel variants are exported in sibling folders.</p>
  <div class="grid">${cards}</div>
</body>
</html>`;
}

await fs.rm(outRoot, { recursive: true, force: true });
await fs.mkdir(outRoot, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ deviceScaleFactor: 1 });
const manifest = [];

for (const campaign of campaigns) {
  for (const format of formats) {
    const formatDir = path.join(outRoot, campaign.id, format.key);
    await fs.mkdir(formatDir, { recursive: true });
    for (const [index, slide] of campaign.slides.entries()) {
      const number = String(index + 1).padStart(2, "0");
      const htmlPath = path.join(formatDir, `slide-${number}.html`);
      const pngPath = path.join(formatDir, `slide-${number}.png`);
      const html = renderCard(campaign, slide, format, index);
      await fs.writeFile(htmlPath, html, "utf8");
      await page.setViewportSize({ width: format.width, height: format.height });
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
      await page.screenshot({ path: pngPath, fullPage: false });
      manifest.push({
        campaignId: campaign.id,
        campaignLabel: campaign.label,
        imageGovernance,
        format: format.key,
        width: format.width,
        height: format.height,
        slide: number,
        slideTitle: slide.headline,
        relativePng: path.relative(outRoot, pngPath).replaceAll("\\", "/"),
        relativeHtml: path.relative(outRoot, htmlPath).replaceAll("\\", "/"),
      });
    }
  }
}

await browser.close();

await fs.writeFile(
  path.join(outRoot, "CREATIVE_STATUS.md"),
  `# Creative Status\n\nThis branch package is superseded for image direction.\n\nFuture TouchPoint social assets must follow ../creative-rules/IMAGE_GOVERNANCE.md and use authentic lifestyle photography only. Do not use charts, graphs, dashboards, calculators, fake app screens, financial spreadsheets, abstract business graphics, floating icons, or embedded source-image text.\n`,
  "utf8",
);
await fs.writeFile(path.join(outRoot, "asset-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
await fs.writeFile(path.join(outRoot, "review-index.html"), renderIndex(manifest), "utf8");

console.log(`Generated ${manifest.length} branched social assets in ${outRoot}`);
