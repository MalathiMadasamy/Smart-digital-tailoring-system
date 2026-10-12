import React, { useState } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';

export function CheckoutView({ onProceedToPayment, onBackToCart }) {
  const { profile = {}, activeProfile = {}, cart = [], cartSummary = {}, updateProfile } = useCustomer();

  const [customerDetails, setCustomerDetails] = useState({
    name: profile?.name || 'Malathi Lakshmi',
    phone: profile?.phone || '+91 98765 43210',
    email: profile?.email || 'malathi@gmail.com',
  });

  const [shippingAddress, setShippingAddress] = useState({
    address: profile?.address || 'No 14, Boag Road, T. Nagar',
    city: profile?.city || 'Chennai',
    state: profile?.state || 'Tamil Nadu',
    pincode: profile?.pincode || '600017',
  });

  const handleSubmitCheckout = (e) => {
    e.preventDefault();
    if (!shippingAddress.address.trim()) {
      alert('Please enter your delivery & fitting address.');
      return;
    }
    if (updateProfile) {
      updateProfile({ ...profile, ...customerDetails, ...shippingAddress });
    }
    onProceedToPayment({ customerDetails, shippingAddress });
  };

  return (
    <div className="checkout-view-layout" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="checkout-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button type="button" className="link-btn" onClick={onBackToCart} style={{ background: 'none', border: 'none', color: '#ad1457', fontWeight: 'bold', cursor: 'pointer' }}>
          ← Back to Cart
        </button>
        <h2 style={{ color: '#880e4f', margin: 0 }}>📋 Checkout & Shipping Details</h2>
      </div>

      <form onSubmit={handleSubmitCheckout} className="checkout-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* LEFT SIDE: CUSTOMER DETAILS, ADDRESS & MEASUREMENTS */}
        <div className="checkout-forms-side" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Customer Details */}
          <div className="content-card checkout-card" style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #f8bbd0' }}>
            <h3 style={{ color: '#880e4f', marginTop: 0 }}>👤 1. Customer Contact Details</h3>
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Email Address</label>
              <input
                type="email"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          {/* Section 2: Delivery & Fitting Address */}
          <div className="content-card checkout-card" style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #f8bbd0' }}>
            <h3 style={{ color: '#880e4f', marginTop: 0 }}>🏠 2. Delivery & Fitting Address</h3>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Street Address / Door No.</label>
              <textarea
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                required
                rows="2"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>City</label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>State</label>
                <input
                  type="text"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Pincode</label>
                <input
                  type="text"
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: SUMMARY & PROCEED TO PAYMENT BUTTON */}
        <div className="checkout-summary-side">
          <div className="content-card order-summary-card" style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #f8bbd0' }}>
            <h3 style={{ color: '#880e4f', marginTop: 0 }}>📦 Order Summary ({cart.length} items)</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {cart.map((item) => {
                const isFitting = Boolean(
                  item.fitCode ||
                  item.name?.toLowerCase().includes('fit') ||
                  item.name?.toLowerCase().includes('custom') ||
                  item.dressType?.toLowerCase().includes('fit') ||
                  item.ownFabric ||
                  (item.price && item.price <= 500)
                );
                const price = isFitting ? 10 : (item.price || 10);
                const title = isFitting && item.name?.includes('Custom Chudidar') ? 'Chudidhar Fit Service (chudithar fit)' : item.name;

                return (
                  <div key={item.cartId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                    <div>
                      <b>{title}</b>
                      <div style={{ fontSize: '11px', color: '#666' }}>{item.dressType || 'Bespoke Tailoring'} • Code: {item.fitCode || 'FIT-10-CHUDITHAR'}</div>
                    </div>
                    <b>₹{price * (item.quantity || 1)}</b>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Subtotal:</span><span>₹{cartSummary?.subtotal || 0}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Delivery Fee:</span><span>{cartSummary?.delivery ? `₹${cartSummary.delivery}` : 'FREE'}</span></div>
              {cartSummary?.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32', marginBottom: '4px' }}><span>Promo Discount:</span><span>-₹{cartSummary.discount}</span></div>
              )}
              <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #ddd' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: '#880e4f' }}>
                <span>Total Amount:</span>
                <span>₹{cartSummary?.total || 0}</span>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                marginTop: '20px',
                boxShadow: '0 4px 12px rgba(173, 20, 87, 0.25)',
              }}
            >
              Proceed to QR Payment & Advance →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
