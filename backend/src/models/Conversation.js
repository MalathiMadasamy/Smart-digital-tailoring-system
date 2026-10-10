const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true, index: true },
  customerName: { type: String, default: 'Customer' },
  customerEmail: { type: String, default: '' },
  tailorId: { type: String, required: true, index: true },
  tailorName: { type: String, default: 'Master Tailor' },
  orderId: { type: String, required: true, index: true },
  serviceName: { type: String, default: 'Designer Saree Blouse' },
  dressType: { type: String, default: 'Blouse' },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ConversationSchema.index({ customerId: 1, tailorId: 1, orderId: 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
