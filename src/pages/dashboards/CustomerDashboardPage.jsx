import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Navbar } from '../../components/Navbar.jsx';
import { CollectionView } from '../../components/CollectionView.jsx';
import { MeasurementManager } from '../../components/MeasurementManager.jsx';
import { CustomDesignStudio } from '../../components/CustomDesignStudio.jsx';
import { CartView } from '../../components/CartView.jsx';
import { CheckoutView } from '../../components/CheckoutView.jsx';
import { PaymentView } from '../../components/PaymentView.jsx';
import { OrderConfirmationModal } from '../../components/OrderConfirmationModal.jsx';
import { OrdersListView } from '../../components/OrdersListView.jsx';
import { OrderTrackingView } from '../../components/OrderTrackingView.jsx';
import { SmartDressRecommendations } from '../../components/SmartDressRecommendations.jsx';
import { VillageSimpleMode } from '../../components/VillageSimpleMode.jsx';
import { OrderChatWidget } from '../../components/OrderChatWidget.jsx';
import { AIDressDesignerStudio } from '../../components/AIDressDesignerStudio.jsx';
import { AITailoringAssistantModal } from '../../components/AITailoringAssistantModal.jsx';
import SubmitGarmentModal from '../../components/SubmitGarmentModal.jsx';
import { WOMEN_DRESS_CATEGORIES, EMBROIDERY_DESIGNERS } from '../../data/womenTailoringData.js';

