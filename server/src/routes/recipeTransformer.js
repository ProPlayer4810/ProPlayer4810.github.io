import { Router } from "express";
import { transformRecipe } from "../services/aiService.js";
import { userContext } from "../utils/userContext.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { dishName } = req.body;
    if (!dishName || !dishName.trim()) return res.status(400).json({ error: "dishName is required" });
    const result = await transformRecipe(dishName, userContext().goal);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to transform recipe" });
  }
});

export default router;
