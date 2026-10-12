# Smart Digital Tailoring System 🧵✨

An end-to-end full-stack digital tailoring management platform designed for bespoke women's fashion, traditional garments (Aari blouses, lehengas, half sarees, anarkalis), 10-field measurement profiles, 14-stage live garment tracking with QR codes, real-time tailoring shop chat, and cloud database persistence.

---

## 🏗️ Project Architecture

```
Smart-Digital-Tailoring-System/
├── frontend/                  # React 19 + Vite 5 Frontend SPA
│   ├── src/                   # Components, Pages, State Contexts, Styles
│   ├── public/                # Static assets & images
│   ├── vercel.json            # Vercel SPA routing rewrite rules
│   ├── vite.config.js         # Vite configuration with proxy and dev server
│   ├── .env.example           # Frontend environment variables template
│   └── package.json           # Frontend dependencies and scripts
│
├── backend/                   # Node.js + Express + Socket.IO REST API
│   ├── src/
│   │   ├── config/            # MongoDB Atlas connection & seed scripts
│   │   ├── controllers/       # Modular API route controllers
│   │   ├── middleware/        # JWT auth verification middleware
│   │   ├── models/            # Mongoose schemas (User, Order, Garment, etc.)
│   │   ├── routes/            # REST API endpoints (/api/v1/...)
│   │   └── socket.js          # Real-time WebSockets engine
│   ├── server.js              # Express HTTP & Socket.IO server entry point
│   ├── .env.example           # Backend environment variables template
│   └── package.json           # Backend dependencies and scripts
│
└── README.md                  # Comprehensive Documentation
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18 or later
- **npm**: v9 or later
- **MongoDB**: MongoDB Atlas connection string or local MongoDB instance

### 2. Start Backend Server
```cmd
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` with health check at `http://localhost:5000/api/health`.*

### 3. Start Frontend Dev Server
In a separate terminal:
```cmd
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` with Vite HMR.*

---

## 🚀 Production Deployment Guide

### A. Deploy Backend on Render (Free Web Service)
1. Push this repository to your GitHub account: `https://github.com/MalathiMadasamy/Smart-digital-tailoring-system`.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + ➔ Web Service**.
3. Select your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `smart-digital-tailoring-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `MONGODB_URI`: `mongodb+srv://malathi:malathi123@cluster0.xduq1hg.mongodb.net/digitailor_db?retryWrites=true&w=majority&appName=Cluster0`
   - `JWT_SECRET`: `digitailor_jwt_secret_key_2026`
   - `GOOGLE_CLIENT_ID`: `437813045287-f29paql2um8l5cud9e48v5kvck0b97o8.apps.googleusercontent.com`
   - `PEXELS_API_KEY`: `hApUmZs0yh00fZ9Gw14XE4v1i2ATAXuno4Y0HZDSGHAQK8KK3sgP5noT`
6. Click **Create Web Service**. Once deployed, copy your live backend URL (e.g. `https://smart-digital-tailoring-backend.onrender.com`).

---

### B. Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New ➔ Project**.
2. Import the `Smart-digital-tailoring-system` repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `vite build` (or leave default)
   - **Output Directory**: `dist` (default)
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://smart-digital-tailoring-backend.onrender.com/api/v1` *(Replace with your real Render URL)*
   - `VITE_GOOGLE_CLIENT_ID`: `437813045287-f29paql2um8l5cud9e48v5kvck0b97o8.apps.googleusercontent.com`
   - `VITE_RAZORPAY_KEY_ID`: `rzp_test_digitailor2026`
5. Click **Deploy**. Vercel will build the frontend and provide your live website URL (e.g. `https://smart-digital-tailoring.vercel.app`)!

---

### C. Update Google Cloud OAuth Origins
Once you have your live Vercel URL:
1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit your OAuth 2.0 Web Client ID.
3. Under **Authorized JavaScript origins**, add your live Vercel URL (e.g. `https://smart-digital-tailoring.vercel.app` without trailing slash).
4. Save the changes.

---

## 🌟 Key Application Features

- **Role-Based Portals**:
  - **Customer Portal**: Measurement profiles, custom neckline/sleeve designer, dress categories catalog, cart, order placement, order status, and customer chat.
  - **Tailor Portal**: Assigned order queue, stage updates (Received, Cutting, Aari Embroidery, Stitching, Quality Check, Ready for Delivery), rack/box location assignments.
  - **Admin Portal**: Analytics overview, tailor assignments, customer database, revenue tracking, inventory, and system metrics.
- **14-Stage QR Tracking**: Instant QR scanning & printable labels with live status verification.
- **Google Sign-In & JWT Auth**: Secured via Google Identity Services & bcrypt password hashing.
- **Resilient Fallback Mode**: Functions seamlessly even if network or database connectivity is temporarily interrupted.
