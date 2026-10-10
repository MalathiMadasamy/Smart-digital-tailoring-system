const express = require('express');
const router = express.Router();
const {
  authController,
  userController,
  tailorController,
  productController,
  pexelsSearchController,
  measurementController,
  customDesignController,
  orderController,
  paymentController,
  analyticsController,
  contactController,
  chatController,
  aiDesignerController,
  aiAssistantController,
  embroideryController,
  devController,
  networkIpController,
  notificationController,
} = require('../controllers/apiControllers');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Notification Endpoints (/api/v1/notifications)
router.get('/notifications', notificationController.getNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.post('/notifications', notificationController.createNotification);

// Local Network IP Endpoint (/api/v1/network-ip)
router.get('/network-ip', networkIpController);

// Dev / Demo Data Reset Endpoint (/api/v1/dev/reset-demo-data)
router.post('/dev/reset-demo-data', devController.resetDemoData);

// Pexels Image Search Endpoint (/api/v1/image-search)
router.get('/image-search', pexelsSearchController);

// 1. Auth Endpoints (/api/v1/auth)
router.get('/auth/google', authController.initiateGoogleOAuth);
router.get('/auth/google/callback', authController.handleGoogleCallback);
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/google', authController.googleLogin);

// 2. User & Customer Endpoints (/api/v1/users, /api/v1/customers)
router.get('/users/profile', authenticateToken, userController.getProfile);
router.get('/customers', authenticateToken, requireRole(['admin']), userController.getCustomers);

// 3. Tailor Endpoints (/api/v1/tailors)
router.get('/tailors', authenticateToken, tailorController.getTailors);
router.put('/tailors/orders/:id/status', authenticateToken, requireRole(['tailor', 'admin']), tailorController.updateOrderStatus);

// 4. Products & Categories Endpoints (/api/v1/products, /api/v1/categories)
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.get('/categories', productController.getCategories);

// 5. Measurements & Custom Designs Endpoints (/api/v1/measurements, /api/v1/custom-designs)
router.get('/measurements', authenticateToken, measurementController.getProfiles);
router.post('/measurements', authenticateToken, measurementController.saveProfile);
router.get('/custom-designs', authenticateToken, customDesignController.getDesigns);
router.post('/custom-designs', authenticateToken, customDesignController.saveDesign);

// 6. AI Smart Dress Designer Endpoints (/api/v1/ai)
router.post('/ai/generate-preview', authenticateToken, aiDesignerController.generatePreview);
router.post('/ai/approve-design', authenticateToken, aiDesignerController.approveDesign);
router.post('/ai/convert-to-order', authenticateToken, aiDesignerController.convertToOrder);
router.post('/ai/assistant', aiAssistantController.processQuestion);

// 7. Cart, Orders & Payments Endpoints (/api/v1/cart, /api/v1/orders, /api/v1/payments)
router.get('/orders', authenticateToken, orderController.getOrders);
router.post('/orders', authenticateToken, orderController.createOrder);
router.get('/orders/search/:query', orderController.searchOrder);
router.put('/orders/:id/status', authenticateToken, orderController.updateOrderStatus);
router.put('/orders/:id/location', authenticateToken, orderController.updateOrderLocation);
router.put('/orders/:id/tailor', authenticateToken, orderController.assignTailor);
router.post('/orders/verify-delivery', authenticateToken, orderController.verifyDelivery);
router.post('/payments/charge', authenticateToken, paymentController.processPayment);
router.post('/payments/verify', paymentController.verifyPayment);
router.post('/payments/razorpay/create-order', paymentController.createRazorpayOrder);
router.post('/payments/razorpay/verify', paymentController.verifyRazorpayPayment);

// 8. Analytics & Reports Endpoints (/api/v1/analytics)
router.get('/analytics/dashboard', authenticateToken, requireRole(['admin']), analyticsController.getMetrics);

// 9. Contact Inquiry Messages Endpoint (/api/v1/contact)
router.post('/contact', contactController.submitMessage);
router.get('/contact', authenticateToken, requireRole(['admin']), contactController.getMessages);

// 10. Real-Time Customer <-> Tailor Chat Endpoints (/api/v1/chat)
router.get('/chat/conversations', authenticateToken, chatController.getConversations);
router.get('/chat/messages', authenticateToken, chatController.getMessages);
router.post('/chat/messages', authenticateToken, chatController.sendMessage);
router.post('/chat/read', authenticateToken, chatController.markAsRead);

// 11. Outsourced Embroidery Designers & Work Endpoints (/api/v1/embroidery-designers, /api/v1/embroidery-work)
router.get('/embroidery-designers', authenticateToken, embroideryController.getDesigners);
router.post('/embroidery-designers', authenticateToken, requireRole(['admin']), embroideryController.createDesigner);
router.put('/embroidery-designers/:id', authenticateToken, requireRole(['admin']), embroideryController.updateDesigner);
router.delete('/embroidery-designers/:id', authenticateToken, requireRole(['admin']), embroideryController.deleteDesigner);

router.get('/embroidery-work', authenticateToken, embroideryController.getWorks);
router.post('/embroidery-work', authenticateToken, requireRole(['admin']), embroideryController.createWork);
router.put('/embroidery-work/:id', authenticateToken, requireRole(['admin', 'tailor']), embroideryController.updateWorkStatus);
router.post('/embroidery-work/:id/send', authenticateToken, requireRole(['admin']), embroideryController.updateWorkStatus);
router.post('/embroidery-work/:id/start', authenticateToken, requireRole(['admin']), embroideryController.updateWorkStatus);
router.post('/embroidery-work/:id/complete', authenticateToken, requireRole(['admin']), embroideryController.updateWorkStatus);
router.post('/embroidery-work/:id/receive', authenticateToken, requireRole(['admin']), embroideryController.updateWorkStatus);
router.post('/embroidery-work/:id/approve', authenticateToken, requireRole(['admin']), embroideryController.updateWorkStatus);
router.post('/embroidery-work/:id/rework', authenticateToken, requireRole(['admin']), embroideryController.updateWorkStatus);

module.exports = router;
