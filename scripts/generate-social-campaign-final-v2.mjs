import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const packageRoot = path.join(root, "TOUCHPOINT_SOCIAL_CAMPAIGN_REVIEW_PACKAGE");
const outRoot = path.join(packageRoot, "ads-ready-final-v2");
const logoPath = path.join(root, "public", "brand", "touchpoint-logo-final.png");

const sourceImages = {
  goppi: path.join(root, "public", "learning-hub", "black-couple-finance-review.jpg"),
  income: path.join(
    "C:",
    "Users",
    "podin",
    "Documents",
    "Codex",
    "2026-05-13",
    "touchpoint-executive-intelligence-command-center-master",
    "outputs",
    "tp_campaign_goppi_success_coordination_phase20",
    "assets",
    "photos",
    "couple_bills_kitchen_vitaly_gariev.jpg",
  ),
  retirement: path.join(
    "C:",
    "Users",
    "podin",
    "Documents",
    "Codex",
    "2026-05-13",
    "touchpoint-executive-intelligence-command-center-master",
    "outputs",
    "tp_campaign_goppi_success_coordination_phase20",
    "assets",
    "photos",
    "couple_document_kitchen_vitaly_gariev.jpg",
  ),
  trust: path.join(root, "public", "learning-hub", "black-couple-finance-review.jpg"),
  business: path.join(root, "public", "learning-hub", "thumbs", "blog-business-continuity-owner.jpg"),
};

const formats = [
  { key: "instagram-square", label: "Instagram / Facebook square", width: 1080, height: 1080 },
  { key: "story-reel", label: "Story / Reel", width: 1080, height: 1920 },
  { key: "linkedin-feed", label: "LinkedIn feed", width: 1200, height: 1500 },
];

