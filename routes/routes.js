import express from "express";
const router = express.Router();
import Route from "../models/Route.js";

// GET all routes
router.get("/", async (req, res) => {
  try {
    const routes = await Route.find({});
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET route by ID
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

// CREATE new route
router.post("/", async (req, res) => {
  try {
    const { from, to, time, price } = req.body;
    if (!from || !to || !time || price === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newRoute = new Route({ from, to, time, price });
    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE route
router.put("/:id", async (req, res) => {
  try {
    const { from, to, time, price } = req.body;
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      { from, to, time, price },
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
router.delete("/:id", async (req, res) => {
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
