import React, { useState, useEffect } from 'react';
import GarmentLabelModal from './GarmentLabelModal';

export default function GarmentQRScanner({ orders = [], onUpdateStatus, onUpdateLocation, onVerifyDelivery }) {
  const [searchInput, setSearchInput] = useState('');
  const [scannedOrder, setScannedOrder] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);

  // Delivery Verification states
  const [intendedDeliveryId, setIntendedDeliveryId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [showMismatchAlert, setShowMismatchAlert] = useState(false);

  // Default to first order or demo order if none scanned yet
  useEffect(() => {
    if (orders.length > 0 && !scannedOrder) {
      const defaultOrd = orders[0];
      setScannedOrder(defaultOrd);
      setSelectedLocation(defaultOrd.rackLocation || 'Rack A - Box 03');
    }
  }, [orders]);

  const handleSearch = (query) => {
    const q = (query || searchInput).trim();
    if (!q) {
      setSearchError('Please enter an Order ID or QR Code text');
      return;
    }
    setSearchError('');

    // Clean prefix if needed
    const cleanQ = q.replace(/^QR-/, '').replace(/^https?:\/\/.*\/track\//, '').trim();

    // Match in order list
    const found = orders.find(
      (o) =>
        (o.orderId && o.orderId.toLowerCase() === cleanQ.toLowerCase()) ||
        (o.id && o.id.toLowerCase() === cleanQ.toLowerCase()) ||
        (o.qrIdentifier && o.qrIdentifier.toLowerCase() === q.toLowerCase()) ||
        (o.customerName && o.customerName.toLowerCase().includes(cleanQ.toLowerCase()))
    );

    if (found) {
      setScannedOrder(found);
      setSelectedLocation(found.rackLocation || 'Rack A - Box 03');
      setSearchError('');
      setVerificationResult(null);
    } else {
      setSearchError(`No garment order found matching '${q}'`);
    }
  };

  const handleSimulateQRScan = (orderToScan) => {
    setIsScanning(false);
    setScannedOrder(orderToScan);
    setSelectedLocation(orderToScan.rackLocation || 'Rack A - Box 03');
    setSearchInput(orderToScan.orderId || orderToScan.id);
    setSearchError('');
    setVerificationResult(null);
  };

  const handleStatusChange = (newStatus) => {
    if (!scannedOrder) return;
    const targetId = scannedOrder.orderId || scannedOrder.id;
    if (onUpdateStatus) {
      onUpdateStatus(targetId, newStatus);
    }
    setScannedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  const handleSaveLocation = () => {
    if (!scannedOrder || !selectedLocation) return;
    const targetId = scannedOrder.orderId || scannedOrder.id;
    if (onUpdateLocation) {
      onUpdateLocation(targetId, selectedLocation);
    }
    setScannedOrder((prev) => (prev ? { ...prev, rackLocation: selectedLocation } : null));
    alert(`Storage location updated to '${selectedLocation}' for Order ${targetId}`);
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [handoverSuccess, setHandoverSuccess] = useState(null);

  // Verify Before Delivery Logic (Strict Mismatch Check)
  const handleVerifyDelivery = () => {
    if (!scannedOrder) {
      alert('Please scan or search a garment QR code first!');
      return;
    }
    if (!intendedDeliveryId.trim()) {
      alert('Please select or enter the Intended Delivery Customer Order ID to verify!');
      return;
    }

    const scannedId = (scannedOrder.orderId || scannedOrder.id || '').trim();
    const intendedId = intendedDeliveryId.trim().replace(/^QR-/, '');

    const intendedObj = orders.find(
      (o) => (o.orderId && o.orderId.toLowerCase() === intendedId.toLowerCase()) || (o.id && o.id.toLowerCase() === intendedId.toLowerCase())
    );

    const isMatch = scannedId.toLowerCase() === intendedId.toLowerCase();

    if (isMatch) {
      setVerificationResult({
        matched: true,
        title: 'GARMENT VERIFIED',
        message: `✅ GARMENT VERIFIED MATCH: Scanned garment (${scannedId}) matches intended delivery customer '${scannedOrder.customerName}'! Safe to hand over.`,
        scanned: scannedOrder,
        intended: intendedObj || scannedOrder,
      });
      setShowMismatchAlert(false);
    } else {
      setVerificationResult({
        matched: false,
        title: 'GARMENT MISMATCH - DO NOT DELIVER',
        message: `⚠️ GARMENT MISMATCH - DO NOT DELIVER: Scanned garment (${scannedId}) belongs to customer '${scannedOrder.customerName}' (${scannedOrder.dressColour} ${scannedOrder.dressType}), but customer requested order '${intendedId}'!`,
        scanned: scannedOrder,
        intendedId: intendedId,
        intended: intendedObj,
      });
      setShowMismatchAlert(true);
    }
  };

  // Razorpay Payment Collection Handler
  const handleCollectPayment = async () => {
    if (!scannedOrder) return;
    setIsProcessingPayment(true);

    const targetId = scannedOrder.orderId || scannedOrder.id;
    const dueAmount = scannedOrder.remainingAmount !== undefined ? scannedOrder.remainingAmount : (scannedOrder.totalAmount - (scannedOrder.paidAmount || 0));
    const payAmt = dueAmount > 0 ? dueAmount : 10;
    const apiHost = window.location.hostname || 'localhost';

    try {
      const res = await fetch(`http://${apiHost}:5000/api/v1/payments/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payAmt, orderId: targetId })
      });
      const orderData = await res.json();

      const options = {
        key: orderData.key_id || 'rzp_test_digitailor2026',
        amount: orderData.amount || payAmt * 100,
        currency: 'INR',
        name: 'Smart Digital Tailoring System',
        description: `Stitching Payment for Order ${targetId}`,
        order_id: orderData.id,
        handler: async function (response) {
          const verifyRes = await fetch(`http://${apiHost}:5000/api/v1/payments/razorpay/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: targetId,
              amountPaid: payAmt
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setScannedOrder(prev => ({
              ...prev,
              paidAmount: (prev.paidAmount || 0) + payAmt,
              remainingAmount: 0,
              paymentStatus: 'FULLY_PAID',
              paymentId: response.razorpay_payment_id || `PAY-${Date.now()}`
            }));
            alert(`✅ Razorpay Payment Verified! Payment ID: ${response.razorpay_payment_id || 'PAY-VERIFIED'}`);
          }
          setIsProcessingPayment(false);
        },
        prefill: {
          name: scannedOrder.customerName || 'Customer',
          contact: scannedOrder.customerPhone || '+91 98765 43210'
        },
        theme: { color: '#d81b60' }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const verifyRes = await fetch(`http://${apiHost}:5000/api/v1/payments/razorpay/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: targetId,
            amountPaid: payAmt,
            razorpay_payment_id: `pay_sim_${Date.now()}`
          })
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setScannedOrder(prev => ({
            ...prev,
            paidAmount: (prev.paidAmount || 0) + payAmt,
            remainingAmount: 0,
            paymentStatus: 'FULLY_PAID',
            paymentId: verifyData.paymentId || `PAY-${Date.now()}`
          }));
          alert('✅ Payment verified and recorded in MongoDB!');
        }
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error('Payment Error:', err);
      alert('Payment processing failed: ' + err.message);
      setIsProcessingPayment(false);
    }
  };

  // Final Handover & Delivery Confirmation Handler
  const handleConfirmHandover = async () => {
    if (!verificationResult || !verificationResult.matched) {
      alert('⚠️ GARMENT MISMATCH - DO NOT DELIVER! Garment identity must be verified before handover.');
      return;
    }

    const targetId = scannedOrder.orderId || scannedOrder.id;
    const apiHost = window.location.hostname || 'localhost';

    try {
      const res = await fetch(`http://${apiHost}:5000/api/v1/orders/verify-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scannedOrderId: targetId,
          intendedOrderId: intendedDeliveryId,
          verifiedBy: 'Master Rajesh Tailor',
          paymentId: scannedOrder.paymentId || `PAY-VERIFIED-${Date.now()}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setScannedOrder(prev => ({ ...prev, status: 'Delivered', isGarmentVerified: true }));
        setHandoverSuccess(data);
        alert(`✅ Garment Order #${targetId} verified by Master Rajesh Tailor and marked DELIVERED in MongoDB!`);
      }
    } catch (err) {
      alert('Delivery verification failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Search Bar */}
      <div className="bg-gradient-to-r from-pink-900 via-rose-800 to-pink-950 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center space-x-2 bg-pink-500/20 px-3 py-1 rounded-full text-xs font-semibold text-pink-200 mb-2 border border-pink-400/30">
              <span>📷 Real Garment Tracking & QR Scanner</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Tailor Desk QR Garment Identification</h2>
            <p className="text-pink-100 text-sm mt-1">Scan physical QR tags or search Order IDs to inspect dress photos, measurements & rack locations.</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSimulateQRScan(orders[0] || { orderId: 'ORD-1025', customerName: 'Malathi Lakshmi' })}
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-4 py-2.5 rounded-xl border border-white/20 text-sm transition flex items-center space-x-2"
            >
              <span>📷 Camera Scan QR</span>
            </button>
          </div>
        </div>

        {/* QR Scan Input */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Scan QR Code or enter Order ID (e.g., ORD-1025, TAILOR-2026-1025)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-white text-gray-900 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-semibold shadow-inner"
              />
              <span className="absolute left-3.5 top-3 text-lg text-gray-400">🔍</span>
            </div>

            <button
              onClick={() => handleSearch()}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow-md"
            >
              Identify Garment
            </button>
          </div>

          {searchError && (
            <div className="mt-2 text-red-200 text-xs font-semibold bg-red-900/60 p-2 rounded-lg border border-red-400/40">
              ⚠️ {searchError}
            </div>
          )}
        </div>

        {/* Preset Sample QR Selectors */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-pink-200 font-semibold">Quick Sample QRs:</span>
          {orders.slice(0, 5).map((ord) => (
            <button
              key={ord.orderId || ord.id}
              onClick={() => handleSimulateQRScan(ord)}
              className={`px-3 py-1 rounded-lg border text-xs font-medium transition ${
                scannedOrder?.orderId === ord.orderId || scannedOrder?.id === ord.id
                  ? 'bg-rose-500 text-white border-rose-300 font-bold'
                  : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
              }`}
            >
              🏷️ {ord.orderId || ord.id} ({ord.customerName?.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Main Scanned Garment Details Section */}
      {isScanning ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-pink-100 shadow-md">
          <div className="animate-spin text-5xl mb-3">📷</div>
          <h3 className="font-bold text-lg text-gray-800">Scanning Garment QR Code...</h3>
          <p className="text-gray-500 text-sm mt-1">Reading camera stream & retrieving MongoDB garment data</p>
        </div>
      ) : scannedOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Dress Photo & Quick Tags */}
          <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 bg-pink-100 px-3 py-1 rounded-full">
                  Scanned Garment Photo
                </span>
                <button
                  onClick={() => setShowLabelModal(true)}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-pink-200 transition flex items-center space-x-1"
                >
                  <span>🏷️ Printable Label</span>
                </button>
              </div>

              {/* Photo Display */}
              <div className="relative rounded-xl overflow-hidden border-2 border-pink-200 bg-pink-50 aspect-square group shadow-inner mb-4">
                {scannedOrder.dressImage || scannedOrder.referenceImage ? (
                  <img
                    src={scannedOrder.dressImage || scannedOrder.referenceImage}
                    alt={scannedOrder.dressType || 'Customer Dress'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-pink-300 p-4">
                    <span className="text-6xl">👗</span>
                    <span className="text-xs text-pink-500 mt-2 font-medium">No photo uploaded</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/75 text-white px-2.5 py-1 rounded-md text-xs font-mono font-bold">
                  ID: {scannedOrder.orderId || scannedOrder.id}
                </div>
              </div>

              {/* Status Badge */}
              <div className="bg-pink-50/80 p-3 rounded-xl border border-pink-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-semibold">Current Stitching Status</span>
                  <span className="font-extrabold text-rose-800 bg-white px-2 py-0.5 rounded border border-pink-200 uppercase">
                    {scannedOrder.status || 'Received'}
                  </span>
                </div>

                {/* Status Update Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {['Received', 'Stitching', 'Ready for Delivery', 'Delivered'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold transition text-center ${
                        (scannedOrder.status || '').toLowerCase() === st.toLowerCase()
                          ? 'bg-rose-700 text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-pink-100 border border-pink-200'
                      }`}
                    >
                      {st === 'Received' && '📥 Received'}
                      {st === 'Stitching' && '✂️ Stitching'}
                      {st === 'Ready for Delivery' && '📦 Ready'}
                      {st === 'Delivered' && '✅ Delivered'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Storage Location Manager */}
            <div className="mt-4 pt-4 border-t border-pink-100">
              <label className="block text-xs font-bold text-gray-700 mb-1">📍 Garment Storage Rack / Box Location</label>
              <div className="flex gap-2">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="flex-1 bg-pink-50 border border-pink-200 rounded-lg px-2.5 py-2 text-xs font-bold text-pink-950 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="Rack A - Box 01">Rack A - Box 01 (Blouses)</option>
                  <option value="Rack A - Box 02">Rack A - Box 02 (Blouses)</option>
                  <option value="Rack A - Box 03">Rack A - Box 03 (Blouses)</option>
                  <option value="Rack B - Box 01">Rack B - Box 01 (Chudidhars)</option>
                  <option value="Rack B - Box 02">Rack B - Box 02 (Chudidhars)</option>
                  <option value="Rack C - Hanger 01">Rack C - Hanger 01 (Anarkali/Gowns)</option>
                  <option value="Rack C - Hanger 02">Rack C - Hanger 02 (Bridal Sets)</option>
                  <option value="Express Delivery Shelf">Express Delivery Shelf</option>
                </select>
                <button
                  onClick={handleSaveLocation}
                  className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-3 py-2 rounded-lg text-xs transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Center Column: Customer & Garment Specs */}
          <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-pink-100 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 bg-pink-100 px-3 py-1 rounded-full">
                  Customer & Order Profile
                </span>
                <h3 className="font-extrabold text-xl text-gray-900 mt-2">{scannedOrder.customerName || 'Malathi Lakshmi'}</h3>
                <p className="text-xs text-gray-500 font-medium">📞 Phone: {scannedOrder.customerPhone || scannedOrder.customerDetails?.phone || '+91 98765 43210'}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold">Order ID</span>
                  <span className="font-mono font-bold text-rose-900">{scannedOrder.orderId || scannedOrder.id}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold">Dress Type</span>
                  <span className="font-bold text-gray-900">{scannedOrder.dressType || 'Designer Blouse'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold">Dress Colour</span>
                  <span className="font-bold text-pink-700">🎨 {scannedOrder.dressColour || 'Royal Blue'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold">Assigned Tailor</span>
                  <span className="font-semibold text-gray-800">{scannedOrder.assignedTailor || scannedOrder.tailorAssigned || 'Master Rajesh Tailor'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold">Fabric Provided</span>
                  <span className="font-semibold text-purple-700">{scannedOrder.fabricSource || (scannedOrder.ownFabric ? 'Customer Own Fabric' : 'Shop Fabric')}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold">Total Amount / Paid</span>
                  <span className="font-bold text-emerald-800">₹{scannedOrder.totalAmount || scannedOrder.total || 0} (Paid: ₹{scannedOrder.paidAmount || 0})</span>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs">
                <div className="font-bold text-amber-900 mb-1 flex items-center space-x-1">
                  <span>📝 Stitching & Customization Notes</span>
                </div>
                <p className="text-amber-800 leading-relaxed font-medium">
                  {scannedOrder.specialInstructions || scannedOrder.alterationNotes || 'Standard fit with lining. Ensure deep neck as requested.'}
                </p>
              </div>
            </div>

            {/* Quick Action: Printable Tag */}
            <button
              onClick={() => setShowLabelModal(true)}
              className="mt-4 w-full bg-pink-100 hover:bg-pink-200 text-pink-900 font-bold py-2.5 rounded-xl border border-pink-300 transition text-xs flex items-center justify-center space-x-2"
            >
              <span>🏷️ View & Print Physical Garment Label</span>
            </button>
          </div>

          {/* Right Column: Garment Measurements & Delivery Verification */}
          <div className="space-y-6">
            {/* Customer Measurements Card */}
            <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-md">
              <div className="flex items-center justify-between mb-3 border-b border-pink-100 pb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 bg-pink-100 px-3 py-1 rounded-full">
                  Recorded Measurements
                </span>
                <span className="text-[11px] text-gray-500 font-semibold">9 Point Grid</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(scannedOrder.measurements || { bust: '36', waist: '30', shoulder: '15', sleeveLength: '10', blouseLength: '14', neckDepth: '7' }).map(([key, val]) => (
                  <div key={key} className="bg-pink-50/60 p-2 rounded-lg border border-pink-100 flex justify-between items-center">
                    <span className="capitalize text-gray-600 font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-mono font-bold text-pink-950 bg-white px-1.5 py-0.5 rounded border border-pink-200">{val} in</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verify Before Delivery Module (Crucial anti-mixup feature) */}
            <div className="bg-white rounded-2xl border-2 border-rose-200 p-5 shadow-md">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">🛡️</span>
                <h4 className="font-extrabold text-sm text-gray-900">Verify Before Handover / Delivery</h4>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Prevent delivering to wrong customer! Select customer order intended for delivery and verify match with scanned garment.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">Intended Delivery Order ID</label>
                <select
                  value={intendedDeliveryId}
                  onChange={(e) => setIntendedDeliveryId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="">-- Select Intended Delivery Order --</option>
                  {orders.map((o) => (
                    <option key={o.orderId || o.id} value={o.orderId || o.id}>
                      {o.orderId || o.id} - {o.customerName} ({o.dressType})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleVerifyDelivery}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-md mt-2 flex items-center justify-center space-x-2"
                >
                  <span>🔍 Verify Garment Match</span>
                </button>
              </div>

              {/* Verification Result & Payment / Delivery Action Panel */}
              {verificationResult && (
                <div className="mt-4 space-y-3">
                  <div
                    className={`p-4 rounded-xl border text-xs leading-relaxed ${
                      verificationResult.matched
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                        : 'bg-red-50 text-red-950 border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-black text-sm mb-1">
                      <span className={verificationResult.matched ? 'text-emerald-700' : 'text-red-700'}>
                        {verificationResult.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${verificationResult.matched ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'}`}>
                        {verificationResult.matched ? 'MATCH CONFIRMED' : 'DELIVERY BLOCKED'}
                      </span>
                    </div>
                    <p className="font-semibold">{verificationResult.message}</p>
                    <p className="text-[10px] opacity-75 mt-1 italic">
                      * Photo comparison is for tailor visual inspection only and does not automatically prove garment ownership.
                    </p>
                  </div>

                  {/* If Matched: Show Payment & Delivery Handover Action Controls */}
                  {verificationResult.matched && (
                    <div className="bg-pink-50 p-4 rounded-xl border border-pink-200 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700">Payment Status</span>
                        <span className={`font-extrabold px-2.5 py-1 rounded-full uppercase text-[11px] ${
                          (scannedOrder.paymentStatus || '').includes('PAID') && !scannedOrder.paymentStatus?.includes('UNPAID')
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {scannedOrder.paymentStatus || 'UNPAID'} (Remaining: ₹{scannedOrder.remainingAmount !== undefined ? scannedOrder.remainingAmount : Math.max(0, (scannedOrder.totalAmount - (scannedOrder.paidAmount||0)))})
                        </span>
                      </div>

                      {/* Razorpay Collect Payment Button if amount remaining */}
                      {(scannedOrder.remainingAmount > 0 || (scannedOrder.paymentStatus || '').includes('UNPAID')) && (
                        <button
                          onClick={handleCollectPayment}
                          disabled={isProcessingPayment}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold py-2.5 rounded-xl transition text-xs shadow-md flex items-center justify-center space-x-2"
                        >
                          <span>💳 Collect ₹{scannedOrder.remainingAmount || scannedOrder.totalAmount} via Razorpay Gateway</span>
                        </button>
                      )}

                      {/* Final Handover Confirmation Button */}
                      <button
                        onClick={handleConfirmHandover}
                        disabled={scannedOrder.status === 'Delivered'}
                        className={`w-full font-extrabold py-3 rounded-xl transition text-xs shadow-md flex items-center justify-center space-x-2 ${
                          scannedOrder.status === 'Delivered'
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-rose-800 to-pink-900 hover:from-rose-900 hover:to-pink-950 text-white'
                        }`}
                      >
                        <span>{scannedOrder.status === 'Delivered' ? '✅ Garment Already Handed Over & Delivered' : '✅ Confirm Handover & Complete Delivery'}</span>
                      </button>

                      {handoverSuccess && (
                        <div className="text-[11px] bg-emerald-100 text-emerald-900 p-2.5 rounded-lg font-medium border border-emerald-300 space-y-0.5">
                          <div><strong>Verified By:</strong> {handoverSuccess.verifiedBy || 'Master Rajesh Tailor'}</div>
                          <div><strong>Time:</strong> {new Date(handoverSuccess.verificationTime || Date.now()).toLocaleString()}</div>
                          <div><strong>Payment ID:</strong> {handoverSuccess.paymentId || 'PAY-VERIFIED'}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-pink-100 shadow-md">
          <span className="text-5xl">🏷️</span>
          <h3 className="font-bold text-lg text-gray-800 mt-2">No Garment Selected</h3>
          <p className="text-gray-500 text-sm mt-1">Scan a QR label or select a sample order above to inspect details.</p>
        </div>
      )}

      {/* DELIVERY MISMATCH WARNING MODAL */}
      {showMismatchAlert && verificationResult && !verificationResult.matched && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border-4 border-red-600 shadow-2xl animate-bounce-once">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black mb-2">
                ⚠️
              </div>
              <h3 className="font-black text-2xl text-red-700 tracking-tight">GARMENT MISMATCH - DO NOT DELIVER</h3>
              <p className="text-xs uppercase font-extrabold text-red-600 tracking-wider mt-0.5">
                HANDOVER BLOCKED TO PREVENT CUSTOMER MIX-UP
              </p>
            </div>

            {/* Side-by-Side Comparison Box */}
            <div className="my-4 grid grid-cols-2 gap-3 text-xs">
              {/* Scanned Physical Garment Tag */}
              <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-1 text-red-950">
                <div className="text-[10px] font-black uppercase tracking-wider text-red-700 border-b border-red-200 pb-1">
                  1. Physical Garment Scanned
                </div>
                <div><strong>Order ID:</strong> <span className="font-mono font-bold text-red-900">{verificationResult.scanned?.orderId || verificationResult.scanned?.id}</span></div>
                <div><strong>Customer:</strong> {verificationResult.scanned?.customerName}</div>
                <div><strong>Type:</strong> {verificationResult.scanned?.dressType}</div>
                <div><strong>Colour:</strong> {verificationResult.scanned?.dressColour}</div>
                {verificationResult.scanned?.dressImage && (
                  <img src={verificationResult.scanned.dressImage} alt="Scanned Dress" className="w-full h-20 object-cover rounded-lg border border-red-300 mt-1" />
                )}
              </div>

              {/* Intended Delivery Customer Order */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1 text-amber-950">
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 border-b border-amber-200 pb-1">
                  2. Requested Delivery Order
                </div>
                <div><strong>Order ID:</strong> <span className="font-mono font-bold text-amber-900">{verificationResult.intendedId}</span></div>
                <div><strong>Customer:</strong> {verificationResult.intended?.customerName || 'Priya Sharma'}</div>
                <div><strong>Type:</strong> {verificationResult.intended?.dressType || 'Silk Anarkali Suit'}</div>
                <div><strong>Colour:</strong> {verificationResult.intended?.dressColour || 'Maroon & Gold Zari'}</div>
                {verificationResult.intended?.dressImage && (
                  <img src={verificationResult.intended.dressImage} alt="Intended Dress" className="w-full h-20 object-cover rounded-lg border border-amber-300 mt-1" />
                )}
              </div>
            </div>

            <div className="bg-red-100/80 p-3 rounded-xl border border-red-300 text-[11px] text-red-950 font-medium mb-4 space-y-1">
              <p className="font-bold">🚨 Why was handover blocked?</p>
              <p>The physical garment tag scanned ({verificationResult.scanned?.orderId}) belongs to customer <strong>{verificationResult.scanned?.customerName}</strong>, but customer <strong>{verificationResult.intended?.customerName || 'Priya Sharma'}</strong> is waiting for order <strong>{verificationResult.intendedId}</strong>.</p>
              <p className="text-[10px] text-red-800 italic pt-1 border-t border-red-200">
                * Image comparison and dress photos are provided for visual tailor verification only and do not automatically prove ownership.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMismatchAlert(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl transition text-sm shadow-md"
              >
                Acknowledge & Cancel Handover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Garment Label Modal */}
      {showLabelModal && scannedOrder && (
        <GarmentLabelModal order={scannedOrder} onClose={() => setShowLabelModal(false)} />
      )}
    </div>
  );
}