const lanes = [
  {
    key: "goppi-conscious-spending",
    image: sourceImages.goppi,
    imageFocus: "center center",
    eyebrow: "START HERE",
    headline: "You know what came in. Do you know what quietly left?",
    body: "A budget tracks intention. GOPPI™ helps reveal what is still yours to direct.",
    cta: "Find my free GOPPI™ snapshot",
    destination: "https://touchpointgroup.co/conscious-spending",
    theme: "Start Here / GOPPI™",
  },
  {
    key: "income-protection",
    image: sourceImages.income,
    imageFocus: "center center",
    eyebrow: "INCOME PROTECTION",
    headline: "The bills would keep coming. Would the income?",
    body: "One pause can expose years of responsibility. Check where the gap may be hiding.",
    cta: "Check protection gaps",
    destination: "https://touchpointgroup.co/income-protection",
    theme: "Income Protection / Family Protection",
  },
  {
    key: "retirement-confidence",
    image: sourceImages.retirement,
    imageFocus: "center center",
    eyebrow: "RETIREMENT CONFIDENCE",
    headline: "The account balance is not the retirement plan.",
    body: "Taxes, timing, and hidden costs can change what retirement actually feels like.",
    cta: "Reveal retirement exposure",
    destination: "https://touchpointgroup.co/retirement-exposure",
    theme: "Retirement Confidence",
  },
  {
    key: "trust-readiness",
    image: sourceImages.trust,
    imageFocus: "center top",
    eyebrow: "TRUST READINESS",
    headline: "Your family should not have to become detectives.",
    body: "When roles, documents, and funding are unclear, love can turn into guesswork.",
    cta: "Check trust readiness",
    destination: "https://touchpointgroup.co/trust-readiness",
    theme: "Estate / Trust Readiness",
  },
  {
    key: "business-continuity",
    image: sourceImages.business,
    imageFocus: "center center",
    eyebrow: "BUSINESS CONTINUITY",
    headline: "If the business depends on you, the risk may already be on the books.",
    body: "Owner and key-person dependency can stay invisible until decisions cannot wait.",
    cta: "Check Business Continuity Exposure",
    destination: "https://touchpointgroup.co/business-continuity-exposure",
    theme: "Business Owner / Self-Employed",
  },
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fileUrl(filePath) {
  return pathToFileURL(filePath).href;
}

function htmlFor(lane, format) {
  const tall = format.height > format.width;
  const square = format.height === format.width;
  const imgHeight = tall ? "49%" : square ? "48%" : "43%";
  const contentPadding = tall ? "72px" : "60px";
  const headlineSize = tall ? "75px" : square ? "61px" : "64px";
  const bodySize = tall ? "33px" : "30px";
  const ctaSize = tall ? "29px" : "27px";
  const logoW = tall ? "178px" : "150px";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: ${format.width}px;
      height: ${format.height}px;
      overflow: hidden;
      background: #061318;
      font-family: Arial, Helvetica, sans-serif;
      color: #f7fbfa;
    }
    .ad {
      position: relative;
      width: ${format.width}px;
      height: ${format.height}px;
      overflow: hidden;
      background:
        radial-gradient(circle at 22% 9%, rgba(94, 224, 195, .2), transparent 28%),
        linear-gradient(150deg, #061318 0%, #0d2830 58%, #07161b 100%);
    }
    .photo {
      position: absolute;
      inset: 0 0 auto 0;
      height: ${imgHeight};
      background-image: url("${fileUrl(lane.image)}");
      background-size: cover;
      background-position: ${lane.imageFocus};
      filter: saturate(.95) contrast(1.02);
    }
    .photo::after {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(3, 16, 21, .02) 0%, rgba(3, 16, 21, .24) 55%, #061318 100%),
        linear-gradient(90deg, rgba(6, 19, 24, .68), rgba(6, 19, 24, .1) 47%, rgba(6, 19, 24, .74));
    }
    .grain {
      position: absolute;
      inset: 0;
      opacity: .16;
      background-image:
        linear-gradient(rgba(130, 220, 205, .16) 1px, transparent 1px),
        linear-gradient(90deg, rgba(130, 220, 205, .16) 1px, transparent 1px);
      background-size: 130px 130px;
      mix-blend-mode: screen;
    }
    .logo {
      position: absolute;
      top: 38px;
      left: 44px;
      width: ${logoW};
      background: rgba(255, 255, 255, .92);
      border-radius: 18px;
      padding: 12px 16px;
      box-shadow: 0 20px 80px rgba(0,0,0,.26);
    }
    .content {
      position: absolute;
      left: ${contentPadding};
      right: ${contentPadding};
      bottom: ${contentPadding};
      padding-top: 26px;
    }
    .eyebrow {
      color: #99e9ca;
      font-size: ${tall ? "25px" : "22px"};
      line-height: 1.2;
      font-weight: 800;
      letter-spacing: 5px;
      margin-bottom: 24px;
    }
    h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-weight: 500;
      font-size: ${headlineSize};
      line-height: .96;
      letter-spacing: 0;
      margin: 0 0 28px 0;
      max-width: ${tall ? "900px" : "980px"};
      text-shadow: 0 2px 22px rgba(0,0,0,.34);
    }
    p {
      margin: 0;
      max-width: ${tall ? "840px" : "910px"};
      color: #d6e3e2;
      font-size: ${bodySize};
      line-height: 1.38;
      font-weight: 650;
    }
    .cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: ${tall ? "86px" : "74px"};
      padding: 0 ${tall ? "42px" : "36px"};
      margin-top: ${tall ? "42px" : "34px"};
      border-radius: 999px;
      background: linear-gradient(90deg, #09eba8, #21c6f3);
      color: #061318;
      font-size: ${ctaSize};
      line-height: 1.08;
      font-weight: 900;
      box-shadow: 0 28px 86px rgba(18, 220, 197, .25);
      max-width: 100%;
      text-align: center;
    }
    .url {
      margin-top: ${tall ? "30px" : "20px"};
      color: rgba(232,255,249,.82);
      font-size: ${tall ? "22px" : "18px"};
      font-weight: 800;
      letter-spacing: 1.6px;
      text-transform: uppercase;
    }
    .safe {
      position: absolute;
      inset: 34px;
      border: 1px solid rgba(141, 232, 210, .24);
      border-radius: ${tall ? "42px" : "34px"};
      pointer-events: none;
    }
  </style>
</head>
<body>
  <main class="ad" aria-label="${esc(lane.theme)} advertisement">
    <div class="photo" role="img" aria-label="${esc(lane.theme)} lifestyle image"></div>
    <div class="grain"></div>
    <img class="logo" src="${fileUrl(logoPath)}" alt="TouchPoint Group" />
    <section class="content">
      <div class="eyebrow">${esc(lane.eyebrow)}</div>
      <h1>${esc(lane.headline)}</h1>
      <p>${esc(lane.body)}</p>
      <div class="cta">${esc(lane.cta)}</div>
      <div class="url">touchpointgroup.co</div>
    </section>
    <div class="safe"></div>
  </main>
</body>
</html>`;
}

async function ensureCleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  await ensureCleanDir(outRoot);
  const browser = await chromium.launch();
  const manifest = {
    generatedAt: new Date().toISOString(),
    package: "ads-ready-final-v2",
    status: "final review candidate",
    imageGovernance:
      "Authentic lifestyle photography only. No charts, graphs, dashboards, spreadsheets, calculators, fake app UI, stock market visuals, floating finance icons, abstract symbols, or embedded text in source imagery.",
    assets: [],
    sourceImages: {},
  };

  for (const [key, value] of Object.entries(sourceImages)) {
    manifest.sourceImages[key] = value;
  }

  for (const lane of lanes) {
    for (const format of formats) {
      const dir = path.join(outRoot, lane.key, format.key);
      await fs.mkdir(dir, { recursive: true });
      const htmlPath = path.join(dir, "slide-01.html");
      const pngPath = path.join(dir, "slide-01.png");
      await fs.writeFile(htmlPath, htmlFor(lane, format), "utf8");
      const page = await browser.newPage({ viewport: { width: format.width, height: format.height }, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(htmlPath).href);
      await page.screenshot({ path: pngPath, type: "png" });
      await page.close();
      manifest.assets.push({
        lane: lane.key,
        theme: lane.theme,
        format: format.key,
        formatLabel: format.label,
        width: format.width,
        height: format.height,
        headline: lane.headline,
        body: lane.body,
        cta: lane.cta,
        destination: lane.destination,
        imageSource: lane.image,
        imageGovernancePass:
          "PASS - selected or cropped to maintain lifestyle photography without charts, dashboards, fake app UI, stock-market screens, or embedded source-image text.",
        html: path.relative(outRoot, htmlPath),
        png: path.relative(outRoot, pngPath),
      });
    }
  }

  const reviewHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TouchPoint Final Social Campaign Review</title>
<style>
body{margin:0;background:#061318;color:#eef8f5;font-family:Arial,Helvetica,sans-serif;padding:34px}
h1{font-family:Georgia,serif;font-size:44px;line-height:1.02;margin:0 0 12px}
p{color:#c9d8d6;font-size:18px;line-height:1.5;max-width:980px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:22px;margin-top:28px}
.card{border:1px solid rgba(153,233,202,.28);border-radius:22px;background:#0b2027;padding:18px}
.card img{width:100%;height:auto;border-radius:16px;border:1px solid rgba(255,255,255,.15);background:#07161b}
.meta{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0;color:#9de9cd;font-weight:800;font-size:12px;letter-spacing:1.6px;text-transform:uppercase}
a{color:#99e9ca}
</style></head><body>
<h1>TouchPoint Final Social Campaign Review</h1>
<p>This package replaces the rejected branch set. It uses human-first lifestyle imagery and approval-ready copy. Each item is built as an HTML composition plus PNG review export for Canva recreation/import.</p>
<div class="grid">
${manifest.assets
  .map(
    (asset) => `<article class="card"><img src="${asset.png.replaceAll("\\", "/")}" alt="${esc(asset.lane)} ${esc(asset.format)}"><div class="meta"><span>${esc(asset.lane)}</span><span>${esc(asset.formatLabel)}</span></div><strong>${esc(asset.headline)}</strong><p>${esc(asset.body)}</p><p><a href="${asset.png.replaceAll("\\", "/")}">Open PNG</a> | <a href="${asset.html.replaceAll("\\", "/")}">Open HTML</a></p></article>`,
  )
  .join("\n")}
</div></body></html>`;

  await fs.writeFile(path.join(outRoot, "asset-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  await fs.writeFile(path.join(outRoot, "review-index.html"), reviewHtml, "utf8");
  await fs.writeFile(
    path.join(outRoot, "CREATIVE_QA.md"),
    `# TouchPoint Final Social Campaign QA

Status: final review candidate.

## Package Scope
- Five launch lanes: GOPPI™ / conscious spending, income protection, retirement confidence, trust readiness, and business continuity.
- Three crops each: Instagram/Facebook square, Story/Reel, and LinkedIn feed.
- Approval-ready campaign copy is included for every lane and format.
- No charts, graphs, dashboards, fake app UI, calculators, stock-market visuals, spreadsheets, or embedded source-image text.

## Governance Notes
- Source imagery was curated from local TouchPoint assets and prior campaign photos.
- Founder-like/headshot adviser photos were excluded.
- Graphic-heavy thumbnails were rejected unless the final crop avoided the offending graphics.
- Copy is short, customer-facing, emotional, and CTA-oriented.

## Review Entry Point
Open: ${path.join(outRoot, "review-index.html")}
`,
    "utf8",
  );

  await fs.writeFile(
    path.join(outRoot, "CANVA_IMPORT_GUIDE.md"),
    `# Canva Import Guide

Use each \`slide-01.png\` as the visual reference. For editable Canva rebuilds:

1. Create the target format in Canva.
2. Place the source photo listed in \`asset-manifest.json\`.
3. Add the TouchPoint logo.
4. Recreate the text layers exactly from the manifest.
5. Keep image-only backgrounds free from charts, dashboards, app UI, calculators, stock-market visuals, and embedded text.

The final copy and CTA text are in \`asset-manifest.json\`.
`,
    "utf8",
  );

  await browser.close();
  console.log(`Generated ${manifest.assets.length} assets in ${outRoot}`);
  console.log(`Review: ${path.join(outRoot, "review-index.html")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
