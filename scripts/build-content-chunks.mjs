import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(fs.readFileSync(path.join(root, "src/data/afterparty-content.normalized.json"), "utf8"));
const output = path.join(root, "src/data/content-chunks");
fs.mkdirSync(output, { recursive: true });

const manifest = {
  schema_version: source.schema_version,
  categories: source.categories.map(({ id, label, color }) => ({ id, label, color })),
  globalRules: {
    adult_only: true,
    minimum_age: "21+",
    age_gate_required: true,
    content_notice: "Adult-only content. Consent is required and non-alcoholic substitutions are always allowed.",
    penalty_tracking: { enabled: true, max_normal_penalties_per_player_per_round: 3 },
  },
};

for (const category of source.categories) {
  fs.writeFileSync(path.join(output, `${category.id}.json`), JSON.stringify({
    truths: source.pools.truth_or_dare[category.id].truths,
    dares: source.pools.truth_or_dare[category.id].dares,
    questions: source.pools.questions[category.id],
  }));
}
fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify(manifest));
console.log(`Built ${manifest.categories.length} lazy content chunks.`);
