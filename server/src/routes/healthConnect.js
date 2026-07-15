import { Router } from "express";
import { db } from "../db/index.js";
import { getOrCreateDailyLog, getUser } from "../services/nutritionService.js";

const router = Router();

router.get("/", (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  res.json(getOrCreateDailyLog(date));
});

router.post("/", (req, res) => {
  const date = req.body.date || new Date().toISOString().slice(0, 10);
  const { steps, activityMinutes, sleepHours, hydrationMl, activityNote } = req.body;
  getOrCreateDailyLog(date);

  const current = db
    .prepare("SELECT * FROM daily_logs WHERE user_id = 1 AND log_date = ?")
    .get(date);

  db.prepare(
    `UPDATE daily_logs SET steps = ?, activity_minutes = ?, sleep_hours = ?, hydration_ml = ?, activity_note = ?
     WHERE user_id = 1 AND log_date = ?`
  ).run(
    steps ?? current.steps,
    activityMinutes ?? current.activity_minutes,
    sleepHours ?? current.sleep_hours,
    hydrationMl ?? current.hydration_ml,
    activityNote ?? current.activity_note,
    date
  );

  const updated = db.prepare("SELECT * FROM daily_logs WHERE user_id = 1 AND log_date = ?").get(date);

  let suggestion = null;
  const user = getUser();
  if (activityNote && activityNote.trim()) {
    suggestion = `You logged "${activityNote.trim()}" today. Consider adding a bit more protein to support recovery.`;
  } else if (updated.activity_minutes >= 45) {
    suggestion = "Good activity level today — make sure your protein intake keeps pace.";
  }

  res.json({ log: updated, suggestion });
});

export default router;
