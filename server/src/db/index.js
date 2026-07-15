import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "zaikora.db");
const isNewDb = !fs.existsSync(dbPath);

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  goal TEXT NOT NULL DEFAULT 'maintain weight',
  region TEXT NOT NULL DEFAULT 'North Indian',
  diet_type TEXT NOT NULL DEFAULT 'vegetarian',
  daily_calorie_target INTEGER NOT NULL DEFAULT 2000,
  daily_protein_target INTEGER NOT NULL DEFAULT 70,
  daily_hydration_target_ml INTEGER NOT NULL DEFAULT 2500,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  raw_input TEXT,
  input_type TEXT NOT NULL DEFAULT 'text',
  source TEXT NOT NULL DEFAULT 'tracker',
  calories REAL NOT NULL DEFAULT 0,
  protein REAL NOT NULL DEFAULT 0,
  carbs REAL NOT NULL DEFAULT 0,
  fats REAL NOT NULL DEFAULT 0,
  logged_at TEXT NOT NULL DEFAULT (datetime('now')),
  logged_date TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS meal_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  dish_name TEXT NOT NULL,
  quantity_label TEXT,
  calories REAL NOT NULL DEFAULT 0,
  protein REAL NOT NULL DEFAULT 0,
  carbs REAL NOT NULL DEFAULT 0,
  fats REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  log_date TEXT NOT NULL,
  hydration_ml INTEGER NOT NULL DEFAULT 0,
  sleep_hours REAL NOT NULL DEFAULT 0,
  activity_minutes INTEGER NOT NULL DEFAULT 0,
  steps INTEGER NOT NULL DEFAULT 0,
  activity_note TEXT,
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS grocery_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  category TEXT,
  reason TEXT,
  checked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  achieved_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, key)
);
`);

if (isNewDb) {
  db.prepare(
    `INSERT INTO user (id, name, goal, region, diet_type) VALUES (1, ?, ?, ?, ?)`
  ).run("Demo User", "maintain weight", "North Indian", "vegetarian");
  console.log("Zaikora DB initialized with demo user.");
}

export default db;
