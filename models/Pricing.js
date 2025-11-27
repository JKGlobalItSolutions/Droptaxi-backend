import { Schema, model } from 'mongoose';

const pricingSchema = new Schema({
  category: {
    type: String,
    required: true,
    enum: ['sedan', 'premiumSedan', 'suv', 'premiumSuv']
  },
  oneWay: {
    ratePerKm: {
      type: Number,
      required: true
    }
  },
  roundTrip: {
    ratePerKm: {
      type: Number,
      required: true
    },
    discountPercentage: {
      type: Number,
      default: 0
    }
  },
  baseFare: {
    type: Number,
    require: true,
    default: 0
  }
});

export default model('Pricing', pricingSchema, 'pricings');
