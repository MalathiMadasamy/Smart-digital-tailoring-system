import React from 'react';

export function OrderDetailsModal({ order, onClose, onTrackOrder }) {
  if (!order) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog order-details-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Order Details #{order.id}</h3>
            <span className="subtitle">Placed on {order.date}</span>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body order-details-body">
          {/* Status & Tailor Banner */}
          <div className="details-banner-card">
            <div className="banner-left">
              <span className="status-label">Current Stage:</span>
              <b className="status-title-badge">{order.status}</b>
            </div>
            <div className="banner-right">
              <span>Assigned Tailor:</span>
              <b>✂️ {order.tailorAssigned || 'Master Rajesh Tailor'}</b>
            </div>
          </div>

          {/* Ordered Products Section */}
          <div className="details-section">
            <h4>👗 Ordered Garments ({order.items.length})</h4>
            <div className="details-items-grid">
              {order.items.map((item, idx) => (
                <div className="details-item-card" key={idx}>
                  <img
                    src={item.imgUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=780&fit=crop&auto=format'}
                    alt={item.name}
                    className="item-details-img"
                  />
                  <div className="item-details-info">
                    <h5>{item.name}</h5>
                    <p className="item-meta">Fabric: {item.fabric || 'Silk'} • Color: {item.color || 'Standard'}</p>
                    {item.customizationDetails && (
                      <span className="custom-badge-pill">
                        Customized: {item.customizationDetails.neckStyle || item.customizationDetails.neck} • {item.customizationDetails.sleeve}
                      </span>
                    )}
                  </div>
                  <div className="item-details-price">
                    <span>₹{item.price} each</span>
                    <b>Qty: {item.quantity || 1}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Measurements & Address Side-by-Side */}
          <div className="details-grid-2">
            <div className="details-section-box">
              <h4>📏 Attached Measurements ({order.measurementProfileName || 'Standard Fit'})</h4>
              {order.measurements ? (
                <div className="meas-keyval-grid">
                  <div><span>Bust:</span> <b>{order.measurements.bust || '36'}"</b></div>
                  <div><span>Waist:</span> <b>{order.measurements.waist || '30'}"</b></div>
                  <div><span>Hip:</span> <b>{order.measurements.hip || '38'}"</b></div>
                  <div><span>Shoulder:</span> <b>{order.measurements.shoulder || '15'}"</b></div>
                  <div><span>Sleeve:</span> <b>{order.measurements.sleeveLength || '10'}"</b></div>
                  <div><span>Blouse Length:</span> <b>{order.measurements.blouseLength || '14'}"</b></div>
                </div>
              ) : (
                <p>Standard fit profile attached.</p>
              )}
            </div>

            <div className="details-section-box">
              <h4>🚚 Shipping & Customer Details</h4>
              <p><b>Customer:</b> {order.customerName || order.customerDetails?.name}</p>
              <p><b>Phone:</b> {order.customerDetails?.phone || '9876543210'}</p>
              <p><b>Address:</b> {order.shippingAddress?.address || '42, Fashion Avenue, T. Nagar, Chennai'}</p>
              <p><b>Delivery Date:</b> <span className="delivery-highlight">{order.deliveryEstimate || 'Mon, Sep 08'}</span></p>
            </div>
          </div>

          {/* Payment Receipt */}
          <div className="details-receipt-box">
            <div className="receipt-row"><span>Payment Method:</span> <b>{order.paymentMethod || 'UPI Paid'} ({order.paymentStatus || 'Paid'})</b></div>
            <div className="receipt-row total"><span>Total Amount Paid:</span> <b>₹{order.total}</b></div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="primary-btn full"
              onClick={() => {
                onClose();
                onTrackOrder(order);
              }}
            >
              🚚 View 9-Stage Live Stitching Tracker →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
