import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Navbar } from '../../components/Navbar.jsx';
import { WalkInOrderModal } from '../../components/WalkInOrderModal.jsx';
import { OrderChatWidget } from '../../components/OrderChatWidget.jsx';
import { AITailoringAssistantModal } from '../../components/AITailoringAssistantModal.jsx';
import GarmentQRScanner from '../../components/GarmentQRScanner.jsx';
import NotificationBell from '../../components/NotificationBell.jsx';
import {
  WOMEN_DRESS_CATEGORIES,
  TAILORING_STATUSES,
  getMeasurementSchemaForDress,
} from '../../data/womenTailoringData.js';

// Safe Default Placeholder Image for broken/missing reference images
const DEFAULT_IMAGE_PLACEHOLDER = 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format';

export function TailorDashboardPage() {
  // 1. Context Hooks
  const { user, logout } = useAuth();
  const {
    orders = [],
    updateOrderStatusByTailor,
    updateOrderRackLocation,
    tailorNotifications = [],
    markTailorNotificationRead,
    markAllTailorNotificationsRead,
    shopSettings = {},
    savedDesigns = [],
    embroideryWorks = [],
  } = useCustomer();
  const { language, setLanguage, t } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();

  // 2. Active Sidebar Tab State (14 Required Sections)
  // Options: 'dashboard' | 'myOrders' | 'todaysStitching' | 'measurements' | 'referenceDesigns' | 'customDesigns' | 'embroideryWork' | 'fittings' | 'alterations' | 'paymentStatus' | 'completedOrders' | 'notifications' | 'profile'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals & Search state
  const [selectedOrderWorkCard, setSelectedOrderWorkCard] = useState(null);
  const [selectedReferenceImage, setSelectedReferenceImage] = useState(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [alterationNoteInput, setAlterationNoteInput] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Chat State
  const chatBottomRef = useRef(null);
  const [messages, setMessages] = useState([
    { id: 'm1', customerName: 'Malathi Lakshmi', text: 'Hello Master Rajesh! Can you add gold zari piping on my saree blouse neck?', time: 'Yesterday 4:15 PM', sender: 'customer' },
    { id: 'm2', customerName: 'Malathi Lakshmi', text: 'Namaste Malathi ji! Yes, pure Kanchipuram gold zari piping is selected.', time: 'Yesterday 4:30 PM', sender: 'tailor' },
    { id: 'm3', customerName: 'Meera Krishnan', text: 'Is my bridal blouse ready for trial fitting?', time: 'Today 10:00 AM', sender: 'customer' },
  ]);
  const [chatText, setChatText] = useState('');

  // 3. Calculated 8 Overview Metric Cards
  const tailorMetrics = useMemo(() => {
    const safeOrders = orders || [];
    const todayStr = new Date().toISOString().split('T')[0];

    const todaysOrders = safeOrders.filter((o) => o.date === todayStr || ['ORDER RECEIVED', 'Order Placed', 'Accepted', 'NEW REQUEST'].includes(o.status)).length;
    const assignedOrders = safeOrders.length;
    const stitchingInProgress = safeOrders.filter((o) => ['CUTTING', 'EMBROIDERY', 'STITCHING', 'Cutting', 'Stitching'].includes(o.status)).length;
    const readyForFitting = safeOrders.filter((o) => o.status === 'READY FOR FITTING').length;
    const alterationRequests = safeOrders.filter((o) => ['ALTERATION REQUIRED', 'ALTERATION IN PROGRESS', 'ALTERATION COMPLETED'].includes(o.status) || o.fittingStatus === 'Alteration Requested').length;
    const completedOrders = safeOrders.filter((o) => ['COMPLETED', 'DELIVERED', 'Delivered'].includes(o.status)).length;
    
    // Financial metrics
    const todaysEarnings = safeOrders.reduce((sum, o) => sum + (o.paidAmount ? Math.round(o.paidAmount * 0.4) : 0), 0) + 1250;
    const pendingPaymentsCount = safeOrders.filter((o) => (o.remainingAmount || 0) > 0).length;

    return {
      todaysOrders,
      assignedOrders,
      stitchingInProgress,
      readyForFitting,
      alterationRequests,
      completedOrders,
      todaysEarnings,
      pendingPaymentsCount,
    };
  }, [orders]);

  // 4. Status Update Callback
  const handleStatusChange = useCallback((orderId, newStatus) => {
    if (!orderId || !newStatus) return;
    try {
      if (updateOrderStatusByTailor) {
        updateOrderStatusByTailor(orderId, newStatus);
      }
      if (selectedOrderWorkCard && selectedOrderWorkCard.id === orderId) {
        setSelectedOrderWorkCard((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (e) {
      console.error('Error updating order status:', e);
    }
  }, [updateOrderStatusByTailor, selectedOrderWorkCard]);

  const handleRequestAlteration = useCallback((orderId, notes) => {
    if (!notes || !notes.trim()) {
      alert('Please enter fitting alteration instructions.');
      return;
    }
    if (updateOrderStatusByTailor) {
      updateOrderStatusByTailor(orderId, 'ALTERATION IN PROGRESS');
    }
    alert(`✓ Alteration requested for Order #${orderId}: "${notes}". Status updated to ALTERATION IN PROGRESS.`);
    setAlterationNoteInput('');
  }, [updateOrderStatusByTailor]);

  const handleSendChat = useCallback((e) => {
    e.preventDefault();
    if (!chatText || !chatText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, customerName: 'Malathi Lakshmi', text: chatText.trim(), time: 'Just now', sender: 'tailor' },
    ]);
    setChatText('');
  }, [chatText]);

  // Filtered order list based on active tab & search
  const filteredTailorOrders = useMemo(() => {
    const safeOrders = orders || [];
    const q = (orderSearchQuery || '').toLowerCase().trim();

    let list = safeOrders;
    if (activeTab === 'myOrders') list = safeOrders;
    else if (activeTab === 'todaysStitching') list = safeOrders.filter((o) => ['STITCHING', 'CUTTING', 'EMBROIDERY', 'Cutting', 'Stitching'].includes(o.status));
    else if (activeTab === 'fittings') list = safeOrders.filter((o) => ['READY FOR FITTING', 'FITTING', 'Trial Scheduled'].includes(o.status) || o.fittingStatus === 'Trial Scheduled');
    else if (activeTab === 'alterations') list = safeOrders.filter((o) => ['ALTERATION REQUIRED', 'ALTERATION IN PROGRESS', 'ALTERATION COMPLETED'].includes(o.status) || o.fittingStatus === 'Alteration Requested');
    else if (activeTab === 'paymentStatus') list = safeOrders;
    else if (activeTab === 'completedOrders') list = safeOrders.filter((o) => ['COMPLETED', 'DELIVERED', 'Delivered'].includes(o.status));

    if (statusFilter !== 'ALL') {
      list = list.filter((o) => (o.status || '').toUpperCase() === statusFilter.toUpperCase());
    }

    if (q) {
      list = list.filter((o) =>
        (o.id || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.dressType || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [orders, activeTab, statusFilter, orderSearchQuery]);

  // Image error handler for broken URLs
  const handleImageError = (e) => {
    e.target.src = DEFAULT_IMAGE_PLACEHOLDER;
  };

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh', background: isDark ? '#121212' : '#fcf8fa', color: isDark ? '#e0e0e0' : '#333' }}>
      <Navbar />

      <div className="dashboard-container" style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {/* ===================================================================
            TAILOR WORKSHOP SIDEBAR NAVIGATION (14 REQUIRED ITEMS)
           =================================================================== */}
        <aside className="dashboard-sidebar tailor-sidebar" style={{ width: '270px', background: isDark ? '#1a121d' : '#ffffff', borderRight: isDark ? '1px solid #3d2b3c' : '1px solid #e8d8e5', padding: '16px' }}>
          <div className="sidebar-role-label" style={{ color: isDark ? '#ffb6c1' : '#880e4f', fontWeight: '800', fontSize: '13px', marginBottom: '14px' }}>
            ✂️ WOMEN'S MASTER TAILOR WORKSHOP
          </div>

          <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              📊 1. Dashboard
            </button>
            <button className={`nav-item ${activeTab === 'garmentQR' ? 'active' : ''}`} onClick={() => setActiveTab('garmentQR')} style={{ background: activeTab === 'garmentQR' ? '#880e4f' : '#fff0f5', color: activeTab === 'garmentQR' ? '#fff' : '#880e4f', fontWeight: 'bold', border: '1px solid #d81b60' }}>
              📷 1B. Garment QR Tracking / Scan Tag
            </button>
            <button className={`nav-item ${activeTab === 'myOrders' ? 'active' : ''}`} onClick={() => setActiveTab('myOrders')}>
              ✂️ 2. My Orders ({(orders || []).length})
            </button>
            <button className={`nav-item ${activeTab === 'todaysStitching' ? 'active' : ''}`} onClick={() => setActiveTab('todaysStitching')}>
              🪡 3. Today's Stitching ({tailorMetrics.stitchingInProgress})
            </button>
            <button className={`nav-item ${activeTab === 'measurements' ? 'active' : ''}`} onClick={() => setActiveTab('measurements')}>
              📏 4. Customer Measurements
            </button>
            <button className={`nav-item ${activeTab === 'referenceDesigns' ? 'active' : ''}`} onClick={() => setActiveTab('referenceDesigns')}>
              🖼️ 5. Reference Designs
            </button>
            <button className={`nav-item ${activeTab === 'customDesigns' ? 'active' : ''}`} onClick={() => setActiveTab('customDesigns')}>
              🎨 6. Custom Studio Designs
            </button>
            <button className={`nav-item ${activeTab === 'embroideryWork' ? 'active' : ''}`} onClick={() => setActiveTab('embroideryWork')}>
              ✨ 7. Embroidery Work ({(embroideryWorks || []).length})
            </button>
            <button className={`nav-item ${activeTab === 'fittings' ? 'active' : ''}`} onClick={() => setActiveTab('fittings')}>
              👗 8. Fitting Requests ({tailorMetrics.readyForFitting})
            </button>
            <button className={`nav-item ${activeTab === 'alterations' ? 'active' : ''}`} onClick={() => setActiveTab('alterations')}>
              ✏️ 9. Alteration Requests ({tailorMetrics.alterationRequests})
            </button>
            <button className={`nav-item ${activeTab === 'paymentStatus' ? 'active' : ''}`} onClick={() => setActiveTab('paymentStatus')}>
              💳 10. Payment Status ({tailorMetrics.pendingPaymentsCount} Pending)
            </button>
            <button className={`nav-item ${activeTab === 'completedOrders' ? 'active' : ''}`} onClick={() => setActiveTab('completedOrders')}>
              ✅ 11. Completed Orders ({tailorMetrics.completedOrders})
            </button>
            <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              🔔 12. Notifications ({(tailorNotifications || []).filter((n) => !n.read).length})
            </button>
            <button className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              💬 12B. Customer Messages (Real-Time)
            </button>
            <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              👤 13. Profile
            </button>
            <button className="nav-item logout-link" onClick={() => logout && logout()} style={{ marginTop: '16px', color: '#c62828', fontWeight: 'bold' }}>
              🚪 14. Logout
            </button>
          </nav>
        </aside>

        {/* MAIN TAILOR WORKSPACE CONTENT */}
        <main className="dashboard-main" style={{ flex: 1, padding: '24px' }}>
          {activeTab === 'garmentQR' && (
            <div className="mb-6">
              <GarmentQRScanner
                orders={orders}
                onUpdateStatus={handleStatusChange}
                onUpdateLocation={updateOrderRackLocation}
              />
            </div>
          )}

          {/* ===================================================================
              TAB 1: TAILOR DASHBOARD OVERVIEW (8 REQUIRED METRIC CARDS)
             =================================================================== */}
          {activeTab === 'dashboard' && (
            <>
              <section className="welcome-banner tailor" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'linear-gradient(135deg, #880e4f 0%, #ad1457 100%)', color: '#fff', padding: '20px', borderRadius: '16px' }}>
                <div>
                  <span className="banner-eyebrow" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>DIGITAILOR MASTER TAILOR WORKSHOP</span>
                  <h1 style={{ margin: '4px 0 6px', fontSize: '24px' }}>Welcome, {user?.name || 'Master Tailor'} 👋</h1>
                  <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Workshop Stitching Console — Inspect customer unstitched fabric, dress-specific body measurements, reference designs, and update 13 tailoring statuses.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <NotificationBell role="tailor" />
                  <button
                    type="button"
                    onClick={() => setActiveTab('garmentQR')}
                    style={{
                      background: '#fff',
                      color: '#880e4f',
                      border: '2px solid #fff',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    📷 Scan Garment QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWalkInModal(true)}
                    style={{
                      background: '#f8bbd0',
                      color: '#880e4f',
                      border: 'none',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    🛍️ + Walk-In Order
                  </button>
                </div>
              </section>

              {/* 8 TAILOR METRIC OVERVIEW CARDS REQUIRED BY SPECIFICATION */}
              <div className="metrics-grid eight-columns" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                <div className="metric-card" onClick={() => setActiveTab('myOrders')} style={{ cursor: 'pointer', background: isDark ? '#1a1a2e' : '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <span className="metric-title" style={{ fontSize: '12px', color: '#777', display: 'block' }}>1. Today's Orders</span>
                  <span className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#880e4f' }}>{tailorMetrics.todaysOrders}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#555', display: 'block', marginTop: '4px' }}>New requests today</span>
                </div>
                <div className="metric-card" onClick={() => setActiveTab('myOrders')} style={{ cursor: 'pointer', background: isDark ? '#1a1a2e' : '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <span className="metric-title" style={{ fontSize: '12px', color: '#777', display: 'block' }}>2. Assigned Orders</span>
                  <span className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#880e4f' }}>{tailorMetrics.assignedOrders}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#555', display: 'block', marginTop: '4px' }}>Allocated to workshop</span>
                </div>
                <div className="metric-card" onClick={() => setActiveTab('todaysStitching')} style={{ cursor: 'pointer', background: isDark ? '#1a1a2e' : '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <span className="metric-title" style={{ fontSize: '12px', color: '#777', display: 'block' }}>3. Stitching In Progress</span>
                  <span className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#ad1457' }}>{tailorMetrics.stitchingInProgress}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#555', display: 'block', marginTop: '4px' }}>Cutting & sewing</span>
                </div>
                <div className="metric-card" onClick={() => setActiveTab('fittings')} style={{ cursor: 'pointer', background: isDark ? '#1a1a2e' : '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <span className="metric-title" style={{ fontSize: '12px', color: '#777', display: 'block' }}>4. Ready for Fitting</span>
                  <span className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>{tailorMetrics.readyForFitting}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#555', display: 'block', marginTop: '4px' }}>Prepped for trial fit</span>
                </div>

                <div className="metric-card" onClick={() => setActiveTab('alterations')} style={{ cursor: 'pointer', background: isDark ? '#1a1a2e' : '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <span className="metric-title" style={{ fontSize: '12px', color: '#777', display: 'block' }}>5. Alteration Requests</span>
                  <span className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#c62828' }}>{tailorMetrics.alterationRequests}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#555', display: 'block', marginTop: '4px' }}>Fit adjustments requested</span>
                </div>
                <div className="metric-card" onClick={() => setActiveTab('completedOrders')} style={{ cursor: 'pointer', background: isDark ? '#1a1a2e' : '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <span className="metric-title" style={{ fontSize: '12px', color: '#777', display: 'block' }}>6. Completed Orders</span>
                  <span className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>{tailorMetrics.completedOrders}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#555', display: 'block', marginTop: '4px' }}>Delivered & closed</span>
                </div>
                <div className="metric-card" style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <span className="metric-title" style={{ fontSize: '12px', color: '#777', display: 'block' }}>7. Today's Earnings</span>
                  <span className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>₹{tailorMetrics.todaysEarnings}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#555', display: 'block', marginTop: '4px' }}>Stitching labor share</span>
                </div>
                <div className="metric-card" onClick={() => setActiveTab('paymentStatus')} style={{ cursor: 'pointer', background: isDark ? '#1a1a2e' : '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <span className="metric-title" style={{ fontSize: '12px', color: '#777', display: 'block' }}>8. Pending Payments</span>
                  <span className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#e65100' }}>{tailorMetrics.pendingPaymentsCount} Orders</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#555', display: 'block', marginTop: '4px' }}>Balance due before delivery</span>
                </div>
              </div>

              {/* RECENT WORKSHOP ORDERS WORK CARDS */}
              <div className="content-card" style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #eee' }}>
                <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#880e4f' }}>✂️ Workshop Tailoring Orders Queue</h3>
                  <button className="link-btn" onClick={() => setActiveTab('myOrders')} style={{ background: 'none', border: 'none', color: '#ad1457', fontWeight: 'bold', cursor: 'pointer' }}>View All Assigned Orders →</button>
                </div>

                {(orders || []).length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#777', background: '#fff0f5', borderRadius: '12px' }}>
                    ✂️ No orders assigned yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(orders || []).map((o) => {
                      const item = (o.items && o.items[0]) || {};
                      const dress = o.dressType || item.name || 'Bespoke Garment';
                      const refImg = o.referenceImage || item.imgUrl || DEFAULT_IMAGE_PLACEHOLDER;

                      return (
                        <div key={o.id} style={{ background: isDark ? '#2a2a40' : '#fff', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <img
                            src={refImg}
                            alt={dress}
                            onError={handleImageError}
                            style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <b>#{o.id}</b>
                              <span style={{ background: '#880e4f', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{dress}</span>
                              {o.ownFabric && <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>🧵 Customer Fabric: YES</span>}
                            </div>
                            <h4 style={{ margin: '4px 0' }}>Customer: {o.customerName || 'Customer'} ({o.customerDetails?.phone || 'Phone N/A'})</h4>
                            <div style={{ fontSize: '12px', color: '#555' }}>
                              <span>Embroidery: <b>{o.embroideryWork || 'Zardosi Motifs'}</b></span> • <span>Expected: <b>{o.deliveryEstimate || '5 Days'}</b></span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', minWidth: '160px' }}>
                            <div>Total: <b>₹{o.total}</b></div>
                            <div>Paid: <b style={{ color: '#2e7d32' }}>₹{o.paidAmount || o.total}</b> | Rem: <b style={{ color: '#c62828' }}>₹{o.remainingAmount || 0}</b></div>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: o.paymentStatus === 'FULLY PAID' ? '#2e7d32' : '#e65100' }}>
                              {o.paymentStatus || 'PARTIALLY PAID'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                            <select
                              value={o.status || 'ORDER RECEIVED'}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                              style={{ padding: '6px', fontSize: '12px', borderRadius: '6px', background: '#880e4f', color: '#fff', fontWeight: 'bold' }}
                            >
                              {TAILORING_STATUSES.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => setSelectedOrderWorkCard(o)}
                              style={{ padding: '6px 12px', background: '#ad1457', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              📋 Open Work Card →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ===================================================================
              TABS: MY ORDERS, TODAY'S STITCHING, FITTINGS, ALTERATIONS, COMPLETED
             =================================================================== */}
          {['myOrders', 'todaysStitching', 'fittings', 'alterations', 'completedOrders'].includes(activeTab) && (
            <div className="content-card" style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #eee' }}>
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ color: '#880e4f', margin: 0 }}>✂️ Tailoring Queue: {activeTab.toUpperCase()} ({filteredTailorOrders.length})</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>Inspect customer measurements, fabric notes, reference image, and update status.</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search orders by ID or customer..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    <option value="ALL">All Statuses</option>
                    {TAILORING_STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredTailorOrders.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#777', background: '#fff0f5', borderRadius: '12px', fontSize: '15px' }}>
                  ✂️ No orders found in this section.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredTailorOrders.map((o) => {
                    const item = (o.items && o.items[0]) || {};
                    const dress = o.dressType || item.name || 'Bespoke Outfit';
                    const refImg = o.referenceImage || item.imgUrl || DEFAULT_IMAGE_PLACEHOLDER;

                    return (
                      <div key={o.id} style={{ background: isDark ? '#2a2a40' : '#fff', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <img
                            src={refImg}
                            alt={dress}
                            onError={handleImageError}
                            style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <b>#{o.id}</b>
                              <span style={{ background: '#880e4f', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{dress}</span>
                              {o.ownFabric && <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>🧵 Customer Fabric: YES</span>}
                            </div>
                            <h4 style={{ margin: '4px 0' }}>Customer: {o.customerName || 'Customer'} ({o.customerDetails?.phone || 'Phone N/A'})</h4>
                            <div style={{ fontSize: '12px', color: '#555' }}>
                              <span>Embroidery: <b>{o.embroideryWork || 'Zardosi Motifs'}</b></span> • <span>Delivery: <b>{o.deliveryEstimate || '5 Days'}</b></span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div>Total: <b>₹{o.total}</b></div>
                            <div>Paid: <b style={{ color: '#2e7d32' }}>₹{o.paidAmount || o.total}</b> | Rem: <b style={{ color: '#c62828' }}>₹{o.remainingAmount || 0}</b></div>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: o.paymentStatus === 'FULLY PAID' ? '#2e7d32' : '#e65100' }}>
                              {o.paymentStatus || 'PARTIALLY PAID'}
                            </span>
                          </div>
                        </div>

                        {/* 13 TAILORING STATUS STEPPER BUTTONS */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                          {TAILORING_STATUSES.map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(o.id, st)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '10px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                border: o.status === st ? '1px solid #ad1457' : '1px solid #ddd',
                                background: o.status === st ? '#880e4f' : '#f5f5f5',
                                color: o.status === st ? '#fff' : '#555',
                              }}
                            >
                              {st}
                            </button>
                          ))}
                        </div>

                        {shopSettings?.requireFullPaymentBeforeDelivery && (o.remainingAmount || 0) > 0 && (o.status === 'READY FOR DELIVERY' || o.status === 'Ready for Delivery') && (
                          <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ffcdd2', fontSize: '12px', fontWeight: 'bold', marginTop: '10px' }}>
                            ⚠️ FULL PAYMENT REQUIRED BEFORE DELIVERY! Balance of ₹{o.remainingAmount} is pending. Confirm customer payment before handover.
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderWorkCard(o)}
                            style={{ background: '#ad1457', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                          >
                            📋 Open Full Tailoring Work Card →
                          </button>

                          {o.status === 'READY FOR FITTING' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleStatusChange(o.id, 'READY FOR DELIVERY')} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                ✓ Fitting Approved
                              </button>
                              <button onClick={() => handleStatusChange(o.id, 'ALTERATION REQUIRED')} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                ✎ Request Alteration
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 4: CUSTOMER MEASUREMENTS VIEW
             =================================================================== */}
          {activeTab === 'measurements' && (
            <div className="content-card" style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #eee' }}>
              <h2 style={{ color: '#880e4f', marginTop: 0 }}>📏 Customer Body Measurements Directory</h2>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Inspect dress-specific 10-field measurement profiles recorded for assigned outfits.</p>

              {(orders || []).length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#777', background: '#fff0f5', borderRadius: '12px' }}>
                  📏 No measurements available.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {(orders || []).map((o) => {
                    const dressType = o.dressType || 'Saree Blouse';
                    const schema = getMeasurementSchemaForDress(dressType);
                    const measurements = o.measurements || {};

                    return (
                      <div key={o.id} style={{ background: isDark ? '#2a2a40' : '#fff9fa', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <b style={{ color: '#880e4f', fontSize: '15px' }}>Order #{o.id}</b>
                          <span style={{ background: '#880e4f', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{dressType}</span>
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>
                          Customer: {o.customerName || 'Malathi Lakshmi'} ({o.customerDetails?.phone || 'Phone N/A'})
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                          {schema.map((field) => (
                            <div key={field.key} style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #eee' }}>
                              <span style={{ color: '#777', fontSize: '10px', display: 'block' }}>{field.label}</span>
                              <b>{measurements[field.key] || field.placeholder}"</b>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 5: REFERENCE DESIGNS VIEW
             =================================================================== */}
          {activeTab === 'referenceDesigns' && (
            <div className="content-card" style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #eee' }}>
              <h2 style={{ color: '#880e4f', marginTop: 0 }}>🖼️ Customer Reference Inspiration Designs</h2>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Uploaded Pinterest / Instagram blouse & dress pattern photos for stitching replication.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {(orders || []).map((o) => {
                  const refImg = o.referenceImage || o.items?.[0]?.imgUrl || DEFAULT_IMAGE_PLACEHOLDER;
                  return (
                    <div key={o.id} style={{ background: isDark ? '#2a2a40' : '#fff9fa', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <img
                        src={refImg}
                        alt="Ref"
                        onError={handleImageError}
                        onClick={() => setSelectedReferenceImage(refImg)}
                        style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                      />
                      <b style={{ display: 'block', margin: '8px 0 2px', color: '#880e4f', fontSize: '14px' }}>Order #{o.id}</b>
                      <span style={{ fontSize: '12px', color: '#555' }}>Customer: {o.customerName}</span>
                      <div style={{ fontSize: '11px', color: '#880e4f', fontWeight: 'bold', marginTop: '4px' }}>{o.dressType || 'Designer Blouse'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 6: CUSTOM STUDIO DESIGNS VIEW
             =================================================================== */}
          {activeTab === 'customDesigns' && (
            <div className="content-card" style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #eee' }}>
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ color: '#880e4f', marginTop: 0 }}>✨ Customer Approved AI Designs & Patterns</h2>
                  <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>AI generated dress previews, necklines, sleeve cuts, and embroidery selections approved by customers.</p>
                </div>
              </div>

              {/* APPROVED AI DESIGN SHOWCASE CARD */}
              <div style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e9 100%)', border: '2px solid #d81b60', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ background: '#2e7d32', color: '#fff', padding: '4px 12px', borderRadius: '14px', fontSize: '11px', fontWeight: 'bold' }}>
                    ✓ CUSTOMER APPROVED DESIGN
                  </span>
                  <span style={{ fontSize: '12px', color: '#666' }}>Design ID: <b>DES-90421</b></span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '16px', marginTop: '14px', alignItems: 'center' }}>
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop"
                    alt="Approved Design"
                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #d81b60' }}
                  />

                  <div>
                    <h3 style={{ color: '#880e4f', margin: '0 0 4px' }}>Malathi Lakshmi — Designer Saree Blouse</h3>
                    <div style={{ fontSize: '12px', color: '#444' }}>
                      <div>Front Neck: <b>V Neck Cutwork</b></div>
                      <div>Sleeve: <b>Elbow Length Puff Sleeve</b></div>
                      <div>Back Neck: <b>Deep U Cut with Gold Potli Buttons</b></div>
                      <div>Embroidery: <b style={{ color: '#d81b60' }}>Peacock Maggam Aari Work</b></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#555', marginBottom: '10px' }}>
                      <div>Fabric: <b>Customer Own Kanchipuram Silk</b></div>
                      <div>Estimated Total: <b style={{ fontSize: '16px', color: '#2e7d32' }}>₹2,800</b></div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => alert('✓ Design accepted by Master Tailor! Added to workshop stitching queue.')}
                        style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      >
                        ✓ Accept Design
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('chat')}
                        style={{ background: '#0288d1', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      >
                        💬 Chat With Customer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SAVED DESIGNS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {(savedDesigns || []).map((des) => (
                  <div key={des.id} style={{ background: isDark ? '#2a2a40' : '#fff0f5', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ color: '#880e4f', margin: '0 0 6px' }}>{des.title}</h4>
                    <div style={{ fontSize: '12px', color: '#555' }}>
                      <div>Outfit: <b>{des.details?.dressType || 'Blouse'}</b></div>
                      <div>Neck Style: <b>{des.details?.neck || 'Sweetheart'}</b></div>
                      <div>Sleeve: <b>{des.details?.sleeve || 'Elbow Length'}</b></div>
                      <div>Embroidery: <b>{des.details?.embroidery || 'Zardosi Work'}</b></div>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 'bold', color: '#2e7d32' }}>
                      Stitching Charge: ₹{des.price || 1200}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 7: EMBROIDERY WORK QUEUE VIEW
             =================================================================== */}
          {activeTab === 'embroideryWork' && (
            <div className="content-card" style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #eee' }}>
              <h2 style={{ color: '#880e4f', marginTop: 0 }}>✨ Artisan Embroidery Work Queue</h2>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Track Aari, Zari, Zardosi, Swarovski Stone Work, and Beadwork tasks.</p>

              {(embroideryWorks || []).length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#777', background: '#fff0f5', borderRadius: '12px' }}>
                  ✨ No active embroidery work items assigned.
                </div>
              ) : (
                <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8bbd0', color: '#880e4f', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Work ID</th>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Embroidery Work</th>
                      <th>Artisan</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(embroideryWorks || []).map((w) => (
                      <tr key={w.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}><b>{w.id}</b></td>
                        <td><b>#{w.orderId}</b></td>
                        <td>{w.customer}</td>
                        <td><b style={{ color: '#ad1457' }}>{w.title}</b></td>
                        <td>{w.designer}</td>
                        <td><span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>{w.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 10: PAYMENT STATUS LEDGER VIEW
             =================================================================== */}
          {activeTab === 'paymentStatus' && (
            <div className="content-card" style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #eee' }}>
              <h2 style={{ color: '#880e4f', marginTop: 0 }}>💳 Tailor Order Payment & Balance Ledger</h2>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Verify customer advance payments, paid balances, and unpaid remaining amounts before final delivery handover.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(orders || []).map((o) => {
                  const rem = o.remainingAmount || 0;
                  const paid = o.paidAmount || o.total;
                  const status = o.paymentStatus || (rem === 0 ? 'FULLY PAID' : 'PARTIALLY PAID');

                  return (
                    <div key={o.id} style={{ background: isDark ? '#2a2a40' : '#fff9fa', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <b style={{ color: '#880e4f', fontSize: '15px' }}>Order #{o.id}</b>
                          <span style={{ background: '#880e4f', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{o.dressType || 'Blouse'}</span>
                        </div>
                        <h4 style={{ margin: '4px 0' }}>Customer: {o.customerName} ({o.customerDetails?.phone})</h4>
                        <span style={{ fontSize: '12px', color: '#555' }}>Payment Method: <b>{o.paymentMethod || 'QR UPI Paid'}</b></span>
                      </div>

                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#777' }}>Total: <b>₹{o.total}</b></div>
                          <div style={{ fontSize: '12px', color: '#2e7d32' }}>Paid: <b>₹{paid}</b></div>
                          <div style={{ fontSize: '12px', color: '#c62828' }}>Remaining: <b>₹{rem}</b></div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              background: status === 'FULLY PAID' ? '#e8f5e9' : '#fff3e0',
                              color: status === 'FULLY PAID' ? '#2e7d32' : '#e65100',
                              border: status === 'FULLY PAID' ? '1px solid #a5d6a7' : '1px solid #ffe0b2',
                            }}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 12: TAILOR NOTIFICATIONS VIEW
             =================================================================== */}
          {activeTab === 'notifications' && (
            <div className="content-card" style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #eee' }}>
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ color: '#880e4f', margin: 0 }}>🔔 Tailor Payment Notifications</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>Real-time alerts when customers pay advance or balance settlement amounts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => markAllTailorNotificationsRead && markAllTailorNotificationsRead()}
                  style={{ background: '#880e4f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✓ Mark All as Read
                </button>
              </div>

              {(tailorNotifications || []).length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#777', background: '#fff0f5', borderRadius: '12px' }}>
                  🔔 No payment notifications yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(tailorNotifications || []).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markTailorNotificationRead && markTailorNotificationRead(n.id)}
                      style={{
                        background: n.read ? (isDark ? '#2a2a40' : '#fff') : '#fff0f5',
                        border: n.read ? '1px solid #eee' : '2px solid #d81b60',
                        padding: '16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <b style={{ color: '#880e4f', fontSize: '15px' }}>{n.title}</b>
                        <span style={{ fontSize: '12px', color: '#777' }}>{n.date}</span>
                      </div>
                      <p style={{ margin: '4px 0 8px', fontSize: '13px', color: '#333' }}>{n.message}</p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#555' }}>
                        <span>Order ID: <b>#{n.order_id || n.orderId}</b></span>
                        <span>Amount Paid: <b style={{ color: '#2e7d32' }}>₹{n.amountPaid}</b></span>
                        <span>Remaining: <b style={{ color: '#c62828' }}>₹{n.remainingAmount}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 12B: CUSTOMER REAL-TIME MESSAGES VIEW
             =================================================================== */}
          {activeTab === 'chat' && (
            <div className="content-card" style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #eee' }}>
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ color: '#880e4f', margin: 0 }}>💬 Real-Time Customer Chat Messages</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>Live bi-directional communication with active customers for custom stitching & alterations.</p>
                </div>
              </div>

              <OrderChatWidget
                orderId={(orders && orders[0]?.id) || 'DT1025'}
                tailorName={user?.name || 'Master Rajesh Tailor'}
                customerName={(orders && orders[0]?.customerName) || 'Malathi Lakshmi'}
              />
            </div>
          )}
          {activeTab === 'profile' && (
            <div className="content-card" style={{ background: isDark ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #eee' }}>
              <h2 style={{ color: '#880e4f', marginTop: 0 }}>👤 Master Tailor Profile</h2>
              <div style={{ background: '#fff0f5', padding: '20px', borderRadius: '14px', border: '1px solid #f8bbd0', marginTop: '16px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#880e4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold' }}>
                  {(user?.name || 'Tailor').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#880e4f' }}>Name: {user?.name || 'Master Rajesh Tailor'}</h3>
                  <div style={{ fontSize: '13px', margin: '4px 0' }}>🆔 User ID: <b>{user?.username || 'tailor'}</b> | Role: <b>{user?.role || 'TAILOR'}</b></div>
                  <div style={{ fontSize: '13px' }}>Specialization: <b>Silk Blouses, Kanchipuram Sarees, Pavadai Thavani & Bridal Lehengas</b></div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================
          MASTER TAILOR WORK CARD MODAL
         =================================================================== */}
      {selectedOrderWorkCard && (
        <div className="modal-backdrop" onClick={() => setSelectedOrderWorkCard(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', padding: '24px', borderRadius: '16px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #880e4f', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ color: '#880e4f', margin: 0 }}>📋 Master Tailoring Work Card: Order #{selectedOrderWorkCard.id}</h3>
                <span style={{ fontSize: '12px', color: '#555' }}>Customer: <b>{selectedOrderWorkCard.customerName}</b> ({selectedOrderWorkCard.customerDetails?.phone})</span>
              </div>
              <button type="button" className="close-modal-btn" onClick={() => setSelectedOrderWorkCard(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 1. ORDER & FABRIC */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#fff0f5', padding: '12px', borderRadius: '10px' }}>
                <div><b>Outfit Type:</b> {selectedOrderWorkCard.dressType || 'Designer Blouse'}</div>
                <div><b>Customer Own Fabric:</b> <b style={{ color: '#2e7d32' }}>{selectedOrderWorkCard.ownFabric ? 'YES' : 'YES'}</b></div>
                <div><b>Fabric Received:</b> <b style={{ color: '#2e7d32' }}>{selectedOrderWorkCard.fabricReceived ? 'YES' : 'YES'}</b></div>
                <div><b>Expected Delivery:</b> {selectedOrderWorkCard.deliveryEstimate || '5 Days'}</div>
              </div>

              {/* 2. DRESS-SPECIFIC MEASUREMENTS */}
              <div style={{ border: '1px solid #f8bbd0', padding: '12px', borderRadius: '10px' }}>
                <b style={{ color: '#880e4f', display: 'block', marginBottom: '8px' }}>📏 Dress-Specific Measurements ({selectedOrderWorkCard.dressType || 'Blouse'} Schema):</b>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px' }}>
                  {getMeasurementSchemaForDress(selectedOrderWorkCard.dressType || 'Blouse').map((field) => (
                    <div key={field.key} style={{ background: '#f5f5f5', padding: '6px', borderRadius: '6px' }}>
                      <span style={{ color: '#777', display: 'block', fontSize: '10px' }}>{field.label}</span>
                      <b>{selectedOrderWorkCard.measurements?.[field.key] || field.placeholder}"</b>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. REFERENCE DESIGN & INSTRUCTIONS */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'center' }}>
                <img
                  src={selectedOrderWorkCard.referenceImage || DEFAULT_IMAGE_PLACEHOLDER}
                  alt="Ref"
                  onError={handleImageError}
                  style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '10px' }}
                />
                <div>
                  <b style={{ color: '#880e4f' }}>🎨 Customization & Special Instructions:</b>
                  <p style={{ fontSize: '13px', color: '#333', margin: '4px 0 10px' }}>
                    "{selectedOrderWorkCard.specialInstructions || 'Deep V neck design with boat neck front, elbow sleeve, gold zari piping, and latkan tassels.'}"
                  </p>
                  <div>Embroidery Work: <b>{selectedOrderWorkCard.embroideryWork || 'Zardosi Handwork'}</b></div>
                  <div>Embroidery Designer: <b>{selectedOrderWorkCard.embroideryDesigner || 'Master Lakshmi Aari Crafts'}</b></div>
                </div>
              </div>

              {/* 4. PAYMENT SUMMARY */}
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#e8f5e9', padding: '12px', borderRadius: '10px', color: '#2e7d32', fontWeight: 'bold' }}>
                <span>Total Amount: ₹{selectedOrderWorkCard.total}</span>
                <span>Paid (Advance): ₹{selectedOrderWorkCard.paidAmount || selectedOrderWorkCard.total}</span>
                <span style={{ color: '#c62828' }}>Remaining: ₹{selectedOrderWorkCard.remainingAmount || 0}</span>
                <span>Status: {selectedOrderWorkCard.paymentStatus || 'PARTIALLY PAID'}</span>
              </div>

              {/* 5. ALTERATION REQUEST FIELD */}
              {selectedOrderWorkCard.status === 'ALTERATION REQUIRED' && (
                <div style={{ background: '#ffebee', padding: '12px', borderRadius: '10px', border: '1px solid #ef5350' }}>
                  <b style={{ color: '#c62828', display: 'block', marginBottom: '6px' }}>✏️ Fitting Alteration Instructions:</b>
                  <input
                    type="text"
                    placeholder="Enter fitting alteration details (e.g. Reduce sleeve length by 1 inch)..."
                    value={alterationNoteInput}
                    onChange={(e) => setAlterationNoteInput(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '8px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRequestAlteration(selectedOrderWorkCard.id, alterationNoteInput)}
                    style={{ background: '#c62828', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Submit Alteration Request →
                  </button>
                </div>
              )}

              {/* 6. STATUS UPDATE SELECTOR */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <b>Update Tailoring Status:</b>
                <select
                  value={selectedOrderWorkCard.status || 'ORDER RECEIVED'}
                  onChange={(e) => handleStatusChange(selectedOrderWorkCard.id, e.target.value)}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', background: '#880e4f', color: '#fff', fontWeight: 'bold' }}
                >
                  {TAILORING_STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REFERENCE IMAGE LIGHTBOX */}
      {selectedReferenceImage && (
        <div className="modal-backdrop" onClick={() => setSelectedReferenceImage(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', textAlign: 'center', padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: '#880e4f' }}>🖼️ Customer Reference Inspiration Design</h4>
              <button onClick={() => setSelectedReferenceImage(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>✕</button>
            </div>
            <img src={selectedReferenceImage} alt="Reference" onError={handleImageError} style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '12px' }} />
          </div>
        </div>
      )}

      {/* WALK-IN COUNTER ORDER MODAL */}
      {showWalkInModal && <WalkInOrderModal onClose={() => setShowWalkInModal(false)} />}

      {/* REALISTIC AI TAILORING ASSISTANT FLOATING WIDGET */}
      <AITailoringAssistantModal />
    </div>
  );
}
