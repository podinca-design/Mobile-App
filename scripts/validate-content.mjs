import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const normalized = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/afterparty-content.normalized.json"), "utf8"),
);
const qa = JSON.parse(fs.readFileSync(path.join(root, "src/data/afterparty-content-QA.json"), "utf8"));

const expectedCategories = ["mild", "bold", "couples", "spicy", "wild"];
const expectedBands = qa.intensity_bands;
const ids = new Set();
const texts = new Set();
const errors = [];
let total = 0;

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function checkPrompt(prompt, mode, categoryId, type) {
  total += 1;
  if (!prompt.id) errors.push(`Missing prompt id in ${mode}/${categoryId}/${type}`);
  if (ids.has(prompt.id)) errors.push(`Duplicate prompt id: ${prompt.id}`);
  ids.add(prompt.id);
  const text = normalizeText(prompt.text);
  if (!text) errors.push(`Missing prompt text: ${prompt.id}`);
  if (texts.has(text)) errors.push(`Duplicate prompt text: ${prompt.id}`);
  texts.add(text);
  if (!Number.isFinite(prompt.intensity)) errors.push(`Missing intensity: ${prompt.id}`);
  const band = expectedBands?.[categoryId];
  if (band && (prompt.intensity < band.min || prompt.intensity > band.max)) {
    errors.push(`Intensity out of band for ${prompt.id}: ${prompt.intensity}`);
  }
  if (!Number.isFinite(prompt.group_min)) errors.push(`Missing group_min: ${prompt.id}`);
  if (!prompt.mechanic) errors.push(`Missing mechanic: ${prompt.id}`);
  if (!prompt.family) errors.push(`Missing family: ${prompt.id}`);
  if (!prompt.pacing) errors.push(`Missing pacing: ${prompt.id}`);
  if (!Number.isFinite(prompt.row_order)) errors.push(`Missing row_order: ${prompt.id}`);
}

for (const categoryId of expectedCategories) {
  const td = normalized.pools?.truth_or_dare?.[categoryId];
  const questions = normalized.pools?.questions?.[categoryId];
  if (!td) errors.push(`Missing truth_or_dare category: ${categoryId}`);
  if (!questions) errors.push(`Missing questions category: ${categoryId}`);
  for (const prompt of td?.truths || []) checkPrompt(prompt, "truth_or_dare", categoryId, "truth");
  for (const prompt of td?.dares || []) checkPrompt(prompt, "truth_or_dare", categoryId, "dare");
  for (const prompt of questions || []) checkPrompt(prompt, "questions", categoryId, "question");

  const expectedTd = qa.counts.truth_or_dare[categoryId];
  const expectedQuestions = qa.counts.questions[categoryId];
  if ((td?.truths || []).length !== expectedTd.truth) errors.push(`${categoryId} truth count mismatch`);
  if ((td?.dares || []).length !== expectedTd.dare) errors.push(`${categoryId} dare count mismatch`);
  if ((questions || []).length !== expectedQuestions.question) errors.push(`${categoryId} question count mismatch`);
}

if (total !== qa.prompt_count_total) {
  errors.push(`Total prompt count mismatch: expected ${qa.prompt_count_total}, got ${total}`);
}

for (const [name, result] of Object.entries(qa.qa || {})) {
  if (name === "prompt_id_count" || name === "prompt_ids_unique") continue;
  if (typeof result === "number" && result !== 0) {
    errors.push(`QA manifest is not green: ${name}=${result}`);
  }
  if (result && typeof result === "object") {
    for (const [nestedName, nestedResult] of Object.entries(result)) {
      if (typeof nestedResult === "number" && nestedResult !== 0) {
        errors.push(`QA manifest is not green: ${name}.${nestedName}=${nestedResult}`);
      }
    }
  }
}

if (qa.qa?.prompt_id_count !== total) {
  errors.push(`QA prompt_id_count mismatch: expected ${qa.qa.prompt_id_count}, got ${total}`);
}

if (qa.qa?.prompt_ids_unique !== true) {
  errors.push("QA prompt_ids_unique is not true");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Afterparty content validated: ${total} prompts, ${ids.size} unique ids.`);
