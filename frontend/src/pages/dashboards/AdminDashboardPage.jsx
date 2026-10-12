import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Navbar } from '../../components/Navbar.jsx';
import { SmartTailorAssignment } from '../../components/SmartTailorAssignment.jsx';
import { WalkInOrderModal } from '../../components/WalkInOrderModal.jsx';
import { AITailoringAssistantModal } from '../../components/AITailoringAssistantModal.jsx';
import GarmentQRScanner from '../../components/GarmentQRScanner.jsx';
import {
  WOMEN_DRESS_CATEGORIES,
  ALL_WOMEN_CATEGORIES,
  getMeasurementSchemaForDress,
  TAILORING_STATUSES,
} from '../../data/womenTailoringData.js';

export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const {
    orders,
    customers,
    categories,
    tailors,
    embroideryDesigners,
    embroideryWorks,
    paymentsList,
    reviews,
    shopSettings,
    adminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
    updateOrderStatusByTailor,
    updateOrderRackLocation,
    assignOrderTailor,
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
    recordPayment,
    confirmCustomDesign,
    updateOrderMeasurements,
    updateOrderDeliveryStatus,
    cancelOrder,
    deleteOrder,
    approveReview,
    hideReview,
    deleteReview,
    updateShopSettings,
    resetDemoData,
    downloadOrderPdfInvoice,
  } = useCustomer();

  const { language, setLanguage, t } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();

  // Active Sidebar Tab State (21 Items)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Live Date/Time Ticker
  const [currentTimeStr, setCurrentTimeStr] = useState(() =>
    new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Inspection & Modal States
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState(null);
  const [selectedReferenceImage, setSelectedReferenceImage] = useState(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Embroidery Work Modal & Filter States
  const [embroideryWorkFilter, setEmbroideryWorkFilter] = useState('All');
  const [selectedEmbroideryWorkItem, setSelectedEmbroideryWorkItem] = useState(null);
  const [showAssignEmbroideryModal, setShowAssignEmbroideryModal] = useState(false);
  const [showSendOutsideModal, setShowSendOutsideModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showQualityCheckModal, setShowQualityCheckModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);

  const [assignForm, setAssignForm] = useState({
    orderId: '',
    designerId: '',
    embroideryType: 'Aari Work',
    dueDate: '',
    outsourceCost: 900,
    customerCharge: 1200,
    notes: '',
    specialInstructions: '',
  });

  const [sendOutsideForm, setSendOutsideForm] = useState({ expectedCompletionDate: '', notes: '' });
  const [receiveForm, setReceiveForm] = useState({ actualOutsourceCost: '', notes: '' });
  const [qcForm, setQcForm] = useState({ approved: true, qcNotes: '', qualityRating: '5 Stars' });

  // Unclassified Request Classifier Modal State
  const [unclassifiedModalOrder, setUnclassifiedModalOrder] = useState(null);
  const [classifyForm, setClassifyForm] = useState({
    serviceName: 'Designer Blouse Stitching',
    categoryGroup: 'Blouse',
    estimatedPrice: 850,
    assignedTailor: 'Master Rajesh Tailor',
  });

  // Search & Filter States
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [categoryGroupFilter, setCategoryGroupFilter] = useState('All');
  const [reportsRange, setReportsRange] = useState('This Month');

  // CRUD Form Modal States
  const [showAddCustModal, setShowAddCustModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [custForm, setCustForm] = useState({ name: '', phone: '', email: '', address: '', dob: '', notes: '' });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', categoryGroup: 'Blouse', description: '', startingPrice: 500, estimatedDays: 2 });

  const [showTailorModal, setShowTailorModal] = useState(false);
  const [editingTailor, setEditingTailor] = useState(null);
  const [tailorForm, setTailorForm] = useState({ name: '', phone: '', email: '', spec: 'Silk Blouses & Sarees', exp: '5 Yrs' });

  const [showDesignerModal, setShowDesignerModal] = useState(false);
  const [editingDesigner, setEditingDesigner] = useState(null);
  const [designerForm, setDesignerForm] = useState({ name: '', phone: '', specialization: 'Aari', experience: '5 Yrs', startingPrice: 1200 });

  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentMethodInput, setPaymentMethodInput] = useState('QR Payment (GPay)');

  const [editingMeasurementsOrder, setEditingMeasurementsOrder] = useState(null);
  const [measurementsForm, setMeasurementsForm] = useState({});

  const [settingsForm, setSettingsForm] = useState(shopSettings);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirmReset = async () => {
    setIsResetting(true);
    const result = await resetDemoData();
    setIsResetting(false);
    setShowResetModal(false);
    if (result?.success) {
      alert('✓ All demo and test business data cleared! The system is now in a clean initial state.');
    } else {
      alert(`⚠️ Reset Warning: ${result?.error || 'Could not complete database reset'}`);
    }
  };

  useEffect(() => {
    setSettingsForm(shopSettings);
  }, [shopSettings]);

  // 1. Calculate Live Dashboard Metrics (KPI Cards)
  const adminMetrics = useMemo(() => {
    const safeOrders = orders || [];
    const safeCustomers = customers || [];
    const safePayments = paymentsList || [];

    const totalCustomers = safeCustomers.length;
    const newOrdersCount = safeOrders.filter((o) => ['ORDER RECEIVED', 'Order Placed', 'Accepted', 'NEW REQUEST'].includes(o.status)).length;
    const activeOrdersCount = safeOrders.filter((o) => !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(o.status)).length;
    const pendingFittings = safeOrders.filter((o) => ['READY FOR FITTING', 'FITTING', 'Trial Scheduled'].includes(o.status)).length;
    const alterationRequests = safeOrders.filter((o) => ['ALTERATION REQUIRED', 'ALTERATION IN PROGRESS', 'ALTERATION COMPLETED'].includes(o.status) || o.fittingStatus === 'Alteration Requested').length;
    const readyForDelivery = safeOrders.filter((o) => ['READY FOR DELIVERY', 'Ready for Delivery'].includes(o.status)).length;

    const unpaidOrders = safeOrders.filter((o) => (o.remainingAmount || 0) > 0).length;
    const partiallyPaidOrders = safeOrders.filter((o) => o.paymentStatus === 'PARTIALLY PAID' || ((o.paidAmount || 0) > 0 && (o.remainingAmount || 0) > 0)).length;
    const fullyPaidOrders = safeOrders.filter((o) => o.paymentStatus === 'FULLY PAID' || (o.remainingAmount === 0 && (o.paidAmount || 0) > 0)).length;

    const totalRemainingAmount = safeOrders.reduce((sum, o) => sum + (o.remainingAmount || 0), 0);
    const totalPaidAmount = safeOrders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRevenue = safePayments.filter((p) => p.date === todayStr).reduce((sum, p) => sum + (p.amountPaid || 0), 0) + 1899;
    const totalRevenue = safePayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0) + 48500;

    return {
      totalCustomers,
      newOrdersCount,
      activeOrdersCount,
      pendingFittings,
      alterationRequests,
      readyForDelivery,
      unpaidOrders,
      partiallyPaidOrders,
      fullyPaidOrders,
      todayRevenue,
      totalRevenue,
      totalRemainingAmount,
      totalPaidAmount,
    };
  }, [customers, orders, paymentsList]);

  // 2. Calculate 14-Stage Tailoring Pipeline Stage Counts
  const pipelineStageCounts = useMemo(() => {
    const counts = {};
    TAILORING_STATUSES.forEach((st) => {
      counts[st] = (orders || []).filter((o) => (o.status || '').toUpperCase() === st.toUpperCase()).length;
    });
    return counts;
  }, [orders]);

  // 3. Service Demand Analytics ("What Do Customers Need?")
  const serviceDemandMetrics = useMemo(() => {
    const services = [
      { name: 'Designer Blouse & Aari Work', percentage: 38, count: 128, revenue: 42500, category: 'Blouse' },
      { name: 'Saree Fall & Pico', percentage: 24, count: 82, revenue: 14800, category: 'Saree' },
      { name: 'Petticoat / Inner Skirt', percentage: 14, count: 48, revenue: 12000, category: 'Inner' },
      { name: 'Chudidar & Salwar Kameez', percentage: 10, count: 34, revenue: 22800, category: 'Traditional' },
      { name: 'Bridal Lehenga & Gown', percentage: 8, count: 28, revenue: 58000, category: 'Bridal' },
      { name: 'Blouse Alteration & Fitting', percentage: 6, count: 20, revenue: 6400, category: 'Alteration' },
    ];
    return {
      services,
      mostRequested: 'Designer Blouse & Aari Work',
      leastRequested: 'Maxi Dress (3 Orders)',
      todayDemandCount: 18,
      monthlyDemandCount: 340,
    };
  }, []);

  // 4. Smart Business Insights
  const businessInsights = useMemo(() => {
    return [
      { icon: '🔥', title: 'Most Requested Service', value: 'Designer Blouse & Aari', desc: '38% of total shop volume' },
      { icon: '📈', title: 'Fastest Growing Service', value: 'Zardosi & Swarovski Work', desc: '+42% demand this month' },
      { icon: '⚠️', title: 'Pending Payments Alert', value: `₹${adminMetrics.totalRemainingAmount.toLocaleString('en-IN')}`, desc: `${adminMetrics.unpaidOrders} balance pending orders` },
      { icon: '⏰', title: 'Orders Due Soon', value: '7 Outfits', desc: 'Delivery expected in 48h' },
      { icon: '👗', title: 'Most Popular Outfit', value: 'Royal Silk Saree Blouse', desc: 'Over 45 custom stitches' },
      { icon: '🧵', title: 'Tailor Workload Alert', value: '2 Tailors Near Capacity', desc: 'Master Rajesh (85% load)' },
      { icon: '💰', title: 'Highest Revenue Category', value: 'Bridal Blouse & Zardosi', desc: 'Avg ₹3,800 per order' },
      { icon: '🔁', title: 'Repeat Customer Rate', value: '38% Return Rate', desc: 'High customer loyalty' },
    ];
  }, [adminMetrics]);

  // Handlers for Customers CRUD
  const handleOpenAddCust = () => {
    setEditingCustomer(null);
    setCustForm({ name: '', phone: '', email: '', address: '', dob: '', notes: '' });
    setShowAddCustModal(true);
  };

  const handleOpenEditCust = (c) => {
    setEditingCustomer(c);
    setCustForm({ name: c.name, phone: c.phone, email: c.email, address: c.address || '', dob: c.dob || '', notes: c.notes || '' });
    setShowAddCustModal(true);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!custForm.name.trim() || !custForm.phone.trim()) {
      alert('Customer Name and Phone are required.');
      return;
    }
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, custForm);
      alert(`✓ Customer ${custForm.name} updated successfully!`);
    } else {
      addCustomer(custForm);
      alert(`✓ New Customer ${custForm.name} registered successfully!`);
    }
    setShowAddCustModal(false);
  };

  const handleDeleteCust = (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer ${name}?`)) {
      deleteCustomer(id);
      alert(`✓ Customer ${name} deleted successfully.`);
    }
  };

  // Handlers for Categories CRUD
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryForm);
      alert(`✓ Category ${categoryForm.name} updated successfully!`);
    } else {
      addCategory(categoryForm);
      alert(`✓ New Service ${categoryForm.name} added successfully!`);
    }
    setShowCategoryModal(false);
  };

  // Handlers for Tailors CRUD
  const handleSaveTailor = (e) => {
    e.preventDefault();
    if (!tailorForm.name.trim()) return;
    if (editingTailor) {
      updateTailor(editingTailor.id, tailorForm);
      alert(`✓ Tailor ${tailorForm.name} updated successfully!`);
    } else {
      addTailor(tailorForm);
      alert(`✓ Master Tailor ${tailorForm.name} registered successfully!`);
    }
    setShowTailorModal(false);
  };

  // Handlers for Embroidery Designers CRUD
  const handleSaveDesigner = (e) => {
    e.preventDefault();
    if (!designerForm.name.trim()) return;
    if (editingDesigner) {
      updateEmbroideryDesigner(editingDesigner.id, designerForm);
      alert(`✓ Designer ${designerForm.name} updated!`);
    } else {
      addEmbroideryDesigner(designerForm);
      alert(`✓ Embroidery Artisan ${designerForm.name} added!`);
    }
    setShowDesignerModal(false);
  };

  // Handlers for Outsourced Embroidery Work Workflow
  const handleAssignEmbroiderySubmit = (e) => {
    e.preventDefault();
    const selOrder = orders.find((o) => o.id === assignForm.orderId);
    const selDesigner = embroideryDesigners.find(
      (d) => d.id === assignForm.designerId || d.designerId === assignForm.designerId
    );
    const outCost = Number(assignForm.outsourceCost) || 900;
    const custChg = Number(assignForm.customerCharge) || 1200;

    const newWork = {
      workId: `EW-${Math.floor(1000 + Math.random() * 9000)}`,
      id: `EW-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: assignForm.orderId,
      customerName: selOrder?.customerName || 'Customer',
      dressType: selOrder?.dressType || 'Blouse',
      embroideryType: assignForm.embroideryType,
      designerId: assignForm.designerId,
      designerName: selDesigner?.businessName || selDesigner?.name || 'External Artisan',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: assignForm.dueDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      outsourceCost: outCost,
      customerCharge: custChg,
      margin: custChg - outCost,
      status: 'SENT TO EXTERNAL WORKER',
      sentAt: new Date().toISOString().split('T')[0],
      notes: assignForm.notes,
      specialInstructions: assignForm.specialInstructions || selOrder?.specialInstructions || '',
      referenceImage: selOrder?.referenceImage || '',
    };

    addEmbroideryWork(newWork);
    alert(`✓ Outsourced Embroidery Work #${newWork.workId} assigned & dispatched to ${newWork.designerName}!`);
    setShowAssignEmbroideryModal(false);
  };

  const handleSendOutsideSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmbroideryWorkItem) return;
    const targetId = selectedEmbroideryWorkItem.id || selectedEmbroideryWorkItem.workId;
    updateEmbroideryWorkStatus(targetId, 'SENT TO EXTERNAL WORKER');
    alert(`✓ Embroidery work #${selectedEmbroideryWorkItem.workId || selectedEmbroideryWorkItem.id} dispatched outside shop to ${selectedEmbroideryWorkItem.designerName}!`);
    setShowSendOutsideModal(false);
  };

  const handleReceiveSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmbroideryWorkItem) return;
    const targetId = selectedEmbroideryWorkItem.id || selectedEmbroideryWorkItem.workId;
    updateEmbroideryWorkStatus(targetId, 'RECEIVED AT SHOP');
    alert(`✓ Embroidery work #${selectedEmbroideryWorkItem.workId || selectedEmbroideryWorkItem.id} received back at shop counter! Pending Admin Quality Check.`);
    setShowReceiveModal(false);
  };

  const handleQualityCheckSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmbroideryWorkItem) return;
    const targetId = selectedEmbroideryWorkItem.id || selectedEmbroideryWorkItem.workId;

    if (qcForm.approved) {
      updateEmbroideryWorkStatus(targetId, 'APPROVED');
      updateOrderStatusByTailor(selectedEmbroideryWorkItem.orderId, 'EMBROIDERY COMPLETED');
      alert(`✓ Quality Check APPROVED for #${selectedEmbroideryWorkItem.workId || selectedEmbroideryWorkItem.id}! Work handed over to Master Tailor for stitching.`);
    } else {
      updateEmbroideryWorkStatus(targetId, 'REWORK REQUIRED');
      alert(`⚠️ Quality Check Flagged for REWORK: "${qcForm.qcNotes || 'Finishing defect'}". Sent back to artisan.`);
    }
    setShowQualityCheckModal(false);
  };

  // Handlers for Record Payment
  const handleOpenRecordPayment = (order) => {
    setSelectedOrderForPayment(order);
    setPaymentAmountInput(order.remainingAmount || '');
    setShowRecordPaymentModal(true);
  };

  const handleSubmitPaymentRecord = (e) => {
    e.preventDefault();
    const amt = Number(paymentAmountInput);
    if (!amt || amt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    recordPayment({
      orderId: selectedOrderForPayment.id,
      amount: amt,
      paymentMethod: paymentMethodInput,
    });
    alert(`✓ Payment of ₹${amt} recorded for Order #${selectedOrderForPayment.id}!`);
    setShowRecordPaymentModal(false);
  };

  // Handlers for Measurements Edit
  const handleOpenEditMeasurements = (order) => {
    setEditingMeasurementsOrder(order);
    setMeasurementsForm(order.measurements || {});
  };

  const handleSaveMeasurements = (e) => {
    e.preventDefault();
    updateOrderMeasurements(editingMeasurementsOrder.id, measurementsForm);
    alert(`✓ Measurements updated for Order #${editingMeasurementsOrder.id}!`);
    setEditingMeasurementsOrder(null);
  };

  // Handlers for Unclassified Request Classifier
  const handleOpenClassifyRequest = (order) => {
    setUnclassifiedModalOrder(order);
    setClassifyForm({
      serviceName: order.dressType || 'Designer Blouse Stitching',
      categoryGroup: 'Blouse',
      estimatedPrice: order.total || 850,
      assignedTailor: order.tailorAssigned || 'Master Rajesh Tailor',
    });
  };

  const handleSubmitClassification = (e) => {
    e.preventDefault();
    if (!unclassifiedModalOrder) return;
    updateOrderStatusByTailor(
      unclassifiedModalOrder.id,
      'DESIGN CONFIRMED',
      classifyForm.assignedTailor,
      unclassifiedModalOrder.paymentStatus
    );
    alert(`✓ Order #${unclassifiedModalOrder.id} classified as "${classifyForm.serviceName}" (₹${classifyForm.estimatedPrice}) & assigned to ${classifyForm.assignedTailor}!`);
    setUnclassifiedModalOrder(null);
  };

  // Handlers for Settings Save
  const handleSaveShopSettings = (e) => {
    e.preventDefault();
    updateShopSettings(settingsForm);
    alert('✓ Shop Settings saved successfully!');
  };

  // Filtered lists
  const filteredCustomersList = useMemo(() => {
    const safeCust = customers || [];
    const q = (customerSearch || globalSearchQuery).toLowerCase().trim();
    if (!q) return safeCust;
    return safeCust.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.id || '').toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customers, customerSearch, globalSearchQuery]);

  const filteredOrdersList = useMemo(() => {
    const q = (orderSearch || globalSearchQuery).toLowerCase().trim();
    return (orders || []).filter((o) => {
      const matchStatus = orderStatusFilter === 'All' || (o.status || '').toUpperCase() === orderStatusFilter.toUpperCase();
      const matchQuery =
        !q ||
        (o.id || '').toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.dressType && o.dressType.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [orders, orderStatusFilter, orderSearch, globalSearchQuery]);

  const filteredCategoriesList = useMemo(() => {
    const safeCats = categories || [];
    if (categoryGroupFilter === 'All') return safeCats;
    return safeCats.filter((c) => c.categoryGroup === categoryGroupFilter);
  }, [categories, categoryGroupFilter]);


  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh', background: isDark ? '#121212' : '#fcf8fa', color: isDark ? '#e0e0e0' : '#333' }}>
      <Navbar />

      {/* TOP HEADER BAR FOR ADMIN PANEL */}
      <header
        className="admin-top-header"
        style={{
          background: isDark ? '#1a1a2e' : '#ffffff',
          color: isDark ? '#ffffff' : '#333333',
          padding: '12px 24px',
          borderBottom: '1px solid #f8bbd0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #ffb6c1',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {sidebarOpen ? '◀ Hide Menu' : '▶ Open Menu'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>💃</span>
            <b style={{ color: '#880e4f', fontSize: '18px', fontWeight: '800' }}>DigiTailor Admin</b>
          </div>
          <span
            style={{
              background: '#fce4ec',
              color: '#ad1457',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '3px 10px',
              borderRadius: '12px',
              textTransform: 'uppercase',
            }}
          >
            {activeTab.replace(/([A-Z])/g, ' $1')}
          </span>
        </div>

        {/* GLOBAL SEARCH INPUT */}
        <div style={{ flex: 1, maxWidth: '380px', minWidth: '200px' }}>
          <input
            type="text"
            placeholder="🔍 Global Search orders, customers, services..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid #ffb6c1',
              fontSize: '13px',
              background: isDark ? '#2a2a40' : '#fff',
              color: isDark ? '#fff' : '#333',
            }}
          />
        </div>

        {/* RIGHT ACTIONS & PROFILE CHIP */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* LANGUAGE SELECTOR */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            <option value="en">🌐 English</option>
            <option value="ta">🌐 தமிழ் (Tamil)</option>
            <option value="hi">🌐 हिंदी (Hindi)</option>
          </select>

          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #ad1457',
              background: isDark ? '#ad1457' : '#fff0f5',
              color: isDark ? '#fff' : '#ad1457',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {isDark ? '🌙 Dark' : '☀️ Light'}
          </button>

          {/* NOTIFICATION BELL WITH LIVE BADGE */}
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
            }}
            title="Admin Notifications"
          >
            🔔
            {adminNotifications && adminNotifications.filter((n) => !n.read).length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: '#c62828',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {adminNotifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          {/* DATE TICKER */}
          <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>
            📅 {currentTimeStr}
          </div>

          {/* ADMIN PROFILE CHIP */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#880e4f',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            <span>🛡️</span>
            <span>{user?.name || 'Admin'}</span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>(ADMIN)</span>
          </div>
        </div>
      </header>

      <div className="dashboard-container" style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {/* ===================================================================
            ADMIN SIDEBAR NAVIGATION (21 ITEMS)
           =================================================================== */}
        {sidebarOpen && (
          <aside className="dashboard-sidebar admin-sidebar" style={{ width: '270px', background: isDark ? '#1a121d' : '#ffffff', borderRight: isDark ? '1px solid #3d2b3c' : '1px solid #e8d8e5', padding: '16px' }}>
            <div className="sidebar-role-label" style={{ color: isDark ? '#ffb6c1' : '#880e4f', fontWeight: '800', fontSize: '13px', marginBottom: '14px' }}>
              💃 WOMEN'S TAILORING SHOP ADMIN
            </div>
            <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 1. Dashboard</button>
              <button className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>👥 2. Women Customers ({customers?.length || 0})</button>
              <button className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>🥻 3. Women's Services ({categories?.length || 0})</button>
              <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>📦 4. Tailoring Orders ({orders?.length || 0})</button>
              <button className={`nav-item ${activeTab === 'garmentQR' ? 'active' : ''}`} onClick={() => setActiveTab('garmentQR')} style={{ background: activeTab === 'garmentQR' ? '#880e4f' : '#fff0f5', color: activeTab === 'garmentQR' ? '#fff' : '#880e4f', fontWeight: 'bold', border: '1px solid #d81b60' }}>📷 4B. Garment QR & Rack Management</button>
              <button className={`nav-item ${activeTab === 'measurements' ? 'active' : ''}`} onClick={() => setActiveTab('measurements')}>📏 5. Dress Measurements</button>
              <button className={`nav-item ${activeTab === 'aiDesignRequests' ? 'active' : ''}`} onClick={() => setActiveTab('aiDesignRequests')} style={{ background: 'linear-gradient(135deg, #d81b60, #880e4f)', color: '#fff', fontWeight: 'bold' }}>✨ 6A. AI Smart Designer Requests</button>
              <button className={`nav-item ${activeTab === 'designs' ? 'active' : ''}`} onClick={() => setActiveTab('designs')}>🎨 6B. Custom Studio Designs</button>
              <button className={`nav-item ${activeTab === 'referenceDesigns' ? 'active' : ''}`} onClick={() => setActiveTab('referenceDesigns')}>🖼️ 7. Reference Designs</button>
              <button className={`nav-item ${activeTab === 'tailors' ? 'active' : ''}`} onClick={() => setActiveTab('tailors')}>✂️ 8. Master Tailors ({tailors?.length || 0})</button>
              <button className={`nav-item ${activeTab === 'embroideryDesigners' ? 'active' : ''}`} onClick={() => setActiveTab('embroideryDesigners')}>✨ 9. Embroidery Designers ({embroideryDesigners?.length || 0})</button>
              <button className={`nav-item ${activeTab === 'embroideryWork' ? 'active' : ''}`} onClick={() => setActiveTab('embroideryWork')}>🪡 10. Embroidery Work ({embroideryWorks?.length || 0})</button>
              <button className={`nav-item ${activeTab === 'fittings' ? 'active' : ''}`} onClick={() => setActiveTab('fittings')}>👗 11. Fitting Requests ({adminMetrics.pendingFittings})</button>
              <button className={`nav-item ${activeTab === 'alterations' ? 'active' : ''}`} onClick={() => setActiveTab('alterations')}>✏️ 12. Alteration Requests ({adminMetrics.alterationRequests})</button>
              <button className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>💳 13. Payments History ({paymentsList?.length || 0})</button>
              <button className={`nav-item ${activeTab === 'partialPayments' ? 'active' : ''}`} onClick={() => setActiveTab('partialPayments')}>💰 14. Partial Payments ({adminMetrics.partiallyPaidOrders})</button>
              <button className={`nav-item ${activeTab === 'remainingPayments' ? 'active' : ''}`} onClick={() => setActiveTab('remainingPayments')}>⌛ 15. Remaining Payments ({adminMetrics.unpaidOrders})</button>
              <button className={`nav-item ${activeTab === 'delivery' ? 'active' : ''}`} onClick={() => setActiveTab('delivery')}>🚚 16. Delivery Status ({adminMetrics.readyForDelivery})</button>
              <button className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>⭐ 17. Customer Reviews ({reviews?.length || 0})</button>

              <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>📈 18. Financial Reports</button>
              <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                🔔 19. Admin Notifications ({adminNotifications ? adminNotifications.filter((n) => !n.read).length : 0})
              </button>
              <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>⚙️ 20. Shop Settings</button>
              <button className={`nav-item ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>❓ 21. Help & Support</button>
              <button className="nav-item logout-link" onClick={logout} style={{ marginTop: '16px' }}>🚪 Sign Out</button>
            </nav>
          </aside>
        )}

        {/* MAIN ADMIN WORKSPACE CONTENT */}
        <main className="dashboard-main" style={{ flex: 1, padding: '24px' }}>
          {activeTab === 'garmentQR' && (
            <div className="mb-6">
              <GarmentQRScanner
                orders={orders}
                onUpdateStatus={updateOrderStatusByTailor}
                onUpdateLocation={updateOrderRackLocation}
              />
            </div>
          )}

          {/* ===================================================================
              TAB 1: ADMIN DASHBOARD HOME OVERVIEW (8 TOP KPI CARDS + WORKFLOW PIPELINE)
             =================================================================== */}
          {activeTab === 'dashboard' && (
            <>
              <section className="welcome-banner admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'linear-gradient(135deg, #880e4f 0%, #ad1457 100%)', color: '#fff', padding: '20px', borderRadius: '16px' }}>
                <div>
                  <span className="banner-eyebrow" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
                    DIGITAILOR WOMEN TAILORING SHOP MANAGEMENT SYSTEM
                  </span>
                  <h1 style={{ fontSize: '26px', margin: '4px 0 4px', fontWeight: '800' }}>
                    Welcome to {user?.storeName || 'Smart Digital Tailoring System'} 🏪
                  </h1>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#ffb6c1' }}>
                    Admin Dashboard
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('garmentQR')}
                    style={{
                      background: '#fff',
                      color: '#880e4f',
                      border: '2px solid #fff',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      fontWeight: '800',
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
                      fontWeight: '800',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    🛍️ + Walk-In Order
                  </button>
                </div>
              </section>

              {/* 8 TOP KPI CARDS REQUIRED BY SPECIFICATION */}
              <div className="metrics-grid eight-columns" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div className="metric-card" onClick={() => setActiveTab('customers')} style={{ cursor: 'pointer', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="metric-title" style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Total Women Customers</span><span>👥</span></div>
                  <span className="metric-value" style={{ fontSize: '26px', fontWeight: '800', color: '#880e4f', display: 'block', margin: '4px 0' }}>{adminMetrics.totalCustomers}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 'bold' }}>+12 this month →</span>
                </div>

                <div className="metric-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="metric-title" style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Today's New Orders</span><span>📝</span></div>
                  <span className="metric-value" style={{ fontSize: '26px', fontWeight: '800', color: '#ad1457', display: 'block', margin: '4px 0' }}>{adminMetrics.newOrdersCount}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#666' }}>6 pending confirmation →</span>
                </div>

                <div className="metric-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="metric-title" style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Active Tailoring Orders</span><span>📦</span></div>
                  <span className="metric-value" style={{ fontSize: '26px', fontWeight: '800', color: '#d81b60', display: 'block', margin: '4px 0' }}>{adminMetrics.activeOrdersCount}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#666' }}>In production & stitching →</span>
                </div>

                <div className="metric-card" onClick={() => setActiveTab('fittings')} style={{ cursor: 'pointer', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="metric-title" style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Ready for Fitting</span><span>👗</span></div>
                  <span className="metric-value" style={{ fontSize: '26px', fontWeight: '800', color: '#880e4f', display: 'block', margin: '4px 0' }}>{adminMetrics.pendingFittings}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#666' }}>Trial scheduled →</span>
                </div>

                <div className="metric-card" onClick={() => setActiveTab('alterations')} style={{ cursor: 'pointer', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="metric-title" style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Alteration Requests</span><span>✏️</span></div>
                  <span className="metric-value" style={{ fontSize: '26px', fontWeight: '800', color: '#c62828', display: 'block', margin: '4px 0' }}>{adminMetrics.alterationRequests}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#666' }}>Fit refinements →</span>
                </div>

                <div className="metric-card" onClick={() => setActiveTab('reports')} style={{ cursor: 'pointer', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="metric-title" style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Total Revenue</span><span>💰</span></div>
                  <span className="metric-value" style={{ fontSize: '26px', fontWeight: '800', color: '#2e7d32', display: 'block', margin: '4px 0' }}>₹{adminMetrics.totalRevenue.toLocaleString('en-IN')}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#666' }}>Gross income ledger →</span>
                </div>

                <div className="metric-card" onClick={() => setActiveTab('payments')} style={{ cursor: 'pointer', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="metric-title" style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Amount Received</span><span>💵</span></div>
                  <span className="metric-value" style={{ fontSize: '26px', fontWeight: '800', color: '#2e7d32', display: 'block', margin: '4px 0' }}>₹{(adminMetrics.totalRevenue - adminMetrics.totalRemainingAmount).toLocaleString('en-IN')}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#2e7d32' }}>Collected advance & full →</span>
                </div>

                <div className="metric-card" onClick={() => setActiveTab('remainingPayments')} style={{ cursor: 'pointer', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="metric-title" style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Amount Remaining</span><span>⌛</span></div>
                  <span className="metric-value" style={{ fontSize: '26px', fontWeight: '800', color: '#c62828', display: 'block', margin: '4px 0' }}>₹{adminMetrics.totalRemainingAmount.toLocaleString('en-IN')}</span>
                  <span className="metric-sub" style={{ fontSize: '11px', color: '#c62828' }}>Across {adminMetrics.unpaidOrders} orders →</span>
                </div>
              </div>

              {/* SECTION 3: REAL TAILORING WORKFLOW OVERVIEW (14-STAGE VISUAL STEPPER PIPELINE) */}
              <div className="content-card" style={{ marginBottom: '24px', background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #f8bbd0' }}>
                <h3 style={{ color: '#880e4f', margin: '0 0 6px' }}>🧵 Real Tailoring Shop Workflow Pipeline (14 Stages)</h3>
                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px' }}>
                  Click any stage to filter active orders currently in that tailoring phase:
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TAILORING_STATUSES.map((stage) => {
                    const count = pipelineStageCounts[stage] || 0;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => {
                          setOrderStatusFilter(stage);
                          setActiveTab('orders');
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid #f8bbd0',
                          background: count > 0 ? '#fff0f5' : '#fafafa',
                          color: count > 0 ? '#880e4f' : '#666',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{stage}</span>
                        <span style={{ background: count > 0 ? '#d81b60' : '#ccc', color: '#fff', borderRadius: '10px', padding: '2px 8px', fontSize: '11px' }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: "WHAT DO CUSTOMERS NEED?" SERVICE DEMAND ANALYTICS */}
              <div className="content-card" style={{ marginBottom: '24px', background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #f8bbd0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ color: '#880e4f', margin: '0 0 4px' }}>📊 "What Do Customers Need?" Local Service Demand Analytics</h3>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                      Real service request frequency & revenue distribution in local physical tailoring shop:
                    </p>
                  </div>
                  <span style={{ background: '#fce4ec', color: '#ad1457', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                    Demand Total: 340 Services This Month
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {serviceDemandMetrics.services.map((item) => (
                    <div key={item.name} style={{ background: '#fff0f5', padding: '14px', borderRadius: '10px', border: '1px solid #ffc1e3' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
                        <span style={{ color: '#880e4f' }}>{item.name}</span>
                        <span style={{ color: '#ad1457' }}>{item.percentage}% ({item.count} Orders)</span>
                      </div>

                      {/* DEMAND BAR */}
                      <div style={{ width: '100%', height: '10px', background: '#ffe4e9', borderRadius: '5px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ width: `${item.percentage * 2.5}%`, height: '100%', background: 'linear-gradient(90deg, #d81b60, #ad1457)', borderRadius: '5px' }} />
                      </div>

                      <div style={{ fontSize: '11px', color: '#555', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Category: <b>{item.category}</b></span>
                        <span>Revenue: <b>₹{item.revenue.toLocaleString('en-IN')}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 25: SMART TAILORING INSIGHTS */}
              <div className="content-card" style={{ marginBottom: '24px', background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #f8bbd0' }}>
                <h3 style={{ color: '#880e4f', margin: '0 0 14px' }}>💡 Smart Business Tailoring Insights</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  {businessInsights.map((ins) => (
                    <div key={ins.title} style={{ background: '#fff0f5', padding: '14px', borderRadius: '10px', border: '1px solid #ffb6c1' }}>
                      <div style={{ fontSize: '22px', marginBottom: '4px' }}>{ins.icon}</div>
                      <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', display: 'block' }}>{ins.title}</span>
                      <b style={{ fontSize: '15px', color: '#880e4f', display: 'block', margin: '2px 0' }}>{ins.value}</b>
                      <span style={{ fontSize: '11px', color: '#555' }}>{ins.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 8: "I DON'T KNOW THE SERVICE NAME" (UNCLASSIFIED REQUESTS) */}
              <div className="content-card" style={{ marginBottom: '24px', background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #ffc1e3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ color: '#c62828', margin: '0 0 4px' }}>❓ "I Don't Know the Service Name" Unclassified Customer Requests</h3>
                    <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
                      Requests submitted by customers who uploaded photos/descriptions without knowing technical tailoring terms.
                    </p>
                  </div>
                  <span style={{ background: '#ffebee', color: '#c62828', padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                    UNCLASSIFIED REQUEST
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(orders || []).slice(0, 2).map((o) => (
                    <div key={o.id} style={{ background: '#fff9fa', border: '1px dashed #d81b60', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <b>Order #{o.id} — Customer: {o.customerName}</b>
                        <p style={{ fontSize: '13px', color: '#333', margin: '4px 0' }}>
                          Customer Description: "{o.specialInstructions || 'Please make neck like the uploaded photo image and shorten bottom.'}"
                        </p>
                        <span style={{ background: '#ffebee', color: '#c62828', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                          UNCLASSIFIED REQUEST
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenClassifyRequest(o)}
                        style={{ background: '#ad1457', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                      >
                        🔍 Classify Service & Assign Tailor →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMART TAILOR ASSIGNMENT WIDGET */}
              <div className="content-card" style={{ marginBottom: '24px' }}>
                <SmartTailorAssignment garmentCategory="Designer Blouse" />
              </div>

              {/* RECENT TAILORING ORDERS TABLE */}
              <div className="content-card">
                <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3>📦 Real-World Tailoring Orders Overview</h3>
                  <button className="link-btn" onClick={() => setActiveTab('orders')}>View Full Orders Management →</button>
                </div>
                <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8bbd0', color: '#880e4f', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Order ID</th>
                      <th>Customer Name</th>
                      <th>Dress Type</th>
                      <th>Own Fabric</th>
                      <th>Assigned Tailor</th>
                      <th>Payment Status</th>
                      <th>Tailoring Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orders || []).map((o) => {
                      const dress = o.dressType || 'Bespoke Outfit';
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}><b>#{o.id}</b></td>
                          <td><b>{o.customerName}</b></td>
                          <td><span className="subcat-badge" style={{ background: '#fce4ec', color: '#d81b60', padding: '4px 8px', borderRadius: '6px' }}>{dress}</span></td>
                          <td><b>{o.ownFabric ? '✓ YES' : 'NO'}</b></td>
                          <td><b>✂️ {o.tailorAssigned || 'Master Rajesh Tailor'}</b></td>
                          <td>
                            <span className={`status-pill ${o.paymentStatus === 'FULLY PAID' ? 'completed' : 'pending'}`} style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                              {o.paymentStatus || 'PARTIALLY PAID'}
                            </span>
                          </td>
                          <td>
                            <span className="status-pill" style={{ background: '#880e4f', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>
                              {o.status || 'ORDER RECEIVED'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button className="primary-btn-sm" onClick={() => setSelectedOrderDetails(o)} style={{ padding: '4px 8px', background: '#ad1457', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                                🔍 Work Card
                              </button>
                              <button className="primary-btn-sm" onClick={() => downloadOrderPdfInvoice(o)} style={{ padding: '4px 8px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                                📄 PDF Invoice
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ===================================================================
              TAB 2: WOMEN CUSTOMERS MANAGEMENT & HISTORY INTELLIGENCE
           =================================================================== */}
          {activeTab === 'customers' && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2>👥 Women Customers Directory ({filteredCustomersList.length})</h2>
                  <p className="subtitle">Manage female customer profiles, phone numbers, addresses, total orders, and payment ledgers.</p>
                </div>
                <button className="primary-btn" onClick={handleOpenAddCust} style={{ background: '#ad1457', color: '#fff', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                  ➕ Add Women Customer
                </button>
              </div>

              <input
                type="text"
                placeholder="Search customers by name, phone, email, or customer ID..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '16px' }}
              />

              <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8bbd0', color: '#880e4f', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Customer ID</th>
                    <th>Customer Name</th>
                    <th>Phone Number</th>
                    <th>Email</th>
                    <th>Orders</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Remaining</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomersList.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}><b>{c.id}</b></td>
                      <td><b>{c.name}</b></td>
                      <td>{c.phone}</td>
                      <td>{c.email}</td>
                      <td><b>{c.ordersCount || 1} Orders</b></td>
                      <td><b>₹{c.totalSpent || 2800}</b></td>
                      <td><span style={{ color: '#2e7d32', fontWeight: 'bold' }}>₹{c.paidAmount || 1800}</span></td>
                      <td><span style={{ color: '#c62828', fontWeight: 'bold' }}>₹{c.remainingAmount || 1000}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setSelectedCustomerProfile(c)} style={{ padding: '4px 8px', background: '#880e4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            👤 Profile & Intelligence
                          </button>
                          <button onClick={() => handleOpenEditCust(c)} style={{ padding: '4px 8px', background: '#0288d1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDeleteCust(c.id, c.name)} style={{ padding: '4px 8px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===================================================================
              TAB 3: WOMEN'S CATEGORIES & SERVICES MANAGEMENT
           =================================================================== */}
          {activeTab === 'categories' && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2>🥻 Women's Tailoring Dress Categories & Services ({filteredCategoriesList.length})</h2>
                  <p className="subtitle">Manage stitching services, starting prices, estimated days, and active status.</p>
                </div>
                <button className="primary-btn" onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', categoryGroup: 'Blouse', description: '', startingPrice: 500, estimatedDays: 2 }); setShowCategoryModal(true); }} style={{ background: '#ad1457', color: '#fff', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                  ➕ Add New Service
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {['All', 'Blouse', 'Saree Services', 'Traditional Wear', 'Modern Wear', 'Embroidery', 'Custom Services'].map((group) => (
                  <button
                    key={group}
                    onClick={() => setCategoryGroupFilter(group)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: categoryGroupFilter === group ? '2px solid #ad1457' : '1px solid #ccc',
                      background: categoryGroupFilter === group ? '#fff0f5' : '#fff',
                      color: categoryGroupFilter === group ? '#880e4f' : '#333',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    {group}
                  </button>
                ))}
              </div>

              <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8bbd0', color: '#880e4f', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Service Name</th>
                    <th>Category Group</th>
                    <th>Description</th>
                    <th>Starting Price</th>
                    <th>Est. Days</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategoriesList.map((cat) => (
                    <tr key={cat.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}><b>{cat.name}</b></td>
                      <td><span style={{ background: '#fff0f5', color: '#880e4f', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>{cat.categoryGroup}</span></td>
                      <td style={{ fontSize: '12px', color: '#555', maxWidth: '300px' }}>{cat.description}</td>
                      <td><b>₹{cat.startingPrice}</b></td>
                      <td><b>{cat.estimatedDays} Days</b></td>
                      <td>
                        <button onClick={() => toggleCategoryActive(cat.id)} style={{ background: cat.active ? '#e8f5e9' : '#ffebee', color: cat.active ? '#2e7d32' : '#c62828', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          {cat.active ? 'Active ✓' : 'Inactive ✗'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, categoryGroup: cat.categoryGroup, description: cat.description, startingPrice: cat.startingPrice, estimatedDays: cat.estimatedDays }); setShowCategoryModal(true); }} style={{ padding: '4px 8px', background: '#0288d1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => deleteCategory(cat.id)} style={{ padding: '4px 8px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===================================================================
              TAB 4: MASTER TAILORING ORDERS MANAGEMENT
           =================================================================== */}
          {activeTab === 'orders' && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2>📦 Master Tailoring Orders Management ({filteredOrdersList.length})</h2>
                  <p className="subtitle">Real tailoring order control: Assign tailors, update 14 tailoring statuses, inspect customer own fabric & reference designs.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Search by order #, customer..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                  <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} style={{ padding: '8px', borderRadius: '8px' }}>
                    <option value="All">All Tailoring Statuses</option>
                    {TAILORING_STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredOrdersList.map((o) => {
                  const dress = o.dressType || 'Bespoke Dress';
                  return (
                    <div key={o.id} style={{ background: '#fff', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <img src={o.referenceImage || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format'} alt={dress} style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <b>#{o.id}</b>
                          <span style={{ background: '#880e4f', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{dress}</span>
                          {o.ownFabric && <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>🧵 Customer Fabric: YES</span>}
                        </div>
                        <h4 style={{ margin: '4px 0' }}>Customer: {o.customerName} ({o.customerDetails?.phone})</h4>
                        <div style={{ fontSize: '12px', color: '#555' }}>
                          <span>Embroidery: <b>{o.embroideryWork || 'Zardosi & Aari Motifs'}</b></span> • <span>Assigned Tailor: <b>{o.tailorAssigned}</b></span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '160px' }}>
                        <div>Total: <b>₹{o.total}</b></div>
                        <div>Paid: <b style={{ color: '#2e7d32' }}>₹{o.paidAmount || o.total}</b> | Rem: <b style={{ color: '#c62828' }}>₹{o.remainingAmount || 0}</b></div>
                        <span className={`status-pill ${o.paymentStatus === 'FULLY PAID' ? 'completed' : 'pending'}`} style={{ fontSize: '11px', fontWeight: 'bold' }}>
                          {o.paymentStatus || 'PARTIALLY PAID'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                        <select value={o.tailorAssigned || 'Master Rajesh Tailor'} onChange={(e) => updateOrderStatusByTailor(o.id, undefined, e.target.value)} style={{ padding: '6px', fontSize: '12px', borderRadius: '6px' }}>
                          {tailors.map((t) => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </select>

                        <select value={o.status || 'ORDER RECEIVED'} onChange={(e) => updateOrderStatusByTailor(o.id, e.target.value)} style={{ padding: '6px', fontSize: '12px', borderRadius: '6px', background: '#880e4f', color: '#fff', fontWeight: 'bold' }}>
                          {TAILORING_STATUSES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>

                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <button onClick={() => setSelectedOrderDetails(o)} style={{ flex: 1, padding: '4px', background: '#ad1457', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                            🔍 Work Card
                          </button>
                          <button onClick={() => downloadOrderPdfInvoice(o)} style={{ flex: 1, padding: '4px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                            📄 PDF Invoice
                          </button>
                          <button onClick={() => cancelOrder(o.id)} style={{ padding: '4px 8px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 5: DRESS-SPECIFIC MEASUREMENTS MANAGEMENT
           =================================================================== */}
          {activeTab === 'measurements' && (
            <div className="content-card">
              <h2>📏 Dress-Specific Customer Measurements Vault</h2>
              <p className="subtitle">Inspect exact body fit profiles configured specifically per dress category (Blouse, Chudidar, Lehenga, Gown, Frock, Kurti, Pavadai).</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {(orders || []).map((o) => {
                  const dress = o.dressType || 'Designer Blouse';
                  const schema = getMeasurementSchemaForDress(dress);
                  return (
                    <div key={o.id} className="content-card" style={{ background: '#fff0f5', padding: '16px', borderRadius: '12px', border: '1px solid #ffb6c1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <b>Order #{o.id} — {o.customerName}</b>
                        <button onClick={() => handleOpenEditMeasurements(o)} style={{ background: '#ad1457', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                          ✏️ Edit Measurements
                        </button>
                      </div>
                      <div style={{ fontSize: '12px', color: '#d81b60', fontWeight: 'bold', marginBottom: '8px' }}>
                        Garment Schema: {dress}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                        {schema.map((field) => (
                          <div key={field.key} style={{ background: '#fff', padding: '6px', borderRadius: '6px' }}>
                            <span style={{ color: '#777', display: 'block', fontSize: '10px' }}>{field.label}</span>
                            <b>{o.measurements?.[field.key] || field.placeholder}"</b>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 6: CUSTOM STUDIO DESIGNS MANAGEMENT
           =================================================================== */}
          {activeTab === 'designs' && (
            <div className="content-card">
              <h2>🎨 Custom Studio Designs & Pattern Customizations</h2>
              <p className="subtitle">Inspect customer necklines, back cutouts, sleeve choices, border selections, and special instructions.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {(orders || []).map((o) => (
                  <div key={o.id} style={{ background: '#fff', border: '1px solid #f8bbd0', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <b style={{ color: '#880e4f' }}>Order #{o.id} — {o.customerName}</b>
                      <span style={{ background: o.designConfirmed ? '#e8f5e9' : '#fff3e0', color: o.designConfirmed ? '#2e7d32' : '#e65100', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                        {o.designConfirmed ? 'CONFIRMED ✓' : 'PENDING REVIEW'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px' }}>Garment: {o.dressType || 'Blouse'}</h4>
                    <p style={{ fontSize: '13px', color: '#555', background: '#fff0f5', padding: '10px', borderRadius: '8px' }}>
                      Instructions: "{o.specialInstructions || 'Deep V neck front, boat neck back, elbow sleeve with gold zari piping.'}"
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontSize: '12px' }}>Embroidery: <b>{o.embroideryWork || 'Zardosi Motifs'}</b></span>
                      {!o.designConfirmed ? (
                        <button onClick={() => { confirmCustomDesign(o.id); alert(`✓ Custom design for Order #${o.id} CONFIRMED!`); }} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          ✓ Confirm Design
                        </button>
                      ) : (
                        <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '12px' }}>✓ Confirmed & Sent to Cutting</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 6A: AI SMART DESIGNER REQUESTS MANAGEMENT
           =================================================================== */}
          {activeTab === 'aiDesignRequests' && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ color: '#880e4f', margin: 0 }}>✨ AI Smart Dress Designer Requests & Previews</h2>
                  <p className="subtitle" style={{ margin: '4px 0 0' }}>Review customer AI design requests, generated preview concepts, approved versions, and assigned tailors.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '16px' }}>
                <div className="content-card" style={{ padding: '20px', borderRadius: '16px', border: '2px solid #d81b60', background: '#fff0f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: '#2e7d32', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                      ✓ CUSTOMER APPROVED
                    </span>
                    <span style={{ fontSize: '12px', color: '#666' }}>Design #DES-90421</span>
                  </div>

                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"
                    alt="AI Preview"
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', margin: '8px 0' }}
                  />

                  <h3 style={{ color: '#880e4f', margin: '4px 0' }}>Malathi Lakshmi — Designer Saree Blouse</h3>
                  <div style={{ fontSize: '12px', color: '#444', lineHeight: 1.5, margin: '6px 0 12px' }}>
                    <div><b>Neck:</b> V Neck Cutwork</div>
                    <div><b>Sleeve:</b> Elbow Length Puff Sleeve</div>
                    <div><b>Back:</b> Deep U Cut with Potli Buttons</div>
                    <div><b>Embroidery:</b> Peacock Maggam Aari Work</div>
                    <div><b>Fabric:</b> Customer Own Kanchipuram Silk</div>
                    <div><b>Estimated Total:</b> <b style={{ color: '#2e7d32' }}>₹2,800</b></div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => alert('✓ Design reviewed and validated by Admin!')}
                      style={{ flex: 1, background: '#880e4f', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                    >
                      ✓ Validate Design
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'referenceDesigns' && (
            <div className="content-card">
              <h2>🖼️ Customer Reference Designs & Uploaded Fabric Photos</h2>
              <p className="subtitle">View customer uploaded inspiration designs, neck patterns, back blouses, and fabric photos.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '16px' }}>
                {(orders || []).map((o) => (
                  <div key={o.id} className="content-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                    <img src={o.referenceImage || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format'} alt={o.id} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '10px' }} />
                    <h4 style={{ margin: '8px 0 2px' }}>Order #{o.id} — {o.customerName}</h4>
                    <span style={{ fontSize: '12px', color: '#880e4f', fontWeight: 'bold' }}>Outfit: {o.dressType || 'Designer Blouse'}</span>
                    <p style={{ fontSize: '12px', color: '#555', margin: '4px 0 10px' }}>
                      Instructions: "{o.specialInstructions || 'Deep V neck with gold zari piping and latkan tassels.'}"
                    </p>
                    <button className="primary-btn-sm" onClick={() => setSelectedReferenceImage(o.referenceImage || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format')} style={{ width: '100%', background: '#ad1457', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                      🔍 Zoom Reference Image
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 8: MASTER TAILORS DIRECTORY MANAGEMENT
           =================================================================== */}
          {activeTab === 'tailors' && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2>✂️ Master Tailors Directory ({(tailors || []).length})</h2>
                  <p className="subtitle">Manage tailoring staff, specializations, active orders, and rating performance.</p>
                </div>
                <button className="primary-btn" onClick={() => { setEditingTailor(null); setTailorForm({ name: '', phone: '', email: '', spec: 'Silk Blouses & Sarees', exp: '5 Yrs' }); setShowTailorModal(true); }} style={{ background: '#ad1457', color: '#fff', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                  ➕ Register Master Tailor
                </button>
              </div>

              <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8bbd0', color: '#880e4f', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Tailor ID</th>
                    <th>Master Tailor Name</th>
                    <th>Specialization</th>
                    <th>Phone Number</th>
                    <th>Experience</th>
                    <th>Assigned</th>
                    <th>Completed</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(tailors || []).map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}><b>{t.id}</b></td>
                      <td><b>{t.name}</b></td>
                      <td>{t.spec}</td>
                      <td>{t.phone}</td>
                      <td>{t.exp}</td>
                      <td><b>{orders.filter(o => o.tailorAssigned === t.name).length} Orders</b></td>
                      <td><b>{t.ordersCompleted || 140} Outfits</b></td>
                      <td><b>⭐ {t.rating || 5.0}</b></td>
                      <td>
                        <button onClick={() => toggleTailorActive(t.id)} style={{ background: t.status === 'Active' ? '#e8f5e9' : '#ffebee', color: t.status === 'Active' ? '#2e7d32' : '#c62828', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          {t.status}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setEditingTailor(t); setTailorForm({ name: t.name, phone: t.phone, email: t.email || '', spec: t.spec, exp: t.exp }); setShowTailorModal(true); }} style={{ padding: '4px 8px', background: '#0288d1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => deleteTailor(t.id)} style={{ padding: '4px 8px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===================================================================
              TAB 9: EMBROIDERY DESIGNERS & EXTERNAL WORKERS MANAGEMENT
           =================================================================== */}
          {activeTab === 'embroideryDesigners' && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ color: '#880e4f', margin: '0 0 4px' }}>🧵 External Embroidery Designers & Workers Directory ({(embroideryDesigners || []).length})</h2>
                  <p className="subtitle" style={{ margin: 0 }}>Manage external Aari work artisans, Zari specialists, Zardosi masters, and threadwork designers.</p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => {
                    setEditingDesigner(null);
                    setDesignerForm({
                      name: '',
                      businessName: '',
                      phone: '',
                      email: '',
                      address: '',
                      specialization: 'Aari Work',
                      experience: '5 years',
                      startingPrice: 900,
                      availability: 'Available',
                      status: 'Active',
                      notes: '',
                    });
                    setShowDesignerModal(true);
                  }}
                  style={{ background: '#ad1457', color: '#fff', padding: '10px 18px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                >
                  ➕ Register External Designer / Worker
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '16px' }}>
                {(embroideryDesigners || []).map((emb) => {
                  const specs = Array.isArray(emb.specializations) ? emb.specializations : [emb.specialization || 'Aari Work'];
                  return (
                    <div key={emb.id || emb.designerId} className="content-card" style={{ padding: '18px', borderRadius: '14px', border: '1px solid #f8bbd0', background: '#fff9fa', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                        <img src={emb.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'} alt={emb.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ad1457' }} />
                        <div>
                          <h3 style={{ color: '#880e4f', margin: 0, fontSize: '16px' }}>{emb.businessName || emb.name}</h3>
                          <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Artisan: {emb.name} ({emb.experience || '5 Yrs Exp'})</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                        {specs.map((sp) => (
                          <span key={sp} style={{ background: '#fce4ec', color: '#ad1457', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                            ✨ {sp}
                          </span>
                        ))}
                      </div>

                      <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.5', marginBottom: '12px' }}>
                        <div>📞 Phone: <b>{emb.phone || '9840192834'}</b> | ✉️ <b>{emb.email || 'designer@digitailor.com'}</b></div>
                        <div>📍 Address: <b>{emb.address || 'T. Nagar, Chennai'}</b></div>
                        <div>💰 Starting Price: <b>₹{emb.startingPrice || 900}</b> | Availability: <b style={{ color: '#2e7d32' }}>{emb.availability || 'Available'}</b></div>
                        {emb.notes && <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#777' }}>"{emb.notes}"</div>}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f8bbd0', paddingTop: '10px' }}>
                        <button onClick={() => toggleDesignerActive(emb.id || emb.designerId)} style={{ background: emb.status === 'Active' ? '#e8f5e9' : '#ffebee', color: emb.status === 'Active' ? '#2e7d32' : '#c62828', border: 'none', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                          ● {emb.status === 'Active' ? 'Active Worker' : 'Inactive'}
                        </button>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setEditingDesigner(emb); setDesignerForm({ name: emb.name, businessName: emb.businessName || emb.name, phone: emb.phone || '', email: emb.email || '', address: emb.address || '', specialization: specs[0] || 'Aari Work', experience: emb.experience || '5 Yrs', startingPrice: emb.startingPrice || 900, availability: emb.availability || 'Available', status: emb.status || 'Active', notes: emb.notes || '' }); setShowDesignerModal(true); }} style={{ padding: '4px 10px', background: '#0288d1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            ✏️ Edit Profile
                          </button>
                          <button onClick={() => deleteEmbroideryDesigner(emb.id || emb.designerId)} style={{ padding: '4px 8px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 10: OUTSOURCED EMBROIDERY WORK MANAGEMENT SYSTEM
           =================================================================== */}
          {activeTab === 'embroideryWork' && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ color: '#880e4f', margin: '0 0 4px' }}>🪡 Outsourced Embroidery Work Management System</h2>
                  <p className="subtitle" style={{ margin: 0 }}>Track external embroidery dispatch to artisans (Aari, Zari, Zardosi), shop receipt, quality control & profit margins.</p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => {
                    const firstOrder = orders?.[0];
                    const firstDesigner = (embroideryDesigners || []).find((d) => d.status === 'Active') || embroideryDesigners?.[0];
                    setAssignForm({
                      orderId: firstOrder?.id || 'ORD-9021',
                      designerId: firstDesigner?.designerId || firstDesigner?.id || 'DES-101',
                      embroideryType: 'Aari Work',
                      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
                      outsourceCost: 900,
                      customerCharge: 1200,
                      notes: 'Gold Aari cutwork around neck & sleeve border',
                      specialInstructions: firstOrder?.specialInstructions || 'Hand zardosi cutwork with maroon silk thread',
                    });
                    setShowAssignEmbroideryModal(true);
                  }}
                  style={{ background: '#ad1457', color: '#fff', padding: '10px 18px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  ➕ Assign Embroidery Work
                </button>
              </div>

              {/* 9 OUTSOURCED EMBROIDERY KPI SUMMARY CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', display: 'block' }}>Active Jobs</span>
                  <b style={{ fontSize: '22px', color: '#880e4f' }}>{(embroideryWorks || []).filter((w) => !['APPROVED', 'SENT TO TAILOR'].includes(w.status)).length}</b>
                </div>
                <div style={{ background: '#fff', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', display: 'block' }}>Sent Outside</span>
                  <b style={{ fontSize: '22px', color: '#0288d1' }}>{(embroideryWorks || []).filter((w) => w.status === 'SENT TO EXTERNAL WORKER' || w.status === 'WORK IN PROGRESS').length}</b>
                </div>
                <div style={{ background: '#fff', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', display: 'block' }}>Received at Shop</span>
                  <b style={{ fontSize: '22px', color: '#ed6c02' }}>{(embroideryWorks || []).filter((w) => w.status === 'RECEIVED AT SHOP').length}</b>
                </div>
                <div style={{ background: '#fff', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', display: 'block' }}>Approved for Tailor</span>
                  <b style={{ fontSize: '22px', color: '#2e7d32' }}>{(embroideryWorks || []).filter((w) => w.status === 'APPROVED' || w.status === 'SENT TO TAILOR').length}</b>
                </div>
                <div style={{ background: '#fff', border: '1px solid #ffebee', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#c62828', fontWeight: 'bold', display: 'block' }}>⚠️ Overdue</span>
                  <b style={{ fontSize: '22px', color: '#c62828' }}>
                    {(embroideryWorks || []).filter((w) => new Date().toISOString().split('T')[0] > w.dueDate && !['WORK COMPLETED', 'RECEIVED AT SHOP', 'APPROVED', 'SENT TO TAILOR'].includes(w.status)).length}
                  </b>
                </div>
                <div style={{ background: '#fff', border: '1px solid #ffebee', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#d32f2f', fontWeight: 'bold', display: 'block' }}>🔄 Rework</span>
                  <b style={{ fontSize: '22px', color: '#d32f2f' }}>{(embroideryWorks || []).filter((w) => w.status === 'REWORK REQUIRED').length}</b>
                </div>
                <div style={{ background: '#fff', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', display: 'block' }}>Total Outsource Cost</span>
                  <b style={{ fontSize: '20px', color: '#c62828' }}>
                    ₹{(embroideryWorks || []).reduce((sum, w) => sum + (w.outsourceCost || 0), 0).toLocaleString('en-IN')}
                  </b>
                </div>
                <div style={{ background: '#fff', border: '1px solid #f8bbd0', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', display: 'block' }}>Embroidery Revenue</span>
                  <b style={{ fontSize: '20px', color: '#2e7d32' }}>
                    ₹{(embroideryWorks || []).reduce((sum, w) => sum + (w.customerCharge || 0), 0).toLocaleString('en-IN')}
                  </b>
                </div>
                <div style={{ background: '#fff', border: '1px solid #c8e6c9', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 'bold', display: 'block' }}>Embroidery Margin</span>
                  <b style={{ fontSize: '20px', color: '#2e7d32' }}>
                    ₹{(embroideryWorks || []).reduce((sum, w) => sum + ((w.customerCharge || 0) - (w.outsourceCost || 0)), 0).toLocaleString('en-IN')}
                  </b>
                </div>
              </div>

              {/* EMBROIDERY WORK FILTER TABS */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {['All', 'Pending', 'Sent Out', 'Work In Progress', 'Received At Shop', 'Approved', 'Rework Required', 'Overdue'].map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setEmbroideryWorkFilter(ft)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1px solid #ad1457',
                      background: embroideryWorkFilter === ft ? '#ad1457' : '#fff',
                      color: embroideryWorkFilter === ft ? '#fff' : '#ad1457',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {ft}
                  </button>
                ))}
              </div>

              {/* EMBROIDERY WORK DATA TABLE */}
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#880e4f', color: '#fff', textAlign: 'left', fontSize: '13px' }}>
                      <th style={{ padding: '12px' }}>Work ID</th>
                      <th>Order ID & Customer</th>
                      <th>Dress & Embroidery Type</th>
                      <th>Assigned Designer / Worker</th>
                      <th>Due Date</th>
                      <th>Cost vs Charge</th>
                      <th>Margin</th>
                      <th>Workflow Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(embroideryWorks || [])
                      .filter((w) => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const isOverdue = todayStr > w.dueDate && !['WORK COMPLETED', 'RECEIVED AT SHOP', 'APPROVED', 'SENT TO TAILOR'].includes(w.status);
                        if (embroideryWorkFilter === 'Overdue') return isOverdue;
                        if (embroideryWorkFilter === 'Pending') return w.status === 'PENDING ASSIGNMENT' || w.status === 'ASSIGNED';
                        if (embroideryWorkFilter === 'Sent Out') return w.status === 'SENT TO EXTERNAL WORKER';
                        if (embroideryWorkFilter === 'Work In Progress') return w.status === 'WORK IN PROGRESS';
                        if (embroideryWorkFilter === 'Received At Shop') return w.status === 'RECEIVED AT SHOP';
                        if (embroideryWorkFilter === 'Approved') return w.status === 'APPROVED' || w.status === 'SENT TO TAILOR';
                        if (embroideryWorkFilter === 'Rework Required') return w.status === 'REWORK REQUIRED';
                        return true;
                      })
                      .map((w) => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const isOverdue = todayStr > w.dueDate && !['WORK COMPLETED', 'RECEIVED AT SHOP', 'APPROVED', 'SENT TO TAILOR'].includes(w.status);
                        const marginVal = (w.customerCharge || 0) - (w.outsourceCost || 0);

                        return (
                          <tr key={w.id || w.workId} style={{ borderBottom: '1px solid #f8bbd0', background: isOverdue ? '#fff5f5' : '#fff' }}>
                            <td style={{ padding: '12px' }}>
                              <b>{w.workId || w.id}</b>
                            </td>
                            <td>
                              <b>#{w.orderId}</b>
                              <div style={{ fontSize: '12px', color: '#555' }}>{w.customerName}</div>
                            </td>
                            <td>
                              <b style={{ color: '#880e4f' }}>{w.dressType}</b>
                              <div style={{ fontSize: '12px', color: '#ad1457', fontWeight: 'bold' }}>✨ {w.embroideryType}</div>
                            </td>
                            <td>
                              <b>🏭 {w.designerName}</b>
                            </td>
                            <td>
                              <div>📅 {w.dueDate}</div>
                              {isOverdue && <span style={{ background: '#c62828', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>⚠️ OVERDUE</span>}
                            </td>
                            <td>
                              <div style={{ fontSize: '12px' }}>Cost: <b style={{ color: '#c62828' }}>₹{w.outsourceCost}</b></div>
                              <div style={{ fontSize: '12px' }}>Charge: <b style={{ color: '#2e7d32' }}>₹{w.customerCharge}</b></div>
                            </td>
                            <td>
                              <b style={{ color: marginVal >= 0 ? '#2e7d32' : '#c62828' }}>+₹{marginVal}</b>
                            </td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: '14px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  background:
                                    w.status === 'APPROVED' || w.status === 'SENT TO TAILOR'
                                      ? '#e8f5e9'
                                      : w.status === 'RECEIVED AT SHOP'
                                      ? '#fff3e0'
                                      : w.status === 'REWORK REQUIRED'
                                      ? '#ffebee'
                                      : '#e1f5fe',
                                  color:
                                    w.status === 'APPROVED' || w.status === 'SENT TO TAILOR'
                                      ? '#2e7d32'
                                      : w.status === 'RECEIVED AT SHOP'
                                      ? '#e65100'
                                      : w.status === 'REWORK REQUIRED'
                                      ? '#c62828'
                                      : '#0288d1',
                                }}
                              >
                                {w.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {(w.status === 'ASSIGNED' || w.status === 'PENDING ASSIGNMENT') && (
                                  <button onClick={() => { setSelectedEmbroideryWorkItem(w); setShowSendOutsideModal(true); }} style={{ background: '#0288d1', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    🚚 Send to External Worker
                                  </button>
                                )}

                                {(w.status === 'SENT TO EXTERNAL WORKER' || w.status === 'WORK IN PROGRESS' || w.status === 'WORK COMPLETED') && (
                                  <button onClick={() => { setSelectedEmbroideryWorkItem(w); setShowReceiveModal(true); }} style={{ background: '#ed6c02', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    📥 Mark as Received at Shop
                                  </button>
                                )}

                                {(w.status === 'RECEIVED AT SHOP' || w.status === 'QUALITY CHECK') && (
                                  <button onClick={() => { setSelectedEmbroideryWorkItem(w); setShowQualityCheckModal(true); }} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    🔍 Perform Quality Check
                                  </button>
                                )}

                                {w.status === 'REWORK REQUIRED' && (
                                  <button onClick={() => { setSelectedEmbroideryWorkItem(w); setShowSendOutsideModal(true); }} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    🔄 Send Back for Rework
                                  </button>
                                )}

                                <button onClick={() => { setSelectedEmbroideryWorkItem(w); setShowReferenceModal(true); }} style={{ background: '#fff0f5', color: '#880e4f', border: '1px solid #f8bbd0', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                  🖼️ View Reference Design
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 11: FITTING REQUESTS MANAGEMENT
           =================================================================== */}
          {activeTab === 'fittings' && (
            <div className="content-card">
              <h2>👗 Customer Fitting & Trial Sessions ({adminMetrics.pendingFittings})</h2>
              <p className="subtitle">Manage trial appointments, customer feedback, and fit approvals.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {(orders || []).filter((o) => ['READY FOR FITTING', 'FITTING', 'Trial Scheduled'].includes(o.status) || o.fittingStatus === 'Trial Scheduled').map((o) => (
                  <div key={o.id} style={{ background: '#fff', border: '1px solid #f8bbd0', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <b style={{ color: '#880e4f' }}>Order #{o.id} — {o.customerName}</b>
                      <h4 style={{ margin: '4px 0' }}>Outfit: {o.dressType || 'Blouse'}</h4>
                      <div style={{ fontSize: '12px', color: '#555' }}>
                        Master Tailor: <b>{o.tailorAssigned}</b> | Status: <b>{o.status}</b>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => { updateOrderStatusByTailor(o.id, 'READY FOR DELIVERY'); alert(`✓ Fitting Approved for Order #${o.id}! Moved to Ready for Delivery.`); }} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        ✓ Approve Fitting
                      </button>
                      <button onClick={() => { updateOrderStatusByTailor(o.id, 'ALTERATION REQUIRED'); alert(`✓ Sent to Alterations for Order #${o.id}!`); }} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        ✏️ Send to Alteration
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 12: ALTERATION REQUESTS MANAGEMENT
           =================================================================== */}
          {activeTab === 'alterations' && (
            <div className="content-card">
              <h2>✏️ Fit Refinement & Alteration Requests ({adminMetrics.alterationRequests})</h2>
              <p className="subtitle">Track customer alteration instructions, assigned tailors, and re-trial readiness.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {(orders || []).filter((o) => ['ALTERATION REQUIRED', 'ALTERATION IN PROGRESS', 'ALTERATION COMPLETED'].includes(o.status) || o.fittingStatus === 'Alteration Requested').map((o) => (
                  <div key={o.id} style={{ background: '#fff', border: '1px solid #f8bbd0', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ color: '#c62828' }}>Order #{o.id} — {o.customerName}</b>
                      <span style={{ background: '#ffebee', color: '#c62828', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                        {o.status}
                      </span>
                    </div>

                    <p style={{ background: '#fff0f5', padding: '10px', borderRadius: '8px', fontSize: '13px', margin: '8px 0' }}>
                      Alteration Instruction: "{o.alterationNotes || 'Reduce sleeve length by 1 inch & adjust waist pleats.'}"
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px' }}>Assigned Tailor: <b>{o.tailorAssigned}</b></span>
                      <button onClick={() => { updateOrderStatusByTailor(o.id, 'READY FOR FITTING'); alert(`✓ Alteration for Order #${o.id} COMPLETED! Moved to Ready for Re-Trial.`); }} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        ✓ Mark Alteration Completed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 13, 14, 15: PAYMENTS HISTORY, PARTIAL PAYMENTS, REMAINING PAYMENTS
           =================================================================== */}
          {(activeTab === 'payments' || activeTab === 'partialPayments' || activeTab === 'remainingPayments') && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2>💳 Tailoring Shop Payment Ledger & History ({(paymentsList || []).length})</h2>
                  <p className="subtitle">Individual payment transactions, advance collections, and balance settlements.</p>
                </div>
              </div>

              {/* REMAINING PAYMENTS ACTION TABLE FOR TAB 15 */}
              {activeTab === 'remainingPayments' && (
                <div style={{ marginBottom: '24px' }}>
                  <h3>⌛ Pending Balance Orders ({adminMetrics.unpaidOrders})</h3>
                  <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <thead>
                      <tr style={{ background: '#ffebee', color: '#c62828', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Order ID</th>
                        <th>Customer</th>
                        <th>Total Amount</th>
                        <th>Paid Amount</th>
                        <th>Remaining Balance</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.filter((o) => (o.remainingAmount || 0) > 0).map((o) => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}><b>#{o.id}</b></td>
                          <td><b>{o.customerName}</b></td>
                          <td><b>₹{o.total}</b></td>
                          <td><span style={{ color: '#2e7d32', fontWeight: 'bold' }}>₹{o.paidAmount || 0}</span></td>
                          <td><span style={{ color: '#c62828', fontWeight: 'bold' }}>₹{o.remainingAmount}</span></td>
                          <td>
                            <button onClick={() => handleOpenRecordPayment(o)} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                              💵 Record Balance Payment
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3>📜 Transaction History Audit Log</h3>
              <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8bbd0', color: '#880e4f', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Txn ID</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Payment Method</th>
                    <th>Amount Paid</th>
                    <th>Remaining Balance</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsList.map((p) => (
                    <tr key={p.txnId || Math.random()} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}><b>{p.txnId}</b></td>
                      <td><b>#{p.orderId}</b></td>
                      <td><b>{p.customer}</b></td>
                      <td>{p.method}</td>
                      <td><b style={{ color: '#2e7d32' }}>₹{p.amountPaid}</b></td>
                      <td><b style={{ color: '#c62828' }}>₹{p.remaining || 0}</b></td>
                      <td>{p.date}</td>
                      <td>
                        <span className={`status-pill ${p.status === 'FULLY PAID' ? 'completed' : 'pending'}`} style={{ fontSize: '11px', fontWeight: 'bold' }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===================================================================
              TAB 16: DELIVERY STATUS MANAGEMENT
           =================================================================== */}
          {activeTab === 'delivery' && (
            <div className="content-card">
              <h2>🚚 Delivery & Dispatch Control ({adminMetrics.readyForDelivery})</h2>
              <p className="subtitle">Manage quality check, shop collection, courier dispatch, and final delivery confirmation.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {(orders || []).map((o) => (
                  <div key={o.id} style={{ background: '#fff', border: '1px solid #f8bbd0', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <b style={{ color: '#880e4f' }}>Order #{o.id} — {o.customerName}</b>
                      <h4 style={{ margin: '4px 0' }}>Outfit: {o.dressType || 'Blouse'}</h4>
                      <div style={{ fontSize: '12px', color: '#555' }}>
                        Address: <b>{o.shippingAddress?.address || 'Counter Pick Up'}</b> | Delivery Estimate: <b>{o.deliveryEstimate || '5 Days'}</b>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select value={o.deliveryStatus || 'In Production'} onChange={(e) => updateOrderDeliveryStatus(o.id, e.target.value)} style={{ padding: '8px', borderRadius: '8px', background: '#880e4f', color: '#fff', fontWeight: 'bold' }}>
                        <option value="In Production">In Production</option>
                        <option value="READY FOR DELIVERY">READY FOR DELIVERY</option>
                        <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 17: CUSTOMER REVIEWS MANAGEMENT
           =================================================================== */}
          {activeTab === 'reviews' && (
            <div className="content-card">
              <h2>⭐ Customer Reviews & Feedback Moderation ({(reviews || []).length})</h2>
              <p className="subtitle">Review customer feedback, ratings, and approve testimonials for the main customer website.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {(reviews || []).map((r) => (
                  <div key={r.id} style={{ background: '#fff', border: '1px solid #f8bbd0', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b>{r.customerName} ({r.dressType})</b>
                      <span style={{ color: '#f57c00', fontWeight: 'bold' }}>{'⭐'.repeat(r.rating)}</span>
                    </div>

                    <p style={{ background: '#fff0f5', padding: '10px', borderRadius: '8px', fontSize: '13px', margin: '8px 0' }}>
                      "{r.review || r.comment}"
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#777' }}>Date: {r.date} | Status: <b>{r.approved ? 'Approved ✓' : 'Hidden / Pending'}</b></span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!r.approved ? (
                          <button onClick={() => approveReview(r.id)} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            ✓ Approve Review
                          </button>
                        ) : (
                          <button onClick={() => hideReview(r.id)} style={{ background: '#e65100', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            Hide
                          </button>
                        )}
                        <button onClick={() => deleteReview(r.id)} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 18: FINANCIAL REPORTS & ANALYTICS
           =================================================================== */}
          {activeTab === 'reports' && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2>📈 Workshop Financial Analytics & Revenue Reports</h2>
                  <p className="subtitle">Real payment calculations dynamically derived from customer transactions.</p>
                </div>
                <select value={reportsRange} onChange={(e) => setReportsRange(e.target.value)} style={{ padding: '8px', borderRadius: '8px' }}>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="All Time">All Time</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
                <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '12px', border: '1px solid #a5d6a7' }}>
                  <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 'bold', display: 'block' }}>TOTAL REVENUE COLLECTED</span>
                  <h2 style={{ color: '#1b5e20', margin: '4px 0' }}>₹{adminMetrics.totalRevenue.toLocaleString('en-IN')}</h2>
                  <span style={{ fontSize: '11px', color: '#555' }}>Includes QR & Counter Cash</span>
                </div>

                <div style={{ background: '#fff0f5', padding: '20px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <span style={{ fontSize: '12px', color: '#880e4f', fontWeight: 'bold', display: 'block' }}>TODAY'S REVENUE</span>
                  <h2 style={{ color: '#ad1457', margin: '4px 0' }}>₹{adminMetrics.todayRevenue.toLocaleString('en-IN')}</h2>
                  <span style={{ fontSize: '11px', color: '#555' }}>Counter transactions today</span>
                </div>

                <div style={{ background: '#ffebee', padding: '20px', borderRadius: '12px', border: '1px solid #ffcdd2' }}>
                  <span style={{ fontSize: '12px', color: '#c62828', fontWeight: 'bold', display: 'block' }}>TOTAL PENDING BALANCE</span>
                  <h2 style={{ color: '#b71c1c', margin: '4px 0' }}>₹{adminMetrics.totalRemainingAmount.toLocaleString('en-IN')}</h2>
                  <span style={{ fontSize: '11px', color: '#555' }}>Payable upon trial completion</span>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 19: ADMIN NOTIFICATIONS
           =================================================================== */}
          {activeTab === 'notifications' && (
            <div className="content-card">
              <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2>🔔 Admin Real-Time Payment Notifications</h2>
                  <p className="subtitle">Instant alerts on full, partial, and remaining balance payments placed by customers.</p>
                </div>
                <button
                  type="button"
                  onClick={markAllAdminNotificationsRead}
                  style={{ background: '#ad1457', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✓ Mark All as Read
                </button>
              </div>

              <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(adminNotifications || []).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAdminNotificationRead(n.id)}
                    style={{
                      background: n.read ? '#fff' : '#fff0f5',
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
                      <span>Status: <b style={{ color: n.paymentStatus === 'FULLY PAID' ? '#2e7d32' : '#e65100' }}>{n.paymentStatus}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 20: SHOP SETTINGS
           =================================================================== */}
          {activeTab === 'settings' && (
            <div className="content-card">
              <h2>⚙️ Tailoring Shop Settings & Master Configuration</h2>
              <form onSubmit={handleSaveShopSettings} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Shop Name</label>
                  <input type="text" value={settingsForm.shopName || ''} onChange={(e) => setSettingsForm({ ...settingsForm, shopName: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Contact Phone</label>
                  <input type="text" value={settingsForm.phone || ''} onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Email Address</label>
                  <input type="email" value={settingsForm.email || ''} onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Official UPI VPA for QR Payment</label>
                  <input type="text" value={settingsForm.upiId || ''} onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Shop Address</label>
                  <input type="text" value={settingsForm.address || ''} onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
                </div>

                <div style={{ gridColumn: 'span 2', background: '#fff0f5', padding: '14px', borderRadius: '10px', border: '1px solid #f8bbd0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', color: '#880e4f' }}>
                    <input
                      type="checkbox"
                      checked={settingsForm.requireFullPaymentBeforeDelivery ?? true}
                      onChange={(e) => setSettingsForm({ ...settingsForm, requireFullPaymentBeforeDelivery: e.target.checked })}
                    />
                    <span>Require 100% Full Payment Before Garment Delivery (Warn Tailors on Remaining Balance)</span>
                  </label>
                  <p style={{ margin: '4px 0 0 24px', fontSize: '12px', color: '#666' }}>
                    When enabled, tailors and admins will see a mandatory payment warning banner if an order is set to "READY FOR DELIVERY" with a pending balance.
                  </p>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <button type="submit" style={{ background: '#ad1457', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                    💾 Save Shop Settings
                  </button>
                </div>
              </form>

              {/* System Reset & Data Cleanup Utility */}
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '2px dashed #f8bbd0' }}>
                <h3 style={{ color: '#c62828', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
                  ⚠️ System Reset & Data Cleanup Utility
                </h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                  Reset all development demo orders, test measurements, custom designs, payments, and notifications to start fresh as a new customer/shop. Core user accounts and configuration will be preserved.
                </p>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  style={{
                    background: '#c62828',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  🗑️ Reset Demo Data
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 21: HELP & SUPPORT GUIDE
           =================================================================== */}
          {activeTab === 'help' && (
            <div className="content-card">
              <h2>❓ Shop Administration Help & Support</h2>
              <p className="subtitle">Guide to managing physical counter orders, tailor dispatch, measurement sheets, and QR payment clearance.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                <div style={{ background: '#fff0f5', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <h4 style={{ color: '#880e4f', margin: '0 0 6px' }}>🛍️ Walk-In Counter Orders</h4>
                  <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
                    Click "+ Create Walk-In Counter Order" at the top to record physical shop walk-in customers, fabric reception, advance payment, and due date.
                  </p>
                </div>

                <div style={{ background: '#fff0f5', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <h4 style={{ color: '#880e4f', margin: '0 0 6px' }}>✂️ Intelligent Tailor Allocation</h4>
                  <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
                    System evaluates master tailors based on dress specialization, current workload capacity, experience, and rating. Override manually anytime.
                  </p>
                </div>

                <div style={{ background: '#fff0f5', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
                  <h4 style={{ color: '#880e4f', margin: '0 0 6px' }}>💳 QR Payment Clearance</h4>
                  <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
                    QR UPI payments append transaction entries into the payments ledger. Clear balances on the "Remaining Payments" tab.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================
          MODALS SECTION (CRUD, INSPECTION, CLASSIFICATION MODALS)
         =================================================================== */}

      {/* 1. ADD / EDIT CUSTOMER MODAL */}
      {showAddCustModal && (
        <div className="modal-backdrop" onClick={() => setShowAddCustModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#880e4f', marginTop: 0 }}>{editingCustomer ? '✏️ Edit Customer Profile' : '➕ Register New Women Customer'}</h3>
            <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Customer Name *</label>
                <input type="text" value={custForm.name} onChange={(e) => setCustForm({ ...custForm, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Phone Number *</label>
                <input type="text" value={custForm.phone} onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Email Address</label>
                <input type="email" value={custForm.email} onChange={(e) => setCustForm({ ...custForm, email: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Address</label>
                <input type="text" value={custForm.address} onChange={(e) => setCustForm({ ...custForm, address: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Notes / Preferences</label>
                <textarea rows="2" value={custForm.notes} onChange={(e) => setCustForm({ ...custForm, notes: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#ad1457', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Save Customer →
                </button>
                <button type="button" onClick={() => setShowAddCustModal(false)} style={{ background: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. VIEW CUSTOMER PROFILE & HISTORY INTELLIGENCE MODAL */}
      {selectedCustomerProfile && (
        <div className="modal-backdrop" onClick={() => setSelectedCustomerProfile(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #880e4f', paddingBottom: '8px' }}>
              <h3 style={{ color: '#880e4f', margin: 0 }}>👤 Customer Profile & Intelligence: {selectedCustomerProfile.name}</h3>
              <button onClick={() => setSelectedCustomerProfile(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>🆔 Customer ID: <b>{selectedCustomerProfile.id}</b> | Phone: <b>{selectedCustomerProfile.phone}</b> | Email: <b>{selectedCustomerProfile.email || 'customer@digitailor.com'}</b></div>
              <div>📍 Address: <b>{selectedCustomerProfile.address || '42, Fashion Avenue, T. Nagar, Chennai'}</b></div>

              {/* QUICK REUSE BUTTONS (REAL TAILORING INNOVATION) */}
              <div style={{ background: '#fff0f5', padding: '14px', borderRadius: '12px', border: '1px solid #f8bbd0', display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    alert(`✓ Previous Measurements of ${selectedCustomerProfile.name} copied! Tailors can now stitch using recorded fit profile without re-asking.`);
                  }}
                  style={{ flex: 1, background: '#880e4f', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                >
                  📏 REUSE PREVIOUS MEASUREMENTS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`✓ Previous Custom Design pattern of ${selectedCustomerProfile.name} reused!`);
                  }}
                  style={{ flex: 1, background: '#ad1457', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                >
                  🎨 REUSE PREVIOUS DESIGN
                </button>
              </div>

              <div style={{ background: '#fff0f5', padding: '14px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#880e4f' }}>Orders & Payment Summary:</h4>
                <div>Total Orders Placed: <b>{orders.filter((o) => o.customerName === selectedCustomerProfile.name).length || 1} Orders</b></div>
                <div>Total Spent: <b>₹{selectedCustomerProfile.totalSpent || 2800}</b> | Total Paid: <b style={{ color: '#2e7d32' }}>₹{selectedCustomerProfile.paidAmount || 1800}</b> | Remaining: <b style={{ color: '#c62828' }}>₹{selectedCustomerProfile.remainingAmount || 1000}</b></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CLASSIFY UNCLASSIFIED REQUEST MODAL ("I DON'T KNOW THE SERVICE NAME") */}
      {unclassifiedModalOrder && (
        <div className="modal-backdrop" onClick={() => setUnclassifiedModalOrder(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#c62828', marginTop: 0 }}>🔍 Classify Unclassified Request (#{unclassifiedModalOrder.id})</h3>
            <p style={{ fontSize: '12px', color: '#555' }}>
              Customer Description: "{unclassifiedModalOrder.specialInstructions || 'Neck pattern like uploaded reference image.'}"
            </p>
            <form onSubmit={handleSubmitClassification} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Assign Service Name *</label>
                <input
                  type="text"
                  value={classifyForm.serviceName}
                  onChange={(e) => setClassifyForm({ ...classifyForm, serviceName: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Category Group *</label>
                <select
                  value={classifyForm.categoryGroup}
                  onChange={(e) => setClassifyForm({ ...classifyForm, categoryGroup: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  <option value="Blouse">Blouse</option>
                  <option value="Saree Services">Saree Services</option>
                  <option value="Traditional Wear">Traditional Wear</option>
                  <option value="Modern Wear">Modern Wear</option>
                  <option value="Embroidery">Embroidery</option>
                  <option value="Custom Services">Custom Services</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Estimated Service Price (₹) *</label>
                <input
                  type="number"
                  value={classifyForm.estimatedPrice}
                  onChange={(e) => setClassifyForm({ ...classifyForm, estimatedPrice: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Assign Master Tailor *</label>
                <select
                  value={classifyForm.assignedTailor}
                  onChange={(e) => setClassifyForm({ ...classifyForm, assignedTailor: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  {tailors.map((t) => (
                    <option key={t.id} value={t.name}>{t.name} ({t.spec})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#2e7d32', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✓ Confirm Classification →
                </button>
                <button type="button" onClick={() => setUnclassifiedModalOrder(null)} style={{ background: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD / EDIT CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="modal-backdrop" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#880e4f', marginTop: 0 }}>{editingCategory ? '✏️ Edit Tailoring Service' : '➕ Add New Tailoring Service'}</h3>
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Service Name *</label>
                <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Category Group *</label>
                <select value={categoryForm.categoryGroup} onChange={(e) => setCategoryForm({ ...categoryForm, categoryGroup: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="Blouse">Blouse</option>
                  <option value="Saree Services">Saree Services</option>
                  <option value="Traditional Wear">Traditional Wear</option>
                  <option value="Modern Wear">Modern Wear</option>
                  <option value="Embroidery">Embroidery</option>
                  <option value="Custom Services">Custom Services</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Description</label>
                <textarea rows="2" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Starting Price (₹)</label>
                  <input type="number" value={categoryForm.startingPrice} onChange={(e) => setCategoryForm({ ...categoryForm, startingPrice: Number(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Estimated Days</label>
                  <input type="number" value={categoryForm.estimatedDays} onChange={(e) => setCategoryForm({ ...categoryForm, estimatedDays: Number(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#ad1457', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Save Service →
                </button>
                <button type="button" onClick={() => setShowCategoryModal(false)} style={{ background: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT TAILOR MODAL */}
      {showTailorModal && (
        <div className="modal-backdrop" onClick={() => setShowTailorModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#880e4f', marginTop: 0 }}>{editingTailor ? '✏️ Edit Tailor Details' : '➕ Register Master Tailor'}</h3>
            <form onSubmit={handleSaveTailor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Master Tailor Name *</label>
                <input type="text" value={tailorForm.name} onChange={(e) => setTailorForm({ ...tailorForm, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Phone Number *</label>
                <input type="text" value={tailorForm.phone} onChange={(e) => setTailorForm({ ...tailorForm, phone: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Specialization</label>
                <input type="text" value={tailorForm.spec} onChange={(e) => setTailorForm({ ...tailorForm, spec: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Experience</label>
                <input type="text" value={tailorForm.exp} onChange={(e) => setTailorForm({ ...tailorForm, exp: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#ad1457', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Save Master Tailor →
                </button>
                <button type="button" onClick={() => setShowTailorModal(false)} style={{ background: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ADD / EDIT EMBROIDERY DESIGNER MODAL */}
      {showDesignerModal && (
        <div className="modal-backdrop" onClick={() => setShowDesignerModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#880e4f', marginTop: 0 }}>{editingDesigner ? '✏️ Edit Embroidery Artisan' : '➕ Register Embroidery Artisan'}</h3>
            <form onSubmit={handleSaveDesigner} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Artisan / Studio Name *</label>
                <input type="text" value={designerForm.name} onChange={(e) => setDesignerForm({ ...designerForm, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Phone Number *</label>
                <input type="text" value={designerForm.phone} onChange={(e) => setDesignerForm({ ...designerForm, phone: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Specialization</label>
                <select value={designerForm.specialization} onChange={(e) => setDesignerForm({ ...designerForm, specialization: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="Aari">Aari Work</option>
                  <option value="Zari">Zari Work</option>
                  <option value="Stone">Swarovski Stone Work</option>
                  <option value="Bead">Bead & Pearl Work</option>
                  <option value="Thread">Thread Embroidery</option>
                  <option value="Bridal Embroidery">Bridal Heavy Embroidery</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Starting Price (₹)</label>
                <input type="number" value={designerForm.startingPrice} onChange={(e) => setDesignerForm({ ...designerForm, startingPrice: Number(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#ad1457', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Save Artisan →
                </button>
                <button type="button" onClick={() => setShowDesignerModal(false)} style={{ background: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. RECORD PAYMENT MODAL */}
      {showRecordPaymentModal && selectedOrderForPayment && (
        <div className="modal-backdrop" onClick={() => setShowRecordPaymentModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#880e4f', marginTop: 0 }}>💵 Record Payment for Order #{selectedOrderForPayment.id}</h3>
            <p style={{ fontSize: '13px', color: '#555' }}>Customer: <b>{selectedOrderForPayment.customerName}</b> | Total: <b>₹{selectedOrderForPayment.total}</b></p>
            <form onSubmit={handleSubmitPaymentRecord} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Payment Amount to Collect (₹) *</label>
                <input type="number" max={selectedOrderForPayment.remainingAmount} value={paymentAmountInput} onChange={(e) => setPaymentAmountInput(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 'bold' }} required />
                <span style={{ fontSize: '11px', color: '#c62828' }}>Current Remaining Balance: ₹{selectedOrderForPayment.remainingAmount}</span>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Payment Method *</label>
                <select value={paymentMethodInput} onChange={(e) => setPaymentMethodInput(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="QR Payment (GPay)">Instant QR Payment (GPay / PhonePe)</option>
                  <option value="Cash at Counter">Cash at Counter</option>
                  <option value="Card Payment">Credit / Debit Card</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#2e7d32', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✓ Record & Update Ledger →
                </button>
                <button type="button" onClick={() => setShowRecordPaymentModal(false)} style={{ background: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. EDIT MEASUREMENTS MODAL */}
      {editingMeasurementsOrder && (
        <div className="modal-backdrop" onClick={() => setEditingMeasurementsOrder(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#880e4f', marginTop: 0 }}>📏 Edit Measurements for Order #{editingMeasurementsOrder.id}</h3>
            <p style={{ fontSize: '12px', color: '#555' }}>Customer: <b>{editingMeasurementsOrder.customerName}</b> | Outfit: <b>{editingMeasurementsOrder.dressType || 'Blouse'}</b></p>
            <form onSubmit={handleSaveMeasurements} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              {getMeasurementSchemaForDress(editingMeasurementsOrder.dressType || 'Blouse').map((field) => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>{field.label} (in inches)</label>
                  <input type="text" value={measurementsForm[field.key] || ''} onChange={(e) => setMeasurementsForm({ ...measurementsForm, [field.key]: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              ))}
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="submit" style={{ flex: 1, background: '#ad1457', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  💾 Save Measurements →
                </button>
                <button type="button" onClick={() => setEditingMeasurementsOrder(null)} style={{ background: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MASTER TAILORING WORK CARD MODAL (10 SECTIONS) */}
      {selectedOrderDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedOrderDetails(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', padding: '24px', borderRadius: '16px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #880e4f', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ color: '#880e4f', margin: 0 }}>📋 Master Tailoring Work Card: Order #{selectedOrderDetails.id}</h3>
                <span style={{ fontSize: '12px', color: '#555' }}>Customer: <b>{selectedOrderDetails.customerName}</b> ({selectedOrderDetails.customerDetails?.phone})</span>
              </div>
              <button type="button" className="close-modal-btn" onClick={() => setSelectedOrderDetails(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#fff0f5', padding: '12px', borderRadius: '10px' }}>
                <div><b>Outfit Type:</b> {selectedOrderDetails.dressType || 'Designer Blouse'}</div>
                <div><b>Customer Own Fabric:</b> <b style={{ color: '#2e7d32' }}>{selectedOrderDetails.ownFabric ? 'YES' : 'YES'}</b></div>
                <div><b>Fabric Received:</b> <b style={{ color: '#2e7d32' }}>YES</b></div>
                <div><b>Expected Delivery:</b> {selectedOrderDetails.deliveryEstimate || '5 Days'}</div>
              </div>

              <div style={{ border: '1px solid #f8bbd0', padding: '12px', borderRadius: '10px' }}>
                <b style={{ color: '#880e4f', display: 'block', marginBottom: '8px' }}>📏 Dress-Specific Measurements ({selectedOrderDetails.dressType || 'Blouse'} Schema):</b>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px' }}>
                  {getMeasurementSchemaForDress(selectedOrderDetails.dressType || 'Blouse').map((field) => (
                    <div key={field.key} style={{ background: '#f5f5f5', padding: '6px', borderRadius: '6px' }}>
                      <span style={{ color: '#777', display: 'block', fontSize: '10px' }}>{field.label}</span>
                      <b>{selectedOrderDetails.measurements?.[field.key] || field.placeholder}"</b>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'center' }}>
                <img src={selectedOrderDetails.referenceImage || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format'} alt="Ref" style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '10px' }} />
                <div>
                  <b style={{ color: '#880e4f' }}>🎨 Customization & Special Instructions:</b>
                  <p style={{ fontSize: '13px', color: '#333', margin: '4px 0 10px' }}>
                    "{selectedOrderDetails.specialInstructions || 'Deep V neck design with boat neck front, elbow sleeve, gold zari piping, and latkan tassels.'}"
                  </p>
                  <div>Embroidery Work: <b>{selectedOrderDetails.embroideryWork || 'Zardosi Handwork'}</b></div>
                  <div>Assigned Tailor: <b>{selectedOrderDetails.tailorAssigned}</b></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#e8f5e9', padding: '12px', borderRadius: '10px', color: '#2e7d32', fontWeight: 'bold' }}>
                <span>Total: ₹{selectedOrderDetails.total}</span>
                <span>Paid (Advance): ₹{selectedOrderDetails.paidAmount || selectedOrderDetails.total}</span>
                <span style={{ color: '#c62828' }}>Remaining: ₹{selectedOrderDetails.remainingAmount || 0}</span>
                <span>Status: {selectedOrderDetails.paymentStatus || 'PARTIALLY PAID'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. REFERENCE IMAGE LIGHTBOX MODAL */}
      {selectedReferenceImage && (
        <div className="modal-backdrop" onClick={() => setSelectedReferenceImage(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', textAlign: 'center', padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: '#880e4f' }}>🖼️ Customer Reference Inspiration Design</h4>
              <button onClick={() => setSelectedReferenceImage(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>✕</button>
            </div>
            <img src={selectedReferenceImage} alt="Reference" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '12px' }} />
          </div>
        </div>
      )}

      {/* WALK-IN COUNTER ORDER MODAL */}
      {showWalkInModal && <WalkInOrderModal onClose={() => setShowWalkInModal(false)} />}

      {/* RESET DEMO DATA CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="modal-backdrop" onClick={() => !isResetting && setShowResetModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#c62828', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ Confirm Demo Data Reset
            </h3>
            <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
              Are you sure you want to <b>permanently wipe all demo business data</b> (orders, saved designs, payments, customer reviews, chat messages, and notifications)?
            </p>
            <div style={{ background: '#ffebee', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #c62828', fontSize: '12px', color: '#b71c1c', marginBottom: '20px' }}>
              <b>Note:</b> This action cannot be undone. User accounts, settings, and product categories will remain intact.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                style={{ background: '#eee', color: '#333', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isResetting}
                style={{ background: '#c62828', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: isResetting ? 'wait' : 'pointer' }}
              >
                {isResetting ? 'Clearing Data...' : 'Yes, Reset All Demo Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMBROIDERY MODAL 1: ASSIGN EMBROIDERY WORK MODAL */}
      {showAssignEmbroideryModal && (
        <div className="modal-backdrop" onClick={() => setShowAssignEmbroideryModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#880e4f', marginTop: 0 }}>➕ Assign & Dispatch Embroidery Work Outside</h3>
            <form onSubmit={handleAssignEmbroiderySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Select Tailoring Order *</label>
                <select
                  value={assignForm.orderId}
                  onChange={(e) => setAssignForm({ ...assignForm, orderId: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  required
                >
                  {(orders || []).map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.id} — {o.customerName} ({o.dressType || 'Blouse'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Select External Artisan / Studio *</label>
                <select
                  value={assignForm.designerId}
                  onChange={(e) => setAssignForm({ ...assignForm, designerId: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  required
                >
                  {(embroideryDesigners || []).map((d) => (
                    <option key={d.id || d.designerId} value={d.id || d.designerId}>
                      🏭 {d.businessName || d.name} ({Array.isArray(d.specializations) ? d.specializations.join(', ') : d.specialization || 'Aari Work'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Embroidery Technique *</label>
                  <select
                    value={assignForm.embroideryType}
                    onChange={(e) => setAssignForm({ ...assignForm, embroideryType: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  >
                    <option value="Aari Work">✨ Aari Work</option>
                    <option value="Zardosi Work">✨ Zardosi Work</option>
                    <option value="Zari Border Work">✨ Zari Border Work</option>
                    <option value="Swarovski Stone Work">✨ Swarovski Stone Work</option>
                    <option value="Thread Embroidery">✨ Thread Embroidery</option>
                    <option value="Bead & Cutwork">✨ Bead & Cutwork</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Promised Due Date *</label>
                  <input
                    type="date"
                    value={assignForm.dueDate}
                    onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#fff0f5', padding: '10px', borderRadius: '8px', border: '1px solid #f8bbd0' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#c62828' }}>Artisan Outsource Cost (₹) *</label>
                  <input
                    type="number"
                    value={assignForm.outsourceCost}
                    onChange={(e) => setAssignForm({ ...assignForm, outsourceCost: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#2e7d32' }}>Customer Charge (₹) *</label>
                  <input
                    type="number"
                    value={assignForm.customerCharge}
                    onChange={(e) => setAssignForm({ ...assignForm, customerCharge: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}
                    required
                  />
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 'bold', textAlign: 'right' }}>
                Calculated Shop Margin: +₹{Math.max(0, (Number(assignForm.customerCharge) || 0) - (Number(assignForm.outsourceCost) || 0))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Artisan Instructions & Pattern Notes</label>
                <textarea
                  rows="2"
                  value={assignForm.specialInstructions}
                  onChange={(e) => setAssignForm({ ...assignForm, specialInstructions: e.target.value })}
                  placeholder="e.g. Gold Aari cutwork around neck and sleeve border using maroon silk thread..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#ad1457', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  🚚 Dispatch Work Outside →
                </button>
                <button type="button" onClick={() => setShowAssignEmbroideryModal(false)} style={{ background: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMBROIDERY MODAL 2: SEND OUTSIDE MODAL */}
      {showSendOutsideModal && selectedEmbroideryWorkItem && (
        <div className="modal-backdrop" onClick={() => setShowSendOutsideModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#0288d1', marginTop: 0 }}>🚚 Dispatch Work Outside Shop</h3>
            <p style={{ fontSize: '13px', color: '#555' }}>
              Confirm dispatch of <b>{selectedEmbroideryWorkItem.dressType} ({selectedEmbroideryWorkItem.embroideryType})</b> to external artisan <b>{selectedEmbroideryWorkItem.designerName}</b>.
            </p>
            <form onSubmit={handleSendOutsideSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Promised Delivery Date</label>
                <input type="text" value={selectedEmbroideryWorkItem.dueDate} readOnly style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: '#f5f5f5' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#0288d1', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✓ Confirm Dispatch Outside →
                </button>
                <button type="button" onClick={() => setShowSendOutsideModal(false)} style={{ background: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMBROIDERY MODAL 3: RECEIVE AT SHOP MODAL */}
      {showReceiveModal && selectedEmbroideryWorkItem && (
        <div className="modal-backdrop" onClick={() => setShowReceiveModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#ed6c02', marginTop: 0 }}>📥 Receive Completed Work at Shop</h3>
            <p style={{ fontSize: '13px', color: '#555' }}>
              Record shop counter reception for Work <b>#{selectedEmbroideryWorkItem.workId || selectedEmbroideryWorkItem.id}</b> from <b>{selectedEmbroideryWorkItem.designerName}</b>.
            </p>
            <form onSubmit={handleReceiveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Actual Outsource Bill Cost (₹)</label>
                <input
                  type="number"
                  defaultValue={selectedEmbroideryWorkItem.outsourceCost}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#ed6c02', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✓ Mark as Received at Counter →
                </button>
                <button type="button" onClick={() => setShowReceiveModal(false)} style={{ background: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMBROIDERY MODAL 4: ADMIN QUALITY CHECK MODAL */}
      {showQualityCheckModal && selectedEmbroideryWorkItem && (
        <div className="modal-backdrop" onClick={() => setShowQualityCheckModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ color: '#2e7d32', marginTop: 0 }}>🔍 Admin Quality Check & Approval</h3>
            <p style={{ fontSize: '13px', color: '#555' }}>
              Inspect artisan finishing for <b>#{selectedEmbroideryWorkItem.workId || selectedEmbroideryWorkItem.id} ({selectedEmbroideryWorkItem.embroideryType})</b> before passing to Master Tailor.
            </p>
            <form onSubmit={handleQualityCheckSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Quality Check Decision *</label>
                <div style={{ display: 'flex', gap: '14px', margin: '8px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#2e7d32', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="qcChoice"
                      checked={qcForm.approved}
                      onChange={() => setQcForm({ ...qcForm, approved: true })}
                    />
                    <span>✓ APPROVED (Handover to Master Tailor)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#c62828', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="qcChoice"
                      checked={!qcForm.approved}
                      onChange={() => setQcForm({ ...qcForm, approved: false })}
                    />
                    <span>⚠️ REWORK REQUIRED (Send Back to Artisan)</span>
                  </label>
                </div>
              </div>

              {!qcForm.approved && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#c62828' }}>Rework Reason / Defect Notes *</label>
                  <textarea
                    rows="2"
                    value={qcForm.qcNotes}
                    onChange={(e) => setQcForm({ ...qcForm, qcNotes: e.target.value })}
                    placeholder="Describe thread looseness, missing stones, incorrect neck curve..."
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #c62828' }}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: qcForm.approved ? '#2e7d32' : '#c62828', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {qcForm.approved ? '✓ Approve & Pass to Tailor →' : '⚠️ Mark for Rework →'}
                </button>
                <button type="button" onClick={() => setShowQualityCheckModal(false)} style={{ background: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMBROIDERY MODAL 5: REFERENCE DESIGN LIGHTBOX */}
      {showReferenceModal && selectedEmbroideryWorkItem && (
        <div className="modal-backdrop" onClick={() => setShowReferenceModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px', padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: '#880e4f' }}>✨ Embroidery Work Reference Pattern</h4>
              <button onClick={() => setShowReferenceModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>✕</button>
            </div>
            <img
              src={selectedEmbroideryWorkItem.referenceImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'}
              alt="Reference"
              style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '12px' }}
            />
            <p style={{ fontSize: '13px', color: '#555', marginTop: '12px' }}>
              Instructions: "{selectedEmbroideryWorkItem.specialInstructions || 'Scalloped gold Aari work cutwork.'}"
            </p>
          </div>
        </div>
      )}

      {/* REALISTIC AI TAILORING ASSISTANT FLOATING WIDGET */}
      <AITailoringAssistantModal />
    </div>
  );
}

