const mongoose = require('mongoose');

const CustomDesignSchema = new mongoose.Schema({
  designId: { type: String, unique: true, sparse: true },
  userId: { type: String, required: true, index: true },
  customerName: { type: String, default: 'Customer' },
  dressType: { type: String, required: true },
  designOptions: {
    neck: { type: String, default: 'V Neck' },
    sleeve: { type: String, default: 'Puff Sleeve' },
    back: { type: String, default: 'Deep U' },
    embroidery: { type: String, default: 'Aari Work' },
    length: { type: String, default: 'Standard' },
    fit: { type: String, default: 'Custom Fit' },
    border: { type: String, default: 'Gold Zari Border' },
    pattern: { type: String, default: 'Cutwork' },
    embellishment: { type: String, default: 'Stone & Tassel' },
    flare: { type: String, default: 'Full Flare' },
    waist: { type: String, default: 'Fitted' },
    sideSlit: { type: String, default: 'Side Slit' },
  },
  fabricSource: { type: String, default: 'Customer Own Fabric' },
  fabricImage: { type: String, default: '' },
  referenceImage: { type: String, default: '' },
  generatedPreviews: [{
    conceptId: { type: String },
    title: { type: String },
    imageUrl: { type: String },
    description: { type: String },
  }],
  selectedPreview: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  priceBreakdown: {
    baseStitching: { type: Number, default: 800 },
    customization: { type: Number, default: 300 },
    embroidery: { type: Number, default: 1200 },
    designerFee: { type: Number, default: 300 },
    additionalWork: { type: Number, default: 200 },
    estimatedTotal: { type: Number, default: 2800 },
  },
  status: {
    type: String,
    enum: ['DRAFT', 'CUSTOMER_APPROVED', 'TAILOR_CONFIRMED', 'ORDER_CREATED'],
    default: 'DRAFT',
  },
  version: { type: Number, default: 1 },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CustomDesign', CustomDesignSchema);
