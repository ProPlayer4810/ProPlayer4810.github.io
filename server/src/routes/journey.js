import { Router } from "express";
import { db } from "../db/index.js";
import { currentStreak, getUser } from "../services/nutritionService.js";
import { streetFoods } from "../services/foodDb.js";

const router = Router();

const ACHIEVEMENT_DEFS = [
  {
    key: "streak-7",
    title: "7-Day Balanced Eating Streak",
    description: "Logged meals for 7 days in a row.",
    check: () => currentStreak() >= 7,
  },
  {
    key: "streak-3",
    title: "3-Day Streak Starter",
    description: "Logged meals for 3 days in a row.",
    check: () => currentStreak() >= 3,
  },
  {
    key: "street-food-master",
    title: "Street Food Master",
    description: "Logged 5+ optimized street food choices.",
    check: () => {
      const names = streetFoods().map((f) => f.name.toLowerCase());
      const rows = db.prepare("SELECT dish_name FROM meal_items").all();
      const count = rows.filter((r) => names.some((n) => r.dish_name.toLowerCase().includes(n))).length;
      return count >= 5;
    },
  },
  {
    key: "protein-goal",
    title: "Protein Goal Completed",
    description: "Hit your daily protein target.",
    check: () => {
      const user = getUser();
      const today = new Date().toISOString().slice(0, 10);
      const row = db
        .prepare("SELECT SUM(protein) as totalProtein FROM meals WHERE user_id = 1 AND logged_date = ?")
        .get(today);
      return (row.totalProtein || 0) >= user.daily_protein_target;
    },
  },
  {
    key: "first-meal",
    title: "First Bite Logged",
    description: "Logged your very first meal with Zaikora.",
    check: () => {
      const row = db.prepare("SELECT COUNT(*) as c FROM meals WHERE user_id = 1").get();
      return row.c >= 1;
    },
  },
];

function evaluateAchievements() {
  const existing = new Set(
    db.prepare("SELECT key FROM achievements WHERE user_id = 1").all().map((r) => r.key)
  );
  const insert = db.prepare(
    "INSERT INTO achievements (user_id, key, title, description) VALUES (1, ?, ?, ?)"
  );
  for (const def of ACHIEVEMENT_DEFS) {
    if (!existing.has(def.key) && def.check()) {
      insert.run(def.key, def.title, def.description);
    }
  }
}

router.get("/", (req, res) => {
  evaluateAchievements();
  const achievements = db
    .prepare("SELECT * FROM achievements WHERE user_id = 1 ORDER BY achieved_at DESC")
    .all();
  res.json({
    streak: currentStreak(),
    achievements,
    locked: ACHIEVEMENT_DEFS.filter((d) => !achievements.some((a) => a.key === d.key)).map((d) => ({
      key: d.key,
      title: d.title,
      description: d.description,
    })),
  });
});

export default router;
