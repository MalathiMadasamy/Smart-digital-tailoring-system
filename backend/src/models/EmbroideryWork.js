const mongoose = require('mongoose');

const EmbroideryWorkSchema = new mongoose.Schema({
  workId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  customerId: { type: String, default: '' },
  customerName: { type: String, required: true },
  dressType: { type: String, required: true },
  embroideryType: { type: String, required: true },
  referenceImage: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  designerId: { type: String, required: true },
  designerName: { type: String, required: true },
  assignedDate: { type: String, default: '' },
  sentAt: { type: String, default: '' },
  dueDate: { type: String, required: true },
  completedAt: { type: String, default: '' },
  receivedAt: { type: String, default: '' },
  qualityCheckedAt: { type: String, default: '' },
  outsourceCost: { type: Number, required: true, default: 0 },
  customerCharge: { type: Number, required: true, default: 0 },
  margin: { type: Number, default: 0 },
  status: {
    type: String,
    enum: [
      'PENDING ASSIGNMENT',
      'ASSIGNED',
      'SENT TO EXTERNAL WORKER',
      'WORK STARTED',
      'WORK IN PROGRESS',
      'WORK COMPLETED',
      'RECEIVED AT SHOP',
      'QUALITY CHECK',
      'APPROVED',
      'SENT TO TAILOR',
      'REWORK REQUIRED',
    ],
    default: 'ASSIGNED',
  },
  reworkReason: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

EmbroideryWorkSchema.pre('save', function (next) {
  this.margin = (this.customerCharge || 0) - (this.outsourceCost || 0);
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('EmbroideryWork', EmbroideryWorkSchema);
