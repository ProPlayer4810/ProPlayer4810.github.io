import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const user = db.prepare("SELECT * FROM user WHERE id = 1").get();
  res.json(user);
});

router.put("/", (req, res) => {
  const { name, goal, region, dietType, dailyCalorieTarget, dailyProteinTarget, dailyHydrationTargetMl } = req.body;
  const current = db.prepare("SELECT * FROM user WHERE id = 1").get();

  db.prepare(
    `UPDATE user SET name = ?, goal = ?, region = ?, diet_type = ?,
     daily_calorie_target = ?, daily_protein_target = ?, daily_hydration_target_ml = ?
     WHERE id = 1`
  ).run(
    name ?? current.name,
    goal ?? current.goal,
    region ?? current.region,
    dietType ?? current.diet_type,
    dailyCalorieTarget ?? current.daily_calorie_target,
    dailyProteinTarget ?? current.daily_protein_target,
    dailyHydrationTargetMl ?? current.daily_hydration_target_ml
  );

  res.json(db.prepare("SELECT * FROM user WHERE id = 1").get());
});

export default router;