export function CustomerDashboardPage() {
  const { user, logout } = useAuth();
  const { theme, isDark } = useTheme();
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSubmitGarmentModal, setShowSubmitGarmentModal] = useState(false);
  const {
    activeProfile,
    orders,
    wishlist,
    cart,
    savedDesigns,
    notifications,
    reviews,
    profile,
    metrics,
    paymentsList,
    recordPaymentForOrder,
    createGarmentOrder,
    addToCart,
    toggleWishlist,
    addReview,
    markNotificationRead,
    updateProfile,
    deleteSavedDesign,
    updateOrderStatusByTailor,
  } = useCustomer();

  // Active tab state: 'dashboard' | 'startOrder' | 'custom' | 'measurements' | 'designs' | 'orders' | 'tracking' | 'payments' | 'reviews' | 'notifications' | 'profile' | 'settings' | 'cart' | 'checkout' | 'payment'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Selected dress product / category for starting new tailoring order
  const [selectedCustomProduct, setSelectedCustomProduct] = useState(null);

  // Checkout flow & tracking state
  const [checkoutData, setCheckoutData] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);

  // Pay Remaining Balance Modal state
  const [payRemainingOrder, setPayRemainingOrder] = useState(null);
  const [payMethod, setPayMethod] = useState('GPay UPI');

  // Review form state
  const [newReview, setNewReview] = useState({ dressName: 'Royal Silk Saree Blouse', rating: 5, comment: '' });

  // Input ref for voice / search
  const searchInputRef = useRef(null);

  // 1. DYNAMIC CUSTOMER NAME IDENTIFICATION (AUTO-DETECTED FROM ACCOUNT RECORD)
  const customerDisplayName = useMemo(() => {
    return user?.name || profile?.name || 'Malathi Lakshmi';
  }, [user, profile]);

  // 2. USEEFFECT: Update document title & focus management
  useEffect(() => {
    document.title = `${customerDisplayName} | Digital Tailoring Assistant`;
  }, [customerDisplayName]);

  // 3. USEMEMO: 4 SPECIFIED SUMMARY METRIC CARDS CALCULATION
  const customerSummaryMetrics = useMemo(() => {
    const activeOrders = orders.filter((o) => !['Delivered', 'COMPLETED', 'Cancelled'].includes(o.status)).length;
    const readyForFitting = orders.filter((o) => ['READY FOR FITTING', 'FITTING', 'Fitting', 'Ready for Fitting'].includes(o.status)).length;
    const alterationRequests = orders.filter((o) => ['ALTERATION REQUIRED', 'ALTERATION IN PROGRESS', 'Alteration Required'].includes(o.status)).length;
    
    // Total remaining payment sum
    const totalRemainingAmount = orders.reduce((sum, o) => sum + (o.remainingAmount || 0), 0);
    const unpaidOrdersCount = orders.filter((o) => (o.remainingAmount || 0) > 0).length;

    return {
      activeOrders,
      readyForFitting,
      alterationRequests,
      totalRemainingAmount,
      unpaidOrdersCount,
    };
  }, [orders]);

  // 4. USEMEMO: Active fitting order preview if any order is at fitting trial stage
  const activeFittingOrder = useMemo(() => {
    return orders.find((o) => ['READY FOR FITTING', 'FITTING', 'Fitting', 'Ready for Fitting'].includes(o.status));
  }, [orders]);

  // 5. USEMEMO: Active in-production order for visual progress tracker
  const activeProductionOrder = useMemo(() => {
    return orders.find((o) => !['Delivered', 'COMPLETED'].includes(o.status)) || orders[0];
  }, [orders]);

  // 6. USECALLBACK: Navigation handlers
  const handleStartNewOrderCategory = useCallback((categoryName) => {
    setSelectedCustomProduct({ subcategory: categoryName, category: 'Traditional Wear' });
    setActiveTab('custom');
  }, []);

  const triggerCustomizeProduct = useCallback((product) => {
    setSelectedCustomProduct(product || null);
    setActiveTab('custom');
  }, []);

  const handleTrackOrderFromList = useCallback((order) => {
    setSelectedOrderForTracking(order);
    setActiveTab('tracking');
  }, []);

  const handleOpenPayRemaining = useCallback((order) => {
    setPayRemainingOrder(order);
  }, []);

  const handleExecutePayRemaining = useCallback(() => {
    if (!payRemainingOrder) return;
    recordPaymentForOrder(payRemainingOrder.id, payRemainingOrder.remainingAmount, payMethod);
    alert(`✓ Successfully recorded balance payment of ₹${payRemainingOrder.remainingAmount} for Order #${payRemainingOrder.id} via ${payMethod}!`);
    setPayRemainingOrder(null);
  }, [payRemainingOrder, payMethod, recordPaymentForOrder]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    addReview(newReview);
    setNewReview({ dressName: 'Royal Silk Saree Blouse', rating: 5, comment: '' });
    alert('✓ Thank you for submitting your tailoring review!');
  };

  // 17 WOMEN-ONLY CATEGORIES SPECIFIED IN REQUIREMENTS
  const WOMEN_ONLY_CATEGORIES_LIST = [
    { name: 'Saree Blouse', icon: '🥻', desc: 'Custom neck, piping & traditional fit' },
    { name: 'Designer Blouse', icon: '✨', desc: 'Aari work, cutwork, padded & deep back' },
    { name: 'Bridal Blouse', icon: '👑', desc: 'Heavy Zardosi, Swarovski stone & tassel work' },
    { name: 'Pavadai', icon: '👗', desc: 'Traditional silk skirt with contrast border' },
    { name: 'Pavadai Thavani', icon: '💃', desc: 'Classic South Indian half saree set' },
    { name: 'Half Saree', icon: '🌺', desc: 'Modern floral & Kalamkari half saree' },
    { name: 'Chudidar', icon: '🎀', desc: 'Custom top & bottom fitting with dupatta' },
    { name: 'Salwar', icon: '🌸', desc: 'Patiala salwar kameez & Punjabi suit' },
    { name: 'Anarkali', icon: '💫', desc: 'Floor-length flared Anarkali gown' },
    { name: 'Lehenga', icon: '✨', desc: 'Bridal & festive lehenga choli' },
    { name: 'Kurti', icon: '👗', desc: 'Daily wear, side-slit & A-line kurti' },
    { name: 'Gown', icon: '👑', desc: 'Indo-western & reception party gown' },
    { name: 'Frock', icon: '🎀', desc: 'Modern fit frock dress with frills' },
    { name: 'Maxi Dress', icon: '🌿', desc: 'Long relaxed cotton & georgette dress' },
    { name: 'Party Wear', icon: '💎', desc: 'Designer sequin & festive outfits' },
    { name: 'Office Wear', icon: '👜', desc: 'Formal trousers, formal kurtis & blazers' },
    { name: 'Custom Dress', icon: '✂️', desc: 'Upload your own reference or design' },
  ];

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        {/* CUSTOMER SIDEBAR NAVIGATION */}
        <aside className="dashboard-sidebar customer-sidebar" style={{ width: '270px', background: isDark ? '#1a121d' : '#ffffff', borderRight: isDark ? '1px solid #3d2b3c' : '1px solid #e8d8e5', padding: '16px' }}>
          <div className="sidebar-role-label" style={{ color: isDark ? '#ffb6c1' : '#880e4f', fontWeight: '800', fontSize: '13px', marginBottom: '14px' }}>💃 WOMEN TAILORING ASSISTANT</div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              📊 1. Dashboard
            </button>
            <button className={`nav-item highlight-btn ${activeTab === 'startOrder' ? 'active' : ''}`} onClick={() => setActiveTab('startOrder')} style={{ background: 'linear-gradient(135deg, #c2185b, #880e4f)', color: '#ffffff', fontWeight: '800' }}>
              🛍️ + Start New Order
            </button>
            <button className="nav-item highlight-btn" onClick={() => setShowSubmitGarmentModal(true)} style={{ background: 'linear-gradient(135deg, #ad1457, #6a1b9a)', color: '#ffffff', fontWeight: '800' }}>
              🏷️ + Submit Garment & QR Tag
            </button>
            <button className={`nav-item highlight-btn ${activeTab === 'aiDesigner' ? 'active' : ''}`} onClick={() => setActiveTab('aiDesigner')} style={{ background: 'linear-gradient(135deg, #d81b60, #880e4f)', color: '#ffffff', fontWeight: '800' }}>
              ✨ 2A. AI Smart Designer
            </button>
            <button className="nav-item highlight-btn" onClick={() => setShowAIAssistant(true)} style={{ background: 'linear-gradient(135deg, #e91e63, #ad1457)', color: '#ffffff', fontWeight: '800' }}>
              💬 Ask DigiTailor AI (தமிழ் / Tanglish)
            </button>
            <button className={`nav-item ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => setActiveTab('custom')}>
              🧵 2B. 2D Custom Studio
            </button>
            <button className={`nav-item ${activeTab === 'measurements' ? 'active' : ''}`} onClick={() => setActiveTab('measurements')}>
              📏 3. My Measurements
            </button>
            <button className={`nav-item ${activeTab === 'designs' ? 'active' : ''}`} onClick={() => setActiveTab('designs')}>
              🎨 4. My Saved Designs ({savedDesigns.length})
            </button>
            <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              📦 5. My Orders ({orders.length})
            </button>
            <button className={`nav-item ${activeTab === 'tracking' ? 'active' : ''}`} onClick={() => setActiveTab('tracking')}>
              🚚 6. Order Tracking
            </button>
            <button className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              💬 6B. Chat with Tailor (Real-Time)
            </button>
            <button className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
              💳 7. Payment History & Ledger
            </button>
            <button className={`nav-item ${['cart', 'checkout', 'payment'].includes(activeTab) ? 'active' : ''}`} onClick={() => setActiveTab('cart')}>
              🛒 8. Tailoring Cart ({cart.length})
            </button>
            <button className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
              ⭐ 9. Tailor Reviews
            </button>
            <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              🔔 10. Notifications ({notifications.filter((n) => !n.read).length})
            </button>
            <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              👤 11. Customer Profile
            </button>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              ⚙️ 12. Settings
            </button>
            <button className="nav-item logout-link" onClick={logout} style={{ marginTop: '16px' }}>
              🚪 Sign Out
            </button>
          </nav>
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="dashboard-main" style={{ flex: 1, padding: '24px' }}>
          {/* ===================================================================
              SECTION 1: CUSTOMER DASHBOARD HOME
             =================================================================== */}
          {activeTab === 'dashboard' && (
            <>
              {/* HEADER WITH DYNAMIC CUSTOMER NAME */}
              <section className="welcome-banner customer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <span className="banner-eyebrow">PERSONAL TAILORING ASSISTANT</span>
                  <h1 style={{ fontSize: '28px', margin: '4px 0 6px' }}>Welcome, {customerDisplayName} 👋</h1>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', opacity: 0.9 }}>Customer Dashboard</p>
                </div>
                <div>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => setActiveTab('startOrder')}
                    style={{
                      background: '#fff',
                      color: '#ad1457',
                      border: 'none',
                      padding: '14px 24px',
                      borderRadius: '14px',
                      fontWeight: '800',
                      fontSize: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    }}
                  >
                    🛍️ + Start New Tailoring Order
                  </button>
                </div>
              </section>

              {/* 4 SUMMARY METRIC CARDS REQUIRED BY SPECIFICATION */}
              <div className="metrics-grid four-columns" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {/* 1. ACTIVE ORDERS */}
                <div className="metric-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer', background: '#fff', border: '1px solid #f8bbd0', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="metric-title" style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>Active Orders</span>
                    <span style={{ fontSize: '20px' }}>📦</span>
                  </div>
                  <span className="metric-value" style={{ fontSize: '28px', fontWeight: '800', color: '#880e4f', display: 'block', margin: '8px 0 2px' }}>
                    {customerSummaryMetrics.activeOrders}
                  </span>
                  <span className="metric-sub" style={{ fontSize: '12px', color: '#888' }}>In production & fitting</span>
                </div>

                {/* 2. READY FOR FITTING */}
                <div className="metric-card" onClick={() => setActiveTab('tracking')} style={{ cursor: 'pointer', background: '#fff', border: '1px solid #f8bbd0', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="metric-title" style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>Ready for Fitting</span>
                    <span style={{ fontSize: '20px' }}>👗</span>
                  </div>
                  <span className="metric-value" style={{ fontSize: '28px', fontWeight: '800', color: '#d81b60', display: 'block', margin: '8px 0 2px' }}>
                    {customerSummaryMetrics.readyForFitting}
                  </span>
                  <span className="metric-sub" style={{ fontSize: '12px', color: '#888' }}>Trial session scheduled</span>
                </div>

                {/* 3. ALTERATION REQUESTS */}
                <div className="metric-card" onClick={() => setActiveTab('tracking')} style={{ cursor: 'pointer', background: '#fff', border: '1px solid #f8bbd0', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="metric-title" style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>Alteration Requests</span>
                    <span style={{ fontSize: '20px' }}>✏️</span>
                  </div>
                  <span className="metric-value" style={{ fontSize: '28px', fontWeight: '800', color: '#c62828', display: 'block', margin: '8px 0 2px' }}>
                    {customerSummaryMetrics.alterationRequests}
                  </span>
                  <span className="metric-sub" style={{ fontSize: '12px', color: '#888' }}>Fit refinements in shop</span>
                </div>

                {/* 4. REMAINING PAYMENT */}
                <div className="metric-card" onClick={() => setActiveTab('payments')} style={{ cursor: 'pointer', background: '#fff', border: '1px solid #f8bbd0', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="metric-title" style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>Remaining Payment</span>
                    <span style={{ fontSize: '20px' }}>💰</span>
                  </div>
                  <span className="metric-value" style={{ fontSize: '28px', fontWeight: '800', color: '#2e7d32', display: 'block', margin: '8px 0 2px' }}>
                    ₹{customerSummaryMetrics.totalRemainingAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="metric-sub" style={{ fontSize: '12px', color: '#888' }}>{customerSummaryMetrics.unpaidOrdersCount} balance order(s)</span>
                </div>
              </div>

              {/* UPCOMING FITTING SESSION HIGHLIGHT CARD (IF FITTING SCHEDULED) */}
              {activeFittingOrder && (
                <div className="content-card" style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e9 100%)', border: '2px solid #d81b60', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ background: '#d81b60', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                        👗 FITTING TRIAL SESSION READY
                      </span>
                      <h3 style={{ color: '#880e4f', margin: '8px 0 4px' }}>
                        Order #{activeFittingOrder.id} — {activeFittingOrder.dressType || 'Designer Outfit'}
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                        Master Tailor: <b>{activeFittingOrder.tailorAssigned || 'Master Rajesh Tailor'}</b> • Location: <b>Digital Tailoring Workshop Counter</b>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          updateOrderStatusByTailor(activeFittingOrder.id, 'Fitting Approved');
                          alert(`✓ Fitting Approved for Order #${activeFittingOrder.id}! Sent for final pressing and delivery.`);
                        }}
                        style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        ✓ Fitting Approved
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderForTracking(activeFittingOrder);
                          setActiveTab('tracking');
                        }}
                        style={{ border: '1px solid #ad1457', background: '#fff', color: '#ad1457', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        🔧 Request Alteration
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CURRENT TAILORING PROGRESS & PRODUCTION TRACKER SUMMARY */}
              {activeProductionOrder && (
                <div className="content-card" style={{ marginBottom: '24px' }}>
                  <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ color: '#880e4f', margin: '0 0 4px' }}>🧵 Current Tailoring Progress (Active Order #{activeProductionOrder.id})</h3>
                      <p className="subtitle" style={{ margin: 0 }}>Outfit: <b>{activeProductionOrder.dressType || 'Bespoke Garment'}</b> • Assigned Tailor: <b>{activeProductionOrder.tailorAssigned}</b></p>
                    </div>
                    <button className="link-btn" onClick={() => handleTrackOrderFromList(activeProductionOrder)}>
                      View Full 14-Stage Tracker →
                    </button>
                  </div>

                  <div style={{ background: '#fff0f5', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <img
                      src={activeProductionOrder.referenceImage || activeProductionOrder.items?.[0]?.imgUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'}
                      alt="Product"
                      style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '10px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ background: '#880e4f', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                          Current Stage: {activeProductionOrder.status || 'CUTTING'}
                        </span>
                        {activeProductionOrder.ownFabric && <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>🧵 Customer Fabric Received</span>}
                      </div>
                      <h4 style={{ margin: '0 0 4px', color: '#333' }}>{activeProductionOrder.items?.[0]?.name || activeProductionOrder.dressType}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                        Estimated Completion: <b style={{ color: '#ad1457' }}>{activeProductionOrder.deliveryEstimate || 'Mon, Sep 08'}</b>
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px' }}>Total: <b>₹{activeProductionOrder.total}</b></div>
                      <div style={{ fontSize: '13px' }}>Paid: <b style={{ color: '#2e7d32' }}>₹{activeProductionOrder.paidAmount || activeProductionOrder.total}</b></div>
                      <div style={{ fontSize: '13px' }}>Remaining: <b style={{ color: '#c62828' }}>₹{activeProductionOrder.remainingAmount || 0}</b></div>
                      {(activeProductionOrder.remainingAmount && activeProductionOrder.remainingAmount > 0) ? (
                        <button onClick={() => handleOpenPayRemaining(activeProductionOrder)} style={{ marginTop: '6px', background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                          💰 Pay Remaining ₹{activeProductionOrder.remainingAmount}
                        </button>
                      ) : (
                        <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '12px', display: 'block', marginTop: '6px' }}>✓ FULLY PAID</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* RECENT ORDERS TABLE */}
              <div className="content-card" style={{ marginBottom: '24px' }}>
                <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3>📦 Recent Tailoring Orders Overview</h3>
                  <button className="link-btn" onClick={() => setActiveTab('orders')}>View All Orders ({orders.length}) →</button>
                </div>

                <div className="recent-orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '14px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <img src={order.referenceImage || order.items?.[0]?.imgUrl || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format'} alt={order.id} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <b>#{order.id}</b>
                          <span style={{ background: '#880e4f', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>
                            {order.dressType || 'Bespoke Dress'}
                          </span>
                        </div>
                        <h4 style={{ margin: '4px 0 2px' }}>{order.items?.[0]?.name || order.dressType}</h4>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <span>Date: {order.date}</span> • <span>Tailor: <b>{order.tailorAssigned}</b></span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '140px' }}>
                        <div>Total: <b>₹{order.total}</b></div>
                        <div>Paid: <b style={{ color: '#2e7d32' }}>₹{order.paidAmount || order.total}</b></div>
                        <div>Rem: <b style={{ color: '#c62828' }}>₹{order.remainingAmount || 0}</b></div>
                      </div>

                      <div>
                        <button className="primary-btn-sm" onClick={() => handleTrackOrderFromList(order)} style={{ background: '#ad1457', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Track Order →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SAVED DESIGNS GALLERY PREVIEW */}
              <div className="content-card">
                <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3>🎨 Saved Custom Designs ({savedDesigns.length})</h3>
                  <button className="link-btn" onClick={() => setActiveTab('designs')}>View All Saved Designs →</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {savedDesigns.slice(0, 3).map((des) => (
                    <div key={des.id} style={{ background: '#fff0f5', padding: '14px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                      <h4 style={{ color: '#880e4f', margin: '0 0 4px' }}>{des.title}</h4>
                      <p style={{ fontSize: '12px', color: '#555', margin: '0 0 10px' }}>
                        Fabric: {des.details?.fabric} • Neck: {des.details?.neck} • Sleeve: {des.details?.sleeve}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomProduct({ subcategory: des.details?.dressType || 'Designer Blouse', category: 'Traditional Wear' });
                          setActiveTab('custom');
                        }}
                        style={{ width: '100%', background: '#ad1457', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        🔄 Reuse Design for Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ===================================================================
              SECTION 2: START NEW TAILORING ORDER (17 WOMEN-ONLY CATEGORIES)
             =================================================================== */}
          {activeTab === 'startOrder' && (
            <div className="content-card">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ background: '#fce4ec', color: '#ad1457', padding: '4px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                  💃 BESPOKE WOMEN'S DIGITAL TAILORING SHOP
                </span>
                <h1 style={{ color: '#880e4f', fontSize: '30px', margin: '8px 0 6px' }}>
                  What would you like us to stitch?
                </h1>
                <p style={{ color: '#666', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
                  Select your dress category below to start specifying your fabric, uploading reference designs, and entering dress-specific measurements.
                </p>
              </div>

              {/* 17 WOMEN-ONLY CATEGORIES GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {WOMEN_ONLY_CATEGORIES_LIST.map((cat) => (
                  <div
                    key={cat.name}
                    className="category-select-card"
                    onClick={() => handleStartNewOrderCategory(cat.name)}
                    style={{
                      background: '#fff',
                      border: '1px solid #f8bbd0',
                      borderRadius: '14px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{cat.icon}</div>
                    <h3 style={{ color: '#880e4f', margin: '0 0 4px', fontSize: '18px' }}>{cat.name}</h3>
                    <p style={{ color: '#666', fontSize: '12px', margin: '0 0 12px', minHeight: '32px' }}>{cat.desc}</p>
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        background: '#ad1457',
                        color: '#fff',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Stitch {cat.name} →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'aiDesigner' && (
            <AIDressDesignerStudio
              onCompleteToOrder={async (designData) => {
                const seqNum = Math.floor(1000 + Math.random() * 9000);
                const orderId = `ORD-${seqNum}`;
                const qrIdentifier = `QR-${orderId}`;
                const refImg = designData.referenceImage || designData.fabricImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop';

                const newOrderData = {
                  orderId,
                  qrIdentifier,
                  customerName: customerDisplayName,
                  customerPhone: profile?.phone || user?.phone || '+91 98765 43210',
                  dressType: designData.dressType || 'Designer Blouse',
                  dressColour: 'Royal Blue & Gold Zari',
                  dressImage: refImg,
                  referenceImage: refImg,
                  rackLocation: 'Rack A - Box 03',
                  measurements: activeProfile?.values || {},
                  specialInstructions: `AI Smart Designer Request: Neck (${designData.customization?.neck || 'V Neck'}), Sleeve (${designData.customization?.sleeve || 'Puff Sleeve'}), Embroidery (${designData.customization?.embroidery || 'Aari Work'}). ${designData.specialInstructions || ''}`,
                  totalAmount: designData.priceBreakdown?.estimatedTotal || 3250,
                  paidAmount: designData.priceBreakdown?.estimatedTotal || 3250,
                  status: 'Received',
                  assignedTailor: 'Master Rajesh Tailor',
                };

                const created = await createGarmentOrder(newOrderData);
                alert(`🎉 SUCCESS! Your AI Smart Design (${designData.dressType}) has been converted into an official order and added to My Orders!`);
                setSelectedOrderForTracking(created || newOrderData);
                setActiveTab('orders');
              }}
              onOpenChatWithTailor={() => setActiveTab('chat')}
            />
          )}

          {/* ===================================================================
              SECTION 3 - 8: CUSTOM DESIGN STUDIO (FABRIC, DESIGN, MEASUREMENTS, EMBROIDERY, PRICING)
             =================================================================== */}
          {activeTab === 'custom' && <CustomDesignStudio selectedProduct={selectedCustomProduct} />}

          {/* ===================================================================
              SECTION 5 & 16: SMART DRESS-SPECIFIC MEASUREMENTS MANAGER
             =================================================================== */}
          {activeTab === 'measurements' && <MeasurementManager onNavigateTab={(tab) => setActiveTab(tab)} />}

          {/* ===================================================================
              SECTION 15: MY SAVED DESIGNS GALLERY
             =================================================================== */}
          {activeTab === 'designs' && (
            <div className="content-card">
              <h2>🎨 My Saved Custom Designs ({savedDesigns.length})</h2>
              <p className="subtitle">Saved blouse patterns, neck designs, sleeve styles, and reference inspirations.</p>

              {savedDesigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: isDark ? '#261b29' : '#fff5f8', borderRadius: '16px', border: '1px dashed #f8bbd0', marginTop: '16px' }}>
                  <div style={{ fontSize: '42px', marginBottom: '12px' }}>🎨</div>
                  <h3 style={{ color: '#880e4f', margin: '0 0 8px' }}>No saved designs yet!</h3>
                  <p style={{ color: '#666', fontSize: '14px', maxWidth: '500px', margin: '0 auto 20px' }}>
                    You can customize neck styles, sleeve patterns, colors, and Aari embroidery in our Custom Studio or AI Designer and click <b>'💾 Save Design to My Profile'</b>!
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('custom')}
                      style={{
                        background: 'linear-gradient(135deg, #ad1457, #880e4f)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(173, 20, 87, 0.25)',
                      }}
                    >
                      🧵 Open 2B. 2D Custom Studio
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('aiDesigner')}
                      style={{
                        background: 'linear-gradient(135deg, #7b1fa2, #4a148c)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(123, 31, 162, 0.25)',
                      }}
                    >
                      ✨ Open 2A. AI Smart Designer
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  {savedDesigns.map((des) => (
                    <div key={des.id} className="content-card" style={{ padding: '18px', borderRadius: '14px', border: '1px solid #f8bbd0', background: '#fff0f5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ color: '#880e4f', margin: 0 }}>{des.title}</h3>
                        <button onClick={() => deleteSavedDesign(des.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#c62828', fontWeight: 'bold' }}>✕ Delete</button>
                      </div>
                      <p style={{ fontSize: '12px', color: '#555', margin: '4px 0 12px' }}>
                        Saved on: {des.date} • Fabric: {des.details?.fabric} • Color: {des.details?.color}
                      </p>
                      <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px' }}>
                        <div><b>Neck:</b> {des.details?.neck}</div>
                        <div><b>Sleeve:</b> {des.details?.sleeve}</div>
                        <div><b>Embroidery:</b> {des.details?.embroidery || 'Aari Work'}</div>
                      </div>
                      <button
                        type="button"
                        className="primary-btn full"
                        onClick={() => {
                          setSelectedCustomProduct({ subcategory: des.details?.dressType || 'Designer Blouse', category: 'Traditional Wear' });
                          setActiveTab('custom');
                        }}
                        style={{ background: '#ad1457', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}
                      >
                        🔄 Reuse This Design For New Order
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              SECTION 17: MY ORDERS LIST
             =================================================================== */}
          {activeTab === 'orders' && <OrdersListView onTrackOrder={handleTrackOrderFromList} />}

          {/* ===================================================================
              SECTION 10 & 11 & 14: REAL TAILORING ORDER TRACKING & FITTING
             =================================================================== */}
          {activeTab === 'tracking' && (
            <OrderTrackingView
              targetOrder={selectedOrderForTracking}
              onBackToOrders={() => setActiveTab('orders')}
            />
          )}

          {activeTab === 'chat' && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ color: '#880e4f', margin: 0 }}>💬 Live Atelier Chat with Master Tailor</h2>
                  <p className="subtitle" style={{ margin: '4px 0 0' }}>Bi-directional Socket.IO communication with design attachment support.</p>
                </div>
              </div>
              <OrderChatWidget
                orderId={selectedOrderForTracking?.id || activeProductionOrder?.id || 'DT1025'}
                tailorName={activeProductionOrder?.tailorAssigned || 'Master Rajesh Tailor'}
                customerName={customerDisplayName}
              />
            </div>
          )}

          {/* ===================================================================
              SECTION 12 & 13: PAYMENT HISTORY & PARTIAL PAYMENT LEDGER
             =================================================================== */}
          {activeTab === 'payments' && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2>💳 Payment History & Partial Balance Ledger</h2>
                  <p className="subtitle">Audit log of all advance payments, balance clearance transactions, and payment methods.</p>
                </div>
              </div>

              {/* PAYMENT LEDGER TABLE */}
              <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <thead>
                  <tr style={{ background: '#f8bbd0', color: '#880e4f', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Transaction ID</th>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Type</th>
                    <th>Amount Paid</th>
                    <th>Remaining Balance</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(paymentsList || []).map((pay) => (
                    <tr key={pay.txnId || pay.id || Math.random()} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}><b>{pay.txnId || 'TXN-908123'}</b></td>
                      <td><b>#{pay.orderId}</b></td>
                      <td>{pay.date}</td>
                      <td><b>{pay.method || 'GPay UPI'}</b></td>
                      <td><span style={{ background: '#fce4ec', color: '#ad1457', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>{pay.type || 'ADVANCE PAYMENT'}</span></td>
                      <td><span style={{ color: '#2e7d32', fontWeight: 'bold' }}>₹{pay.amountPaid}</span></td>
                      <td><span style={{ color: '#c62828', fontWeight: 'bold' }}>₹{pay.remaining || 0}</span></td>
                      <td>
                        <span className={`status-pill ${pay.status === 'FULLY PAID' ? 'completed' : 'pending'}`}>
                          {pay.status || 'PARTIALLY PAID'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===================================================================
              SECTION 9: TAILORING CART, CHECKOUT & PAYMENT VIEWS
             =================================================================== */}
          {activeTab === 'cart' && (
            <CartView
              onProceedToCheckout={() => {
                setActiveTab('checkout');
              }}
            />
          )}

          {activeTab === 'checkout' && (
            <CheckoutView
              onProceedToPayment={(data) => {
                setCheckoutData(data);
                setActiveTab('payment');
              }}
              onBackToCart={() => setActiveTab('cart')}
            />
          )}

          {activeTab === 'payment' && (
            <PaymentView
              checkoutData={checkoutData || { customerDetails: profile, shippingAddress: profile }}
              onOrderConfirmed={(order) => {
                setConfirmedOrder(order);
              }}
              onBackToCheckout={() => setActiveTab('checkout')}
            />
          )}

          {/* ===================================================================
              SECTION 9: TAILOR REVIEWS
             =================================================================== */}
          {activeTab === 'reviews' && (
            <div className="content-card">
              <h2>⭐ Tailor Reviews & Feedback</h2>
              <form onSubmit={handleReviewSubmit} className="review-form">
                <h3>Leave a Tailoring Review</h3>
                <div className="form-group">
                  <label>Outfit Name</label>
                  <input
                    type="text"
                    value={newReview.dressName}
                    onChange={(e) => setNewReview({ ...newReview, dressName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rating (1 to 5 Stars)</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Perfect Fit)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars - Great Stitching)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comments / Feedback</label>
                  <textarea
                    placeholder="Describe fitting, stitching quality, and finish..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="primary-btn">
                  Submit Tailor Feedback
                </button>
              </form>

              <div className="reviews-list" style={{ marginTop: '30px' }}>
                <h3>Customer Feedback ({reviews.length})</h3>
                {reviews.map((r) => (
                  <div className="review-item" key={r.id}>
                    <div className="review-head">
                      <b>{r.dressName}</b>
                      <span>{'⭐'.repeat(r.rating)}</span>
                    </div>
                    <p>{r.comment}</p>
                    <small>{r.date}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="content-card">
              <h2>🔔 Notifications Center</h2>
              <div className="notifications-list">
                {notifications.map((n) => (
                  <div className={`notification-item ${!n.read ? 'unread' : ''}`} key={n.id} onClick={() => markNotificationRead(n.id)}>
                    <div className="notif-header">
                      <b>{n.title}</b>
                      <span>{n.date}</span>
                    </div>
                    <p>{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              SECTION 18: CUSTOMER PROFILE HUB
             =================================================================== */}
          {activeTab === 'profile' && (
            <div className="customer-profile-hub-container">
              <div className="content-card" style={{ marginBottom: '20px' }}>
                <h2>👤 Smart Customer Profile & Preferences Hub</h2>
                <p className="subtitle">Personalized summary of your recorded fit profiles, custom studio designs, tailoring orders, wishlist, and preferred master tailors.</p>
                
                {/* ACCOUNT IDENTIFICATION BADGE CARD */}
                <div className="account-details-card" style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #fff 100%)', padding: '16px 20px', borderRadius: '12px', marginTop: '16px', border: '1px solid #f8bbd0', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#880e4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>
                    {customerDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#880e4f', fontWeight: 'bold' }}>ACCOUNT IDENTIFICATION</div>
                    <h3 style={{ margin: '2px 0 6px', color: '#333' }}>Name: {customerDisplayName}</h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', flexWrap: 'wrap' }}>
                      <span>🆔 <b>User ID:</b> {user?.username || user?.id || '24104102'}</span>
                      <span>👑 <b>Role:</b> {user?.role || 'Customer'}</span>
                      <span>📧 <b>Email:</b> {user?.email || profile.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-hub-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {/* 1. Saved Measurements */}
                <div className="content-card">
                  <h3>📏 Saved Measurements</h3>
                  <div className="hub-info-box">
                    <b>Active: {activeProfile?.name}</b>
                    <p>Bust: {activeProfile?.values?.bust}" • Waist: {activeProfile?.values?.waist}" • Hip: {activeProfile?.values?.hip}"</p>
                    <button className="primary-btn-sm" onClick={() => setActiveTab('measurements')}>Manage Measurements →</button>
                  </div>
                </div>

                {/* 2. Saved Designs */}
                <div className="content-card">
                  <h3>🎨 Saved Custom Designs ({savedDesigns.length})</h3>
                  <div className="hub-info-box">
                    <b>{savedDesigns[0]?.title || 'No saved designs'}</b>
                    <p>{savedDesigns[0] ? `Fabric: ${savedDesigns[0].details?.fabric} • Neck: ${savedDesigns[0].details?.neckStyle}` : 'Use Custom Studio to save designs.'}</p>
                    <button className="primary-btn-sm" onClick={() => setActiveTab('custom')}>Go to Custom Studio →</button>
                  </div>
                </div>
              </div>

              <div className="content-card" style={{ marginTop: '20px' }}>
                <h3>Contact & Fitting Address</h3>
                <div className="profile-form-box">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={user?.name || profile.name} onChange={(e) => updateProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" value={user?.phone || profile.phone} onChange={(e) => updateProfile({ ...profile, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={user?.email || profile.email} onChange={(e) => updateProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Shipping / Fitting Address</label>
                    <textarea value={profile.address} onChange={(e) => updateProfile({ ...profile, address: e.target.value })} />
                  </div>
                  <button className="primary-btn" onClick={() => alert('✓ Profile updated successfully!')}>
                    Save Profile Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="content-card">
              <h2>⚙️ Customer Application Preferences</h2>
              <p>Configure theme mode, notifications, and language settings.</p>
              <div className="settings-options-list">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Receive Order Status Notifications (SMS & WhatsApp)</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Measurement Reminder Alerts</span>
                </label>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PAY REMAINING BALANCE MODAL */}
      {payRemainingOrder && (
        <div className="modal-backdrop" onClick={() => setPayRemainingOrder(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#880e4f', margin: 0 }}>💰 Pay Remaining Order Balance</h3>
              <button onClick={() => setPayRemainingOrder(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>✕</button>
            </div>

            <div style={{ background: '#fff0f5', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#555' }}>Order ID: <b>#{payRemainingOrder.id}</b></div>
              <div style={{ fontSize: '13px', color: '#555' }}>Dress Type: <b>{payRemainingOrder.dressType}</b></div>
              <div style={{ fontSize: '13px', color: '#555' }}>Total Price Quote: <b>₹{payRemainingOrder.total}</b></div>
              <div style={{ fontSize: '13px', color: '#2e7d32' }}>Previously Paid: <b>₹{payRemainingOrder.paidAmount || 0}</b></div>
              <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #f8bbd0' }} />
              <div style={{ fontSize: '16px', color: '#ad1457', fontWeight: 'bold' }}>
                Remaining Balance to Pay: ₹{payRemainingOrder.remainingAmount}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>Select Payment Method:</label>
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="GPay UPI">Google Pay (GPay UPI)</option>
                <option value="PhonePe UPI">PhonePe UPI</option>
                <option value="Paytm QR">Paytm QR Code</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Cash at Shop Counter">Cash at Shop Counter</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="secondary-btn" onClick={() => setPayRemainingOrder(null)}>Cancel</button>
              <button type="button" className="primary-btn" onClick={handleExecutePayRemaining} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
                Pay ₹{payRemainingOrder.remainingAmount} Now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER CONFIRMATION MODAL */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrackOrder={() => {
            setSelectedOrderForTracking(confirmedOrder);
            setConfirmedOrder(null);
            setActiveTab('tracking');
          }}
        />
      )}

      {/* REALISTIC AI TAILORING ASSISTANT MODAL & FLOATING WIDGET */}
      <AITailoringAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onOpenHumanChat={() => {
          setShowAIAssistant(false);
          setActiveTab('chat');
        }}
        onNavigateTab={(tab) => {
          setShowAIAssistant(false);
          setActiveTab(tab);
        }}
      />

      {/* SUBMIT GARMENT & GENERATE QR MODAL */}
      {showSubmitGarmentModal && (
        <SubmitGarmentModal
          onClose={() => setShowSubmitGarmentModal(false)}
          onGarmentSubmitted={(newOrd) => {
            setSelectedOrderForTracking(newOrd);
          }}
        />
      )}
    </div>
  );
}
