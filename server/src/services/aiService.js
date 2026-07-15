import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as foodDb from "./foodDb.js";
import { goalTip, round1, sumItems } from "./nutritionService.js";
import { isAiEnabled, getProviderName, askAiJson } from "./aiProvider.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const recipeTransforms = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "recipeTransforms.json"), "utf-8")
);
const groceryEssentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "groceryEssentials.json"), "utf-8")
);

export { isAiEnabled, getProviderName };

const TRACKER_SYSTEM = `You are Zaikora's Indian food nutrition analyst. Given a casual description of a meal
(possibly transcribed from voice, or a mix of dishes), identify each Indian dish, estimate its quantity,
and estimate nutrition. Respond ONLY with strict JSON, no prose, in this exact shape:
{"items":[{"dishName":"string","quantityLabel":"string","calories":number,"protein":number,"carbs":number,"fats":number}],"note":"short friendly one-liner"}
Use realistic Indian home-cooking / restaurant portions. Numbers are per the stated quantity, not per 100g.`;

/** Smart Indian Food Tracker: text or voice-transcribed text input */
export async function parseMealText(text) {
  if (isAiEnabled()) {
    try {
      const result = await askAiJson({
        system: TRACKER_SYSTEM,
        prompt: `Meal description: "${text}"`,
      });
      return finalizeMealItems(result.items, result.note);
    } catch (err) {
      console.log("parseMealText, error: ", err);
      console.error("[aiService] parseMealText AI failed, falling back:", err.message);
    }
  }
  return fallbackParseMealText(text);
}

function fallbackParseMealText(text) {
  const extracted = foodDb.extractDishesFromText(text);
  const items = extracted.map(({ food, quantity, rawText }) => {
    if (food) {
      return {
        dishName: food.name,
        quantityLabel: `${quantity} x ${food.servingLabel}`,
        calories: round1(food.calories * quantity),
        protein: round1(food.protein * quantity),
        carbs: round1(food.carbs * quantity),
        fats: round1(food.fats * quantity),
      };
    }
    return {
      dishName: rawText || "Unrecognized item",
      quantityLabel: `${quantity} serving(s)`,
      calories: 150 * quantity,
      protein: 5 * quantity,
      carbs: 20 * quantity,
      fats: 5 * quantity,
      estimated: true,
    };
  });
  return finalizeMealItems(
    items,
    "Estimated using Zaikora's local Indian food database (add an AI key for sharper estimates)."
  );
}

function finalizeMealItems(items, note) {
  const totals = sumItems(items);
  return {
    items,
    totals: {
      calories: round1(totals.calories),
      protein: round1(totals.protein),
      carbs: round1(totals.carbs),
      fats: round1(totals.fats),
    },
    note,
  };
}

/** Smart Indian Food Tracker: photo input */
export async function parseMealImage(imageBase64, imageMediaType) {
  if (isAiEnabled()) {
    try {
      const result = await askAiJson({
        system: TRACKER_SYSTEM,
        prompt:
          "Identify the Indian dish(es) in this photo and estimate nutrition for the visible quantity.",
        imageBase64,
        imageMediaType,
      });
      return { ...finalizeMealItems(result.items, result.note), aiUnavailable: false };
    } catch (err) {
      console.error("[aiService] parseMealImage AI failed:", err.message);
    }
  }
  return {
    items: [],
    totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
    note:
      "Photo recognition needs the AI engine (set ANTHROPIC_API_KEY on the server). In the meantime, try describing your meal in text or voice.",
    aiUnavailable: true,
  };
}

const TASTE_MATCH_SYSTEM = `You are Zaikora's Taste Match Engine. Users describe a craving in casual language.
Never tell them "don't eat this". Instead, suggest 3-4 Indian dishes/snacks that satisfy the same craving
(similar flavour/texture) while being a smarter choice (better portion, less fried, more protein, etc.).
Respond ONLY with strict JSON:
{"understanding":"short reflection of what they're craving","suggestions":[{"dishName":"string","reason":"string","calories":number,"protein":number}]}`;

