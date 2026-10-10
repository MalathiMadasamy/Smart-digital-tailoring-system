import React, { useState, useMemo, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { OrderDetailsModal } from './OrderDetailsModal.jsx';
import GarmentLabelModal from './GarmentLabelModal.jsx';
import QRCode from 'qrcode';

export function OrdersListView({ onTrackOrder }) {
  const { orders, updateOrderStatusByTailor, downloadOrderPdfInvoice } = useCustomer();
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [showLabelModalOrder, setShowLabelModalOrder] = useState(null);

  // Remaining Payment QR Modal state
  const [payRemainingOrder, setPayRemainingOrder] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrConfirmed, setQrConfirmed] = useState(false);

  // Generate QR Code for paying remaining balance
  useEffect(() => {
    if (payRemainingOrder && payRemainingOrder.remainingAmount > 0) {
      const upiString = `upi://pay?pa=digitailor@upi&pn=DigiTailor%20Smart%20Tailoring&am=${payRemainingOrder.remainingAmount}&cu=INR&tn=Remaining%20Balance%20Payment%20Order%20${payRemainingOrder.id}`;
      const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
      setQrCodeUrl(fallbackUrl);

      try {
        const toDataFn = QRCode?.toDataURL || (QRCode?.default && QRCode?.default?.toDataURL);
        if (typeof toDataFn === 'function') {
          toDataFn(upiString, { width: 200, margin: 1, color: { dark: '#880e4f', light: '#ffffff' } })
            .then((url) => setQrCodeUrl(url || fallbackUrl))
            .catch(() => setQrCodeUrl(fallbackUrl));
        }
      } catch (err) {
        setQrCodeUrl(fallbackUrl);
      }
    }
  }, [payRemainingOrder]);

  const handleSettleRemainingBalance = () => {
    if (!qrConfirmed) {
      alert('Please check "I have completed the QR payment" after scanning.');
      return;
    }

    if (payRemainingOrder) {
      const orderTotal = payRemainingOrder.total || payRemainingOrder.price || 0;
      updateOrderStatusByTailor(payRemainingOrder.id, undefined, undefined, 'FULLY PAID');

      // Update remaining balance in local storage
      const savedOrders = JSON.parse(localStorage.getItem('digitailor_customer_orders') || '[]');
      const updated = savedOrders.map((o) => {
        if (o.id === payRemainingOrder.id) {
          return {
            ...o,
            paidAmount: orderTotal,
            remainingAmount: 0,
            paymentStatus: 'FULLY PAID',
            paymentHistory: [
              ...(o.paymentHistory || [
                { amount: o.paidAmount || orderTotal - (o.remainingAmount || 0), type: 'Advance Payment', method: 'QR Payment', date: 'Order Date' }
              ]),
              { amount: o.remainingAmount || 0, type: 'Final Remaining Payment', method: 'QR Payment', date: new Date().toISOString().split('T')[0] }
            ],
          };
        }
        return o;
      });
      localStorage.setItem('digitailor_customer_orders', JSON.stringify(updated));

      alert(`✓ Remaining balance of ₹${payRemainingOrder.remainingAmount} paid successfully! Payment Status is now FULLY PAID.`);
      setPayRemainingOrder(null);
      setQrConfirmed(false);
      window.location.reload();
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const isDelivered = o.status === 'Delivered';
      const matchesTab =
        filterTab === 'all' ||
        (filterTab === 'active' && !isDelivered) ||
        (filterTab === 'delivered' && isDelivered);

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        o.id.toLowerCase().includes(query) ||
        (o.items && o.items.some((i) => i.name.toLowerCase().includes(query))) ||
        (o.tailorAssigned && o.tailorAssigned.toLowerCase().includes(query));

      return matchesTab && matchesSearch;
    });
  }, [orders, filterTab, searchQuery]);

  return (
    <div className="orders-list-view-container">
      <div className="content-card">
        <div className="card-header-row">
          <div>
            <h2 style={{ color: '#880e4f' }}>📦 My Women's Tailoring Orders History</h2>
            <p className="subtitle">View tailoring orders, assigned master tailors, payment receipts, advance balances, and tracking.</p>
          </div>

          <div className="orders-filter-toolbar">
            <div className="filter-tabs-group">
              <button
                type="button"
                className={`filter-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
                onClick={() => setFilterTab('all')}
              >
                All Orders ({orders.length})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${filterTab === 'active' ? 'active' : ''}`}
                onClick={() => setFilterTab('active')}
              >
                Active ({orders.filter((o) => o.status !== 'Delivered').length})
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${filterTab === 'delivered' ? 'active' : ''}`}
                onClick={() => setFilterTab('delivered')}
              >
                Delivered ({orders.filter((o) => o.status === 'Delivered').length})
              </button>
            </div>

            <input
              type="text"
              placeholder="Search Order ID, dress, tailor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Orders Cards Stack */}
        <div className="orders-cards-stack">
          {filteredOrders.map((order) => {
            const mainItem = order.items?.[0] || order;
            const isPartiallyPaid = order.remainingAmount > 0 || order.paymentStatus === 'PARTIALLY PAID';

            return (
              <div className="order-history-card-item" key={order.id} style={{ border: '1px solid #f8bbd0' }}>
                <div className="order-card-img-box">
                  <img
                    src={order.referenceImage || mainItem.imgUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'}
                    alt={mainItem.name || order.dressType}
                    className="order-card-thumb"
                    style={{ borderRadius: '10px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                </div>

                <div className="order-card-main-info">
                  <div className="order-top-bar" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                    <b className="order-id-code">#{order.id}</b>
                    <span className={`status-badge-pill ${(order.status || 'Order Placed').toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.status || 'Order Placed'}
                    </span>
                    <span style={{ fontSize: '11px', background: isPartiallyPaid ? '#fff3e0' : '#e8f5e9', color: isPartiallyPaid ? '#e65100' : '#2e7d32', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                      {isPartiallyPaid ? 'PARTIAL AMOUNT PAID' : 'FULLY PAID'}
                    </span>
                  </div>

                  <h3 className="order-item-title" style={{ color: '#880e4f' }}>
                    {mainItem.name || `Bespoke Women's ${order.dressType || 'Tailored Garment'}`}
                  </h3>

                  <div className="order-specs-grid" style={{ fontSize: '12px' }}>
                    <span>Customer: <b>{order.customerName || 'Malathi'}</b></span>
                    <span>Assigned Tailor: <b>✂️ {order.tailorAssigned || 'Master Rajesh Tailor'}</b></span>
                    <span>Total Quote: <b>₹{order.total || order.price}</b></span>
                    <span>Paid Amount: <b style={{ color: '#2e7d32' }}>₹{order.paidAmount || order.total}</b></span>
                    {isPartiallyPaid && (
                      <span>Remaining Balance: <b style={{ color: '#c62828' }}>₹{order.remainingAmount}</b></span>
                    )}
                    <span>Delivery Date: <b>{order.deliveryEstimate || 'Mon, Sep 08'}</b></span>
                  </div>

                  {isPartiallyPaid && (
                    <div style={{ marginTop: '10px' }}>
                      <button
                        type="button"
                        className="primary-btn-sm"
                        onClick={() => setPayRemainingOrder(order)}
                        style={{ background: '#ad1457', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        💳 PAY REMAINING AMOUNT (₹{order.remainingAmount}) →
                      </button>
                    </div>
                  )}
                </div>

                <div className="order-card-right-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setShowLabelModalOrder(order)}
                    style={{ background: '#fff0f5', color: '#880e4f', borderColor: '#d81b60', fontWeight: 'bold' }}
                    title="View & Print Physical Garment QR Tag"
                  >
                    🏷️ QR Label
                  </button>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => downloadOrderPdfInvoice(order)}
                    style={{ background: '#fce4ec', color: '#ad1457', borderColor: '#f8bbd0', fontWeight: 'bold' }}
                    title="Download / Print PDF Invoice"
                  >
                    📄 PDF Invoice
                  </button>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setSelectedOrderForDetails(order)}
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => onTrackOrder(order)}
                    style={{ background: '#880e4f' }}
                  >
                    Track Stitching →
                  </button>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="no-orders-box">
              <p>No orders found matching your search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* QR MODAL FOR PAYING REMAINING AMOUNT */}
      {payRemainingOrder && (
        <div className="modal-backdrop" onClick={() => setPayRemainingOrder(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '20px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#880e4f', margin: 0 }}>💳 Pay Remaining Balance</h3>
              <button type="button" className="close-modal-btn" onClick={() => setPayRemainingOrder(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', marginTop: '14px' }}>
              <div style={{ background: '#fff0f5', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
                <div style={{ fontSize: '13px' }}>Order ID: <b>#{payRemainingOrder.id}</b></div>
                <div style={{ fontSize: '13px' }}>Total Amount: <b>₹{payRemainingOrder.total || payRemainingOrder.price}</b></div>
                <div style={{ fontSize: '13px', color: '#2e7d32' }}>Already Paid: <b>₹{payRemainingOrder.paidAmount || 0}</b></div>
                <div style={{ fontSize: '16px', color: '#c62828', fontWeight: 'bold', marginTop: '4px' }}>
                  Remaining Amount to Pay: ₹{payRemainingOrder.remainingAmount}
                </div>
              </div>

              <div style={{ background: '#fff', padding: '10px', display: 'inline-block', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="UPI QR Code" style={{ width: '180px', height: '180px' }} />
                ) : (
                  <div>Generating QR...</div>
                )}
              </div>

              <div style={{ marginTop: '10px', fontSize: '12px', color: '#555' }}>
                Scan with GPay / PhonePe / Paytm (VPA: <b>digitailor@upi</b>)
              </div>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '14px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={qrConfirmed}
                  onChange={(e) => setQrConfirmed(e.target.checked)}
                />
                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✓ I have completed the QR payment</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="secondary-btn" onClick={() => setPayRemainingOrder(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="button" className="primary-btn" onClick={handleSettleRemainingBalance} style={{ flex: 1, background: '#ad1457' }}>
                  Confirm Final Payment →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrderForDetails && (
        <OrderDetailsModal
          order={selectedOrderForDetails}
          onClose={() => setSelectedOrderForDetails(null)}
          onTrackOrder={(ord) => {
            setSelectedOrderForDetails(null);
            onTrackOrder(ord);
          }}
        />
      )}

      {showLabelModalOrder && (
        <GarmentLabelModal order={showLabelModalOrder} onClose={() => setShowLabelModalOrder(null)} />
      )}
    </div>
  );
}
