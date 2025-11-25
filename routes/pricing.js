import express from "express";
const router = express.Router();
import Pricing from "../models/Pricing.js";

// GET all pricing
router.get("/", async (req, res) => {
  try {
    const pricings = await Pricing.find({});
    res.json(pricings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET pricing by type
router.get("/:type", async (req, res) => {
  try {
    const pricing = await Pricing.findOne({ type: req.params.type });
    if (!pricing) {
      return res.status(404).json({ error: "Pricing not found" });
    }
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE pricing
router.put("/:type", async (req, res) => {
  try {
    const { rate, fixedPrice } = req.body;
    const updateData = {};
    if (rate !== undefined) updateData.rate = rate;
    if (fixedPrice !== undefined) updateData.fixedPrice = fixedPrice;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "At least one field (rate or fixedPrice) is required" });
    }
    const pricing = await Pricing.findOneAndUpdate(
      { type: req.params.type },
      updateData,
      { new: true, runValidators: true }
    );
    if (!pricing) {
      return res.status(404).json({ error: "Pricing not found" });
    }
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