/** Taste Match Engine */
export async function tasteMatch(craving, userContext) {
  if (isAiEnabled()) {
    try {
      return await askAiJson({
        system: TASTE_MATCH_SYSTEM,
        prompt: `Craving: "${craving}". User diet: ${userContext.dietType}, goal: ${userContext.goal}, usual region: ${userContext.region}.`,
      });
    } catch (err) {
      console.log("tasteMatch, error: ", err);
      console.error("[aiService] tasteMatch AI failed, falling back:", err.message);
    }
  }
  return fallbackTasteMatch(craving, userContext);
}

const TAG_KEYWORDS = {
  spicy: ["spicy", "spice", "hot", "chatpata"],
  crunchy: ["crunchy", "crispy", "crunch"],
  tangy: ["tangy", "sour", "chatpata", "tamarind"],
  sweet: ["sweet", "dessert", "mithai"],
  creamy: ["creamy", "rich", "buttery"],
  "street-food": ["street", "chaat"],
  "protein-rich": ["protein", "filling", "heavy"],
  light: ["light", "healthy"],
};

function fallbackTasteMatch(craving, userContext) {
  const lower = craving.toLowerCase();
  const matchedTags = Object.entries(TAG_KEYWORDS)
    .filter(([, keywords]) => keywords.some((k) => lower.includes(k)))
    .map(([tag]) => tag);

  const veg = userContext.dietType === "vegetarian" ? true : undefined;
  let candidates = matchedTags.length
    ? foodDb.byTags(matchedTags, { veg })
    : foodDb.byTags([], { veg });

  candidates = candidates
    .slice()
    .sort((a, b) => {
      const aFried = a.tags.includes("fried") ? 1 : 0;
      const bFried = b.tags.includes("fried") ? 1 : 0;
      if (aFried !== bFried) return aFried - bFried;
      return a.calories - b.calories;
    })
    .slice(0, 4);

  return {
    understanding: `Looking for something ${matchedTags.join(", ") || "satisfying"} — here's how to get that without giving up the Zaika.`,
    suggestions: candidates.map((f) => ({
      dishName: f.name,
      reason: f.tags.includes("fried")
        ? `Similar flavour profile with a lighter preparation than deep-fried options — ${f.servingLabel}.`
        : `Matches the ${matchedTags.join("/") || "craving"} you're after, at a reasonable portion.`,
      calories: f.calories,
      protein: f.protein,
    })),
  };
}

const STREET_FOOD_SYSTEM = `You are Zaikora's Street Food Optimizer. A user names an Indian street food
they want to eat. Never tell them not to eat it — help them enjoy it intelligently, the way a knowledgeable
friend would. Respond ONLY with strict JSON:
{"dishName":"string","calories":number,"servingLabel":"string","recommendedPortion":"string","healthierCustomization":"string","balancingTip":"string"}
Each field except calories/servingLabel/dishName should be one short, practical sentence. Use realistic
Indian street-food stall portions and calorie estimates. This works for any Indian street food, not just a
fixed list — pani puri, pav bhaji, chaat, momos, rolls, vada pav, biryani, and anything else people eat
from a street cart or stall.`;

/** Street Food Optimizer */
export async function streetFoodAdvice(dishName, userContext) {
  if (isAiEnabled()) {
    try {
      const result = await askAiJson({
        system: STREET_FOOD_SYSTEM,
        prompt: `Street food: "${dishName}". User diet: ${userContext.dietType}, goal: ${userContext.goal}, usual region: ${userContext.region}.`,
      });
      const resolvedName = result.dishName || dishName;
      const goalNote = goalTip(resolvedName, userContext.goal);
      return {
        found: true,
        dishName: resolvedName,
        calories: result.calories,
        servingLabel: result.servingLabel,
        recommendedPortion: result.recommendedPortion,
        healthierCustomization: result.healthierCustomization,
        balancingTip: result.balancingTip,
        goalNote,
        summary: `Enjoy ${resolvedName.toLowerCase()} today. ${result.balancingTip}`,
      };
    } catch (err) {
      console.error("[aiService] streetFoodAdvice AI failed, falling back:", err.message);
    }
  }
  return fallbackStreetFoodAdvice(dishName, userContext);
}

