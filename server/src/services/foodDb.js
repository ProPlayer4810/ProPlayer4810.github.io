import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foods = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "indianFoods.json"), "utf-8")
);

export function allFoods() {
  return foods;
}

export function findByName(name) {
  if (!name) return null;
  const needle = name.trim().toLowerCase();

  const exact =
    foods.find((f) => f.name.toLowerCase() === needle) ||
    foods.find((f) => f.aliases?.some((a) => a.toLowerCase() === needle));
  if (exact) return exact;

  // Fuzzy match: prefer the longest matching name/alias so more specific
  // dishes (e.g. "Rajma Chawal") win over shorter substrings of generic
  // dishes (e.g. the "chawal" alias of plain "Steamed Rice").
  let best = null;
  let bestLength = 0;
  for (const f of foods) {
    for (const candidate of [f.name, ...(f.aliases || [])]) {
      const cl = candidate.toLowerCase();
      if ((needle.includes(cl) || cl.includes(needle)) && cl.length > bestLength) {
        best = f;
        bestLength = cl.length;
      }
    }
  }
  return best;
}

/** Naive multi-dish extraction from free text like "2 rotis + dal + paneer sabzi" */
export function extractDishesFromText(text) {
  const parts = text
    .split(/\+|,|\band\b|\bwith\b/gi)
    .map((p) => p.trim())
    .filter(Boolean);

  const results = [];
  for (const part of parts) {
    const qtyMatch = part.match(/^(\d+)\s*(.*)$/);
    const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
    const rest = qtyMatch ? qtyMatch[2] : part;
    const food = findByName(rest);
    if (food) {
      results.push({ food, quantity: qty });
    } else {
      results.push({ food: null, rawText: rest, quantity: qty });
    }
  }
  return results;
}

export function byTags(tags = [], { veg } = {}) {
  return foods.filter((f) => {
    const tagMatch = tags.length === 0 || tags.some((t) => f.tags.includes(t));
    const vegMatch = veg === undefined || f.isVeg === veg;
    return tagMatch && vegMatch;
  });
}

export function byRegion(region) {
  if (!region) return foods;
  return foods.filter((f) => f.region.toLowerCase() === region.toLowerCase());
}

export function byCategory(category) {
  return foods.filter((f) => f.category === category);
}

export function streetFoods() {
  return foods.filter((f) => f.category === "street-food");
}

export function proteinRich({ veg } = {}) {
  return byTags(["protein-rich"], { veg }).sort((a, b) => b.protein - a.protein);
}
