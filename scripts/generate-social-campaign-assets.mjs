import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = process.cwd();
const outRoot = path.join(root, "TOUCHPOINT_SOCIAL_CAMPAIGN_REVIEW_PACKAGE", "ads-ready");
const logo = pathToFileURL(path.join(root, "public", "brand", "touchpoint-logo-final.png")).href;
const hero = pathToFileURL(path.join(root, "public", "brand", "touchpoint-hero-pressure.jpg")).href;

const slides = [
  {
    id: "01",
    eyebrow: "TOUCHPOINT CONSCIOUS SPENDING",
    headline: "You can be doing the work and still feel money slipping away.",
    body: "Sometimes the issue is not effort. It is visibility.",
    image: hero,
  },
  {
    id: "02",
    eyebrow: "HIDDEN FINANCIAL DRAG",
    headline: "The pressure is not always loud.",
    body: "It can show up as timing, taxes, recurring commitments, or small decisions that quietly stack up.",
  },
  {
    id: "03",
    eyebrow: "START WITH GOPPI™",
    headline: "See what is still available after the month is already spoken for.",
    body: "GOPPI™ is your Gross Opportunity Income: the monthly money left after committed expenses are accounted for.",
  },
  {
    id: "04",
    eyebrow: "ONE CLEAR LAYER FIRST",
    headline: "Before a bigger plan, get one clean snapshot.",
    body: "The Conscious Spending Tool helps you see what is committed, what is flexible, and what deserves attention first.",
  },
  {
    id: "05",
    eyebrow: "FREE PLANNING TOOL",
    headline: "No account links. No credit card. No document upload.",
    body: "Start with simple manual entries before deciding whether a deeper review makes sense.",
  },
  {
    id: "06",
    eyebrow: "FROM GOPPI™ TO TOPPI™",
    headline: "Turn visibility into a more intentional next step.",
    body: "TOPPI™ is the next planning layer: savings, protection, debt, timing, and strategy working from the same snapshot.",
  },
  {
    id: "07",
    eyebrow: "START WHERE IT IS EASIEST TO SEE",
    headline: "Build your GOPPI™ snapshot, then choose the next move with more clarity.",
    body: "Free educational planning tool. Not legal, tax, or insurance advice.",
    cta: "Start the free GOPPI™ snapshot",
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

function htmlFor(slide, format) {
  const isTall = format.height > 1400;
  const hasImage = Boolean(slide.image);
  const imageBlock = hasImage
    ? `<div class="image-wrap"><img src="${slide.image}" alt=""></div>`
    : `<div class="signal-panel"><span></span><span></span><span></span><span></span></div>`;
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: ${format.width}px; height: ${format.height}px; overflow: hidden; }
    body {
      background:
        linear-gradient(rgba(142, 238, 205, .085) 1px, transparent 1px),
        linear-gradient(90deg, rgba(142, 238, 205, .085) 1px, transparent 1px),
        radial-gradient(circle at 22% 20%, rgba(100, 235, 206, .18), transparent 31%),
        linear-gradient(135deg, #061116, #082226 55%, #07131a);
      background-size: 142px 142px, 142px 142px, 100% 100%, 100% 100%;
      color: #f7fbf8;
      font-family: Inter, Arial, sans-serif;
      padding: ${isTall ? 76 : 58}px;
    }
    .frame {
      width: 100%;
      height: 100%;
      border: 2px solid rgba(151, 246, 217, .25);
      border-radius: ${isTall ? 54 : 44}px;
      background: linear-gradient(180deg, rgba(5, 23, 28, .93), rgba(7, 20, 26, .98));
      box-shadow: 0 36px 90px rgba(0, 0, 0, .45), inset 0 0 80px rgba(65, 223, 203, .08);
      padding: ${isTall ? 62 : 54}px;
      display: flex;
      flex-direction: column;
      gap: ${isTall ? 46 : 32}px;
      position: relative;
      overflow: hidden;
    }
    .brand {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 26px;
      min-height: 100px;
    }
    .brand img {
      width: ${isTall ? 170 : 150}px;
      height: auto;
      display: block;
      background: #fff;
      border-radius: 8px;
      padding: 8px 14px;
    }
    .count {
      color: #9beacb;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 5px;
    }
    .visual {
      height: ${hasImage ? (isTall ? 500 : 320) : (isTall ? 380 : 260)}px;
      border-radius: ${isTall ? 42 : 34}px;
      overflow: hidden;
      border: 1px solid rgba(190, 249, 230, .28);
      background: rgba(18, 50, 59, .62);
    }
    .image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 52%;
      display: block;
      filter: saturate(.92) contrast(1.04) brightness(.78);
    }
    .signal-panel {
      width: 100%;
      height: 100%;
      padding: 46px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 22px;
    }
    .signal-panel span {
      border-radius: 30px;
      border: 1px solid rgba(151, 246, 217, .22);
      background: linear-gradient(135deg, rgba(138, 243, 206, .18), rgba(25, 196, 230, .08));
    }
    .eyebrow {
      color: #9beacb;
      font-size: ${isTall ? 34 : 28}px;
      line-height: 1.24;
      font-weight: 900;
      letter-spacing: 8px;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      color: #fffaf3;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: ${isTall ? 82 : 68}px;
      line-height: 1.05;
      font-weight: 700;
      letter-spacing: 0;
    }
    p {
      margin: 0;
      color: #d6e4e5;
      font-size: ${isTall ? 42 : 34}px;
      line-height: 1.42;
      font-weight: 600;
    }
    .cta {
      margin-top: auto;
      min-height: ${isTall ? 130 : 104}px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 44px;
      color: #031318;
      background: linear-gradient(90deg, #0decab, #25c8f4);
      box-shadow: 0 24px 60px rgba(31, 213, 206, .28);
      font-size: ${isTall ? 40 : 34}px;
      font-weight: 900;
      text-align: center;
    }
    .footer {
      margin-top: auto;
      color: rgba(215, 230, 231, .72);
      font-size: 24px;
      line-height: 1.35;
    }
  </style>
</head>
<body>
  <section class="frame">
    <div class="brand">
      <img src="${logo}" alt="">
      <div class="count">${slide.id} / ${slides.length}</div>
    </div>
    <div class="visual">${imageBlock}</div>
    <div class="eyebrow">${escapeHtml(slide.eyebrow)}</div>
    <h1>${escapeHtml(slide.headline)}</h1>
    <p>${escapeHtml(slide.body)}</p>
    ${slide.cta ? `<div class="cta">${escapeHtml(slide.cta)}</div>` : `<div class="footer">TouchPoint provides financial education and planning support.</div>`}
  </section>
</body>
</html>`;
}

await fs.rm(outRoot, { recursive: true, force: true });
await fs.mkdir(outRoot, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ deviceScaleFactor: 1 });
const manifest = [];

for (const format of formats) {
  const formatDir = path.join(outRoot, format.key);
  await fs.mkdir(formatDir, { recursive: true });
  for (const slide of slides) {
    const html = htmlFor(slide, format);
    const htmlPath = path.join(formatDir, `slide-${slide.id}.html`);
    const pngPath = path.join(formatDir, `slide-${slide.id}.png`);
    await fs.writeFile(htmlPath, html, "utf8");
    await page.setViewportSize({ width: format.width, height: format.height });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    await page.screenshot({ path: pngPath, fullPage: false });
    manifest.push({
      format: format.key,
      width: format.width,
      height: format.height,
      slide: slide.id,
      png: path.relative(root, pngPath).replaceAll("\\", "/"),
      html: path.relative(root, htmlPath).replaceAll("\\", "/"),
    });
  }
}

await browser.close();

await fs.writeFile(
  path.join(outRoot, "asset-manifest.json"),
  JSON.stringify({ campaignId: "TP_CAMPAIGN_GOPPI_SUCCESS_COORDINATION_V1", generatedAt: new Date().toISOString(), assets: manifest }, null, 2),
  "utf8",
);

console.log(`Generated ${manifest.length} social ad assets in ${outRoot}`);