function fallbackStreetFoodAdvice(dishName, userContext) {
  const food = foodDb.findByName(dishName);
  if (!food || !food.streetFoodTips) {
    return {
      found: false,
      message: `We don't have detailed guidance for "${dishName}" yet. Try pani puri, pav bhaji, chaat, momos, rolls, vada pav, or biryani.`,
    };
  }
  const tip = food.streetFoodTips;
  const goalNote = goalTip(food.name, userContext.goal);
  return {
    found: true,
    dishName: food.name,
    calories: food.calories,
    servingLabel: food.servingLabel,
    recommendedPortion: tip.recommendedPortion,
    healthierCustomization: tip.healthierCustomization,
    balancingTip: tip.balancingTip,
    goalNote,
    summary: `Enjoy ${food.name.toLowerCase()} today. ${tip.balancingTip}`,
  };
}

/** Family Food Mode */
export async function familyFoodAdvice(dishDescription, userContext) {
  if (isAiEnabled()) {
    try {
      const result = await askAiJson({
        system: `You are Zaikora's Family Food Mode. A user describes a home-cooked family dish. Estimate
one ideal serving's nutrition, suggest quantity, and give short advice on balancing the rest of the day's
meals for their goal. No separate "fitness meal" needed — work with what the family is eating.
Respond ONLY with strict JSON:
{"dish":"string","quantitySuggestion":"string","nutritionEstimate":{"calories":number,"protein":number,"carbs":number,"fats":number},"balancingAdvice":"string"}`,
        prompt: `Family dish: "${dishDescription}". User goal: ${userContext.goal}, diet: ${userContext.dietType}.`,
      });
      return result;
    } catch (err) {
      console.log("fsmilyFoodAdvice, error: ", err);
      console.error("[aiService] familyFoodAdvice AI failed, falling back:", err.message);
    }
  }
  return fallbackFamilyFoodAdvice(dishDescription, userContext);
}

function fallbackFamilyFoodAdvice(dishDescription, userContext) {
  const extracted = foodDb.extractDishesFromText(dishDescription);
  const matched = extracted.filter((e) => e.food).map((e) => ({ food: e.food, quantity: e.quantity }));
  if (matched.length === 0) {
    return {
      dish: dishDescription,
      quantitySuggestion: "1 standard home-cooked portion",
      nutritionEstimate: { calories: 350, protein: 10, carbs: 45, fats: 10 },
      balancingAdvice: goalTip(dishDescription, userContext.goal),
    };
  }
  const totals = sumItems(
    matched.map(({ food, quantity }) => ({
      calories: food.calories * quantity,
      protein: food.protein * quantity,
      carbs: food.carbs * quantity,
      fats: food.fats * quantity,
    }))
  );
  const dishNames = matched.map((m) => m.food.name).join(", ");
  return {
    dish: dishNames,
    quantitySuggestion: matched
      .map((m) => `${m.quantity} x ${m.food.servingLabel} of ${m.food.name}`)
      .join(", "),
    nutritionEstimate: {
      calories: round1(totals.calories),
      protein: round1(totals.protein),
      carbs: round1(totals.carbs),
      fats: round1(totals.fats),
    },
    balancingAdvice: goalTip(dishNames, userContext.goal),
  };
}

/** Recipe Transformer */
export async function transformRecipe(dishName, goal) {
  const key = dishName.trim().toLowerCase();
  const curated = recipeTransforms[key] || Object.values(recipeTransforms).find(
    (r) => r.dish.toLowerCase() === key
  );

  if (isAiEnabled()) {
    try {
      const result = await askAiJson({
        system: `You are Zaikora's Recipe Transformer. Turn a favourite Indian dish into a goal-friendly
version that keeps the same taste identity, using smarter ingredients/technique (not a bland substitute).
Respond ONLY with strict JSON:
{"dish":"string","transformedName":"string","swaps":["string", "..."],"macroNote":"string"}`,
        prompt: `Dish: "${dishName}". User goal: ${goal}. ${curated ? `Reference ideas: ${JSON.stringify(curated)}` : ""}`,
      });
      return result;
    } catch (err) {
      console.log("trnsformRecipe, error: ", err);
      console.error("[aiService] transformRecipe AI failed, falling back:", err.message);
    }
  }

  if (curated) return curated;
  return {
    dish: dishName,
    transformedName: `Smarter ${dishName}`,
    swaps: [
      "Reduce oil/ghee by roughly a third and use a non-stick pan",
      "Add a protein source (paneer, dal, egg, or chicken) if not already present",
      "Bulk up with extra vegetables for fibre and volume",
    ],
    macroNote: "General smart-swap guidance — add an AI key for dish-specific transformations.",
  };
}

