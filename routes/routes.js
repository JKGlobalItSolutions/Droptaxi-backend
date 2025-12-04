import express from "express";
const router = express.Router();
import Route from "../models/Route.js";
import verifyAdmin from "../utils/verifyAdmin.js";

// GET all routes (public)
// Transforms DB format to frontend format
router.get("/", async (req, res) => {
  try {
    console.log("Fetching routes...");
    const routes = await Route.find({}, { createdAt: 0, updatedAt: 0, __v: 0 });

    // Transform to frontend format:
    // [{ _id, from, to, time, price, distance }]
    const transformed = routes.map(route => ({
      _id: route._id,
      from: route.fromLocation,
      to: route.toLocation,
      time: route.estimatedTime,
      price: route.faresPerCategory?.sedan || 0, // Use Sedan price as default
      distance: route.distanceKm
    }));

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET route by ID (public)
router.get("/by-id", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Id required" });
    }
    const route = await Route.findById(id);
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new route
// Accepts frontend format { from, to, time, price, distance }
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { from, to, time, price, distance } = req.body;

    if (!from || !to || !distance || typeof price !== 'number') {
      return res.status(400).json({ error: "from, to, time, price, and distance are required" });
    }

    // Transform to DB format
    const newRouteData = {
      fromLocation: from,
      toLocation: to,
      distanceKm: distance,
      estimatedTime: time || "",
      faresPerCategory: {
        sedan: price,
        premiumSedan: price, // Use same price for all categories, adjust as needed
        suv: price,
        premiumSuv: price
      }
    };

    const newRoute = new Route(newRouteData);
    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE route
// Accepts frontend format { from, to, time, price, distance }
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to, time, price, distance } = req.body;

    if (!from || !to || !distance || typeof price !== 'number') {
      return res.status(400).json({ error: "from, to, time, price, and distance are required" });
    }

    // Transform to DB format
    const updateData = {
      fromLocation: from,
      toLocation: to,
      distanceKm: distance,
      estimatedTime: time || "",
      faresPerCategory: {
        sedan: price,
        premiumSedan: price,
        suv: price,
        premiumSuv: price
      }
    };

    const updatedRoute = await Route.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRoute) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json(updatedRoute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE route
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoute = await Route.findByIdAndDelete(id);
    if (!deletedRoute) {
      return res.status(404).json({ error: "Route not found" });
    }
    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
