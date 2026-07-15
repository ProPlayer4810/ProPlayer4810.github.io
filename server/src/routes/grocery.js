import { Router } from "express";
import { db } from "../db/index.js";
import { generateGroceryList } from "../services/aiService.js";
import { userContext } from "../utils/userContext.js";

const router = Router();

router.get("/", (req, res) => {
  const items = db
    .prepare("SELECT * FROM grocery_items WHERE user_id = 1 ORDER BY checked ASC, created_at DESC")
    .all();
  res.json(items);
});

router.post("/generate", (req, res) => {
  const { focusArea = "protein" } = req.body;
  const { reason, items } = generateGroceryList(userContext(), focusArea);

  const insert = db.prepare(
    `INSERT INTO grocery_items (user_id, name, category, reason) VALUES (1, ?, ?, ?)`
  );
  const existing = new Set(
    db.prepare("SELECT name FROM grocery_items WHERE user_id = 1 AND checked = 0").all().map((r) => r.name)
  );

  const inserted = [];
  for (const item of items) {
    if (existing.has(item.name)) continue;
    const result = insert.run(item.name, item.category, reason);
    inserted.push({ id: result.lastInsertRowid, name: item.name, category: item.category, reason, checked: 0 });
  }

  res.json({ reason, added: inserted });
});

router.post("/", (req, res) => {
  const { name, category } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });
  const result = db
    .prepare(`INSERT INTO grocery_items (user_id, name, category, reason) VALUES (1, ?, ?, 'Added manually')`)
    .run(name, category || "other");
  res.json(db.prepare("SELECT * FROM grocery_items WHERE id = ?").get(result.lastInsertRowid));
});

router.patch("/:id", (req, res) => {
  const { checked } = req.body;
  db.prepare("UPDATE grocery_items SET checked = ? WHERE id = ? AND user_id = 1").run(checked ? 1 : 0, req.params.id);
  res.json(db.prepare("SELECT * FROM grocery_items WHERE id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM grocery_items WHERE id = ? AND user_id = 1").run(req.params.id);
  res.status(204).end();
});

export default router;
