const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const config = require('./src/config/db');
const apiRoutes = require('./src/routes/apiRoutes');
const { pexelsSearchController } = require('./src/controllers/apiControllers');
const { initSocket } = require('./src/socket');

// Load environment variables safely
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO Engine
initSocket(server);

// Global Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files if built dist exists
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Health Check Endpoint with MongoDB & Socket.IO Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'Smart Digital Tailoring System REST API & Real-Time Socket.IO Server',
    database: config.getIsConnected() ? 'CONNECTED (MongoDB Atlas)' : 'DISCONNECTED (Fallback Active)',
    timestamp: new Date().toISOString(),
  });
});

// Root Level Endpoint: GET /api/image-search
app.get('/api/image-search', pexelsSearchController);

// Google OAuth Root Level Aliases (/api/auth/google & /api/auth/google/callback)
app.get('/api/auth/google', (req, res) => res.redirect('/api/v1/auth/google'));
app.get('/api/auth/google/callback', (req, res) => {
  const queryStr = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
  res.redirect(`/api/v1/auth/google/callback${queryStr}`);
});

// Mount V1 REST API Routes
app.use('/api/v1', apiRoutes);

// Catch-all route to serve React frontend SPA or Welcome Card
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  
  const distIndex = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Smart Digital Tailoring System - Unified Server</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #120b10; color: #fff; text-align: center; padding: 60px 20px; line-height: 1.6; }
          .card { max-width: 650px; margin: 0 auto; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 28px; padding: 40px; box-shadow: 0 25px 60px rgba(0,0,0,0.5); }
          .badge { display: inline-block; background: #22c55e22; color: #4ade80; border: 1px solid #22c55e55; padding: 6px 18px; border-radius: 20px; font-weight: bold; font-size: 13px; margin-bottom: 20px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #d76578, #e88a9a); color: #fff; padding: 14px 32px; border-radius: 30px; font-weight: bold; text-decoration: none; box-shadow: 0 10px 25px rgba(215,101,120,0.4); margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✂️ Smart Digital Tailoring System</h1>
          <div class="badge">${config.getIsConnected() ? '✅ MongoDB Atlas Connected' : '⚠️ Fallback Mode Active'}</div>
          <p>Full-Stack Tailoring Platform: <b>Client Frontend + Express REST API + Real-Time Socket.IO + MongoDB Database</b> connected together!</p>
          <p>Click below to launch your full website interface:</p>
          <a href="http://localhost:5173" class="btn">👉 Launch Full Website (http://localhost:5173)</a>
        </div>
      </body>
    </html>
  `);
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Backend Server Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || config.port || 5000;

function startServer(listenPort) {
  const currentPort = Number(listenPort || 5000);
  
  const onError = (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ [Port ${currentPort} in use] Please kill existing process or check running backend.`);
    } else {
      console.error('[Backend Server Fatal Error]', err);
    }
  };

  server.once('error', onError);
  server.listen(currentPort, () => {
    console.log(`🚀 [DigiTailor Unified Full-Stack & Socket.IO Server] running on http://localhost:${currentPort}`);
  });
}

if (require.main === module) {
  (async () => {
    await config.connectDB();
    startServer(PORT);
  })();
}

module.exports = { app, server };
