const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['economy', 'premium', 'suv']
  },
  rate: {
    type: Number,
    required: true
  },
  fixedPrice: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model('Pricing', pricingSchema, 'pricings');
