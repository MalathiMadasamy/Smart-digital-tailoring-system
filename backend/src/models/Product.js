const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, default: 'Women' },
  subCategory: { type: String, required: true },
  fabric: { type: String, default: 'Silk / Cotton' },
  price: { type: Number, required: true, min: 0 },
  rating: { type: Number, default: 5.0 },
  image: { type: String, default: '' },
  stitchTimeDays: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', ProductSchema);
