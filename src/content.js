import normalizedContent from "./data/afterparty-content.normalized.json";

export const CONTENT_SCHEMA_VERSION = normalizedContent.schema_version;

export const CONTENT = {
  globalRules: {
    adult_only: true,
    minimum_age: "21+",
    age_gate_required: true,
    content_notice:
      "This game contains adult-only flirtation, kissing, optional consensual touching, optional consensual clothing removal, optional consensual partial nudity, and alcohol-based penalties. Players must be 21+.",
    consent_model: {
      ask_once_rule:
        "For any dare involving another player, the active player may ask once. If the other player says no, hesitates, or seems uncomfortable, the active player fails the dare and takes the listed penalty.",
    },
    penalty_tracking: {
      enabled: true,
      penalty_unit: "shots",
      max_normal_penalties_per_player_per_round: 3,
      on_fourth_penalty: {
        rules: [
          "No additional alcohol escalation.",
          "No forced touching.",
          "No forced kissing.",
          "No forced nudity or exposure.",
          "No recording or posting.",
          "No humiliating, unsafe, or degrading consequence.",
        ],
      },
    },
    shot_safety: {
      non_alcoholic_substitution_allowed: true,
      substitution_text: "Players may substitute water, soda, juice, or any non-alcoholic drink at any time.",
    },
  },
  categories: normalizedContent.categories.map((category) => ({
    id: category.id,
    label: category.label,
    accent: category.color,
    truths: normalizedContent.pools.truth_or_dare[category.id].truths,
    dares: normalizedContent.pools.truth_or_dare[category.id].dares,
  })),
  questionsMode: Object.fromEntries(
    normalizedContent.categories.map((category) => [
      category.id,
      normalizedContent.pools.questions[category.id],
    ]),
  ),
};

export const CONTENT_INDEX = new Map();

for (const category of CONTENT.categories) {
  for (const prompt of [...category.truths, ...category.dares]) {
    CONTENT_INDEX.set(prompt.id, prompt);
  }
}

for (const prompts of Object.values(CONTENT.questionsMode)) {
  for (const prompt of prompts) {
    CONTENT_INDEX.set(prompt.id, prompt);
  }
}
