const mongoose = require('mongoose');

const EmbroideryDesignerSchema = new mongoose.Schema({
  designerId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  businessName: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  specializations: { type: [String], default: ['Aari Work', 'Bridal Embroidery'] },
  experience: { type: String, default: '5 years' },
  startingPrice: { type: Number, default: 500 },
  availability: { type: String, enum: ['Available', 'Busy', 'On Leave'], default: 'Available' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  notes: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

EmbroideryDesignerSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('EmbroideryDesigner', EmbroideryDesignerSchema);
