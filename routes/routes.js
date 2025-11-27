import express from "express";
const router = express.Router();
import Route from "../models/Route.js";

// Admin authentication middleware (TODO: Implement proper JWT authentication)
const requireAdmin = (req, res, next) => {
  // For now, skip authentication - TODO: Add proper admin check
  // const token = req.headers.authorization;
  // if (!token) {
  //   return res.status(401).json({ error: 'Authentication required' });
  // }
  // Verify token and check admin role
  next();
};

// GET all routes (public)
// Transforms DB format to frontend format
router.get("/", async (req, res) => {
  try {
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
router.get("/:id", async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new route (admin only)
// Accepts frontend format { from, to, time, price, distance }
router.post("/", requireAdmin, async (req, res) => {
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

// UPDATE route (admin only)
// Accepts frontend format { from, to, time, price, distance }
router.put("/:id", requireAdmin, async (req, res) => {
  try {
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
      req.params.id,
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

// DELETE route (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const deletedRoute = await Route.findByIdAndDelete(req.params.id);
    if (!deletedRoute) {
      return res.status(404).json({ error: "Route not found" });
    }
    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
