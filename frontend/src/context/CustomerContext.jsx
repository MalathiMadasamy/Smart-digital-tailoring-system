import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import dresses, { ALL_PRODUCTS } from '../data/dresses.js';
import { EMBROIDERY_DESIGNERS } from '../data/womenTailoringData.js';
import { apiFetch } from '../services/apiClient.js';

const CustomerContext = createContext(null);


const INITIAL_PROFILES = [
  {
    id: 'prof-1',
    name: 'Saree Blouse Fit (Default)',
    isDefault: true,
    values: {
      bust: '36',
      waist: '30',
      hip: '38',
      shoulder: '15',
      sleeveLength: '10',
      armhole: '16',
      blouseLength: '14',
      neckDepth: '7',
      frontLength: '14.5',
      backLength: '14',
    },
  },
  {
    id: 'prof-2',
    name: 'Anarkali & Suit Fit',
    isDefault: false,
    values: {
      bust: '38',
      waist: '32',
      hip: '40',
      shoulder: '15.5',
      sleeveLength: '22',
      armhole: '17',
      blouseLength: '15',
      neckDepth: '6.5',
      frontLength: '42',
      backLength: '42',
    },
  },
];

const DEMO_SAVED_DESIGNS = [
  {
    id: 'saved-des-1',
    title: 'Bridal Crimson Silk Blouse',
    date: '2026-09-02',
    details: {
      dressType: 'Blouse',
      fabric: 'Silk',
      color: 'Red',
      pattern: 'Embroidery',
      sleeve: 'Elbow',
      neck: 'Sweetheart',
      embroidery: 'Zardosi Handwork',
      border: 'Gold Zari',
      length: 'Regular',
      fit: 'Slim Fit',
    },
    price: 2499,
  },
];

