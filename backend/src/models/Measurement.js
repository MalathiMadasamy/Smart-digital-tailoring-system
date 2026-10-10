const mongoose = require('mongoose');

const MeasurementSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  profileName: { type: String, default: 'Default Fit Profile' },
  dressType: { type: String, required: true }, // 'Blouse', 'Gown', 'Frock', 'Chudidar', 'Salwar', 'Lehenga', etc.
  fields: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  notes: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Measurement', MeasurementSchema);
