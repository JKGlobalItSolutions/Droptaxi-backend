import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Pricing from "./models/Pricing.js";
import Route from "./models/Route.js";

dotenv.config();

const seedData = async () => {
  await connectDB();
  try {
    // Seed pricing
    await Pricing.deleteMany(); // Clear existing

    const pricings = [
      {
        category: "sedan",
        oneWay: { ratePerKm: 12 },
        roundTrip: { ratePerKm: 12, discountPercentage: 10 },
        baseFare: 150
      },
      {
        category: "premiumSedan",
        oneWay: { ratePerKm: 15 },
        roundTrip: { ratePerKm: 15, discountPercentage: 10 },
        baseFare: 300
      },
      {
        category: "suv",
        oneWay: { ratePerKm: 18 },
        roundTrip: { ratePerKm: 18, discountPercentage: 10 },
        baseFare: 500
      }
    ];

    await Pricing.insertMany(pricings);

    // Seed routes
    await Route.deleteMany();

    const routes = [
      {
        fromLocation: "Chennai",
        toLocation: "Tiruvannamalai",
        estimatedTime: "3h 30m",
        distanceKm: 170,
        faresPerCategory: { sedan: 2500, premiumSedan: 3000, suv: 3500, premiumSuv: 4000 }
      },
      {
        fromLocation: "Tiruvannamalai",
        toLocation: "Coimbatore",
        estimatedTime: "5h 15m",
        distanceKm: 270,
        faresPerCategory: { sedan: 4200, premiumSedan: 4700, suv: 5200, premiumSuv: 5700 }
      },
      {
        fromLocation: "Chennai",
        toLocation: "Bangalore",
        estimatedTime: "6h",
        distanceKm: 345,
        faresPerCategory: { sedan: 4800, premiumSedan: 5300, suv: 5800, premiumSuv: 6300 }
      },
      {
        fromLocation: "Chennai",
        toLocation: "Pondicherry",
        estimatedTime: "3h",
        distanceKm: 165,
        faresPerCategory: { sedan: 2200, premiumSedan: 2500, suv: 2800, premiumSuv: 3100 }
      },
      {
        fromLocation: "Coimbatore",
        toLocation: "Ooty",
        estimatedTime: "3h",
        distanceKm: 100,
        faresPerCategory: { sedan: 2800, premiumSedan: 3100, suv: 3400, premiumSuv: 3700 }
      },
      {
        fromLocation: "Chennai",
        toLocation: "Madurai",
        estimatedTime: "7h",
        distanceKm: 480,
        faresPerCategory: { sedan: 5500, premiumSedan: 6000, suv: 6500, premiumSuv: 7000 }
      },
      {
        fromLocation: "Bangalore",
        toLocation: "Mysore",
        estimatedTime: "3h",
        distanceKm: 143,
        faresPerCategory: { sedan: 2400, premiumSedan: 2700, suv: 3000, premiumSuv: 3300 }
      },
      {
        fromLocation: "Chennai",
        toLocation: "Vellore",
        estimatedTime: "2h 30m",
        distanceKm: 135,
        faresPerCategory: { sedan: 1800, premiumSedan: 2100, suv: 2400, premiumSuv: 2700 }
      },
      {
        fromLocation: "Coimbatore",
        toLocation: "Kodaikanal",
        estimatedTime: "4h",
        distanceKm: 200,
        faresPerCategory: { sedan: 3200, premiumSedan: 3500, suv: 3800, premiumSuv: 4100 }
      },
      {
        fromLocation: "Chennai",
        toLocation: "Kanchipuram",
        estimatedTime: "1h 30m",
        distanceKm: 75,
        faresPerCategory: { sedan: 1200, premiumSedan: 1400, suv: 1600, premiumSuv: 1800 }
      }
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
