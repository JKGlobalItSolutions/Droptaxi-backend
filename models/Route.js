import { Schema, model } from 'mongoose';

const routeSchema = new Schema({
  fromLocation: {
    type: String,
    required: true
  },
  toLocation: {
    type: String,
    required: true
  },
  distanceKm: {
    type: Number,
    required: true
  },
  faresPerCategory: {
    sedan: {
      type: Number,
      required: true
    },
    premiumSedan: {
      type: Number,
      required: true
    },
    suv: {
      type: Number,
      required: true
    },
    premiumSuv: {
      type: Number,
      required: true
    }
  },
  estimatedTime: {
    type: String,
    default: ""
  }
});

export default model('Route', routeSchema, 'routes');
