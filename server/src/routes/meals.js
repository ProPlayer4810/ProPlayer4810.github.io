import { Router } from "express";
import multer from "multer";
import { db } from "../db/index.js";
import { parseMealText, parseMealImage } from "../services/aiService.js";
import { goalTip } from "../services/nutritionService.js";
import { userContext } from "../utils/userContext.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const router = Router();

function saveMeal({ rawInput, inputType, items, totals, source = "tracker" }) {
  const today = new Date().toISOString().slice(0, 10);
  const insertMeal = db.prepare(
    `INSERT INTO meals (user_id, raw_input, input_type, source, calories, protein, carbs, fats, logged_date)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const mealResult = insertMeal.run(
    rawInput,
    inputType,
    source,
    totals.calories,
    totals.protein,
    totals.carbs,
    totals.fats,
    today
  );
  const mealId = mealResult.lastInsertRowid;

  const insertItem = db.prepare(
    `INSERT INTO meal_items (meal_id, dish_name, quantity_label, calories, protein, carbs, fats)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  for (const item of items) {
    insertItem.run(mealId, item.dishName, item.quantityLabel, item.calories, item.protein, item.carbs, item.fats);
  }
  return mealId;
}

router.get("/", (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const meals = db
    .prepare("SELECT * FROM meals WHERE user_id = 1 AND logged_date = ? ORDER BY logged_at DESC")
    .all(date);
  const withItems = meals.map((meal) => ({
    ...meal,
    items: db.prepare("SELECT * FROM meal_items WHERE meal_id = ?").all(meal.id),
  }));
  res.json(withItems);
});

// Text or voice-transcribed text input
router.post("/text", async (req, res) => {
  try {
    const { text, inputType = "text" } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: "text is required" });

    const result = await parseMealText(text);
    const mealId = saveMeal({
      rawInput: text,
      inputType,
      items: result.items,
      totals: result.totals,
    });

    const ctx = userContext();
    const primaryDish = result.items[0]?.dishName || text;
    res.json({
      mealId,
      ...result,
      goalNote: goalTip(primaryDish, ctx.goal),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process meal" });
  }
});

// Photo input
router.post("/photo", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "photo file is required" });
    const base64 = req.file.buffer.toString("base64");
    const result = await parseMealImage(base64, req.file.mimetype);

    if (result.aiUnavailable || result.items.length === 0) {
      return res.json(result);
    }

    const mealId = saveMeal({
      rawInput: "[photo upload]",
      inputType: "photo",
      items: result.items,
      totals: result.totals,
    });

    const ctx = userContext();
    const primaryDish = result.items[0]?.dishName || "meal";
    res.json({ mealId, ...result, goalNote: goalTip(primaryDish, ctx.goal) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process photo" });
  }
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM meals WHERE id = ? AND user_id = 1").run(req.params.id);
  res.status(204).end();
});

export default router;
