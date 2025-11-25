import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Pricing from "./models/Pricing.js";
import Route from "./models/Route.js";

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    // Seed pricing
    await Pricing.deleteMany(); // Clear existing

    const pricings = [
      { type: "economy", rate: 12, fixedPrice: 150 },
      { type: "premium", rate: 15, fixedPrice: 300 },
      { type: "suv", rate: 18, fixedPrice: 500 },
    ];

    await Pricing.insertMany(pricings);

    // Seed routes
    await Route.deleteMany();

    const routes = [
      { from: "Chennai", to: "Tiruvannamalai", time: "3h 30m", price: 2500 },
      { from: "Tiruvannamalai", to: "Coimbatore", time: "5h 15m", price: 4200 },
      { from: "Chennai", to: "Bangalore", time: "6h", price: 4800 },
      { from: "Chennai", to: "Pondicherry", time: "3h", price: 2200 },
      { from: "Coimbatore", to: "Ooty", time: "3h", price: 2800 },
      { from: "Chennai", to: "Madurai", time: "7h", price: 5500 },
      { from: "Bangalore", to: "Mysore", time: "3h", price: 2400 },
      { from: "Chennai", to: "Vellore", time: "2h 30m", price: 1800 },
      { from: "Coimbatore", to: "Kodaikanal", time: "4h", price: 3200 },
      { from: "Chennai", to: "Kanchipuram", time: "1h 30m", price: 1200 },
    ];

    await Route.insertMany(routes);

    console.log("Data seeded successfully");

    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
