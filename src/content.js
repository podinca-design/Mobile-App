import manifest from "./data/content-chunks/manifest.json";

export const CONTENT_SCHEMA_VERSION = manifest.schema_version;
export const CONTENT = {
  globalRules: manifest.globalRules,
  categories: manifest.categories.map((category) => ({
    id: category.id,
    label: category.label,
    accent: category.color,
    truths: [],
    dares: [],
  })),
  questionsMode: {},
};
export const CONTENT_INDEX = new Map();
const loaded = new Set();

const loaders = {
  mild: () => import("./data/content-chunks/mild.json"),
  bold: () => import("./data/content-chunks/bold.json"),
  couples: () => import("./data/content-chunks/couples.json"),
  spicy: () => import("./data/content-chunks/spicy.json"),
  wild: () => import("./data/content-chunks/wild.json"),
};

export async function ensureContentCategory(categoryId) {
  const id = loaders[categoryId] ? categoryId : "mild";
  if (loaded.has(id)) return;
  const module = await loaders[id]();
  const chunk = module.default;
  const category = CONTENT.categories.find((item) => item.id === id);
  category.truths = chunk.truths;
  category.dares = chunk.dares;
  CONTENT.questionsMode[id] = chunk.questions;
  [...chunk.truths, ...chunk.dares, ...chunk.questions].forEach((prompt) => CONTENT_INDEX.set(prompt.id, prompt));
  loaded.add(id);
}

export function isContentCategoryLoaded(categoryId) {
  return loaded.has(categoryId);
}
