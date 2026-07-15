import { Router } from "express";
import { streetFoodAdvice } from "../services/aiService.js";
import { streetFoods } from "../services/foodDb.js";
import { userContext } from "../utils/userContext.js";

const router = Router();

router.get("/list", (req, res) => {
  res.json(streetFoods());
});

router.post("/optimize", async (req, res) => {
  try {
    const { dishName } = req.body;
    if (!dishName || !dishName.trim()) return res.status(400).json({ error: "dishName is required" });
    const result = await streetFoodAdvice(dishName, userContext());
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to optimize street food choice" });
  }
});

export default router;
