# Droptaxi Backend API

This backend provides APIs for taxi booking services including pricing, routes, fare calculation, and more.

## Base URL
http://localhost:3000/api

## Authentication
Admin endpoints require authentication. (TODO: Implement authentication system)

## Endpoints

### Pricing API

#### GET /api/pricing
Returns all pricing configurations.

**Response:**
```json
[
  {
    "category": "sedan",
    "oneWay": {
      "ratePerKm": 15
    },
    "roundTrip": {
      "ratePerKm": 12,
      "discountPercentage": 10
    },
    "baseFare": 50
  }
]
```

#### GET /api/pricing/:category
Returns pricing for a specific category (sedan, premiumSedan, suv, premiumSuv).

**Response:**
```json
{
  "category": "sedan",
  "oneWay": {
    "ratePerKm": 15
  },
  "roundTrip": {
    "ratePerKm": 12,
    "discountPercentage": 10
  },
  "baseFare": 50
}
```

#### PUT /api/pricing
Updates pricing configurations. Accepts an array of pricing objects.

**Request:**
```json
{
  "pricingData": [
    {
      "category": "sedan",
      "oneWay": {
        "ratePerKm": 15
      },
      "roundTrip": {
        "ratePerKm": 12,
        "discountPercentage": 10
      },
      "baseFare": 50
    }
  ]
}
```

### Routes API

#### GET /api/routes
Returns all routes.

**Response:**
```json
[
  {
    "fromLocation": "Chennai",
    "toLocation": "Tiruvannamalai",
    "distanceKm": 220,
    "faresPerCategory": {
      "sedan": 3000,
      "premiumSedan": 3500,
      "suv": 4000,
      "premiumSuv": 4500
    },
    "estimatedTime": "4h"
  }
]
```

#### GET /api/routes/:id
Returns a specific route by ID.

#### POST /api/routes
Creates a new route.

**Request:**
```json
{
  "fromLocation": "Chennai",
  "toLocation": "Bangalore",
  "distanceKm": 350,
  "faresPerCategory": {
    "sedan": 4500,
    "premiumSedan": 5500,
    "suv": 6500,
    "premiumSuv": 7500
  },
  "estimatedTime": "6h"
}
```

#### PUT /api/routes/:id
Updates an existing route.

#### DELETE /api/routes/:id
Deletes a route.

### Fare Calculation API

#### POST /api/calculate-fare
Calculates fare based on from/to locations, category, and trip type.

**Request:**
```json
{
  "from": "Chennai",
  "to": "Tiruvannamalai",
  "category": "sedan",
  "tripType": "oneWay"
}
```

**Response:**
```json
{
  "distanceKm": 220.5,
  "fare": 3407.5
}
```

**Parameters:**
- `from`: Pickup location (string)
- `to`: Drop location (string)
- `category`: Vehicle category (sedan|premiumSedan|suv|premiumSuv)
- `tripType`: Trip type (oneWay|roundTrip)

### Distance API (Legacy)

#### POST /api/distance
Calculates distance between two locations using Google Maps API.

**Request:**
```json
{
  "pickup": "Chennai",
  "drop": "Tiruvannamalai"
}
```

**Response:**
```json
{
  "distance": 220.5,
  "text": "220 km"
}
```

## Environment Variables

Set the following environment variables in a `.env` file:

- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 3000)
- `GOOGLE_MAP_API_KEY`: Google Maps API key for distance calculation
- `ORS_API_KEY`: (Optional) OpenRouteService API key for distance calculation

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create .env file with required variables

3. Seed the database:
```bash
npm run seeder
```

4. Start the server:
```bash
npm start
# or for development
npm run dev
```

## Notes

- Admin endpoints require authentication (implementation TODO)
- Email functionality is handled separately and not part of this API
- All monetary values are in the smallest currency unit (e.g., rupees)
