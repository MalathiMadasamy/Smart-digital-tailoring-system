const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String, default: 'Customer' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', ReviewSchema);
