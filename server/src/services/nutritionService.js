import { db } from "../db/index.js";

export function sumItems(items) {
  return items.reduce(
    (acc, it) => {
      acc.calories += it.calories || 0;
      acc.protein += it.protein || 0;
      acc.carbs += it.carbs || 0;
      acc.fats += it.fats || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

export function round1(n) {
  return Math.round(n * 10) / 10;
}

/** Deterministic goal-based tip so advice is consistent with or without AI. */
export function goalTip(dishName, goal) {
  const name = (dishName || "").toLowerCase();
  const isBiryani = name.includes("biryani");

  const tips = {
    "lose fat": isBiryani
      ? "Adjust the portion slightly and balance the rest of your day with a lighter, protein-forward dinner."
      : "Keep the portion moderate and balance your next meal with extra protein and vegetables.",
    "gain muscle": isBiryani
      ? "Add a protein side (extra chicken, egg, or paneer) to this meal to hit your muscle-gain targets."
      : "Add a protein side to this meal to support muscle growth.",
    "maintain weight": "Good balance for today — enjoy it and keep the rest of your meals steady.",
    "improve fitness": "Pair this with good hydration and some activity today for the best benefit.",
    "improve eating habits": "Notice how this meal makes you feel, and aim for a whole-food-forward next meal.",
  };

  return tips[goal] || tips["maintain weight"];
}

export function getUser() {
  return db.prepare("SELECT * FROM user WHERE id = 1").get();
}

export function getOrCreateDailyLog(date) {
  let log = db
    .prepare("SELECT * FROM daily_logs WHERE user_id = 1 AND log_date = ?")
    .get(date);
  if (!log) {
    db.prepare(
      "INSERT INTO daily_logs (user_id, log_date) VALUES (1, ?)"
    ).run(date);
    log = db
      .prepare("SELECT * FROM daily_logs WHERE user_id = 1 AND log_date = ?")
      .get(date);
  }
  return log;
}

export function getMealsForDate(date) {
  return db
    .prepare("SELECT * FROM meals WHERE user_id = 1 AND logged_date = ? ORDER BY logged_at")
    .all(date);
}

export function currentStreak() {
  const dates = db
    .prepare(
      "SELECT DISTINCT logged_date FROM meals WHERE user_id = 1 ORDER BY logged_date DESC"
    )
    .all()
    .map((r) => r.logged_date);

  if (dates.length === 0) return 0;

  // Dates are stored as UTC-based "YYYY-MM-DD" strings (new Date().toISOString().slice(0, 10)),
  // so streak arithmetic must stay in UTC too, rather than mixing in local-time Date methods.
  const dateSet = new Set(dates);
  const todayStr = new Date().toISOString().slice(0, 10);
  let cursor = new Date(`${todayStr}T00:00:00Z`);

  if (!dateSet.has(todayStr)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function computeBalanceScore(date) {
  const user = getUser();
  const log = getOrCreateDailyLog(date);
  const meals = getMealsForDate(date);
  const totals = sumItems(meals);

  const calorieTarget = user.daily_calorie_target;
  const proteinTarget = user.daily_protein_target;
  const hydrationTarget = user.daily_hydration_target_ml;

  const nutritionScore = totals.calories === 0
    ? 0
    : Math.max(0, 100 - Math.abs(totals.calories - calorieTarget) / calorieTarget * 100);

  const proteinScore = Math.min(100, (totals.protein / proteinTarget) * 100);
  const hydrationScore = Math.min(100, (log.hydration_ml / hydrationTarget) * 100);
  const activityScore = Math.min(100, (log.activity_minutes / 30) * 100);

  const sleepDelta = Math.abs(log.sleep_hours - 7.5);
  const sleepScore = log.sleep_hours === 0 ? 0 : Math.max(0, 100 - sleepDelta * 25);

  const streak = currentStreak();
  const consistencyScore = Math.min(100, streak * 15);

  const weighted =
    nutritionScore * 0.3 +
    proteinScore * 0.2 +
    hydrationScore * 0.15 +
    activityScore * 0.15 +
    sleepScore * 0.1 +
    consistencyScore * 0.1;

  const score = Math.round(Math.max(0, Math.min(100, weighted)));

  let message = "Log a meal today to get your Zaikora Score.";
  if (meals.length > 0) {
    if (score >= 80) message = "You enjoyed your favourite foods while staying balanced.";
    else if (score >= 60) message = "Solid day overall — a little more balance and you're golden.";
    else message = "A lighter day on tracking — small consistent steps add up.";
  }

  return {
    score,
    message,
    breakdown: {
      nutrition: Math.round(nutritionScore),
      protein: Math.round(proteinScore),
      hydration: Math.round(hydrationScore),
      activity: Math.round(activityScore),
      sleep: Math.round(sleepScore),
      consistency: Math.round(consistencyScore),
    },
    totals: {
      calories: round1(totals.calories),
      protein: round1(totals.protein),
      carbs: round1(totals.carbs),
      fats: round1(totals.fats),
    },
    targets: {
      calories: calorieTarget,
      protein: proteinTarget,
      hydration: hydrationTarget,
    },
    streak,
    log,
  };
}
