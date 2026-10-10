import React, { useState } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';
import GarmentLabelModal from './GarmentLabelModal.jsx';

export default function SubmitGarmentModal({ onClose, onGarmentSubmitted }) {
  const { createGarmentOrder, activeProfile, customerProfile } = useCustomer();

  const [dressType, setDressType] = useState('Designer Blouse');
  const [dressColour, setDressColour] = useState('Royal Blue');
  const [customerPhone, setCustomerPhone] = useState(customerProfile?.phone || '9876543210');
  const [customerName, setCustomerName] = useState(customerProfile?.name || 'Malathi Lakshmi');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [dressImage, setDressImage] = useState('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop');
  const [rackLocation, setRackLocation] = useState('Rack A - Box 03');
  
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDressImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const seqNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${seqNum}`;
    const qrIdentifier = `QR-${orderId}`;

    const orderData = {
      orderId,
      qrIdentifier,
      customerName,
      customerPhone,
      dressType,
      dressColour,
      dressImage,
      rackLocation,
      measurements: activeProfile?.values || {},
      specialInstructions,
      totalAmount: 850,
      paidAmount: 850,
      status: 'Received',
    };

    try {
      const newOrd = await createGarmentOrder(orderData);
      setIsSubmitting(false);
      setCreatedOrder(newOrd || orderData);
      if (onGarmentSubmitted) onGarmentSubmitted(newOrd || orderData);
    } catch (err) {
      console.error('Error submitting garment:', err);
      setIsSubmitting(false);
      setCreatedOrder(orderData);
    }
  };

  if (createdOrder) {
    return (
      <GarmentLabelModal
        order={createdOrder}
        onClose={() => {
          setCreatedOrder(null);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-pink-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-800 to-rose-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏷️</span>
            <div>
              <h3 className="font-bold text-lg leading-tight">Submit Garment & Generate QR</h3>
              <p className="text-pink-200 text-xs">Prevent garment mix-ups with unique Order ID & QR Code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Customer Full Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-pink-50/50 border border-pink-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Dress Type</label>
              <select
                value={dressType}
                onChange={(e) => setDressType(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-lg p-2.5 text-xs font-bold text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="Designer Blouse">Designer Blouse</option>
                <option value="Saree Blouse">Saree Blouse</option>
                <option value="Bridal Blouse">Bridal Blouse</option>
                <option value="Chudidhar Fit">Chudidhar Fit</option>
                <option value="Salwar Kameez">Salwar Kameez</option>
                <option value="Anarkali Gown">Anarkali Gown</option>
                <option value="Pavadai Thavani">Pavadai Thavani</option>
                <option value="Half Saree">Half Saree</option>
                <option value="Lehenga Choli">Lehenga Choli</option>
                <option value="Kurti / Tunic">Kurti / Tunic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Dress Colour</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Blue, Crimson Red"
                value={dressColour}
                onChange={(e) => setDressColour(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Storage Location</label>
              <select
                value={rackLocation}
                onChange={(e) => setRackLocation(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-lg p-2.5 text-xs font-bold text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="Rack A - Box 01">Rack A - Box 01 (Blouses)</option>
                <option value="Rack A - Box 02">Rack A - Box 02 (Blouses)</option>
                <option value="Rack A - Box 03">Rack A - Box 03 (Blouses)</option>
                <option value="Rack B - Box 01">Rack B - Box 01 (Chudidhars)</option>
                <option value="Rack C - Hanger 01">Rack C - Hanger 01 (Anarkali/Gowns)</option>
              </select>
            </div>
          </div>

          {/* Garment Photo Upload */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Upload Garment / Unstitched Fabric Photo</label>
            <div className="flex items-center space-x-3 bg-pink-50/60 p-3 rounded-xl border border-pink-200">
              <img
                src={dressImage}
                alt="Dress Preview"
                className="w-16 h-16 object-cover rounded-lg border border-pink-300 shadow-sm flex-shrink-0"
              />
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-700 cursor-pointer"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">Upload customer submitted dress photo</span>
              </div>
            </div>
          </div>

          {/* Stitching Instructions */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Special Stitching Instructions</label>
            <textarea
              rows={2}
              placeholder="e.g., Fixed ₹10 fee, deep V neck back, gold zari piping on sleeve edge..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full bg-pink-50/50 border border-pink-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-pink-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-md transition flex items-center space-x-1"
            >
              <span>{isSubmitting ? 'Generating Tag...' : '🏷️ Save & Generate Printable QR Label'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
