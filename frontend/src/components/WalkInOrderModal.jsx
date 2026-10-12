import React, { useState, useMemo } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { WOMEN_DRESS_CATEGORIES, getMeasurementSchemaForDress } from '../data/womenTailoringData.js';

export function WalkInOrderModal({ onClose }) {
  const { placeOrderWithCheckoutDetails } = useCustomer();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [dressType, setDressType] = useState('Designer Blouse');
  const [fabricSource, setFabricSource] = useState('Customer Fabric');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [totalPrice, setTotalPrice] = useState(1800);
  const [advancePaid, setAdvancePaid] = useState(500);

  const activeMeasSchema = useMemo(() => {
    return getMeasurementSchemaForDress(dressType);
  }, [dressType]);

  const [measValues, setMeasValues] = useState({
    bust: '36',
    underBust: '30',
    shoulder: '14.5',
    armhole: '16',
    sleeveLength: '10',
    blouseLength: '14',
    frontNeckDepth: '7',
    backNeckDepth: '9',
    waist: '30',
    hip: '38',
  });

  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter Walk-In Customer Name and Phone Number.');
      return;
    }

    const remaining = Math.max(0, Number(totalPrice) - Number(advancePaid));
    const paymentStatus = remaining === 0 ? 'FULLY PAID' : 'PARTIALLY PAID';

    const orderId = `WALK-${Math.floor(1000 + Math.random() * 9000)}`;

    const savedOrders = JSON.parse(localStorage.getItem('digitailor_customer_orders') || '[]');
    const newWalkInOrder = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      deliveryEstimate: '5 Days from Today',
      items: [
        {
          cartId: `walkin-${Date.now()}`,
          id: `prod-walkin-${Date.now()}`,
          name: `Walk-In Bespoke ${dressType}`,
          price: Number(totalPrice),
          quantity: 1,
          fabric: fabricSource,
          imgUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format',
        },
      ],
      total: Number(totalPrice),
      paidAmount: Number(advancePaid),
      remainingAmount: remaining,
      paymentStatus,
      paymentMethod: 'Cash at Shop Counter',
      customerName,
      tailorAssigned: 'Master Rajesh Tailor',
      customerDetails: { name: customerName, phone: customerPhone, email: 'walkin@digitailor.com' },
      shippingAddress: { address: 'Counter Pickup', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017' },
      measurements: measValues,
      specialInstructions,
      dressType,
      status: 'Order Placed',
      isWalkIn: true,
    };

    localStorage.setItem('digitailor_customer_orders', JSON.stringify([newWalkInOrder, ...savedOrders]));

    alert(`✓ Created Walk-In Order #${orderId} for ${customerName}! (${paymentStatus}: ₹${advancePaid} Advance)`);
    onClose();
    window.location.reload();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', padding: '24px', borderRadius: '16px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#880e4f', margin: 0 }}>🛍️ Create Walk-In Counter Order</h3>
          <button type="button" className="close-modal-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleWalkInSubmit} className="modal-body" style={{ marginTop: '16px' }}>
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Walk-In Customer Name</label>
              <input
                type="text"
                placeholder="e.g. Meera Krishnan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div className="form-group">
              <label>Women's Dress Type</label>
              <select value={dressType} onChange={(e) => setDressType(e.target.value)}>
                {WOMEN_DRESS_CATEGORIES.traditional.map((d) => <option key={d} value={d}>🥻 {d}</option>)}
                {WOMEN_DRESS_CATEGORIES.modern.map((d) => <option key={d} value={d}>👗 {d}</option>)}
                {WOMEN_DRESS_CATEGORIES.specialOccasion.map((d) => <option key={d} value={d}>👑 {d}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Fabric Source</label>
              <select value={fabricSource} onChange={(e) => setFabricSource(e.target.value)}>
                <option value="Customer Unstitched Fabric">Customer Unstitched Fabric</option>
                <option value="Customer Existing Dress">Customer Sample Fitting Dress</option>
                <option value="Boutique Fabric">Boutique In-House Fabric</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC MEASUREMENTS */}
          <div style={{ marginTop: '14px', background: '#fff0f5', padding: '12px', borderRadius: '10px', border: '1px solid #f8bbd0' }}>
            <b style={{ color: '#880e4f', display: 'block', marginBottom: '8px', fontSize: '13px' }}>
              📏 Smart Measurements ({dressType} Schema)
            </b>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {activeMeasSchema.slice(0, 6).map((field) => (
                <div key={field.key}>
                  <label style={{ fontSize: '11px', display: 'block' }}>{field.label.split('(')[0]}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measValues[field.key] || ''}
                    onChange={(e) => setMeasValues({ ...measValues, [field.key]: e.target.value })}
                    style={{ width: '100%', padding: '4px', fontSize: '12px' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>Special Instructions & Design Notes</label>
            <input
              type="text"
              placeholder="e.g. Customer requested elbow sleeve with boat neck and gold piping."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>

          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div className="form-group">
              <label>Total Price Quote (₹)</label>
              <input
                type="number"
                value={totalPrice}
                onChange={(e) => setTotalPrice(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label>Advance Payment Paid (₹)</label>
              <input
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button type="button" className="secondary-btn" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" style={{ flex: 1, background: '#ad1457', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>
              + Create Walk-In Order →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
