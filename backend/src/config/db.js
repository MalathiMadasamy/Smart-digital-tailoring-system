const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Load environment variables safely
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configure Google Public DNS for SRV resolution reliability on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore if DNS override restricted
}

let isConnected = false;

module.exports = {
  dbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digitailor_db',
  jwtSecret: process.env.JWT_SECRET || 'digitailor_jwt_secret_key_2026',
  port: process.env.PORT || 5000,
  getIsConnected: () => isConnected,
  connectDB: async () => {
    const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digitailor_db';
    const localUri = 'mongodb://127.0.0.1:27017/digitailor_db';

    if (primaryUri.includes('<db_password>')) {
      console.warn('⚠️ [MongoDB Warning] Please replace "<db_password>" in your .env file with your actual MongoDB Atlas database password!');
      return false;
    }

    // Try Primary URI (MongoDB Atlas Cloud / Custom)
    try {
      mongoose.set('strictQuery', false);
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
      return true;
    } catch (primaryErr) {
      // If primary failed, try local MongoDB instance
      try {
        const localConn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
        isConnected = true;
        console.log(`✅ [MongoDB Connected] Host: ${localConn.connection.host} | Database: ${localConn.connection.name}`);
        return true;
      } catch (localErr) {
        isConnected = false;
        console.warn(`⚠️ [MongoDB Connection Note] Unable to connect to Primary or Local MongoDB.`);
        console.warn(`   Primary URI Error: ${primaryErr.message}`);
        console.warn(`   Backend REST API is running with safe fallback mode enabled.`);
        return false;
      }
    }
  },
};
