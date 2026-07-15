import { Router } from "express";
import { allFoods, byRegion } from "../services/foodDb.js";

const router = Router();

router.get("/regions", (req, res) => {
  const regions = [...new Set(allFoods().map((f) => f.region))].sort();
  res.json(regions);
});

router.get("/", (req, res) => {
  const { region } = req.query;
  res.json(byRegion(region));
});

export default router;
