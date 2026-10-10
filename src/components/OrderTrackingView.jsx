import React, { useState, useMemo } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { REAL_TAILOR_WORKFLOW_STAGES } from '../data/womenTailoringData.js';

export function OrderTrackingView({ targetOrder, onBackToOrders }) {
  const { orders, updateOrderStatusByTailor } = useCustomer();
  const activeOrder = targetOrder || orders[0];

  const [alterationNote, setAlterationNote] = useState('');
  const [showAlterationInput, setShowAlterationInput] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const currentStageIndex = useMemo(() => {
    if (!activeOrder || !Array.isArray(REAL_TAILOR_WORKFLOW_STAGES)) return 3;
    const foundIdx = REAL_TAILOR_WORKFLOW_STAGES.findIndex(
      (s) => s.stage.toLowerCase() === (activeOrder.status || activeOrder.stage || '').toLowerCase()
    );
    return foundIdx !== -1 ? foundIdx : 5;
  }, [activeOrder]);

  if (!activeOrder) {
    return (
      <div className="content-card" style={{ padding: '30px', textAlign: 'center' }}>
        <h2>🚚 Live Women's Tailoring Order Tracker</h2>
        <p>No active orders to track. Place a custom women's tailoring order to view live stitching progress.</p>
      </div>
    );
  }

  const mainItem = activeOrder.items?.[0] || activeOrder;

  const handleApproveFitting = () => {
    updateOrderStatusByTailor(activeOrder.id, 'Fitting Approved');
    setFeedbackSuccess('✓ Fitting approved! Your order is progressing to final delivery packaging.');
  };

  const handleRequestAlteration = () => {
    if (!alterationNote.trim()) {
      alert('Please specify your required alteration details (e.g., "Reduce sleeve length by 1 inch").');
      return;
    }
    updateOrderStatusByTailor(activeOrder.id, 'Alteration Required');
    setFeedbackSuccess(`✓ Alteration request sent to ${activeOrder.tailorAssigned || 'Master Tailor'}: "${alterationNote}"`);
    setShowAlterationInput(false);
  };

  return (
    <div className="order-tracking-view-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="content-card tracking-main-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f8bbd0' }}>
        {/* Header Row */}
        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ color: '#880e4f', margin: '0 0 4px' }}>🚚 Live Women's Tailoring & Fitting Tracker</h2>
            <p className="subtitle" style={{ margin: 0, color: '#666' }}>
              Real-world tailor shop stage tracker from fabric cutting to final fitting approval.
            </p>
          </div>
          {onBackToOrders && (
            <button type="button" className="secondary-btn" onClick={onBackToOrders}>
              ← Back to Order History
            </button>
          )}
        </div>

        {/* Order Summary Highlight Banner */}
        <div className="tracking-summary-banner" style={{ display: 'flex', gap: '20px', background: '#fff0f5', padding: '20px', borderRadius: '14px', margin: '20px 0', border: '1px solid #f8bbd0', flexWrap: 'wrap' }}>
          <div className="banner-product-img-box">
            <img
              src={mainItem.imgUrl || activeOrder.referenceDesignPhoto || activeOrder.fabricPhoto || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format'}
              alt={mainItem.name || activeOrder.dressType}
              className="tracking-product-img"
              style={{ width: '110px', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #d81b60' }}
            />
          </div>

          <div className="banner-details-col" style={{ flex: 1 }}>
            <div className="banner-top-line" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <span className="tracking-id-badge" style={{ background: '#880e4f', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                Order #{activeOrder.id}
              </span>
              <span className="current-stage-tag" style={{ background: '#d81b60', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                {activeOrder.status || 'In Progress'}
              </span>
              <span style={{ fontSize: '12px', background: activeOrder.paymentStatus === 'FULLY PAID' ? '#e8f5e9' : '#fff3e0', color: activeOrder.paymentStatus === 'FULLY PAID' ? '#2e7d32' : '#e65100', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                {activeOrder.paymentStatus || 'PARTIALLY PAID'}
              </span>
            </div>

            <h3 className="tracking-item-name" style={{ margin: '0 0 10px', color: '#880e4f' }}>
              {mainItem.name || `Bespoke Women's ${activeOrder.dressType || 'Tailored Garment'}`}
            </h3>

            <div className="tracking-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '13px' }}>
              <div><span>Customer:</span> <b>{activeOrder.customerName || 'Malathi'}</b></div>
              <div><span>Master Tailor:</span> <b>✂️ {activeOrder.tailorAssigned || 'Master Rajesh Tailor'}</b></div>
              <div><span>Total Amount:</span> <b>₹{activeOrder.total || activeOrder.price}</b></div>
              <div><span>Paid Amount:</span> <b style={{ color: '#2e7d32' }}>₹{activeOrder.paidAmount || activeOrder.total}</b></div>
              <div><span>Remaining Balance:</span> <b style={{ color: '#c62828' }}>₹{activeOrder.remainingAmount || 0}</b></div>
              <div><span>Estimated Delivery:</span> <b className="delivery-date-highlight" style={{ color: '#ad1457' }}>{activeOrder.deliveryEstimate || 'Fri, Sep 12'}</b></div>
            </div>

            {activeOrder.specialInstructions && (
              <div style={{ marginTop: '10px', fontSize: '12px', background: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ffc1e3' }}>
                <b style={{ color: '#ad1457' }}>Special Instructions:</b> "{activeOrder.specialInstructions}"
              </div>
            )}
          </div>
        </div>

        {feedbackSuccess && (
          <div className="auth-alert-banner success" style={{ marginBottom: '20px', background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', border: '1px solid #a5d6a7' }}>
            {feedbackSuccess}
          </div>
        )}

        {/* INTERACTIVE FITTING AND ALTERATION MODULE (INNOVATION) */}
        <div className="content-card fitting-alteration-box" style={{ background: '#fff9fa', padding: '20px', borderRadius: '14px', border: '2px solid #f8bbd0', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 8px', color: '#880e4f', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👗</span> Fitting & Alteration Management
          </h3>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#555' }}>
            When your garment reaches the Trial / Fitting stage, review the stitching fit. Approve the fit or request precision alterations.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="primary-btn"
              onClick={handleApproveFitting}
              style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ✓ Fitting Approved (Ready for Delivery)
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowAlterationInput((prev) => !prev)}
              style={{ border: '1px solid #ad1457', color: '#ad1457', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ✏️ Request Alteration
            </button>
          </div>

          {showAlterationInput && (
            <div style={{ marginTop: '14px', background: '#fff', padding: '14px', borderRadius: '10px', border: '1px solid #ffc1e3' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#880e4f', marginBottom: '6px' }}>
                Enter Alteration Note for Master Tailor:
              </label>
              <input
                type="text"
                placeholder="e.g. Please reduce sleeve length by 1 inch and tighten waist by 0.5 inch."
                value={alterationNote}
                onChange={(e) => setAlterationNote(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '10px' }}
              />
              <button
                type="button"
                className="primary-btn-sm"
                onClick={handleRequestAlteration}
                style={{ background: '#ad1457', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Send Alteration Request to Tailor →
              </button>
            </div>
          )}
        </div>

        {/* 12-STAGE PROGRESS TIMELINE */}
        <div className="nine-stage-timeline-container" style={{ marginTop: '24px' }}>
          <h3 style={{ color: '#880e4f', marginBottom: '16px' }}>
            Women's Tailoring Progress Timeline ({currentStageIndex + 1} / {(REAL_TAILOR_WORKFLOW_STAGES || []).length} Stages)
          </h3>

          <div className="timeline-stages-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {(REAL_TAILOR_WORKFLOW_STAGES || []).map((stage, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage.stage}
                  className={`timeline-stage-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: isCurrent ? '2px solid #d81b60' : isCompleted ? '1px solid #a5d6a7' : '1px solid #eee',
                    background: isCurrent ? '#fff0f5' : isCompleted ? '#e8f5e9' : '#fafafa',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '18px' }}>{stage.icon}</span>
                    <b style={{ fontSize: '13px', color: isCurrent ? '#d81b60' : isCompleted ? '#2e7d32' : '#333' }}>
                      {stage.stage}
                    </b>
                  </div>
                  <small style={{ fontSize: '11px', color: '#666', display: 'block' }}>{stage.desc}</small>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
