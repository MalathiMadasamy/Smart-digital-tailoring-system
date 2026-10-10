const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dbConfig = require('./db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Measurement = require('../models/Measurement');

async function seedDatabase() {
  console.log('🌱 Starting DigiTailor MongoDB Seed Process...');
  const connected = await dbConfig.connectDB();
  if (!connected) {
    console.error('❌ Database connection failed. Aborting seed script.');
    process.exit(1);
  }

  try {
    // 1. Clear existing documents
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Measurement.deleteMany({});

    console.log('🧹 Cleared existing database collections.');

    // 2. Hash default passwords
    const cusPassword = await bcrypt.hash('cus123', 10);
    const tailorPassword = await bcrypt.hash('tailor123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const malathiPassword = await bcrypt.hash('malathi123', 10);

    // 3. Seed Users
    const users = await User.insertMany([
      {
        name: 'Malathi',
        username: 'malathi',
        passwordHash: malathiPassword,
        role: 'customer',
        phone: '9876543210',
        email: 'malathi@digitailor.com',
        status: 'active',
      },
      {
        name: 'Customer Account',
        username: 'customer',
        passwordHash: cusPassword,
        role: 'customer',
        phone: '9876543210',
        email: 'customer@digitailor.com',
        status: 'active',
      },
      {
        name: 'Master Rajesh Tailor',
        username: 'tailor',
        passwordHash: tailorPassword,
        role: 'tailor',
        phone: '9876501234',
        email: 'tailor@digitailor.com',
        status: 'active',
      },
      {
        name: 'Atelier Admin',
        username: 'admin',
        passwordHash: adminPassword,
        role: 'admin',
        phone: '9988776655',
        email: 'admin@digitailor.com',
        status: 'active',
      },
    ]);

    console.log(`✅ Seeded ${users.length} default user accounts (customer, tailor, admin, malathi).`);

    // 4. Seed Women-Only Tailoring Products & Services
    const products = await Product.insertMany([
      {
        name: 'Designer Saree Cutwork Blouse',
        department: 'Women',
        subCategory: 'Saree Blouse',
        fabric: 'Kanchipuram Raw Silk',
        price: 1899,
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
        stitchTimeDays: 4,
      },
      {
        name: 'Kanchipuram Pavadai Thavani Set',
        department: 'Women',
        subCategory: 'Half Saree',
        fabric: 'Pure Mulberry Silk',
        price: 2499,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
        stitchTimeDays: 5,
      },
      {
        name: 'Bridal Zardozi Lehenga Choli',
        department: 'Women',
        subCategory: 'Bridal Lehenga',
        fabric: 'Crimson Velvet & Brocade',
        price: 3499,
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
        stitchTimeDays: 7,
      },
      {
        name: 'Flared Silk Anarkali Gown',
        department: 'Women',
        subCategory: 'Anarkali Gown',
        fabric: 'Dupion Silk',
        price: 1999,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
        stitchTimeDays: 5,
      },
    ]);

    console.log(`✅ Seeded ${products.length} women's tailoring products.`);

    // 5. Seed Customer Measurements
    const malathiUser = users.find((u) => u.username === 'malathi');
    const malathiId = malathiUser._id.toString();

    const measurements = await Measurement.insertMany([
      {
        customerId: malathiId,
        profileName: 'Bridal Blouse Profile',
        dressType: 'Designer Saree Blouse',
        fields: {
          bust: '36 in',
          underBust: '30 in',
          shoulder: '14.5 in',
          armhole: '16 in',
          sleeveLength: '10.5 in',
          blouseLength: '14 in',
          frontNeckDepth: '7 in',
          backNeckDepth: '9.5 in',
          waist: '29 in',
        },
        notes: 'Deep scalloped cutwork with dori and gold potli buttons',
      },
    ]);

    console.log(`✅ Seeded ${measurements.length} customer fit profile.`);

    // 6. Seed Tailoring Orders with Partial Payment
    const sampleOrder = new Order({
      orderId: 'ORD-98421',
      customerId: malathiId,
      customerName: 'Malathi',
      orderType: 'Custom Stitching',
      serviceName: 'Designer Saree Cutwork Blouse',
      dressType: 'Designer Saree Blouse',
      fabricSource: 'Customer Own Fabric',
      referenceImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      measurements: measurements[0].fields,
      customization: { neckline: 'Deep Scallop', sleeve: 'Elbow Zari Border', back: 'Potli & Dori' },
      embroidery: 'Peacock Maggam & Gold Zardozi',
      assignedTailor: 'Master Rajesh Tailor',
      specialInstructions: 'Express bridal delivery requested before wedding reception.',
      totalAmount: 1899,
      paidAmount: 899,
      status: 'STITCHING',
      history: [
        { status: 'ORDER_RECEIVED', note: 'Order placed at atelier counter' },
        { status: 'MEASUREMENT_TAKEN', note: '10-field precision fit recorded' },
        { status: 'CUTTING', note: 'Fabric cut by Chief Master Tailor' },
        { status: 'STITCHING', note: 'Aari maggam work completed, assembling panels' },
      ],
    });

    await sampleOrder.save();
    console.log(`✅ Seeded sample order ORD-98421 with partial balance.`);

    console.log('🎉 MongoDB Seed script executed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed script error:', err);
    process.exit(1);
  }
}

seedDatabase();
