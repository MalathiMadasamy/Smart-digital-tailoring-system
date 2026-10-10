const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  notificationId: { type: String, required: true, unique: true },
  recipientRole: { type: String, enum: ['admin', 'tailor', 'customer'], required: true },
  recipientId: { type: String, default: 'ALL' },
  orderId: { type: String, required: true },
  type: {
    type: String,
    enum: ['READY_FOR_DELIVERY', 'GARMENT_MISMATCH', 'GARMENT_VERIFIED', 'PAYMENT_RECEIVED', 'ORDER_CREATED'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  metadata: {
    customerName: { type: String },
    dressType: { type: String },
    dressColour: { type: String },
    dressImage: { type: String },
    rackLocation: { type: String },
    paymentStatus: { type: String },
    nextAction: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
