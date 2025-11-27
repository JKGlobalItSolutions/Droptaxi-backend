import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import connectDB from "./config/db.js";
import pricingRoutes from "./routes/pricing.js";
import routeRoutes from "./routes/routes.js";

dotenv.config();
connectDB();

const app = express();

// CORS
const allowedOrigins = [
  "https://jkglobalitsolutions.github.io",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

// Routes
app.use("/api/pricing", pricingRoutes);
app.use("/api/routes", routeRoutes);

/* =========================================================
   FARE CALCULATION API
========================================================= */
app.post("/api/calculate-fare", async (req, res) => {
  try {
    const { from, to, category, tripType } = req.body;

    if (!from || !to || !category || !tripType) {
      return res
        .status(400)
        .json({ error: "from, to, category, and tripType are required" });
    }

    if (!["sedan", "premiumSedan", "suv", "premiumSuv"].includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    if (!["oneWay", "roundTrip"].includes(tripType)) {
      return res.status(400).json({ error: "Invalid tripType" });
    }

    const Pricing = (await import("./models/Pricing.js")).default;
    const pricing = await Pricing.findOne({ category });

    if (!pricing) {
      return res.status(404).json({ error: "Pricing not found for category" });
    }

    let distanceKm;

    // ✅ GOOGLE DISTANCE MATRIX (SAFE)
    if (!process.env.GOOGLE_MAP_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GOOGLE_MAP_API_KEY not configured",
      });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
      from
    )}&destinations=${encodeURIComponent(
      to
    )}&key=${process.env.GOOGLE_MAP_API_KEY}`;

    const response = await axios.get(url);

    const data = response.data.rows[0].elements[0];

    if (data.status !== "OK") {
      return res
        .status(400)
        .json({ error: "Invalid locations or unable to calculate distance" });
    }

    distanceKm = data.distance.value / 1000;

    const ratePerKm = pricing[tripType].ratePerKm;
    const baseFare = pricing.baseFare || 0;
    let fare = Math.round(distanceKm * ratePerKm + baseFare);

    if (tripType === "roundTrip" && pricing.roundTrip?.discountPercentage) {
      const discount =
        fare * (pricing.roundTrip.discountPercentage / 100);
      fare = Math.round(fare - discount);
    }

    res.json({
      distanceKm: Math.round(distanceKm * 100) / 100,
      fare,
    });
  } catch (error) {
    console.error("Fare calculation error:", error?.message || error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* =========================================================
   DISTANCE API
========================================================= */
app.post("/api/distance", async (req, res) => {
  try {
    const { pickup, drop } = req.body;

    if (!pickup || !drop) {
      return res.status(400).json({ error: "Pickup & Drop required" });
    }

    if (!process.env.GOOGLE_MAP_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GOOGLE_MAP_API_KEY not configured",
      });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
      pickup
    )}&destinations=${encodeURIComponent(
      drop
    )}&key=${process.env.GOOGLE_MAP_API_KEY}`;

    const response = await axios.get(url);

    const data = response.data.rows[0].elements[0];

    if (data.status !== "OK") {
      return res.status(400).json({ error: "Invalid locations" });
    }

    const distanceKm = data.distance.value / 1000;

    res.json({
      distance: distanceKm,
      text: data.distance.text,
    });
  } catch (error) {
    console.error("Distance API Error:", error?.message || error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* =========================================================
   BOOKING + EMAIL API
========================================================= */


app.get("/api/test-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });


    await transporter.sendMail({
      from: process.env.BREVO_USER,
      to: "gokie210402@gmail.com",
      subject: "SMTP Test",
      text: "Email test successful",
    });

    res.json({ success: true });
  } catch (err) {
    console.error("SMTP TEST ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/booking", async (req, res) => {
  try {
    console.log("RAW BODY =>", req.body, typeof req.body);

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON body or missing Content-Type",
      });
    }

    const {
      name,
      email,
      phone,
      pickup,
      drop,
      vehicleType,
      date,
      message,
      distance,
      calculatedPrice,
    } = req.body;

    console.log("📩 Incoming booking:", req.body);

    // ✅ Required fields check
    if (!name || !email || !phone || !pickup || !drop || !vehicleType || !date) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // Booking data logged; no email sending

    return res.json({
      success: true,
      message: "Booking saved successfully",
    });
  } catch (error) {
    console.error("❌ FULL Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send booking",
    });
  }
});


/* =========================================================
   SERVER START
========================================================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
  console.log("✅ Pricing API aligned");
  console.log("✅ Routes API aligned");
  console.log("✅ Booking API ready");
  console.log("✅ Distance API ready");
});
