import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import pricingRoutes from "./routes/pricing.js";
import routeRoutes from "./routes/routes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/pricing", pricingRoutes);
app.use("/api/routes", routeRoutes);

// Distance API Route
app.post("/api/distance", async (req, res) => {
  const { pickup, drop } = req.body;

  if (!pickup || !drop) {
    return res.status(400).json({ error: "Pickup & Drop required" });
  }

  try {
    const apiKey = process.env.GOOGLE_MAP_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
      pickup
    )}&destinations=${encodeURIComponent(drop)}&key=${apiKey}`;

    const response = await axios.get(url);

    const data = response.data.rows[0].elements[0];

    if (data.status !== "OK") {
      return res.status(400).json({ error: "Invalid locations" });
    }

    const distanceKm = data.distance.value / 1000; // meters → KM

    res.json({
      distance: distanceKm,
      text: data.distance.text,
    });
  } catch (error) {
    console.error("Distance API Error:", error.response?.data || error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(process.env.PORT, () => {
  console.log("🚀 Server running on port", process.env.PORT);
});
