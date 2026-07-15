import { Router } from "express";
import { computeBalanceScore } from "../services/nutritionService.js";

const router = Router();

router.get("/", (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  res.json(computeBalanceScore(date));
});

export default router;
