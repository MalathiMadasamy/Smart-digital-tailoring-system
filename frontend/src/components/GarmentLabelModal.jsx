import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function GarmentLabelModal({ order, onClose }) {
  const orderId = order?.orderId || order?.id || 'ORD-1025';
  const [networkHost, setNetworkHost] = useState(window.location.host);
  const [customIp, setCustomIp] = useState(() => {
    return localStorage.getItem('digitailor_saved_wifi_ip') || '';
  });

  useEffect(() => {
    // Auto-fetch real Wi-Fi IP from backend port 5000 and save permanently to localStorage
    const apiHost = window.location.hostname || 'localhost';
    fetch(`http://${apiHost}:5000/api/v1/network-ip`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ip && data.ip !== 'localhost') {
          const port = window.location.port || '5173';
          const detectedHost = `${data.ip}:${port}`;
          setNetworkHost(detectedHost);
          if (!localStorage.getItem('digitailor_saved_wifi_ip')) {
            setCustomIp(data.ip);
            localStorage.setItem('digitailor_saved_wifi_ip', data.ip);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleCustomIpChange = (newIp) => {
    setCustomIp(newIp);
    if (newIp.trim()) {
      localStorage.setItem('digitailor_saved_wifi_ip', newIp.trim());
    }
  };

  const effectiveHost = customIp.trim()
    ? `${customIp.trim().replace(/^https?:\/\//, '')}:${window.location.port || '5173'}`
    : networkHost;

  const trackingUrl = `http://${effectiveHost}/track/${orderId}`;
  
  // Instant fallback QR code URL using standard public QR API
  const defaultQrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingUrl)}`;
  const [qrUrl, setQrUrl] = useState(defaultQrApiUrl);

  useEffect(() => {
    if (orderId) {
      // Safely attempt local canvas QRCode generation with fallback
      try {
        const toDataFn = QRCode?.toDataURL || (QRCode?.default && QRCode?.default?.toDataURL);
        if (typeof toDataFn === 'function') {
          toDataFn(trackingUrl, { width: 220, margin: 1, color: { dark: '#880e4f', light: '#ffffff' } })
            .then((url) => setQrUrl(url))
            .catch(() => setQrUrl(defaultQrApiUrl));
        } else {
          setQrUrl(defaultQrApiUrl);
        }
      } catch (err) {
        setQrUrl(defaultQrApiUrl);
      }
    }
  }, [orderId, trackingUrl, defaultQrApiUrl]);

  if (!order) return null;

  // 1. Primary Print Handler
  const handlePrint = () => {
    window.print();
  };

  // 2. Secondary Standalone Popout Print Window Handler (100% immune to modal CSS issues)
  const handlePopoutPrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=750');
    if (!printWindow) {
      alert('Pop-up blocked! Using standard page print instead.');
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Garment Tracking Label - ${orderId}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #fff; color: #111; }
            .tag-box { border: 2px dashed #d81b60; border-radius: 16px; padding: 24px; max-width: 420px; margin: 0 auto; background: #fff; }
            .header { text-align: center; border-bottom: 1px solid #f8bbd0; padding-bottom: 12px; margin-bottom: 16px; }
            .header h2 { margin: 0; color: #880e4f; font-size: 20px; }
            .header p { margin: 4px 0 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            .qr-container { text-align: center; margin: 16px 0; }
            .qr-container img { width: 180px; height: 180px; border: 1px solid #f8bbd0; padding: 6px; border-radius: 12px; }
            .order-id { font-family: monospace; font-size: 24px; font-weight: 900; color: #880e4f; margin-top: 8px; }
            .details { background: #fff0f5; padding: 14px; border-radius: 12px; font-size: 13px; line-height: 1.6; }
            .details-row { display: flex; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #f8bbd0; padding-bottom: 4px; }
            .details-row:last-child { border-bottom: none; margin-bottom: 0; }
            .footer { margin-top: 16px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="tag-box">
            <div class="header">
              <h2>Smart Digital Tailoring System</h2>
              <p>GARMENT IDENTIFICATION TAG</p>
            </div>
            <div class="qr-container">
              <img src="${qrUrl}" alt="QR Code" />
              <div class="order-id">${orderId}</div>
              <div style="font-size: 11px; font-weight: bold; color: #ad1457;">${order.qrIdentifier || `QR-${orderId}`}</div>
            </div>
            <div class="details">
              <div class="details-row"><span>Customer:</span> <strong>${order.customerName || 'Customer'}</strong></div>
              <div class="details-row"><span>Phone:</span> <strong>${order.customerPhone || order.customerDetails?.phone || 'N/A'}</strong></div>
              <div class="details-row"><span>Dress Type:</span> <strong>${order.dressType || 'Custom Blouse'}</strong></div>
              <div class="details-row"><span>Colour:</span> <strong>${order.dressColour || 'Standard'}</strong></div>
              <div class="details-row"><span>Storage Location:</span> <strong style="color: #ad1457;">📍 ${order.rackLocation || 'Rack A - Box 03'}</strong></div>
              <div class="details-row"><span>Status:</span> <strong style="color: #2e7d32;">⏳ ${order.status || 'Received'}</strong></div>
            </div>
            <div class="footer">Attach to physical garment bag / hanger. Scan at Tailor Desk to prevent mix-ups.</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div id="garment-printable-label-root" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <style>{`
        @media print {
          body > *:not(#garment-printable-label-root) {
            display: none !important;
          }
          #garment-printable-label-root {
            position: absolute !important;
            inset: 0 !important;
            background: #ffffff !important;
            display: block !important;
            z-index: 99999 !important;
          }
          .no-print {
            display: none !important;
          }
          #garment-printable-card {
            border: 2px dashed #880e4f !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 450px !important;
            margin: 0 auto !important;
            padding: 20px !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-pink-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-800 to-rose-700 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏷️</span>
            <h3 className="font-bold text-lg">Garment QR Identification Label</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Mobile Camera Scanning Helper Banner */}
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-6 py-3 no-print flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between font-bold gap-2">
            <span>📱 Mobile Scanning Wi-Fi Host IP:</span>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={customIp}
                onChange={(e) => handleCustomIpChange(e.target.value)}
                placeholder="192.168.X.X"
                className="bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-mono font-bold text-amber-950 w-32 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-[10px] text-amber-800 font-mono font-bold">:5173</span>
            </div>
          </div>
          <div className="text-[11px] text-amber-800 break-all font-mono font-bold bg-amber-100/60 px-2 py-1 rounded border border-amber-200">
            🔗 {trackingUrl}
          </div>
          <p className="text-[10px] text-amber-700 italic m-0">
            QR code is auto-updated with your laptop's Wi-Fi IP so mobile phone cameras scan directly over Wi-Fi without connection errors.
          </p>
        </div>

        {/* Scrollable Printable Garment Tag Container */}
        <div className="p-6 bg-pink-50/40 overflow-y-auto flex-1">
          <div id="garment-printable-card" className="bg-white p-5 rounded-xl border-2 border-dashed border-rose-300 shadow-sm text-gray-800">
            {/* Store Brand Header */}
            <div className="text-center pb-3 border-b border-pink-200">
              <div className="text-xs uppercase tracking-widest text-rose-700 font-bold">Smart Digital Tailoring System</div>
              <h4 className="font-extrabold text-xl text-pink-900 mt-0.5">GARMENT TRACKING TAG</h4>
              <p className="text-[11px] text-gray-500">Attach to physical garment rack bag / hanger</p>
            </div>

            {/* QR Code & Order ID */}
            <div className="flex flex-col items-center justify-center my-4">
              <img
                src={qrUrl}
                alt={`QR Code for ${orderId}`}
                className="w-40 h-40 border-2 border-pink-200 p-2 rounded-xl bg-white shadow-sm object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultQrApiUrl;
                }}
              />
              <div className="mt-2 font-mono font-extrabold text-2xl text-rose-900 tracking-wider">
                {orderId}
              </div>
              <span className="inline-block bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1">
                {order.qrIdentifier || `QR-${orderId}`}
              </span>
            </div>

            {/* Garment Photo & Key Details */}
            <div className="bg-pink-50/80 rounded-lg p-3 border border-pink-100 text-xs space-y-2">
              <div className="flex items-center space-x-3">
                {order.dressImage || order.referenceImage ? (
                  <img
                    src={order.dressImage || order.referenceImage}
                    alt={order.dressType || 'Garment'}
                    className="w-16 h-16 object-cover rounded-md border border-pink-300 shadow-sm flex-shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-pink-100 rounded-md flex items-center justify-center text-rose-400 text-2xl flex-shrink-0">
                    👗
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm truncate">{order.customerName || 'Malathi Lakshmi'}</div>
                  <div className="text-gray-600 font-medium">📞 {order.customerPhone || order.customerDetails?.phone || '+91 98765 43210'}</div>
                  <div className="text-rose-800 font-semibold mt-0.5">👗 {order.dressType || 'Custom Blouse'}</div>
                  <div className="text-gray-600">🎨 Colour: <span className="font-semibold text-gray-800">{order.dressColour || 'Royal Blue'}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-pink-200/60">
                <div className="bg-white p-2 rounded border border-pink-100">
                  <span className="block text-[10px] uppercase font-bold text-gray-500">Storage Rack Location</span>
                  <span className="font-bold text-rose-800 text-xs">📍 {order.rackLocation || 'Rack A - Box 03'}</span>
                </div>
                <div className="bg-white p-2 rounded border border-pink-100">
                  <span className="block text-[10px] uppercase font-bold text-gray-500">Current Status</span>
                  <span className="font-bold text-emerald-700 text-xs">⏳ {order.status || 'Received'}</span>
                </div>
              </div>

              {order.specialInstructions && (
                <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-[11px] text-yellow-900">
                  <strong>Notes:</strong> {order.specialInstructions}
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="mt-3 text-center text-[10px] text-gray-400 border-t border-pink-100 pt-2">
              Scan QR code at Tailor Desk to inspect measurements & prevent customer garment mix-up.
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-pink-100 flex flex-wrap items-center justify-between gap-2 no-print">
          <button
            onClick={handlePopoutPrint}
            className="px-3.5 py-2 text-xs font-bold text-rose-900 bg-pink-100 hover:bg-pink-200 rounded-lg border border-pink-300 transition flex items-center space-x-1"
            title="Open dedicated print window"
          >
            <span>🌐 Popup Print</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-extrabold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-md transition flex items-center space-x-1"
            >
              <span>🖨️ Print Label</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
