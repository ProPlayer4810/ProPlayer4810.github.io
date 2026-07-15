import "dotenv/config";
import express from "express";
import cors from "cors";

import "./db/index.js";
import { isAiEnabled, getProviderName } from "./services/aiService.js";

import userRoutes from "./routes/user.js";
import mealsRoutes from "./routes/meals.js";
import tasteMatchRoutes from "./routes/tasteMatch.js";
import balanceScoreRoutes from "./routes/balanceScore.js";
import streetFoodRoutes from "./routes/streetFood.js";
import familyFoodRoutes from "./routes/familyFood.js";
import recipeTransformerRoutes from "./routes/recipeTransformer.js";
import regionalRoutes from "./routes/regional.js";
import plateBuilderRoutes from "./routes/plateBuilder.js";
import groceryRoutes from "./routes/grocery.js";
import journeyRoutes from "./routes/journey.js";
import healthConnectRoutes from "./routes/healthConnect.js";

import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEnabled: isAiEnabled(), aiProvider: getProviderName() });
});

app.use("/api/user", userRoutes);
app.use("/api/meals", mealsRoutes);
app.use("/api/taste-match", tasteMatchRoutes);
app.use("/api/balance-score", balanceScoreRoutes);
app.use("/api/street-food", streetFoodRoutes);
app.use("/api/family-food", familyFoodRoutes);
app.use("/api/recipe-transform", recipeTransformerRoutes);
app.use("/api/regional", regionalRoutes);
app.use("/api/plate-builder", plateBuilderRoutes);
app.use("/api/grocery", groceryRoutes);
app.use("/api/journey", journeyRoutes);
app.use("/api/health-connect", healthConnectRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Zaikora server running on http://localhost:${PORT}`);
  console.log(
    `AI engine: ${isAiEnabled() ? `${getProviderName()} enabled` : "rule-based fallback (no ANTHROPIC_API_KEY or OPENAI_API_KEY set)"}`
  );
});
