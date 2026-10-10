const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./config/db');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const User = require('./models/User');

let io = null;

// Track active online users: Map<userId, { socketId, role, username, name }>
const onlineUsers = new Map();

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token) {
      // Allow guest socket connection with query parameters for demo fallback
      const queryUserId = socket.handshake.query?.userId || `guest-${socket.id.slice(0, 5)}`;
      const queryRole = socket.handshake.query?.role || 'customer';
      const queryName = socket.handshake.query?.name || 'Guest User';
      socket.user = { id: queryUserId, username: queryUserId, role: queryRole, name: queryName };
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.user = decoded;
      next();
    } catch (err) {
      const queryUserId = socket.handshake.query?.userId || `user-${socket.id.slice(0, 5)}`;
      const queryRole = socket.handshake.query?.role || 'customer';
      const queryName = socket.handshake.query?.name || 'User';
      socket.user = { id: queryUserId, username: queryUserId, role: queryRole, name: queryName };
      next();
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id || socket.user._id || socket.user.username;
    const userRole = socket.user.role || 'customer';
    const userName = socket.user.name || socket.user.username || 'User';

    // Register user as Online
    onlineUsers.set(userId, { socketId: socket.id, role: userRole, username: socket.user.username, name: userName });
    console.log(`⚡ [Socket.IO] Connected: ${userName} (${userId}) [Role: ${userRole}] [Socket: ${socket.id}]`);

    // Broadcast online status change to all clients
    io.emit('online_status', { userId, isOnline: true });

    // Client requests status check for target user
    socket.on('check_online', ({ targetUserId }, callback) => {
      const isOnline = onlineUsers.has(targetUserId);
      if (typeof callback === 'function') callback({ targetUserId, isOnline });
    });

    // Join room by conversation ID
    socket.on('join_conversation', ({ conversationId, orderId }) => {
      if (conversationId) {
        socket.join(conversationId);
        console.log(`📌 [Socket.IO] ${userName} joined conversation room: ${conversationId}`);
      }
      if (orderId) {
        socket.join(`order_${orderId}`);
      }
    });

    // Handle Real-Time Message Transmission
    socket.on('send_message', async (data, ack) => {
      try {
        const {
          conversationId,
          orderId,
          receiverId,
          message,
          messageType = 'TEXT',
          attachmentUrl = '',
        } = data;

        const senderId = socket.user.id || socket.user.username;
        const senderRole = socket.user.role || 'customer';
        const senderName = socket.user.name || socket.user.username || 'User';

        const msgId = `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const newMsgPayload = {
          messageId: msgId,
          conversationId: conversationId || `CONV-${orderId}`,
          orderId: orderId || 'DT1025',
          senderId,
          senderName,
          senderRole,
          receiverId: receiverId || 'tailor',
          message: message || '',
          messageType,
          attachmentUrl: attachmentUrl || '',
          readStatus: false,
          createdAt: new Date().toISOString(),
        };

        // Save to MongoDB if database connection is active
        if (config.getIsConnected()) {
          try {
            const dbMessage = new Message(newMsgPayload);
            await dbMessage.save();

            // Update conversation last message timestamp
            await Conversation.findOneAndUpdate(
              { conversationId: newMsgPayload.conversationId },
              {
                lastMessage: messageType === 'IMAGE' ? '📷 [Reference Image]' : message,
                lastMessageAt: new Date(),
                updatedAt: new Date(),
              },
              { upsert: true }
            );
          } catch (dbErr) {
            console.warn('[Socket DB Save Warning]', dbErr.message);
          }
        }

        // Broadcast to conversation room
        const roomName = conversationId || `CONV-${orderId}`;
        io.to(roomName).emit('new_message', newMsgPayload);

        // Also emit directly to receiver socket if online
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('unread_notification', {
            senderName,
            senderRole,
            orderId,
            message: messageType === 'IMAGE' ? '📷 Sent a reference design image' : message,
          });
        }

        if (typeof ack === 'function') {
          ack({ success: true, message: newMsgPayload });
        }
      } catch (err) {
        console.error('[Socket Send Error]', err);
        if (typeof ack === 'function') ack({ success: false, error: err.message });
      }
    });

    // Handle Typing Status Indicators
    socket.on('typing_start', ({ conversationId, receiverId }) => {
      socket.to(conversationId).emit('user_typing', { senderId: userId, isTyping: true });
    });

    socket.on('typing_stop', ({ conversationId, receiverId }) => {
      socket.to(conversationId).emit('user_typing', { senderId: userId, isTyping: false });
    });

    // Handle Disconnection
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      console.log(`🔌 [Socket.IO] Disconnected: ${userName} (${userId})`);
      io.emit('online_status', { userId, isOnline: false });
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}

module.exports = {
  initSocket,
  getIO,
  getOnlineUsers,
};
