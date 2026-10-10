const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  customerId: { type: String, required: true },
  amountPaid: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, default: 'UPI / QR Code' },
  paymentDate: { type: Date, default: Date.now },
  paymentStatus: {
    type: String,
    enum: ['SUCCESS', 'PENDING', 'FAILED'],
    default: 'SUCCESS',
  },
  transactionReference: { type: String, default: '' },
});

module.exports = mongoose.model('Payment', PaymentSchema);
