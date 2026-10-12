import React, { useState } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { getDressCategoryDetails } from '../data/womenTailoringData.js';

export function CartView({ onProceedToCheckout }) {
  const { cart, cartSummary, updateCartQuantity, removeFromCart, applyPromoCode, activeProfile, addToCart } = useCustomer();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);
  const [selectedFitCode, setSelectedFitCode] = useState('FIT-10-CHUDITHAR');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const res = applyPromoCode(promoInput);
    setPromoMessage(res);
  };

  // Quick Micro Fitting Service Addition (Only ₹10 Charge as requested)
  const handleSelectMicroFitOption = (fitName, code, category) => {
    setSelectedFitCode(code);
    const details = getDressCategoryDetails(category || 'Chudidar');
    addToCart({
      id: `micro-fit-${Date.now()}`,
      title: `${fitName} [${code}]`,
      name: `${fitName} [${code}]`,
      category: category || 'Micro Fitting',
      dressType: fitName,
      price: 10,
      image: details.image,
      imgUrl: details.image,
      customizationMode: 'fabric',
      ownFabric: true,
      fitCode: code,
      specialInstructions: `Selected Micro Fitting Service (${code}) - ₹10 Fee`,
    });
    alert(`✓ Selected "${fitName}" (${code})!\nAdded ₹10 Fitting Charge to Cart.\nCode: ${code} | Total Fee: ₹10`);
  };

  if (cart.length === 0) {
    return (
      <div className="content-card empty-cart-box">
        <div className="empty-cart-icon">🛒</div>
        <h3>Your Tailoring Cart is Empty</h3>
        <p>Browse our women's bespoke collections or select a ₹10 Micro Fitting Service below.</p>
        
        {/* ₹10 Micro Fitting Quick Selector Box */}
        <div style={{ marginTop: '20px', background: '#fff0f5', padding: '16px', borderRadius: '12px', border: '1px solid #f8bbd0' }}>
          <h4 style={{ color: '#880e4f', margin: '0 0 10px' }}>✂️ Quick ₹10 Micro Fitting & Hemming Services</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <button type="button" onClick={() => handleSelectMicroFitOption('Saree Mundhi Edge Folding', 'FIT-10-MUNDHI', 'Saree Blouse')} style={{ padding: '10px', background: '#fff', border: '2px solid #d81b60', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
              <b style={{ color: '#880e4f', display: 'block' }}>✂️ Saree Mundhi Edge</b>
              <span style={{ fontSize: '11px', color: '#666' }}>Code: FIT-10-MUNDHI • <b>₹10 Only</b></span>
            </button>
            <button type="button" onClick={() => handleSelectMicroFitOption('Chudidhar / Blouse Side Fitting', 'FIT-10-CHUDITHAR', 'Chudidar')} style={{ padding: '10px', background: '#fff', border: '2px solid #d81b60', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
              <b style={{ color: '#880e4f', display: 'block' }}>👗 Side Fitting Alteration</b>
              <span style={{ fontSize: '11px', color: '#666' }}>Code: FIT-10-CHUDITHAR • <b>₹10 Only</b></span>
            </button>
            <button type="button" onClick={() => handleSelectMicroFitOption('Hook & Press Button Fixing', 'FIT-10-HOOK', 'Saree Blouse')} style={{ padding: '10px', background: '#fff', border: '2px solid #d81b60', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
              <b style={{ color: '#880e4f', display: 'block' }}>🔘 Hook & Button Fixing</b>
              <span style={{ fontSize: '11px', color: '#666' }}>Code: FIT-10-HOOK • <b>₹10 Only</b></span>
            </button>
            <button type="button" onClick={() => handleSelectMicroFitOption('Machine Zigzag Pallu End', 'FIT-10-ZIGZAG', 'Saree Blouse')} style={{ padding: '10px', background: '#fff', border: '2px solid #d81b60', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
              <b style={{ color: '#880e4f', display: 'block' }}>⚡ Zigzag End Finishing</b>
              <span style={{ fontSize: '11px', color: '#666' }}>Code: FIT-10-ZIGZAG • <b>₹10 Only</b></span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-view-layout">
      {/* LEFT: TAILORING CART ITEMS LIST */}
      <div className="content-card cart-items-card">
        <div className="card-header-row">
          <h2 style={{ color: '#880e4f' }}>🛒 Tailoring Cart & Bespoke Orders ({cart.length})</h2>
          <span className="subtitle">Attached Fit Profile: <b>{activeProfile?.name || 'Default Fit'}</b></span>
        </div>

        {/* SELECTABLE FITTING SERVICE CODE BAR (₹10 SERVICE SELECTOR) */}
        <div style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%)', border: '2px solid #d81b60', borderRadius: '12px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontWeight: 'bold', color: '#880e4f', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✂️</span> Micro Fitting & Hemming Service Selector (Only ₹10):
            </span>
            <span style={{ background: '#d81b60', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
              Active Code: {selectedFitCode}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleSelectMicroFitOption('Chudidhar Fitting', 'FIT-10-CHUDITHAR', 'Chudidar')}
              style={{
                background: selectedFitCode === 'FIT-10-CHUDITHAR' ? '#880e4f' : '#ffffff',
                color: selectedFitCode === 'FIT-10-CHUDITHAR' ? '#ffffff' : '#880e4f',
                border: '1px solid #d81b60',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              👗 Chudidhar Fit [FIT-10-CHUDITHAR] • ₹10
            </button>
            <button
              type="button"
              onClick={() => handleSelectMicroFitOption('Blouse Fitting', 'FIT-10-BLOUSE', 'Saree Blouse')}
              style={{
                background: selectedFitCode === 'FIT-10-BLOUSE' ? '#880e4f' : '#ffffff',
                color: selectedFitCode === 'FIT-10-BLOUSE' ? '#ffffff' : '#880e4f',
                border: '1px solid #d81b60',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🥻 Blouse Fit [FIT-10-BLOUSE] • ₹10
            </button>
            <button
              type="button"
              onClick={() => handleSelectMicroFitOption('Saree Mundhi Hemming', 'FIT-10-MUNDHI', 'Saree Blouse')}
              style={{
                background: selectedFitCode === 'FIT-10-MUNDHI' ? '#880e4f' : '#ffffff',
                color: selectedFitCode === 'FIT-10-MUNDHI' ? '#ffffff' : '#880e4f',
                border: '1px solid #d81b60',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              ✂️ Mundhi Hemming [FIT-10-MUNDHI] • ₹10
            </button>
            <button
              type="button"
              onClick={() => handleSelectMicroFitOption('Hook & Button Fitting', 'FIT-10-HOOK', 'Saree Blouse')}
              style={{
                background: selectedFitCode === 'FIT-10-HOOK' ? '#880e4f' : '#ffffff',
                color: selectedFitCode === 'FIT-10-HOOK' ? '#ffffff' : '#880e4f',
                border: '1px solid #d81b60',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🔘 Hook & Button [FIT-10-HOOK] • ₹10
            </button>
          </div>
        </div>

        <div className="cart-items-table" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.map((item) => {
            const dressDetails = getDressCategoryDetails(item);
            const itemImageSrc = item.imgUrl && item.imgUrl.includes('unsplash') && !item.imgUrl.includes('photo-1558769132-cb1aea458c5e')
              ? item.imgUrl
              : item.image && item.image.includes('unsplash') && !item.image.includes('photo-1558769132-cb1aea458c5e')
              ? item.image
              : dressDetails.image;

            const isFittingItem = Boolean(
              item.fitCode ||
              item.name?.toLowerCase().includes('fit') ||
              item.name?.toLowerCase().includes('custom') ||
              item.dressType?.toLowerCase().includes('fit') ||
              item.ownFabric ||
              (item.price && item.price <= 500)
            );

            const itemEffectivePrice = isFittingItem ? 10 : (item.price || 10);
            const stitchingFeeDisplay = isFittingItem ? 10 : Math.round((itemEffectivePrice || 500) * 0.5);
            const embroideryFeeDisplay = isFittingItem ? 0 : (item.embroideryType && item.embroideryType !== 'None' ? Math.round(itemEffectivePrice * 0.3) : 0);
            const fabricFeeDisplay = isFittingItem ? 0 : (item.customizationMode === 'fabric' || item.ownFabric ? 0 : Math.round(itemEffectivePrice * 0.3));
            const designerFeeDisplay = isFittingItem ? 0 : (item.designerName ? 300 : 0);
            const itemTotalDisplay = itemEffectivePrice * (item.quantity || 1);
            const displayTitle = isFittingItem && item.name?.includes('Custom Chudidar') ? 'Chudidhar Fit Service (chudithar fit)' : item.name;
            const displayFitCode = item.fitCode || (isFittingItem ? 'FIT-10-CHUDITHAR' : 'FIT-STD');

            return (
              <div className="cart-item-row-card" key={item.cartId} style={{ background: '#fff', border: '1px solid #f8bbd0', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Category-Specific Product Image */}
                  <div className="cart-item-img-box">
                    <img
                      src={itemImageSrc}
                      alt={displayTitle}
                      className="cart-product-img"
                      style={{ width: '90px', height: '115px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #f8bbd0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = dressDetails.image;
                      }}
                    />
                  </div>

                  {/* Item Info */}
                  <div className="cart-item-info-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 className="cart-item-name" style={{ margin: 0, color: '#880e4f', fontSize: '18px' }}>{displayTitle}</h3>
                      <span style={{ background: '#fce4ec', color: '#ad1457', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                        👗 {item.dressType || item.category || dressDetails.category || 'Bespoke Service'}
                      </span>
                    </div>

                    {/* Own Fabric Badge */}
                    {(item.customizationMode === 'fabric' || item.ownFabric || isFittingItem) && (
                      <div className="custom-badge-pill" style={{ background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', display: 'inline-block', marginTop: '6px', fontWeight: 'bold' }}>
                        🧵 Customer Provided Own Fabric ({item.ownFabricOption || 'Bring to shop'})
                      </div>
                    )}

                    {/* Reference Design Photo Badge */}
                    {(item.referenceDesignPhoto || item.referenceImage) && (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#ad1457', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📸 Reference Design Attached:</span>
                        <img src={item.referenceDesignPhoto || item.referenceImage} alt="Ref" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #d81b60' }} />
                      </div>
                    )}

                    {/* Selected Style Options */}
                    {(item.customizationDetails || item.neckStyle) && (
                      <div style={{ fontSize: '12px', color: '#555', marginTop: '6px', background: '#fafafa', padding: '8px 12px', borderRadius: '6px' }}>
                        ✨ <b>Style Details:</b> Neck: {item.neckStyle || item.customizationDetails?.neckStyle || 'Standard'} • Sleeve: {item.sleeveStyle || item.customizationDetails?.sleeve || 'Standard'} • Back: {item.backStyle || 'Standard'}
                      </div>
                    )}

                    {/* Embroidery Work */}
                    {item.embroideryType && item.embroideryType !== 'None' && !isFittingItem && (
                      <div style={{ fontSize: '12px', color: '#880e4f', marginTop: '4px', fontWeight: 'bold' }}>
                        ✨ <b>Embroidery Work:</b> {item.embroideryType} (Artisan: {item.designerName || 'Master Tailor'})
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <div style={{ fontSize: '12px', color: '#e65100', marginTop: '4px', fontStyle: 'italic' }}>
                        📝 <b>Special Instructions:</b> "{item.specialInstructions}"
                      </div>
                    )}

                    {/* Attached Measurements */}
                    <div className="linked-meas-tag" style={{ fontSize: '12px', marginTop: '6px', color: '#333' }}>
                      📐 <b>Dress Measurements ({item.measurementProfileName || activeProfile?.name || 'Standard Fit'}):</b>{' '}
                      {item.measurements
                        ? Object.entries(item.measurements).slice(0, 5).map(([k, v]) => `${k}: ${v}"`).join(' • ')
                        : 'Recorded in Profile'}
                    </div>

                    {/* SMART FABRIC & MATERIAL RECOMMENDATIONS ENGINE */}
                    <div style={{ marginTop: '12px', background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%)', border: '1px solid #ffb6c1', borderRadius: '12px', padding: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#880e4f', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <span>🧵</span> Smart Fabric & Material Recommendations (ஆடைக்கான துணி பரிந்துரைகள்):
                      </div>
                      <div style={{ fontSize: '12px', color: '#444', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div><b>Suggested Fabrics:</b> <span style={{ color: '#ad1457', fontWeight: 'bold' }}>{dressDetails.fabrics.join(' • ')}</span></div>
                        <div><b>Recommended Lining & Trims:</b> {dressDetails.lining}</div>
                        <div><b>Fabric Length Required:</b> {dressDetails.lengthReq} • Est. Material Cost: <b>{dressDetails.fabricPriceEstimate}</b></div>
                      </div>
                    </div>
                  </div>

                  {/* Remove Trigger */}
                  <div>
                    <button
                      type="button"
                      className="cart-remove-icon-btn"
                      onClick={() => removeFromCart(item.cartId)}
                      title="Remove item from tailoring cart"
                      style={{ background: 'none', border: 'none', fontSize: '18px', color: '#c62828', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* ITEMIZED PRICE ESTIMATION BREAKDOWN AS REQUIRED BY SPECIFICATION */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #f8bbd0', background: '#fff9fa', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                  <div style={{ fontWeight: 'bold', color: '#880e4f', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span>Itemized Cost Breakdown:</span>
                    <span style={{ fontSize: '11px', background: '#d81b60', color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                      Fit Code: {displayFitCode}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', color: '#555' }}>
                    <div>Stitching Charge: <b>₹{stitchingFeeDisplay}</b></div>
                    <div>Embroidery / Work: <b>₹{embroideryFeeDisplay}</b></div>
                    <div>Fabric / Accessories: <b>₹{fabricFeeDisplay}</b></div>
                    <div>Designer Fee: <b>₹{designerFeeDisplay}</b></div>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '8px', fontSize: '16px', fontWeight: 'bold', color: '#ad1457' }}>
                    Item Total: ₹{itemTotalDisplay}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: TAILORING SUMMARY SIDEBAR */}
      <div className="content-card cart-summary-sidebar" style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #f8bbd0' }}>
        <h3 style={{ color: '#880e4f', marginTop: 0 }}>📋 Tailoring Order Summary</h3>

        <form onSubmit={handleApplyPromo} className="promo-code-form" style={{ marginBottom: '16px' }}>
          <div className="promo-input-group" style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Promo Code (DIGI150)"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <button type="submit" className="secondary-btn" style={{ padding: '8px 14px' }}>
              Apply
            </button>
          </div>
          {promoMessage && (
            <div className={`promo-msg ${promoMessage.success ? 'success' : 'error'}`} style={{ fontSize: '12px', marginTop: '4px', color: promoMessage.success ? '#2e7d32' : '#c62828' }}>
              {promoMessage.message}
            </div>
          )}
        </form>

        <div className="summary-breakdown-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
          <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Stitching & Service Subtotal</span>
            <b>₹{cartSummary.subtotal}</b>
          </div>
          <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Doorstep Measurement / Pickup</span>
            <b>{cartSummary.delivery === 0 ? <span style={{ color: '#2e7d32' }}>FREE</span> : `₹${cartSummary.delivery}`}</b>
          </div>
          {cartSummary.discount > 0 && (
            <div className="summary-row discount" style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32' }}>
              <span>Promo Discount</span>
              <b>-₹{cartSummary.discount}</b>
            </div>
          )}
          <div className="summary-row total-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', borderTop: '2px solid #f8bbd0', paddingTop: '10px', color: '#880e4f' }}>
            <span>TOTAL TAILORING QUOTE</span>
            <b className="grand-total-price">₹{cartSummary.total}</b>
          </div>
        </div>

        <button
          type="button"
          className="primary-btn full checkout-action-btn"
          onClick={onProceedToCheckout}
          style={{
            width: '100%',
            padding: '14px',
            marginTop: '20px',
            background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(216, 27, 96, 0.3)',
          }}
        >
          [PLACE TAILORING ORDER]
        </button>
      </div>
    </div>
  );
}
