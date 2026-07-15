import { Router } from "express";
import { tasteMatch } from "../services/aiService.js";
import { userContext } from "../utils/userContext.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { craving } = req.body;
    if (!craving || !craving.trim()) return res.status(400).json({ error: "craving is required" });
    const result = await tasteMatch(craving, userContext());
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to find a taste match" });
  }
});

export default router;
