import express from "express";
const router = express.Router();
import Pricing from "../models/Pricing.js";
import verifyAdmin from "../utils/verifyAdmin.js";

// GET all pricing configurations
// Transforms DB format to frontend format
router.get("/", async (req, res) => {
  try {
    const pricings = await Pricing.find({}, { createdAt: 0, updatedAt: 0, __v: 0 });

    // Transform to frontend format: [{ type: "Sedan", rate: number, fixedPrice: number }, ...]
    const transformed = pricings.map(pricing => {
      const displayType = pricing.category.charAt(0).toUpperCase() + pricing.category.slice(1).replace(/([A-Z])/g, ' $1');
      return {
        type: displayType,
        rate: pricing.oneWay?.ratePerKm || 0,
        fixedPrice: pricing.baseFare || 0
      };
    });

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET pricing by category (admin only)
router.get("/by-category", verifyAdmin, async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ error: "Category required" });
    }
    const pricing = await Pricing.findOne({ category });
    if (!pricing) {
      return res.status(404).json({ error: "Pricing not found" });
    }
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE pricing (expects array of frontend format pricing objects)
// Transforms frontend format to DB format
router.put("/", async (req, res) => {
  try {
    const frontendPricingData = req.body;

    if (!Array.isArray(frontendPricingData)) {
      return res.status(400).json({ error: "Request body must be an array of pricing objects" });
    }

    // Transform to DB format: oneWay/roundTrip etc.
    const results = [];
    for (const pricing of frontendPricingData) {
      const { type, rate, fixedPrice } = pricing;

      // Convert type to category (e.g., "Sedan" -> "sedan")
      const category = type.toLowerCase().replace(/\s+/g, '');

      // For now, assume same rate for oneWay and roundTrip, can be adjusted later
      const updateData = {
        oneWay: { ratePerKm: rate },
        roundTrip: { ratePerKm: rate, discountPercentage: 10 }, // default discount
        baseFare: fixedPrice
      };

      const updatedPricing = await Pricing.findOneAndUpdate(
        { category },
        updateData,
        { new: true, upsert: true, runValidators: true }
      );
      results.push(updatedPricing);
    }

    res.json({ message: "Pricing updated successfully", data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