/** Zaikora Plate Builder */
const PLATE_COMBOS = {
  dosa: { addOns: ["extra sambar", "a protein side (paneer bhurji or boiled egg)"], tip: "Have dosa + extra sambar + protein side." },
  "masala dosa": { addOns: ["extra sambar", "a small bowl of curd"], tip: "Balance the potato filling with extra sambar and curd." },
  biryani: { addOns: ["raita", "a side salad or cucumber"], tip: "Add raita and a fresh salad to round out the plate." },
  roti: { addOns: ["a vegetable sabzi", "a bowl of dal", "a side salad"], tip: "Pair roti with dal + sabzi + a side salad for full balance." },
  rice: { addOns: ["dal or sambar", "a vegetable side", "curd"], tip: "Add dal/sambar, a vegetable side, and curd alongside rice." },
  idli: { addOns: ["extra sambar", "a protein-rich chutney (peanut/moong)"], tip: "Have idli with extra sambar for volume and protein." },
  paratha: { addOns: ["a bowl of curd", "a side of pickled/raw salad"], tip: "Pair paratha with curd instead of extra butter." },
};

export async function buildPlate(desiredDish, userContext) {
  if (isAiEnabled()) {
    try {
      const result = await askAiJson({
        system: `You are Zaikora's Plate Builder. The user names one food they want tonight. Keep that food
exactly as their preferred centerpiece, then suggest 2-3 better combinations to round out the plate's
nutrition, tailored to their goal. Respond ONLY with strict JSON:
{"preferredFood":"string","addOns":["string","..."],"tip":"string","estimatedNutrition":{"calories":number,"protein":number,"carbs":number,"fats":number}}`,
        prompt: `Desired dish: "${desiredDish}". Goal: ${userContext.goal}, diet: ${userContext.dietType}.`,
      });
      return result;
    } catch (err) {
      console.error("[aiService] buildPlate AI failed, falling back:", err.message);
    }
  }
  return fallbackBuildPlate(desiredDish, userContext);
}

function fallbackBuildPlate(desiredDish, userContext) {
  const lower = desiredDish.trim().toLowerCase();
  const comboKey = Object.keys(PLATE_COMBOS).find((k) => lower.includes(k));
  const food = foodDb.findByName(desiredDish);
  const combo = comboKey
    ? PLATE_COMBOS[comboKey]
    : { addOns: ["a protein side", "a vegetable or salad"], tip: `Round out ${desiredDish} with a protein side and some vegetables.` };

  const preferredFood = food
    ? food.name
    : comboKey
    ? comboKey.replace(/\b\w/g, (c) => c.toUpperCase())
    : desiredDish;

  return {
    preferredFood,
    addOns: combo.addOns,
    tip: combo.tip,
    estimatedNutrition: food
      ? { calories: food.calories, protein: food.protein, carbs: food.carbs, fats: food.fats }
      : { calories: 400, protein: 12, carbs: 55, fats: 12 },
    goalNote: goalTip(desiredDish, userContext.goal),
  };
}

/** Smart Grocery Assistant */
export function generateGroceryList(userContext, focusArea = "protein") {
  const veg = userContext.dietType === "vegetarian";
  const filtered = groceryEssentials.filter((item) => {
    const dietOk = veg ? item.veg : item.nonVeg || item.veg;
    const focusOk = focusArea === "all" || item.tags.includes(focusArea) || item.category === focusArea;
    return dietOk && focusOk;
  });

  const reasonMap = {
    protein: "You need more protein this week.",
    fibre: "Add more fibre-rich foods this week.",
    all: "Weekly essentials based on your goal.",
  };

  return {
    reason: reasonMap[focusArea] || `Stock up on ${focusArea}-focused essentials this week.`,
    items: filtered.map((f) => ({ name: f.name, category: f.category })),
  };
}