const DEMO_ORDERS = [
  {
    id: 'TAILOR-2026-1025',
    orderId: 'TAILOR-2026-1025',
    date: '2026-10-04',
    deliveryEstimate: 'Tue, Oct 06',
    dressType: 'Chudidhar Fit',
    fitCode: 'FIT-10-CHUDITHAR',
    items: [{ id: 'fit-1', title: 'Chudidhar Side Fitting Alteration [FIT-10-CHUDITHAR]', price: 10 }],
    total: 10,
    subtotal: 10,
    fabricCost: 0,
    deliveryCharge: 0,
    paidAmount: 10,
    remainingAmount: 0,
    paymentStatus: 'FULLY PAID',
    paymentMethod: 'Dynamic UPI QR Code (₹10 Verified)',
    status: 'IN STITCHING',
    ownFabric: true,
    fabricReceived: true,
    measurementStatus: 'Recorded (9 Fits)',
    referenceImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    embroideryWork: 'None',
    embroideryDesigner: 'N/A',
    customerName: 'Malathi Lakshmi',
    tailorAssigned: 'Master Rajesh Tailor',
    customerDetails: { name: 'Malathi Lakshmi', phone: '9876543210', email: 'malathi@digitailor.com' },
    shippingAddress: { address: '42, Fashion Avenue, T. Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017' },
    measurementsProfileName: 'Chudithar Fit Profile',
    measurements: INITIAL_PROFILES[0].values,
    fittingStatus: 'Trial Ready',
    alterationNotes: 'Micro-Fitting Service Code: FIT-10-CHUDITHAR - Fixed ₹10 Fee Enforced',
    deliveryStatus: 'In Production',
  },
  {
    id: 'TAILOR-2026-1026',
    orderId: 'TAILOR-2026-1026',
    date: '2026-10-04',
    deliveryEstimate: 'Wed, Oct 07',
    dressType: 'Blouse Fit',
    fitCode: 'FIT-10-BLOUSE',
    items: [{ id: 'fit-2', title: 'Saree Blouse Side & Sleeve Fitting [FIT-10-BLOUSE]', price: 10 }],
    total: 10,
    subtotal: 10,
    fabricCost: 0,
    deliveryCharge: 0,
    paidAmount: 10,
    remainingAmount: 0,
    paymentStatus: 'FULLY PAID',
    paymentMethod: 'Dynamic UPI QR Code (₹10 Verified)',
    status: 'READY FOR FITTING',
    ownFabric: true,
    fabricReceived: true,
    measurementStatus: 'Recorded (10 Fits)',
    referenceImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    embroideryWork: 'None',
    embroideryDesigner: 'N/A',
    customerName: 'Anitha Ramesh',
    tailorAssigned: 'Lakshmi Tailors',
    customerDetails: { name: 'Anitha Ramesh', phone: '9840112233', email: 'anitha.r@gmail.com' },
    shippingAddress: { address: '15, Canal Bank Road, Mylapore', city: 'Chennai', state: 'Tamil Nadu', pincode: '600004' },
    measurementsProfileName: 'Blouse Precision Fit Profile',
    measurements: INITIAL_PROFILES[0].values,
    fittingStatus: 'Trial Scheduled',
    alterationNotes: 'Micro-Fitting Service Code: FIT-10-BLOUSE - Fixed ₹10 Fee Enforced',
    deliveryStatus: 'Ready for Trial',
  },
  {
    id: 'TAILOR-2026-1027',
    orderId: 'TAILOR-2026-1027',
    date: '2026-10-03',
    deliveryEstimate: 'Mon, Oct 05',
    dressType: 'Mundhi Edge Fit',
    fitCode: 'FIT-10-MUNDHI',
    items: [{ id: 'fit-3', title: 'Saree Mundhi Edge Folding [FIT-10-MUNDHI]', price: 10 }],
    total: 10,
    subtotal: 10,
    fabricCost: 0,
    deliveryCharge: 0,
    paidAmount: 10,
    remainingAmount: 0,
    paymentStatus: 'FULLY PAID',
    paymentMethod: 'Cash at Atelier Counter (₹10 Verified)',
    status: 'COMPLETED',
    ownFabric: true,
    fabricReceived: true,
    measurementStatus: 'Recorded (Standard)',
    referenceImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    embroideryWork: 'None',
    embroideryDesigner: 'N/A',
    customerName: 'Kavitha Sundaram',
    tailorAssigned: 'Master Murugan Tailor',
    customerDetails: { name: 'Kavitha Sundaram', phone: '9840223344', email: 'kavitha.s@gmail.com' },
    shippingAddress: { address: '8, Gandhi Street, Adyar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600020' },
    measurementsProfileName: 'Standard Mundhi Fit',
    measurements: INITIAL_PROFILES[0].values,
    fittingStatus: 'Fitting Approved',
    alterationNotes: 'Micro-Fitting Service Code: FIT-10-MUNDHI - Fixed ₹10 Fee Enforced',
    deliveryStatus: 'DELIVERED',
  },
  {
    id: 'TAILOR-2026-1028',
    orderId: 'TAILOR-2026-1028',
    date: '2026-10-03',
    deliveryEstimate: 'Tue, Oct 06',
    dressType: 'Hook & Button Fixing',
    fitCode: 'FIT-10-HOOK',
    items: [{ id: 'fit-4', title: 'Hook & Press Button Fixing [FIT-10-HOOK]', price: 10 }],
    total: 10,
    subtotal: 10,
    fabricCost: 0,
    deliveryCharge: 0,
    paidAmount: 10,
    remainingAmount: 0,
    paymentStatus: 'FULLY PAID',
    paymentMethod: 'Dynamic UPI QR Code (₹10 Verified)',
    status: 'IN STITCHING',
    ownFabric: true,
    fabricReceived: true,
    measurementStatus: 'Recorded (Standard)',
    referenceImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    embroideryWork: 'None',
    embroideryDesigner: 'N/A',
    customerName: 'Divya Krishnan',
    tailorAssigned: 'Meenakshi Boutique Tailor',
    customerDetails: { name: 'Divya Krishnan', phone: '9840334455', email: 'divya.k@gmail.com' },
    shippingAddress: { address: '22, Trunk Road, Porur', city: 'Chennai', state: 'Tamil Nadu', pincode: '600116' },
    measurementsProfileName: 'Hook & Button Fit Profile',
    measurements: INITIAL_PROFILES[0].values,
    fittingStatus: 'In Production',
    alterationNotes: 'Micro-Fitting Service Code: FIT-10-HOOK - Fixed ₹10 Fee Enforced',
    deliveryStatus: 'In Production',
  },
  {
    id: 'TAILOR-2026-1029',
    orderId: 'TAILOR-2026-1029',
    date: '2026-10-02',
    deliveryEstimate: 'Thu, Oct 08',
    dressType: 'Frock Fit',
    fitCode: 'FIT-10-FROCK',
    items: [{ id: 'fit-5', title: 'Frock Waist & Flare Alteration [FIT-10-FROCK]', price: 10 }],
    total: 10,
    subtotal: 10,
    fabricCost: 0,
    deliveryCharge: 0,
    paidAmount: 10,
    remainingAmount: 0,
    paymentStatus: 'FULLY PAID',
    paymentMethod: 'Credit / Debit Card (₹10 Verified)',
    status: 'READY FOR FITTING',
    ownFabric: true,
    fabricReceived: true,
    measurementStatus: 'Recorded (8 Fits)',
    referenceImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
    embroideryWork: 'None',
    embroideryDesigner: 'N/A',
    customerName: 'Meena Subramanian',
    tailorAssigned: 'Sangeetha Atelier',
    customerDetails: { name: 'Meena Subramanian', phone: '9840445566', email: 'meena.sub@gmail.com' },
    shippingAddress: { address: '11, Cross Street, Velachery', city: 'Chennai', state: 'Tamil Nadu', pincode: '600042' },
    measurementsProfileName: 'Frock Fit Profile',
    measurements: INITIAL_PROFILES[1].values,
    fittingStatus: 'Trial Scheduled',
    alterationNotes: 'Micro-Fitting Service Code: FIT-10-FROCK - Fixed ₹10 Fee Enforced',
    deliveryStatus: 'Ready for Trial',
  },
  {
    id: 'ORD-9021',
    date: '2026-09-02',
    deliveryEstimate: 'Mon, Sep 08',
    dressType: 'Designer Blouse',
    items: [ALL_PRODUCTS[0]],
    total: 1899,
    paidAmount: 899,
    remainingAmount: 1000,
    paymentStatus: 'PARTIALLY PAID',
    paymentMethod: 'UPI Paid',
    status: 'CUTTING',
    ownFabric: true,
    fabricReceived: true,
    measurementStatus: 'Recorded (9 Fits)',
    referenceImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    embroideryWork: 'Scallop Cutwork & Zari Border',
    embroideryDesigner: 'Master Lakshmi Aari Crafts',
    customerName: 'Malathi Lakshmi',
    tailorAssigned: 'Master Rajesh Tailor',
    customerDetails: { name: 'Malathi Lakshmi', phone: '9876543210', email: 'malathi@digitailor.com' },
    shippingAddress: { address: '42, Fashion Avenue, T. Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017' },
    measurementsProfileName: 'Designer Blouse Fit (Default)',
    measurements: INITIAL_PROFILES[0].values,
    fittingStatus: 'Pending',
    alterationNotes: '',
    deliveryStatus: 'In Production',
  },
  {
    id: 'ORD-9104',
    date: '2026-09-03',
    deliveryEstimate: 'Wed, Sep 10',
    dressType: 'Pavadai Thavani',
    items: [ALL_PRODUCTS[1]],
    total: 4299,
    paidAmount: 2000,
    remainingAmount: 2299,
    paymentStatus: 'PARTIALLY PAID',
    paymentMethod: 'UPI (PhonePe)',
    status: 'READY FOR FITTING',
    ownFabric: true,
    fabricReceived: true,
    measurementStatus: 'Recorded (9 Fits)',
    referenceImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    embroideryWork: 'Kanchipuram Elephant Zari Border',
    embroideryDesigner: 'Sri Kanchi Zari Artisans',
    customerName: 'Kavitha Sundaram',
    tailorAssigned: 'Master Rajesh Tailor',
    customerDetails: { name: 'Kavitha Sundaram', phone: '9840223344', email: 'kavitha.s@gmail.com' },
    shippingAddress: { address: '8, Gandhi Street, Adyar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600020' },
    measurementsProfileName: 'Bridal Fit Profile',
    measurements: INITIAL_PROFILES[0].values,
    fittingStatus: 'Trial Scheduled',
    alterationNotes: '',
    deliveryStatus: 'Ready for Trial',
  },
  {
    id: 'ORD-9150',
    date: '2026-09-04',
    deliveryEstimate: 'Thu, Sep 11',
    dressType: 'Half Saree',
    items: [ALL_PRODUCTS[2]],
    total: 3699,
    paidAmount: 1699,
    remainingAmount: 2000,
    paymentStatus: 'PARTIALLY PAID',
    paymentMethod: 'GPay UPI',
    status: 'ALTERATION REQUIRED',
    ownFabric: true,
    fabricReceived: true,
    measurementStatus: 'Recorded (7 Fits)',
    referenceImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    embroideryWork: 'Floral Kalamkari & Red Scallop Border',
    embroideryDesigner: 'Silk Thread Needlework Studio',
    customerName: 'Soundarya Rajan',
    tailorAssigned: 'Master Rajesh Tailor',
    customerDetails: { name: 'Soundarya Rajan', phone: '9840556677', email: 'soundarya.r@gmail.com' },
    shippingAddress: { address: '18, Main Road, Nungambakkam', city: 'Chennai', state: 'Tamil Nadu', pincode: '600034' },
    measurementsProfileName: 'Lehenga Fit Profile',
    measurements: INITIAL_PROFILES[0].values,
    fittingStatus: 'Alteration Requested',
    alterationNotes: 'Adjust waist pleating & sleeve fit',
    deliveryStatus: 'In Workshop',
  },
  {
    id: 'ORD-8942',
    date: '2026-08-28',
    deliveryEstimate: 'Delivered on Sep 01',
    dressType: 'Anarkali Gown',
    items: [ALL_PRODUCTS[3]],
    total: 2899,
    paidAmount: 2899,
    remainingAmount: 0,
    paymentStatus: 'FULLY PAID',
    paymentMethod: 'Credit Card',
    status: 'COMPLETED',
    ownFabric: false,
    fabricReceived: true,
    measurementStatus: 'Recorded (8 Fits)',
    referenceImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    embroideryWork: 'Crimson Red Leaf Tree Threadwork',
    embroideryDesigner: 'Silk Thread Needlework Studio',
    customerName: 'Anitha Ramesh',
    tailorAssigned: 'Sangeetha Atelier',
    customerDetails: { name: 'Anitha Ramesh', phone: '9840112233', email: 'anitha.r@gmail.com' },
    shippingAddress: { address: '15, Canal Bank Road, Mylapore', city: 'Chennai', state: 'Tamil Nadu', pincode: '600004' },
    measurementsProfileName: 'Anarkali Fit Profile',
    measurements: INITIAL_PROFILES[1].values,
    fittingStatus: 'Fitting Approved',
    alterationNotes: '',
    deliveryStatus: 'DELIVERED',
  },
  {
    id: 'ORD-8810',
    date: '2026-08-15',
    deliveryEstimate: 'Delivered on Aug 20',
    dressType: 'Salwar Kameez',
    items: [ALL_PRODUCTS[4]],
    total: 1699,
    paidAmount: 1699,
    remainingAmount: 0,
    paymentStatus: 'FULLY PAID',
    paymentMethod: 'UPI Paid',
    status: 'READY FOR DELIVERY',
    ownFabric: true,
    fabricReceived: true,
    measurementStatus: 'Recorded (9 Fits)',
    referenceImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
    embroideryWork: 'Textured Mustard & Floral Patiala',
    embroideryDesigner: 'Master Lakshmi Aari Crafts',
    customerName: 'Divya Krishnan',
    tailorAssigned: 'Master Murugan Tailor',
    customerDetails: { name: 'Divya Krishnan', phone: '9840334455', email: 'divya.k@gmail.com' },
    shippingAddress: { address: '22, Trunk Road, Porur', city: 'Chennai', state: 'Tamil Nadu', pincode: '600116' },
    measurementsProfileName: 'Anarkali & Suit Fit',
    measurements: INITIAL_PROFILES[1].values,
    fittingStatus: 'Fitting Approved',
    alterationNotes: '',
    deliveryStatus: 'READY FOR DELIVERY',
  },
];

