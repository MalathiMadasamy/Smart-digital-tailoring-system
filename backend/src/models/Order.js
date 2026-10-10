const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, default: 'Customer' },
  customerPhone: { type: String, default: '+91 98765 43210' },
  orderType: { type: String, default: 'Custom Stitching' },
  serviceName: { type: String, required: true },
  dressType: { type: String, required: true },
  dressColour: { type: String, default: 'Royal Blue' },
  dressImage: { type: String, default: '' },
  qrIdentifier: { type: String, default: '' },
  rackLocation: { type: String, default: 'Rack A - Box 03' },
  fabricSource: {
    type: String,
    enum: ['Customer Own Fabric', 'Store Stock Fabric'],
    default: 'Customer Own Fabric',
  },
  existingDress: { type: String, default: '' },
  referenceImage: { type: String, default: '' },
  intakePhoto: { type: String, default: '' },
  intakeDate: { type: Date, default: Date.now },
  measurements: { type: mongoose.Schema.Types.Mixed, default: {} },
  customization: { type: mongoose.Schema.Types.Mixed, default: {} },
  embroidery: { type: String, default: 'None' },
  assignedTailor: { type: String, default: 'Master Rajesh Tailor' },
  specialInstructions: { type: String, default: '' },
  
  // Payment tracking
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  remainingAmount: { type: Number, default: 0, min: 0 },
  paymentStatus: {
    type: String,
    default: 'UNPAID',
  },

  // Garment Stitching Workflow Status: Received | Stitching | Ready for Delivery | Delivered
  status: {
    type: String,
    default: 'Received',
  },

  // Verification & Delivery Handover Audit Trail
  isGarmentVerified: { type: Boolean, default: false },
  verifiedBy: { type: String, default: '' },
  verificationTime: { type: Date },
  paymentId: { type: String, default: '' },
  deliveryConfirmationTime: { type: Date },

  history: [
    {
      status: { type: String },
      updatedAt: { type: Date, default: Date.now },
      note: { type: String, default: '' },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Middleware to calculate remainingAmount and paymentStatus before saving
OrderSchema.pre('save', function (next) {
  if (this.paidAmount > this.totalAmount) {
    this.paidAmount = this.totalAmount;
  }
  this.remainingAmount = Math.max(0, this.totalAmount - this.paidAmount);

  if (this.paidAmount === 0) {
    this.paymentStatus = 'UNPAID';
  } else if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'FULLY_PAID';
  } else {
    this.paymentStatus = 'PARTIALLY_PAID';
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
