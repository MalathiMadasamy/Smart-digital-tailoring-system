import React from 'react';

export function OrderConfirmationModal({ order, onClose, onTrackOrder }) {
  if (!order) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog confirmation-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-content-box">
          <div className="success-party-emoji">🎉👗🎊</div>
          <h2>Order Confirmed!</h2>
          <p className="order-id-highlight">
            Order Reference: <b>#{order.id}</b>
          </p>

          <p className="confirmation-subtitle">
            Thank you for placing your bespoke order with <b>DigiTailor</b>. Our master tailors have received your fabric and body measurement specifications.
          </p>

          <div className="delivery-estimate-badge">
            🚚 Estimated Delivery & Fitting: <b>{order.deliveryEstimate || 'In 5 Business Days'}</b>
          </div>

          <div className="confirmed-items-list">
            <h4>Ordered Garments ({order.items.length}):</h4>
            {order.items.map((item, i) => (
              <div className="confirmed-item-card" key={i}>
                <img
                  src={item.imgUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=780&fit=crop&auto=format'}
                  alt={item.name}
                  className="confirmed-item-img"
                />
                <div className="confirmed-item-info">
                  <b>{item.name}</b>
                  <small>Qty: {item.quantity || 1} • ₹{item.price} each</small>
                </div>
                <b className="confirmed-item-total">₹{(item.price || 0) * (item.quantity || 1)}</b>
              </div>
            ))}
          </div>

          <div className="paid-total-display">
            <span>Total Paid ({order.paymentMethod}):</span> <b>₹{order.total}</b>
          </div>

          <div className="confirmation-action-btns" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="primary-btn full"
              onClick={() => {
                onClose();
                onTrackOrder();
              }}
            >
              🚚 Track Order Stitching Status Live →
            </button>

            <button
              type="button"
              className="secondary-btn full"
              onClick={() => {
                const printWindow = window.open('', '_blank', 'width=850,height=1100');
                if (!printWindow) return;
                const itemsList = (order.items || []).map(item => `
                  <tr>
                    <td><strong>${item.name}</strong><br><small style="color:#666">${item.measurementProfileName || 'Custom Fit Measurements Attached'}</small></td>
                    <td>${item.embroideryType || 'Standard'}</td>
                    <td>${order.status || 'CUTTING IN PROGRESS'}</td>
                    <td>₹${item.price}</td>
                  </tr>
                `).join('');

                const htmlContent = `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>Invoice #${order.id} - Smart Digital Tailoring System</title>
                    <style>
                      body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #333; background: #fff; }
                      .header { display: flex; justify-content: space-between; border-bottom: 2px solid #880e4f; padding-bottom: 20px; }
                      .brand { color: #880e4f; font-size: 24px; font-weight: bold; }
                      .tagline { font-size: 12px; color: #666; }
                      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0; }
                      .info-card { background: #fafafa; padding: 16px; border-radius: 8px; border: 1px solid #eee; }
                      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                      th { background: #880e4f; color: #fff; text-align: left; padding: 12px; }
                      td { padding: 12px; border-bottom: 1px solid #eee; }
                      .totals-table { width: 320px; margin-left: auto; margin-top: 20px; }
                      .totals-table td { padding: 8px; }
                      .grand-total { font-weight: bold; font-size: 16px; color: #880e4f; border-top: 2px solid #880e4f; }
                      .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 14px; }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <div>
                        <div class="brand">✂️ Smart Digital Tailoring System</div>
                        <div class="tagline">Women-Only Bespoke Atelier & Custom Studio</div>
                      </div>
                      <div style="text-align: right">
                        <h2 style="margin:0; color:#880e4f">OFFICIAL TAX INVOICE</h2>
                        <span>Reference: #${order.id}</span>
                      </div>
                    </div>
                    <div class="info-grid">
                      <div class="info-card">
                        <h4>CUSTOMER DETAILS</h4>
                        <p><strong>Name:</strong> ${order.customerName || 'Customer'}</p>
                        <p><strong>Phone:</strong> ${order.customerDetails?.phone || '+91 98765 43210'}</p>
                      </div>
                      <div class="info-card">
                        <h4>TAILORING ORDER DETAILS</h4>
                        <p><strong>Order Date:</strong> ${order.date || new Date().toLocaleDateString()}</p>
                        <p><strong>Payment Status:</strong> <b style="color: #2e7d32">${order.paymentStatus || 'FULLY PAID'} (${order.paymentMethod || 'QR Code Scanner'})</b></p>
                      </div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Item / Tailoring Service</th>
                          <th>Embroidery</th>
                          <th>Status</th>
                          <th>Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsList}
                      </tbody>
                    </table>
                    <table class="totals-table">
                      <tr><td>Total Amount:</td><td style="text-align:right"><strong>₹${order.total}</strong></td></tr>
                      <tr><td>Amount Paid:</td><td style="text-align:right; color:#2e7d32"><strong>₹${order.paidAmount || order.total}</strong></td></tr>
                      <tr><td>Remaining Balance:</td><td style="text-align:right; color:#c62828"><strong>₹${order.remainingAmount || 0}</strong></td></tr>
                    </table>
                    <div class="footer">
                      <p>Thank you for choosing <strong>Smart Digital Tailoring System</strong>! For support contact support@digitailor.com</p>
                    </div>
                    <script>
                      window.onload = function() { setTimeout(function() { window.print(); }, 300); };
                    </script>
                  </body>
                  </html>
                `;
                printWindow.document.write(htmlContent);
                printWindow.document.close();
              }}
              style={{ background: '#fce4ec', color: '#880e4f', border: '1px solid #f8bbd0', padding: '12px', borderRadius: '12px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}
            >
              🧾 Download / Print PDF Invoice & Bill (கட்டண ரசீது) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