const DEMO_CUSTOMERS = [
  { id: 'CUST-101', name: 'Malathi Lakshmi', phone: '9876543210', email: 'malathi@digitailor.com', address: '42, Fashion Avenue, T. Nagar, Chennai', dob: '1992-05-14', notes: 'VIP Client. Prefers deep V neck blouses & ₹10 micro fittings.', ordersCount: 5, totalSpent: 14505 },
  { id: 'CUST-102', name: 'Anitha Ramesh', phone: '9840112233', email: 'anitha.r@gmail.com', address: '15, Canal Bank Road, Mylapore, Chennai', dob: '1989-11-20', notes: 'Prefers silk blouses & elbow sleeve fittings.', ordersCount: 3, totalSpent: 3709 },
  { id: 'CUST-103', name: 'Kavitha Sundaram', phone: '9840223344', email: 'kavitha.s@gmail.com', address: '8, Gandhi Street, Adyar, Chennai', dob: '1995-02-10', notes: 'Bridal customer - Heavy Aari & Kanchipuram borders.', ordersCount: 4, totalSpent: 8609 },
  { id: 'CUST-104', name: 'Divya Krishnan', phone: '9840334455', email: 'divya.k@gmail.com', address: '22, Trunk Road, Porur, Chennai', dob: '1998-08-05', notes: 'Regular Chudidhar & Hook fixing orders.', ordersCount: 3, totalSpent: 2419 },
  { id: 'CUST-105', name: 'Meena Subramanian', phone: '9840445566', email: 'meena.sub@gmail.com', address: '11, Cross Street, Velachery, Chennai', dob: '1991-04-18', notes: 'Frock & Gown alterations customer.', ordersCount: 2, totalSpent: 1410 },
  { id: 'CUST-106', name: 'Soundarya Rajan', phone: '9840556677', email: 'soundarya.r@gmail.com', address: '18, Main Road, Nungambakkam, Chennai', dob: '1994-12-30', notes: 'Half Saree & Kalamkari embroidery orders.', ordersCount: 2, totalSpent: 4709 },
];

const DEMO_CATEGORIES = [
  { id: 'cat-1', name: 'Simple Blouse Stitching', categoryGroup: 'Blouse', description: 'Classic plain blouse stitching with lining', startingPrice: 500, estimatedDays: 2, active: true },
  { id: 'cat-2', name: 'Designer Saree Blouse', categoryGroup: 'Blouse', description: 'Custom neck, sleeve & back designs with piping', startingPrice: 800, estimatedDays: 3, active: true },
  { id: 'cat-3', name: 'Bridal Aari Work Blouse', categoryGroup: 'Blouse', description: 'Heavy zardosi & maggam Aari embroidery', startingPrice: 1500, estimatedDays: 5, active: true },
  { id: 'cat-4', name: 'Petticoat / Inner Skirt', categoryGroup: 'Inner', description: 'Cotton 6-panel or 8-panel saree petticoat', startingPrice: 350, estimatedDays: 1, active: true },
  { id: 'cat-5', name: 'Pavadai Thavani / Half Saree', categoryGroup: 'Traditional', description: 'Pleated skirt, choli blouse & voni drape set', startingPrice: 1400, estimatedDays: 4, active: true },
  { id: 'cat-6', name: 'Chudidar / Salwar Suit', categoryGroup: 'Traditional', description: '3-piece kameez, churidar bottom & dupatta', startingPrice: 900, estimatedDays: 3, active: true },
  { id: 'cat-7', name: 'Anarkali Floor Length Gown', categoryGroup: 'Bridal', description: 'Full flared floor-length Anarkali suit', startingPrice: 1400, estimatedDays: 4, active: true },
  { id: 'cat-8', name: 'Saree Fall & Pico Finishing', categoryGroup: 'Saree', description: 'Cotton fall border attachment & pico', startingPrice: 220, estimatedDays: 1, active: true },
];

const DEMO_TAILORS = [
  { id: 'tlr-1', name: 'Master Rajesh Tailor', phone: '9840192834', email: 'rajesh@digitailor.com', spec: 'Silk Blouses & Kanchipuram Sarees', exp: '12 Yrs', activeOrdersCount: 5, active: true },
  { id: 'tlr-2', name: 'Lakshmi Tailors', phone: '9840283741', email: 'lakshmi@digitailor.com', spec: 'Aari & Zari Embroidery', exp: '10 Yrs', activeOrdersCount: 4, active: true },
  { id: 'tlr-3', name: 'Meenakshi Boutique Tailor', phone: '9840374652', email: 'meenakshi@digitailor.com', spec: 'Lehengas & Pavadai Thavani', exp: '8 Yrs', activeOrdersCount: 3, active: true },
  { id: 'tlr-4', name: 'Master Murugan Tailor', phone: '9840485763', email: 'murugan@digitailor.com', spec: 'Chudidhar & Salwar Fitting Specialist', exp: '15 Yrs', activeOrdersCount: 4, active: true },
  { id: 'tlr-5', name: 'Sangeetha Atelier', phone: '9840596874', email: 'sangeetha@digitailor.com', spec: 'Frocks, Gowns & Western Alterations', exp: '9 Yrs', activeOrdersCount: 2, active: true },
];

