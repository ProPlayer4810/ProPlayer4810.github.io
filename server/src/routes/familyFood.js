import { Router } from "express";
import { familyFoodAdvice } from "../services/aiService.js";
import { userContext } from "../utils/userContext.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) return res.status(400).json({ error: "description is required" });
    const result = await familyFoodAdvice(description, userContext());
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process family meal" });
  }
});

export default router;
