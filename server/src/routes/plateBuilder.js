import { Router } from "express";
import { buildPlate } from "../services/aiService.js";
import { userContext } from "../utils/userContext.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { desiredDish } = req.body;
    if (!desiredDish || !desiredDish.trim()) return res.status(400).json({ error: "desiredDish is required" });
    const result = await buildPlate(desiredDish, userContext());
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to build plate" });
  }
});

export default router;