const INITIAL_EMBROIDERY_DESIGNERS = [
  {
    designerId: 'DES-101',
    id: 'DES-101',
    name: 'Priya',
    businessName: 'Priya Aari Works',
    phone: '9840192834',
    email: 'priya.aari@gmail.com',
    address: '14, North Usman Road, T. Nagar, Chennai',
    specializations: ['Aari Work', 'Bridal Embroidery', 'Zari Work'],
    experience: '8 years',
    startingPrice: 900,
    availability: 'Available',
    status: 'Active',
    active: true,
    notes: 'Specialist in Kanchipuram silk blouse peacock Aari cutwork.',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  },
  {
    designerId: 'DES-102',
    id: 'DES-102',
    name: 'Master Lakshmi',
    businessName: 'Master Lakshmi Aari Crafts',
    phone: '9840283741',
    email: 'lakshmi.aari@gmail.com',
    address: '28, South Boag Road, T. Nagar, Chennai',
    specializations: ['Zardosi Handwork', 'Stone Work', 'Bead Work'],
    experience: '12 years',
    startingPrice: 1200,
    availability: 'Available',
    status: 'Active',
    active: true,
    notes: 'Specialist in heavy bridal velvet Zardosi and Swarovski stone work.',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
  {
    designerId: 'DES-103',
    id: 'DES-103',
    name: 'Karthik Artisan',
    businessName: 'Sri Kanchi Zari Artisans',
    phone: '9840374652',
    email: 'kanchi.zari@gmail.com',
    address: '5, Weaver Street, Kanchipuram',
    specializations: ['Zari Work', 'Border Work', 'Mundhi/Pallu Embroidery'],
    experience: '15 years',
    startingPrice: 1500,
    availability: 'Available',
    status: 'Active',
    active: true,
    notes: 'Traditional South Indian tissue silk zari borders and temple motifs.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    designerId: 'DES-104',
    id: 'DES-104',
    name: 'Anitha Designer',
    businessName: 'Silk Thread Needlework Studio',
    phone: '9840465563',
    email: 'anitha.silk@gmail.com',
    address: '19, Mylapore Tank, Chennai',
    specializations: ['Thread Embroidery', 'Sequin Work', 'Floral Embroidery'],
    experience: '6 years',
    startingPrice: 850,
    availability: 'Available',
    status: 'Active',
    active: true,
    notes: 'Modern threadwork for Anarkalis and floral lehengas.',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  },
];

const INITIAL_EMBROIDERY_WORKS = [
  {
    workId: 'EW-1001',
    id: 'EW-1001',
    orderId: 'ORD-9021',
    customerId: 'USR-MALATHI-01',
    customerName: 'Malathi Lakshmi',
    dressType: 'Designer Blouse',
    embroideryType: 'Aari Work',
    referenceImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    specialInstructions: 'Gold Aari work with maroon thread cutwork around the neck and sleeve border.',
    designerId: 'DES-101',
    designerName: 'Priya Aari Works',
    assignedDate: '2026-09-15',
    sentAt: '2026-09-15',
    dueDate: '2026-09-23',
    completedAt: '',
    receivedAt: '',
    qualityCheckedAt: '',
    outsourceCost: 900,
    customerCharge: 1200,
    margin: 300,
    status: 'WORK IN PROGRESS',
    reworkReason: '',
    notes: 'Express bridal order for wedding reception',
  },
  {
    workId: 'EW-1002',
    id: 'EW-1002',
    orderId: 'ORD-9104',
    customerId: 'USR-MALATHI-01',
    customerName: 'Malathi Lakshmi',
    dressType: 'Pavadai Thavani',
    embroideryType: 'Zari Work',
    referenceImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    specialInstructions: 'Elephant Zari border detailing on waist pleats.',
    designerId: 'DES-103',
    designerName: 'Sri Kanchi Zari Artisans',
    assignedDate: '2026-09-16',
    sentAt: '2026-09-16',
    dueDate: '2026-09-22',
    completedAt: '2026-09-18',
    receivedAt: '2026-09-18',
    qualityCheckedAt: '2026-09-18',
    outsourceCost: 1500,
    customerCharge: 2000,
    margin: 500,
    status: 'APPROVED',
    reworkReason: '',
    notes: 'Quality checked and sent to Master Tailor for stitching',
  },
  {
    workId: 'EW-1003',
    id: 'EW-1003',
    orderId: 'ORD-9150',
    customerId: 'USR-MALATHI-01',
    customerName: 'Malathi Lakshmi',
    dressType: 'Half Saree',
    embroideryType: 'Thread Embroidery',
    referenceImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    specialInstructions: 'Red scalloped floral threadwork on voni hem.',
    designerId: 'DES-104',
    designerName: 'Silk Thread Needlework Studio',
    assignedDate: '2026-09-17',
    sentAt: '2026-09-17',
    dueDate: '2026-09-21',
    completedAt: '2026-09-19',
    receivedAt: '2026-09-19',
    qualityCheckedAt: '',
    outsourceCost: 800,
    customerCharge: 1100,
    margin: 300,
    status: 'RECEIVED AT SHOP',
    reworkReason: '',
    notes: 'Received at shop counter. Pending Admin Quality Check approval',
  },
];

export function CustomerProvider({ children }) {
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_measurement_profiles');
      return saved ? JSON.parse(saved) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    try {
      return localStorage.getItem('digitailor_active_profile_id') || 'prof-1';
    } catch {
      return 'prof-1';
    }
  });

  const [savedDesigns, setSavedDesigns] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_saved_custom_designs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_customer_orders');
      const list = saved ? JSON.parse(saved) : [];
      const cleanList = list.filter((o) => {
        const title = (
          (o.dressType || '') +
          ' ' +
          (o.items?.[0]?.name || '') +
          ' ' +
          (o.items?.[0]?.subcategory || '')
        ).toLowerCase();
        return !title.includes('charcoal') && !title.includes('two-piece') && !title.includes('men');
      });
      return cleanList;
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_customer_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_customer_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item) => ({ ...item, quantity: item.quantity || 1 }));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_customer_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [adminNotifications, setAdminNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_admin_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tailorNotifications, setTailorNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_tailor_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [shopSettings, setShopSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_shop_settings');
      return saved
        ? JSON.parse(saved)
        : {
            shopName: 'DigiTailor Women Bespoke Boutique',
            upiId: 'digitailor@upi',
            phone: '+91 98765 43210',
            address: '42, Fashion Avenue, T. Nagar, Chennai - 600017',
            requireFullPaymentBeforeDelivery: true,
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=digitailor@upi&pn=DigiTailor%20Bespoke',
            instructions: 'Scan QR code using GPay, PhonePe, Paytm or any UPI App to make full or advance payment.',
          };
    } catch {
      return {
        shopName: 'DigiTailor Women Bespoke Boutique',
        upiId: 'digitailor@upi',
        phone: '+91 98765 43210',
        address: '42, Fashion Avenue, T. Nagar, Chennai - 600017',
        requireFullPaymentBeforeDelivery: true,
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=digitailor@upi&pn=DigiTailor%20Bespoke',
        instructions: 'Scan QR code using GPay, PhonePe, Paytm or any UPI App to make full or advance payment.',
      };
    }
  });

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_customer_reviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customerProfile, setCustomerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_customer_profile');
      return saved
        ? JSON.parse(saved)
        : {
            name: 'Ananya Sharma',
            phone: '9876543210',
            email: 'customer@digitailor.com',
            address: '42, Fashion Avenue, T. Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600017',
          };
    } catch {
      return {
        name: 'Ananya Sharma',
        phone: '9876543210',
        email: 'customer@digitailor.com',
        address: '42, Fashion Avenue, T. Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600017',
      };
    }
  });

  const [appliedDiscount, setAppliedDiscount] = useState({ code: '', amount: 0 });

  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_admin_customers');
      return saved ? JSON.parse(saved) : DEMO_CUSTOMERS;
    } catch {
      return DEMO_CUSTOMERS;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_admin_categories');
      return saved ? JSON.parse(saved) : DEMO_CATEGORIES;
    } catch {
      return DEMO_CATEGORIES;
    }
  });

  const [tailors, setTailors] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_admin_tailors');
      return saved ? JSON.parse(saved) : DEMO_TAILORS;
    } catch {
      return DEMO_TAILORS;
    }
  });

  const [embroideryDesigners, setEmbroideryDesigners] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_admin_designers');
      return saved ? JSON.parse(saved) : INITIAL_EMBROIDERY_DESIGNERS;
    } catch {
      return INITIAL_EMBROIDERY_DESIGNERS;
    }
  });

  const [embroideryWorks, setEmbroideryWorks] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_admin_embroidery_works');
      return saved ? JSON.parse(saved) : INITIAL_EMBROIDERY_WORKS;
    } catch {
      return INITIAL_EMBROIDERY_WORKS;
    }
  });

  useEffect(() => { localStorage.setItem('digitailor_measurement_profiles', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem('digitailor_active_profile_id', activeProfileId); }, [activeProfileId]);
  useEffect(() => { localStorage.setItem('digitailor_saved_custom_designs', JSON.stringify(savedDesigns)); }, [savedDesigns]);
  useEffect(() => { localStorage.setItem('digitailor_customer_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('digitailor_customer_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('digitailor_customer_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('digitailor_customer_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('digitailor_admin_notifications', JSON.stringify(adminNotifications)); }, [adminNotifications]);
  useEffect(() => { localStorage.setItem('digitailor_tailor_notifications', JSON.stringify(tailorNotifications)); }, [tailorNotifications]);
  useEffect(() => { localStorage.setItem('digitailor_shop_settings', JSON.stringify(shopSettings)); }, [shopSettings]);
  useEffect(() => { localStorage.setItem('digitailor_customer_reviews', JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem('digitailor_customer_profile', JSON.stringify(customerProfile)); }, [customerProfile]);
  useEffect(() => { localStorage.setItem('digitailor_admin_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('digitailor_admin_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('digitailor_admin_tailors', JSON.stringify(tailors)); }, [tailors]);
  useEffect(() => { localStorage.setItem('digitailor_admin_designers', JSON.stringify(embroideryDesigners)); }, [embroideryDesigners]);
  useEffect(() => { localStorage.setItem('digitailor_admin_embroidery_works', JSON.stringify(embroideryWorks)); }, [embroideryWorks]);


  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0] || INITIAL_PROFILES[0];
  }, [profiles, activeProfileId]);

  const [paymentsList, setPaymentsList] = useState(() => {
    try {
      const saved = localStorage.getItem('digitailor_admin_payments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    async function syncBackendOrders() {
      try {
        const res = await apiFetch('/orders');
        if (isMounted && res && Array.isArray(res.orders)) {
          const formatted = res.orders.map((o) => ({
            id: o.orderId || o.id || `ORD-${o._id}`,
            date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            deliveryEstimate: o.deliveryEstimate || '5 Days',
            dressType: o.dressType || o.serviceName || 'Designer Blouse',
            items: o.items || [{ name: o.serviceName || o.dressType || 'Designer Stitching', price: o.totalAmount }],
            total: o.totalAmount || 0,
            paidAmount: o.paidAmount || 0,
            remainingAmount: Math.max(0, (o.totalAmount || 0) - (o.paidAmount || 0)),
            paymentStatus: o.paidAmount >= o.totalAmount ? 'FULLY PAID' : o.paidAmount > 0 ? 'PARTIALLY PAID' : 'UNPAID',
            status: o.status || 'ORDER RECEIVED',
            ownFabric: o.fabricSource ? o.fabricSource.includes('Customer') : true,
            fabricReceived: true,
            referenceImage: o.referenceImage || '',
            embroideryWork: o.embroidery || 'None',
            customerName: o.customerName || 'Customer',
            tailorAssigned: o.assignedTailor || 'Master Rajesh Tailor',
            measurements: o.measurements || {},
          }));
          setOrders(formatted);
        }
      } catch (err) {
        console.warn('Failed to sync live orders from backend:', err.message);
      }
    }
    syncBackendOrders();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('digitailor_admin_payments', JSON.stringify(paymentsList));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [paymentsList]);

  const updateOrderStatusByTailor = useCallback((orderId, newStatus, tailorName, paymentStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus || o.status,
              tailorAssigned: tailorName || o.tailorAssigned || 'Master Rajesh Tailor',
              paymentStatus: paymentStatus || o.paymentStatus || 'PARTIALLY PAID',
            }
          : o
      )
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Order Status Update',
        message: `Order #${orderId} status set to "${newStatus}"${tailorName ? ` (Assigned to ${tailorName})` : ''}.`,
        date: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  }, []);

  // REAL-WORLD CONNECTED PAYMENT EXECUTION FUNCTION
  const makePayment = useCallback(
    ({ orderId, amountPaid, paymentType, paymentMethod = 'UPI / QR', transactionRef }) => {
      const amount = Number(amountPaid);
      if (!amount || amount <= 0) return null;

      let updatedOrder = null;
      let prevPaid = 0;
      let newPaid = 0;
      let newRemaining = 0;
      let newStatus = 'PARTIALLY PAID';

      setOrders((prevOrders) => {
        return prevOrders.map((order) => {
          if (order.id === orderId) {
            prevPaid = order.paidAmount || 0;
            newPaid = Math.min(order.total, prevPaid + amount);
            newRemaining = Math.max(0, order.total - newPaid);
            newStatus = newRemaining === 0 ? 'FULLY PAID' : (newPaid > 0 ? 'PARTIALLY PAID' : 'UNPAID');

            updatedOrder = {
              ...order,
              paidAmount: newPaid,
              remainingAmount: newRemaining,
              paymentStatus: newStatus,
              paymentMethod: paymentMethod || order.paymentMethod,
            };
            return updatedOrder;
          }
          return order;
        });
      });

      const paymentRecord = {
        payment_id: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        txnId: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        order_id: orderId,
        orderId,
        customer: updatedOrder?.customerName || 'Malathi Lakshmi',
        customer_id: updatedOrder?.customerDetails?.id || 'CUST-101',
        amount_paid: amount,
        amountPaid: amount,
        previous_paid_amount: prevPaid,
        total_paid_amount: newPaid,
        remaining_amount: newRemaining,
        remaining: newRemaining,
        total: updatedOrder?.total || amount,
        payment_type: paymentType || (newRemaining === 0 ? (prevPaid > 0 ? 'Remaining Payment' : 'Full Payment') : 'Advance Payment'),
        type: paymentType || (newRemaining === 0 ? (prevPaid > 0 ? 'Remaining Payment' : 'Full Payment') : 'Advance Payment'),
        payment_method: paymentMethod || 'UPI / QR',
        method: paymentMethod || 'UPI / QR',
        payment_status: newStatus,
        status: newStatus,
        payment_date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        transaction_reference: transactionRef || `UPI-REF-${Date.now()}`,
      };

      // 1. Append payment history (Never overwrite!)
      setPaymentsList((prev) => [paymentRecord, ...prev]);

      // 2. Customer Notification
      const custNotif = {
        notification_id: `notif-cust-${Date.now()}`,
        id: `notif-cust-${Date.now()}`,
        recipient_role: 'CUSTOMER',
        type: 'PAYMENT_SUCCESS',
        title: `✓ Payment Successful (₹${amount})`,
        message:
          newRemaining === 0
            ? `Your full payment of ₹${amount} for Order #${orderId} has been received. Status: FULLY PAID.`
            : `Your payment of ₹${amount} for Order #${orderId} has been received. Status: PARTIALLY PAID. Remaining Amount: ₹${newRemaining}.`,
        order_id: orderId,
        payment_id: paymentRecord.payment_id,
        amount,
        read: false,
        created_at: new Date().toISOString(),
        date: 'Just now',
      };
      setNotifications((prev) => [custNotif, ...prev]);

      // 3. Admin Notification
      const adminNotif = {
        notification_id: `notif-admin-${Date.now()}`,
        id: `notif-admin-${Date.now()}`,
        recipient_role: 'ADMIN',
        type: 'PAYMENT_RECEIVED',
        title: newRemaining === 0 ? `🔔 Full Payment Received (#${orderId})` : `🔔 New Payment Received (#${orderId})`,
        message: `Customer ${updatedOrder?.customerName || 'Customer'} paid ₹${amount} for Order #${orderId} (${updatedOrder?.dressType || 'Outfit'}). Total Paid: ₹${newPaid}, Remaining: ₹${newRemaining}. Status: ${newStatus}.`,
        order_id: orderId,
        customerName: updatedOrder?.customerName || 'Customer',
        dressType: updatedOrder?.dressType || 'Outfit',
        amountPaid: amount,
        totalAmount: updatedOrder?.total,
        remainingAmount: newRemaining,
        paymentStatus: newStatus,
        paymentType: paymentRecord.payment_type,
        read: false,
        created_at: new Date().toISOString(),
        date: new Date().toLocaleString('en-IN'),
      };
      setAdminNotifications((prev) => [adminNotif, ...prev]);

      // 4. Tailor Notification
      const tailorNotif = {
        notification_id: `notif-tailor-${Date.now()}`,
        id: `notif-tailor-${Date.now()}`,
        recipient_role: 'TAILOR',
        type: 'PAYMENT_UPDATED',
        title: `🔔 Customer Payment Updated (#${orderId})`,
        message: `Customer ${updatedOrder?.customerName || 'Customer'} payment received: ₹${amount} for Order #${orderId} (${updatedOrder?.dressType || 'Outfit'}). Total Paid: ₹${newPaid}, Remaining: ₹${newRemaining}. Status: ${newStatus}.`,
        order_id: orderId,
        customerName: updatedOrder?.customerName || 'Customer',
        dressType: updatedOrder?.dressType || 'Outfit',
        amountPaid: amount,
        remainingAmount: newRemaining,
        paymentStatus: newStatus,
        read: false,
        created_at: new Date().toISOString(),
        date: new Date().toLocaleString('en-IN'),
      };
      setTailorNotifications((prev) => [tailorNotif, ...prev]);

      return paymentRecord;
    },
    []
  );

  const recordPaymentForOrder = useCallback(
    (orderId, amountPaid, paymentMethod = 'GPay UPI') => {
      return makePayment({
        orderId,
        amountPaid,
        paymentType: 'Remaining Payment',
        paymentMethod,
      });
    },
    [makePayment]
  );

  const updateShopSettings = useCallback((newSettings) => {
    setShopSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const markAdminNotificationRead = useCallback((id) => {
    setAdminNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAdminNotificationsRead = useCallback(() => {
    setAdminNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markTailorNotificationRead = useCallback((id) => {
    setTailorNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllTailorNotificationsRead = useCallback(() => {
    setTailorNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addToCart = useCallback(
    (product) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id && !item.customizationDetails);
        if (existing) {
          return prev.map((item) =>
            item.cartId === existing.cartId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [
          ...prev,
          {
            cartId: `cart-${Date.now()}-${Math.random()}`,
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imgUrl: product.imgUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=780&fit=crop&auto=format',
            fabric: product.fabric || 'Cotton',
            color: product.color || product.colors?.[0] || 'Standard',
            customizationDetails: product.customizationDetails || null,
            measurementProfileName: activeProfile?.name || 'Standard Fit',
          },
        ];
      });
    },
    [activeProfile]
  );

  const updateCartQuantity = useCallback((cartId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const removeFromCart = useCallback((cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartSummary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const isFitting = Boolean(
        item.fitCode ||
        item.name?.toLowerCase().includes('fit') ||
        item.name?.toLowerCase().includes('custom') ||
        item.dressType?.toLowerCase().includes('fit') ||
        item.ownFabric ||
        (item.price && item.price <= 500)
      );
      const price = isFitting ? 10 : (item.price || 10);
      return sum + price * (item.quantity || 1);
    }, 0);
    const delivery = 0; // FREE measurement & pickup
    const discount = appliedDiscount.amount;
    const total = Math.max(0, subtotal + delivery - discount);

    return {
      subtotal,
      delivery,
      discount,
      total,
    };
  }, [cart, appliedDiscount]);

  const applyPromoCode = useCallback((code) => {
    const clean = (code || '').trim().toUpperCase();
    if (clean === 'DIGI150' || clean === 'TAILOR150' || clean === 'PROMO150') {
      setAppliedDiscount({ code: clean, amount: 150 });
      return { success: true, message: '✓ ₹150 promo discount applied!' };
    }
    return { success: false, message: 'Invalid promo code. Try DIGI150.' };
  }, []);

  const placeOrderWithCheckoutDetails = useCallback(
    ({ customerDetails, shippingAddress, paymentMethod, paymentOption, paidAmount, remainingAmount, paymentStatus, orderIdOverride }) => {
      if (cart.length === 0) return null;

      // REQUIREMENT 2: Unique Order ID Format (TAILOR-2026-XXXX)
      const seqNum = Math.floor(1000 + Math.random() * 9000);
      const orderId = orderIdOverride || `TAILOR-2026-${seqNum}`;
      const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      // REQUIREMENT 3: FIXED ₹10 PAYMENT RULE (No extra fees, fabric = 0, delivery = 0)
      const total = 10;
      const paid = 10;
      const rem = 0;
      const status = 'FULLY PAID';
      const customerName = customerDetails?.name || customerProfile.name;
      const dressType = cart[0]?.subcategory || cart[0]?.category || cart[0]?.name || 'Tailoring Fit Service';

      const newOrder = {
        id: orderId,
        orderId: orderId,
        date: new Date().toISOString().split('T')[0],
        deliveryEstimate: deliveryDate,
        items: [...cart],
        subtotal: 10,
        deliveryFee: 0,
        extraCharges: 0,
        fabricCost: 0,
        embroideryCost: 0,
        designerFee: 0,
        discount: 0,
        total: 10,
        paidAmount: 10,
        remainingAmount: 0,
        status: 'Order Placed',
        paymentMethod: paymentMethod || 'Dynamic UPI QR Code (₹10 Verified)',
        paymentStatus: 'FULLY PAID',
        customerName: customerName,
        dressType: dressType,
        tailorAssigned: 'Master Rajesh Tailor',
        customerDetails: customerDetails || customerProfile,
        shippingAddress: shippingAddress || customerProfile,
        measurements: activeProfile.values,
        measurementProfileName: activeProfile.name,
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Call API to sync backend MongoDB record
      try {
        apiFetch('/orders', {
          method: 'POST',
          body: JSON.stringify({
            orderId,
            customerId: customerDetails?.id || 'CUST-101',
            customerName,
            serviceName: dressType,
            dressType,
            totalAmount: 10,
            paidAmount: 10,
            paymentMethod: paymentMethod || 'Dynamic UPI QR Code',
          }),
        });
      } catch (err) {
        console.warn('Backend order sync note:', err);
      }

      if (paid > 0) {
        const paymentRecord = {
          payment_id: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
          txnId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          order_id: orderId,
          orderId,
          customer: customerName,
          customer_id: customerDetails?.id || 'CUST-101',
          amount_paid: paid,
          amountPaid: paid,
          previous_paid_amount: 0,
          total_paid_amount: paid,
          remaining_amount: rem,
          remaining: rem,
          total: cartSummary.total,
          payment_type: rem === 0 ? 'Full Payment' : 'Advance Payment',
          type: rem === 0 ? 'Full Payment' : 'Advance Payment',
          payment_method: paymentMethod || 'UPI Paid',
          method: paymentMethod || 'UPI Paid',
          payment_status: status,
          status: status,
          payment_date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          transaction_reference: `UPI-REF-${Date.now()}`,
        };
        setPaymentsList((prev) => [paymentRecord, ...prev]);

        // Dispatch Admin Notification
        const adminNotif = {
          notification_id: `notif-admin-${Date.now()}`,
          id: `notif-admin-${Date.now()}`,
          recipient_role: 'ADMIN',
          type: 'PAYMENT_RECEIVED',
          title: rem === 0 ? `🔔 Full Payment Received (#${orderId})` : `🔔 New Payment Received (#${orderId})`,
          message: `Customer ${customerName} paid ₹${paid} for Order #${orderId} (${dressType}). Total Paid: ₹${paid}, Remaining: ₹${rem}. Status: ${status}.`,
          order_id: orderId,
          customerName,
          dressType,
          amountPaid: paid,
          totalAmount: cartSummary.total,
          remainingAmount: rem,
          paymentStatus: status,
          paymentType: rem === 0 ? 'Full Payment' : 'Advance Payment',
          read: false,
          created_at: new Date().toISOString(),
          date: new Date().toLocaleString('en-IN'),
        };
        setAdminNotifications((prev) => [adminNotif, ...prev]);

        // Dispatch Tailor Notification
        const tailorNotif = {
          notification_id: `notif-tailor-${Date.now()}`,
          id: `notif-tailor-${Date.now()}`,
          recipient_role: 'TAILOR',
          type: 'PAYMENT_UPDATED',
          title: `🔔 Customer Payment Updated (#${orderId})`,
          message: `Customer ${customerName} payment received: ₹${paid} for Order #${orderId} (${dressType}). Remaining: ₹${rem}. Status: ${status}.`,
          order_id: orderId,
          customerName,
          dressType,
          amountPaid: paid,
          remainingAmount: rem,
          paymentStatus: status,
          read: false,
          created_at: new Date().toISOString(),
          date: new Date().toLocaleString('en-IN'),
        };
        setTailorNotifications((prev) => [tailorNotif, ...prev]);
      }

      setCart([]);
      setAppliedDiscount({ code: '', amount: 0 });

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Order Confirmed',
          message: `Your order #${newOrder.id} for ₹${newOrder.total} has been confirmed (${status}). Master Rajesh Tailor is assigned.`,
          date: 'Just now',
          read: false,
        },
        ...prev,
      ]);

      return newOrder;
    },
    [cart, cartSummary, activeProfile, customerProfile]
  );

  const addMeasurementProfile = useCallback((name, values) => {
    const newProf = {
      id: `prof-${Date.now()}`,
      name: name || 'New Fit Profile',
      isDefault: false,
      values,
    };
    setProfiles((prev) => [...prev, newProf]);
    setActiveProfileId(newProf.id);
    return newProf;
  }, []);

  const updateMeasurementProfile = useCallback((id, name, values) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: name || p.name, values } : p))
    );
  }, []);

  const deleteMeasurementProfile = useCallback((id) => {
    setProfiles((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (filtered.length > 0) setActiveProfileId(filtered[0].id);
      return filtered;
    });
  }, []);

  const saveCustomDesign = useCallback((design) => {
    const newDesign = {
      id: `saved-des-${Date.now()}`,
      title: `${design.color} ${design.fabric} ${design.dressType}`,
      date: new Date().toISOString().split('T')[0],
      details: design,
      price: design.ownFabric ? 850 : 2299,
    };
    setSavedDesigns((prev) => [newDesign, ...prev]);
    return newDesign;
  }, []);

  const deleteSavedDesign = useCallback((id) => {
    setSavedDesigns((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
  }, []);

  const addReview = useCallback((review) => {
    setReviews((prev) => [{ id: `rev-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...review }, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const updateProfile = useCallback((newProfile) => {
    setCustomerProfile(newProfile);
  }, []);

  const addCustomer = useCallback((c) => {
    const newC = { id: `CUST-${Math.floor(100 + Math.random() * 900)}`, ordersCount: 0, totalSpent: 0, ...c };
    setCustomers((prev) => [newC, ...prev]);
    return newC;
  }, []);

  const updateCustomer = useCallback((id, updated) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  }, []);

  const deleteCustomer = useCallback((id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addCategory = useCallback((cat) => {
    const newCat = { id: `cat-${Date.now()}`, active: true, ...cat };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  }, []);

  const updateCategory = useCallback((id, updated) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleCategoryActive = useCallback((id) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  }, []);

  const addTailor = useCallback((t) => {
    const newT = { id: `tlr-${Date.now()}`, activeOrdersCount: 0, active: true, ...t };
    setTailors((prev) => [...prev, newT]);
    return newT;
  }, []);

  const updateTailor = useCallback((id, updated) => {
    setTailors((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  }, []);

  const deleteTailor = useCallback((id) => {
    setTailors((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTailorActive = useCallback((id) => {
    setTailors((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  }, []);

  const addEmbroideryDesigner = useCallback((d) => {
    const newD = { id: `emb-${Date.now()}`, rating: 5.0, reviewsCount: 0, ...d };
    setEmbroideryDesigners((prev) => [...prev, newD]);
    return newD;
  }, []);

  const updateEmbroideryDesigner = useCallback((id, updated) => {
    setEmbroideryDesigners((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
  }, []);

  const deleteEmbroideryDesigner = useCallback((id) => {
    setEmbroideryDesigners((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const toggleDesignerActive = useCallback((id) => {
    setEmbroideryDesigners((prev) => prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d)));
  }, []);

  const addEmbroideryWork = useCallback((w) => {
    const newW = { id: `emb-wk-${Date.now()}`, status: 'IN PROGRESS', ...w };
    setEmbroideryWorks((prev) => [...prev, newW]);
    return newW;
  }, []);

  const updateEmbroideryWorkStatus = useCallback((id, status) => {
    setEmbroideryWorks((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
  }, []);

  const recordPayment = useCallback(({ orderId, amount, paymentMethod }) => {
    return recordPaymentForOrder(orderId, amount, paymentMethod);
  }, [recordPaymentForOrder]);

  const updateOrderMeasurements = useCallback((orderId, measurements) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, measurements } : o)));
  }, []);

  const updateOrderDeliveryStatus = useCallback((orderId, status) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, deliveryStatus: status, status: status } : o)));
  }, []);

  const cancelOrder = useCallback((orderId) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)));
  }, []);

  const deleteOrder = useCallback((orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const confirmCustomDesign = useCallback((orderId) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'DESIGN CONFIRMED' } : o)));
  }, []);

  const approveReview = useCallback((id) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r)));
  }, []);

  const hideReview = useCallback((id) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'HIDDEN' } : r)));
  }, []);

  const deleteReview = useCallback((id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateOrderRackLocation = useCallback(async (orderId, rackLocation) => {
    try {
      await apiFetch(`/orders/${orderId}/location`, {
        method: 'PUT',
        body: JSON.stringify({ rackLocation }),
      });
    } catch (err) {
      console.warn('API error updating rack location:', err.message);
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.orderId === orderId ? { ...o, rackLocation } : o))
    );
  }, []);

  const assignOrderTailor = useCallback(async (orderId, assignedTailor) => {
    try {
      await apiFetch(`/orders/${orderId}/tailor`, {
        method: 'PUT',
        body: JSON.stringify({ assignedTailor }),
      });
    } catch (err) {
      console.warn('API error assigning tailor:', err.message);
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.orderId === orderId ? { ...o, assignedTailor, tailorAssigned: assignedTailor } : o))
    );
  }, []);

  const createGarmentOrder = useCallback(async (orderData) => {
    const seqNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = orderData.orderId || `ORD-${seqNum}`;
    const qrIdentifier = orderData.qrIdentifier || `QR-${orderId}`;

    const newOrd = {
      id: orderId,
      orderId,
      qrIdentifier,
      date: new Date().toISOString().split('T')[0],
      deliveryEstimate: 'Standard (3-5 Days)',
      customerName: orderData.customerName || 'Malathi Lakshmi',
      customerPhone: orderData.customerPhone || '+91 98765 43210',
      dressType: orderData.dressType || 'Designer Blouse',
      dressColour: orderData.dressColour || 'Royal Blue',
      dressImage: orderData.dressImage || '',
      referenceImage: orderData.dressImage || '',
      rackLocation: orderData.rackLocation || 'Rack A - Box 03',
      measurements: orderData.measurements || INITIAL_PROFILES[0].values,
      specialInstructions: orderData.specialInstructions || '',
      status: 'Received',
      assignedTailor: orderData.assignedTailor || 'Master Rajesh Tailor',
      totalAmount: Number(orderData.totalAmount) || 850,
      paidAmount: Number(orderData.paidAmount) || 850,
      remainingAmount: 0,
      paymentStatus: 'FULLY PAID',
    };

    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(newOrd),
      });
    } catch (err) {
      console.warn('API error creating garment order:', err.message);
    }

    setOrders((prev) => [newOrd, ...prev]);
    return newOrd;
  }, []);

  const resetDemoData = useCallback(async () => {
    try {
      await apiFetch('/dev/reset-demo-data', {
        method: 'POST',
        body: JSON.stringify({ confirmReset: true }),
      });

      localStorage.removeItem('digitailor_customer_orders');
      localStorage.removeItem('digitailor_saved_custom_designs');
      localStorage.removeItem('digitailor_customer_cart');
      localStorage.removeItem('digitailor_customer_notifications');
      localStorage.removeItem('digitailor_admin_notifications');
      localStorage.removeItem('digitailor_tailor_notifications');
      localStorage.removeItem('digitailor_customer_reviews');
      localStorage.removeItem('digitailor_admin_payments');
      localStorage.removeItem('digitailor_customer_wishlist');
      localStorage.removeItem('digitailor_admin_embroidery_works');

      setOrders([]);
      setSavedDesigns([]);
      setCart([]);
      setNotifications([]);
      setAdminNotifications([]);
      setTailorNotifications([]);
      setReviews([]);
      setWishlist([]);
      setPaymentsList([]);
      setEmbroideryWorks([]);

      return { success: true, message: 'All demo business data has been reset successfully.' };
    } catch (err) {
      console.error('Failed to reset demo data:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'Order Placed' || o.status === 'Accepted').length;
    const inProgress = orders.filter((o) => ['Cutting', 'Stitching', 'Quality Check', 'Ready'].includes(o.status)).length;
    const completedOrders = orders.filter((o) => o.status === 'Delivered').length;
    const wishlistCount = wishlist.length;
    const savedMeasurementsCount = Object.values(activeProfile?.values || {}).filter(Boolean).length;

    return {
      totalOrders,
      pendingOrders,
      inProgress,
      completedOrders,
      wishlistCount,
      savedMeasurementsCount,
    };
  }, [orders, wishlist, activeProfile]);

  const downloadOrderPdfInvoice = useCallback((order) => {
    if (!order) return;
    const printWindow = window.open('', '_blank', 'width=850,height=1100');
    if (!printWindow) {
      alert('Please allow popup windows to download/print the customer PDF invoice.');
      return;
    }

    const orderId = order.id || order.orderId || 'ORD-1001';
    const customerName = order.customerName || order.customerDetails?.name || 'Malathi Lakshmi';
    const dressType = order.dressType || order.serviceName || 'Custom Tailoring Outfit';
    const total = order.total || order.totalAmount || order.price || 0;
    const paid = order.paidAmount || (order.remainingAmount === 0 ? total : total - (order.remainingAmount || 0));
    const remaining = Math.max(0, total - paid);
    const status = order.status || 'ORDER RECEIVED';
    const date = order.date || new Date().toISOString().split('T')[0];
    const tailorName = order.tailorAssigned || order.tailorName || 'Master Rajesh Tailor';
    const embroideryInfo = order.embroidery || order.embroideryWork || order.embroideryType || 'N/A';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${orderId} - Smart Digital Tailoring System</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; color: #333; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 2px solid #880e4f; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ad1457; padding-bottom: 20px; margin-bottom: 24px; }
          .logo-title { color: #880e4f; font-size: 24px; font-weight: 900; margin: 0; }
          .logo-sub { color: #666; font-size: 12px; margin-top: 4px; }
          .invoice-tag { background: #ad1457; color: #fff; padding: 8px 18px; border-radius: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .info-card { background: #fcf8fa; border: 1px solid #f8bbd0; border-radius: 10px; padding: 14px; }
          .info-card h4 { margin: 0 0 8px; color: #880e4f; font-size: 14px; border-bottom: 1px solid #f8bbd0; padding-bottom: 4px; }
          .info-card p { margin: 4px 0; font-size: 13px; color: #444; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 24px; }
          th { background: #880e4f; color: #fff; text-align: left; padding: 12px; font-size: 13px; }
          td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }
          .totals-table { width: 340px; margin-left: auto; }
          .totals-table td { padding: 8px 12px; }
          .totals-table .grand-total { font-weight: bold; font-size: 16px; color: #880e4f; border-top: 2px solid #ad1457; }
          .badge-paid { background: #e8f5e9; color: #2e7d32; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; }
          .badge-partial { background: #fff3e0; color: #e65100; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; }
          .footer { text-align: center; border-top: 1px solid #ddd; padding-top: 18px; margin-top: 30px; font-size: 12px; color: #777; }
          @media print {
            body { padding: 0; }
            .invoice-box { border: none; box-shadow: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div>
              <h1 class="logo-title">✂️ Smart Digital Tailoring System</h1>
              <div class="logo-sub">Bespoke Women's Tailoring & Artisanal Embroidery Atelier</div>
            </div>
            <div class="invoice-tag">OFFICIAL INVOICE</div>
          </div>

          <div class="details-grid">
            <div class="info-card">
              <h4>CUSTOMER DETAILS</h4>
              <p><strong>Customer Name:</strong> ${customerName}</p>
              <p><strong>Phone:</strong> ${order.customerDetails?.phone || '9876543210'}</p>
              <p><strong>Email:</strong> ${order.customerDetails?.email || 'customer@digitailor.com'}</p>
            </div>
            <div class="info-card">
              <h4>ORDER & TAILOR DETAILS</h4>
              <p><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Payment Status:</strong> <span class="${remaining === 0 ? 'badge-paid' : 'badge-partial'}">${remaining === 0 ? 'FULLY PAID' : 'PARTIALLY PAID'}</span></p>
              <p><strong>Assigned Tailor:</strong> ${tailorName}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item / Service Description</th>
                <th>Embroidery Work</th>
                <th>Tailoring Status</th>
                <th>Total Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${dressType}</strong><br><small style="color:#666">${order.fabricSource || 'Custom Stitching & Fit'}</small></td>
                <td>${embroideryInfo}</td>
                <td>${status}</td>
                <td>₹${total}</td>
              </tr>
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td>Total Quote Amount:</td>
              <td style="text-align:right"><strong>₹${total}</strong></td>
            </tr>
            <tr>
              <td>Amount Paid:</td>
              <td style="text-align:right; color:#2e7d32"><strong>₹${paid}</strong></td>
            </tr>
            <tr>
              <td>Remaining Balance:</td>
              <td style="text-align:right; color:#c62828"><strong>₹${remaining}</strong></td>
            </tr>
            <tr class="grand-total">
              <td>Payment Status:</td>
              <td style="text-align:right">${remaining === 0 ? 'PAID IN FULL ✓' : `BAL DUE: ₹${remaining}`}</td>
            </tr>
          </table>

          <div class="footer">
            <p>Thank you for choosing <strong>Smart Digital Tailoring System</strong>! For queries, contact support@digitailor.com</p>
            <p><small>This is an official computer-generated tax invoice & tailoring job card.</small></p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }, []);

  const contextValue = useMemo(
    () => ({
      profiles,
      activeProfile,
      activeProfileId,
      savedDesigns,
      orders,
      customers,
      categories,
      tailors,
      embroideryDesigners,
      embroideryWorks,
      wishlist,
      cart,
      cartSummary,
      appliedDiscount,
      notifications,
      adminNotifications,
      markAdminNotificationRead,
      markAllAdminNotificationsRead,
      tailorNotifications,
      markTailorNotificationRead,
      markAllTailorNotificationsRead,
      shopSettings,
      updateShopSettings,
      makePayment,
      reviews,
      customerProfile,
      metrics,
      paymentsList,
      recordPayment,
      recordPaymentForOrder,
      setActiveProfileId,
      addMeasurementProfile,
      updateMeasurementProfile,
      deleteMeasurementProfile,
      saveCustomDesign,
      deleteSavedDesign,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      applyPromoCode,
      placeOrderWithCheckoutDetails,
      updateOrderStatusByTailor,
      toggleWishlist,
      addReview,
      markNotificationRead,
      updateProfile,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addCategory,
      updateCategory,
      deleteCategory,
      toggleCategoryActive,
      addTailor,
      updateTailor,
      deleteTailor,
      toggleTailorActive,
      addEmbroideryDesigner,
      updateEmbroideryDesigner,
      deleteEmbroideryDesigner,
      toggleDesignerActive,
      addEmbroideryWork,
      updateEmbroideryWorkStatus,
      updateOrderMeasurements,
      updateOrderDeliveryStatus,
      cancelOrder,
      deleteOrder,
      confirmCustomDesign,
      approveReview,
      hideReview,
      deleteReview,
      updateOrderRackLocation,
      assignOrderTailor,
      createGarmentOrder,
      resetDemoData,
      downloadOrderPdfInvoice,
    }),
    [
      profiles,
      activeProfile,
      activeProfileId,
      savedDesigns,
      orders,
      customers,
      categories,
      tailors,
      embroideryDesigners,
      embroideryWorks,
      wishlist,
      cart,
      cartSummary,
      appliedDiscount,
      notifications,
      adminNotifications,
      markAdminNotificationRead,
      markAllAdminNotificationsRead,
      tailorNotifications,
      markTailorNotificationRead,
      markAllTailorNotificationsRead,
      shopSettings,
      updateShopSettings,
      makePayment,
      reviews,
      customerProfile,
      metrics,
      paymentsList,
      recordPayment,
      recordPaymentForOrder,
      setActiveProfileId,
      addMeasurementProfile,
      updateMeasurementProfile,
      deleteMeasurementProfile,
      saveCustomDesign,
      deleteSavedDesign,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      applyPromoCode,
      placeOrderWithCheckoutDetails,
      updateOrderStatusByTailor,
      toggleWishlist,
      addReview,
      markNotificationRead,
      updateProfile,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addCategory,
      updateCategory,
      deleteCategory,
      toggleCategoryActive,
      addTailor,
      updateTailor,
      deleteTailor,
      toggleTailorActive,
      addEmbroideryDesigner,
      updateEmbroideryDesigner,
      deleteEmbroideryDesigner,
      toggleDesignerActive,
      addEmbroideryWork,
      updateEmbroideryWorkStatus,
      updateOrderMeasurements,
      updateOrderDeliveryStatus,
      cancelOrder,
      deleteOrder,
      confirmCustomDesign,
      approveReview,
      hideReview,
      deleteReview,
      updateOrderRackLocation,
      assignOrderTailor,
      createGarmentOrder,
      downloadOrderPdfInvoice,
    ]
  );


  return <CustomerContext.Provider value={contextValue}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
