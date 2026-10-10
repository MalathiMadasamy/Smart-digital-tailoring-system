const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true },
  conversationId: { type: String, required: true, index: true },
  orderId: { type: String, required: true, index: true },
  senderId: { type: String, required: true, index: true },
  senderName: { type: String, default: '' },
  senderRole: {
    type: String,
    enum: ['customer', 'tailor', 'admin', 'system'],
    required: true,
  },
  receiverId: { type: String, required: true, index: true },
  message: { type: String, default: '' },
  messageType: {
    type: String,
    enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM'],
    default: 'TEXT',
  },
  attachmentUrl: { type: String, default: '' },
  readStatus: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

MessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
