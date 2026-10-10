import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';
import {
  WOMEN_DRESS_CATEGORIES,
  ALL_WOMEN_CATEGORIES,
  EMBROIDERY_DESIGNERS,
  OCCASION_RECOMMENDATIONS,
  NEARBY_TAILORS,
  getMeasurementSchemaForDress,
} from '../data/womenTailoringData.js';

const COLOR_MAP = {
  Red: '#dc2626',
  Maroon: '#800020',
  'Navy Blue': '#1e3a8a',
  'Emerald Green': '#065f46',
  Gold: '#d97706',
  Cream: '#fef3c7',
  Pink: '#ec4899',
  Purple: '#7e22ce',
  Black: '#111827',
};

export function CustomDesignStudio({ selectedProduct }) {
  const { saveCustomDesign, deleteSavedDesign, savedDesigns, addToCart, activeProfile } = useCustomer();

  // 1. REAL TAILOR SHOP OPTION MODE
  // 'catalog' (Choose from Our Designs) | 'fabric' (Bring My Own Fabric) | 'existing' (Bring My Existing Dress) | 'reference' (Upload Reference Design)
  const [customizationMode, setCustomizationMode] = useState('catalog');

  // 2. OCCASION SELECTION
  const [occasion, setOccasion] = useState('Wedding');

  // 3. DRESS TYPE SELECTION
  const [selectedDressType, setSelectedDressType] = useState(
    selectedProduct?.subcategory || selectedProduct?.category || 'Designer Blouse'
  );

  // 4. DRESS CUSTOMIZATION CONTROLS STATE
  const [neckStyle, setNeckStyle] = useState('Sweetheart');
  const [sleeveStyle, setSleeveStyle] = useState('Elbow Sleeve');
  const [backStyle, setBackStyle] = useState('U Back');
  const [embroideryType, setEmbroideryType] = useState('Aari Work');
  const [fabricType, setFabricType] = useState('Raw Silk');
  const [color, setColor] = useState('Maroon');
  const [ownFabricOption, setOwnFabricOption] = useState('bring'); // 'bring' | 'submitted' | 'pickup'
  const [sareeWorkArea, setSareeWorkArea] = useState('Border + Mundhi'); // 'Only Border' | 'Only Mundhi' | 'Border + Mundhi' | 'Full Saree'
  const [petticoatClosure, setPetticoatClosure] = useState('Drawstring'); // 'Drawstring' | 'Zip & Button'
  const [selectedDesignerId, setSelectedDesignerId] = useState('emb-aari-1');
  const [selectedTailorShop, setSelectedTailorShop] = useState('tlr-1');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Web Speech API for Voice Requirements
  const handleVoiceRequirement = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser. You can type instructions manually.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ta-IN'; // Default to Tamil / English multi-lang
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpecialInstructions((prev) => (prev ? `${prev} | ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, []);

  // 5. UPLOADED IMAGE STATES
  const [fabricPhoto, setFabricPhoto] = useState(null);
  const [existingDressPhoto, setExistingDressPhoto] = useState(null);
  const [referenceDesignPhoto, setReferenceDesignPhoto] = useState(selectedProduct?.imgUrl || null);

  // 6. SMART DRESS-SPECIFIC MEASUREMENTS STATE
  const activeMeasSchema = useMemo(() => {
    return getMeasurementSchemaForDress(selectedDressType);
  }, [selectedDressType]);

  const [measValues, setMeasValues] = useState(activeProfile?.values || {
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

  // 7. PAYMENT SELECTION (Full vs Advance)
  const [paymentOption, setPaymentOption] = useState('advance'); // 'full' | 'advance'

  // Sync state if selectedProduct prop changes
  useEffect(() => {
    if (selectedProduct) {
      const type = selectedProduct.subcategory || selectedProduct.category || 'Designer Blouse';
      setSelectedDressType(type);
      if (selectedProduct.imgUrl) {
        setReferenceDesignPhoto(selectedProduct.imgUrl);
      }
    }
  }, [selectedProduct]);

  // Handle image uploads
  const handleFileUpload = (e, targetSetter) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        targetSetter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 8. SMART ITEMIZE PRICE ESTIMATION
  const priceBreakdown = useMemo(() => {
    let stitchingFee = 800; // Base designer blouse/kurti
    if (selectedDressType === 'Simple Blouse') stitchingFee = 500;
    else if (selectedDressType === 'Petticoat / Inner Skirt') stitchingFee = 350;
    else if (selectedDressType.includes('Saree Fall') || selectedDressType.includes('Saree Pico')) stitchingFee = 220;
    else if (selectedDressType === 'Saree Border / Mundhi Work') stitchingFee = 800;
    else if (['Gown', 'Evening Gown', 'Anarkali', 'Anarkali Gown', 'Lehenga', 'Lehenga Choli', 'Pavadai Thavani', 'Bridal Blouse', 'Bridal Wear'].includes(selectedDressType)) {
      stitchingFee = 1600;
    } else if (['Salwar Suit', 'Chudidar', 'Chudidar / Salwar Suit', 'Frock', 'Maxi Dress'].includes(selectedDressType)) {
      stitchingFee = 900;
    }

    // Fabric Fee (₹0 if customer brings own fabric or existing dress)
    let fabricFee = (customizationMode === 'fabric' || customizationMode === 'existing') ? 0 : 500;
    if (selectedDressType === 'Petticoat / Inner Skirt' || selectedDressType === 'Simple Blouse') fabricFee = 200;
    if (fabricType === 'Velvet' || fabricType === 'Bridal Silk') fabricFee += 400;

    // Embroidery Fee
    let embroideryFee = 0;
    if (embroideryType === 'Aari Work') embroideryFee = 1200;
    if (embroideryType === 'Zari Work') embroideryFee = 1500;
    if (embroideryType === 'Zardosi Work') embroideryFee = 2200;
    if (embroideryType === 'Stone Work') embroideryFee = 1000;
    if (embroideryType === 'Thread Embroidery') embroideryFee = 800;
    if (embroideryType === 'Bead Work') embroideryFee = 1100;

    if (selectedDressType === 'Simple Blouse' || selectedDressType === 'Petticoat / Inner Skirt') {
      // Don't force embroidery on simple blouse or petticoat unless specifically chosen
      if (embroideryType === 'Aari Work') embroideryFee = 0; // Default reset for simple items
    }

    // Saree Work Area modifier
    if (selectedDressType === 'Saree Border / Mundhi Work') {
      if (sareeWorkArea === 'Only Border') stitchingFee = 600;
      if (sareeWorkArea === 'Only Mundhi') stitchingFee = 700;
      if (sareeWorkArea === 'Border + Mundhi') stitchingFee = 900;
      if (sareeWorkArea === 'Full Saree') stitchingFee = 1800;
    }

    // Designer Fee
    const designer = EMBROIDERY_DESIGNERS.find((d) => d.id === selectedDesignerId);
    const designerFee = embroideryFee > 0 && designer ? 300 : 0;

    const grandTotal = stitchingFee + fabricFee + embroideryFee + designerFee;
    const advanceAmount = Math.min(500, Math.round(grandTotal * 0.3));
    const remainingBalance = grandTotal - advanceAmount;

    return { stitchingFee, fabricFee, embroideryFee, designerFee, grandTotal, advanceAmount, remainingBalance, designer };
  }, [selectedDressType, customizationMode, fabricType, embroideryType, selectedDesignerId, sareeWorkArea]);

  // Handle Add to Cart / Place Order
  const handleAddToCartOrder = useCallback(() => {
    const finalPaid = paymentOption === 'advance' ? priceBreakdown.advanceAmount : priceBreakdown.grandTotal;
    const paymentStatus = paymentOption === 'advance' ? 'PARTIALLY PAID' : 'FULLY PAID';

    const orderItem = {
      id: `custom-women-order-${Date.now()}`,
      name: `Bespoke Women's ${selectedDressType}`,
      dressType: selectedDressType,
      customizationMode,
      price: priceBreakdown.grandTotal,
      paidAmount: finalPaid,
      remainingAmount: priceBreakdown.remainingBalance,
      paymentStatus,
      paymentOption,
      fabricType,
      color,
      neckStyle,
      sleeveStyle,
      backStyle,
      embroideryType,
      specialInstructions,
      designerName: priceBreakdown.designer?.name || 'Master Tailor',
      fabricPhoto,
      existingDressPhoto,
      referenceDesignPhoto: referenceDesignPhoto || selectedProduct?.imgUrl,
      measurements: measValues,
      imgUrl: referenceDesignPhoto || selectedProduct?.imgUrl || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format',
      stage: 'Order Placed',
      fittingStatus: 'Pending Fitting Session',
    };

    addToCart(orderItem);
    alert(`✓ Added Bespoke Women's ${selectedDressType} to Cart! (${paymentStatus}: ₹${finalPaid})`);
  }, [
    selectedDressType,
    customizationMode,
    priceBreakdown,
    paymentOption,
    fabricType,
    color,
    neckStyle,
    sleeveStyle,
    backStyle,
    embroideryType,
    specialInstructions,
    fabricPhoto,
    existingDressPhoto,
    referenceDesignPhoto,
    selectedProduct,
    measValues,
    addToCart,
  ]);

  const hexColor = COLOR_MAP[color] || '#800020';

  return (
    <div className="custom-design-studio-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 1. STUDIO HERO HEADER */}
      <div className="studio-header" style={{ background: 'linear-gradient(135deg, #880e4f 0%, #ad1457 100%)', color: '#fff', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '12px' }}>
              ✂️ REAL WOMEN'S TAILOR SHOP WORKFLOW
            </span>
            <h2 style={{ margin: '8px 0 4px', fontSize: '26px' }}>Bespoke Women's Tailoring Studio</h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
              Choose your design, bring your own fabric, stitch like an existing dress, or upload a reference photo for custom fitting.
            </p>
          </div>
          <div style={{ background: '#fff', color: '#880e4f', padding: '12px 18px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }}>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>ESTIMATED TOTAL</div>
            <div style={{ fontSize: '22px' }}>₹{priceBreakdown.grandTotal}</div>
          </div>
        </div>
      </div>

      {/* 2. REAL TAILOR SHOP CONCEPT (4 OPERATIONAL MODES) */}
      <div className="content-card" style={{ marginBottom: '24px', background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #f8bbd0' }}>
        <h3 style={{ margin: '0 0 14px', color: '#880e4f' }}>How would you like to customize your women's dress?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <button
            type="button"
            className={`mode-card-btn ${customizationMode === 'catalog' ? 'active' : ''}`}
            onClick={() => setCustomizationMode('catalog')}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: customizationMode === 'catalog' ? '2px solid #d81b60' : '1px solid #e0e0e0',
              background: customizationMode === 'catalog' ? '#fce4ec' : '#fcfcfc',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>👗</div>
            <b style={{ display: 'block', color: '#880e4f' }}>Choose from Our Designs</b>
            <span style={{ fontSize: '12px', color: '#666' }}>Pick from DigiTailor Women Collection</span>
          </button>

          <button
            type="button"
            className={`mode-card-btn ${customizationMode === 'fabric' ? 'active' : ''}`}
            onClick={() => setCustomizationMode('fabric')}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: customizationMode === 'fabric' ? '2px solid #d81b60' : '1px solid #e0e0e0',
              background: customizationMode === 'fabric' ? '#fce4ec' : '#fcfcfc',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>🧵</div>
            <b style={{ display: 'block', color: '#880e4f' }}>Bring My Own Fabric</b>
            <span style={{ fontSize: '12px', color: '#666' }}>Upload fabric photo for custom stitching</span>
          </button>

          <button
            type="button"
            className={`mode-card-btn ${customizationMode === 'existing' ? 'active' : ''}`}
            onClick={() => setCustomizationMode('existing')}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: customizationMode === 'existing' ? '2px solid #d81b60' : '1px solid #e0e0e0',
              background: customizationMode === 'existing' ? '#fce4ec' : '#fcfcfc',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>📐</div>
            <b style={{ display: 'block', color: '#880e4f' }}>Stitch Like My Existing Dress</b>
            <span style={{ fontSize: '12px', color: '#666' }}>Upload sample fitting dress photo</span>
          </button>

          <button
            type="button"
            className={`mode-card-btn ${customizationMode === 'reference' ? 'active' : ''}`}
            onClick={() => setCustomizationMode('reference')}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: customizationMode === 'reference' ? '2px solid #d81b60' : '1px solid #e0e0e0',
              background: customizationMode === 'reference' ? '#fce4ec' : '#fcfcfc',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>📸</div>
            <b style={{ display: 'block', color: '#880e4f' }}>Upload My Reference Design</b>
            <span style={{ fontSize: '12px', color: '#666' }}>Pinterest/Instagram design reference</span>
          </button>
        </div>
      </div>

      {/* 3. SMART OCCASION RECOMMENDATION BAR */}
      <div className="content-card" style={{ marginBottom: '24px', background: '#fff9fa', padding: '16px 20px', borderRadius: '14px', border: '1px solid #ffc1e3' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <b style={{ color: '#ad1457' }}>💡 Smart Occasion Recommendation: What is this dress for?</b>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>
              {OCCASION_RECOMMENDATIONS[occasion]?.desc}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.keys(OCCASION_RECOMMENDATIONS).map((occ) => (
              <button
                key={occ}
                type="button"
                className={`occ-btn ${occasion === occ ? 'active' : ''}`}
                onClick={() => setOccasion(occ)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid #ad1457',
                  background: occasion === occ ? '#ad1457' : '#fff',
                  color: occasion === occ ? '#fff' : '#ad1457',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="studio-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* LEFT COLUMN: CUSTOMIZATION CONTROLS & PHOTO UPLOADS */}
        <div className="controls-col">
          {/* DRESS TYPE SELECTION */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '14px', marginBottom: '20px', background: '#fff' }}>
            <h3 style={{ margin: '0 0 14px', color: '#880e4f' }}>1. Select Women's Dress Type</h3>
            <div className="form-group">
              <label>Dress Category</label>
              <select
                value={selectedDressType}
                onChange={(e) => setSelectedDressType(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}
              >
                <optgroup label="TRADITIONAL WEAR">
                  {WOMEN_DRESS_CATEGORIES.traditional.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </optgroup>
                <optgroup label="MODERN WEAR">
                  {WOMEN_DRESS_CATEGORIES.modern.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </optgroup>
                <optgroup label="SPECIAL OCCASION">
                  {WOMEN_DRESS_CATEGORIES.specialOccasion.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* DYNAMIC PHOTO UPLOADERS & OWN FABRIC OPTIONS BASED ON CUSTOMIZATION MODE */}
          {(customizationMode === 'fabric' || customizationMode === 'existing' || customizationMode === 'reference') && (
            <div className="content-card" style={{ padding: '20px', borderRadius: '14px', marginBottom: '20px', background: '#fff0f5', border: '1px dashed #d81b60' }}>
              <h3 style={{ margin: '0 0 10px', color: '#880e4f' }}>
                📷 {customizationMode === 'fabric' ? 'Upload Fabric Photo & Options' : customizationMode === 'existing' ? 'Upload Existing Fitting Dress Photo' : 'Upload Reference Design Photo'}
              </h3>

              {customizationMode === 'fabric' && (
                <div style={{ marginBottom: '14px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #f8bbd0' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '13px', color: '#880e4f', display: 'block', marginBottom: '8px' }}>
                    🧵 How will you provide your unstitched fabric?
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="ownFabOpt" checked={ownFabricOption === 'bring'} onChange={() => setOwnFabricOption('bring')} />
                      <span>I will bring my fabric to the shop</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="ownFabOpt" checked={ownFabricOption === 'submitted'} onChange={() => setOwnFabricOption('submitted')} />
                      <span>Fabric already submitted at shop</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="ownFabOpt" checked={ownFabricOption === 'pickup'} onChange={() => setOwnFabricOption('pickup')} />
                      <span>Need doorstep fabric pickup assistance</span>
                    </label>
                  </div>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (customizationMode === 'fabric') handleFileUpload(e, setFabricPhoto);
                  if (customizationMode === 'existing') handleFileUpload(e, setExistingDressPhoto);
                  if (customizationMode === 'reference') handleFileUpload(e, setReferenceDesignPhoto);
                }}
                style={{ margin: '8px 0', fontSize: '13px' }}
              />
              {(fabricPhoto || existingDressPhoto || referenceDesignPhoto) && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={fabricPhoto || existingDressPhoto || referenceDesignPhoto}
                    alt="Uploaded Preview"
                    style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #d81b60' }}
                  />
                  <span style={{ display: 'block', fontSize: '11px', color: '#388e3c', fontWeight: 'bold' }}>
                    ✓ Photo attached to order & ready for tailor inspection
                  </span>
                </div>
              )}
            </div>
          )}

          {/* SAREE BORDER / MUNDHI SPECIFIC WORK AREA CONTROL */}
          {selectedDressType === 'Saree Border / Mundhi Work' && (
            <div className="content-card" style={{ padding: '20px', borderRadius: '14px', marginBottom: '20px', background: '#fff9fa', border: '1px solid #ffc1e3' }}>
              <h3 style={{ margin: '0 0 10px', color: '#880e4f' }}>🥻 Saree Embroidery Work Area</h3>
              <div className="form-group">
                <label>Select Work Area (Do not need full saree embroidered? Pick below):</label>
                <select value={sareeWorkArea} onChange={(e) => setSareeWorkArea(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>
                  <option value="Only Border">Only Border Work</option>
                  <option value="Only Mundhi">Only Mundhi / Pallu Work</option>
                  <option value="Border + Mundhi">Border + Mundhi Work</option>
                  <option value="Full Saree">Full Saree Work (All Over)</option>
                </select>
              </div>
            </div>
          )}

          {/* PETTICOAT SPECIFIC CLOSURE CONTROL */}
          {selectedDressType === 'Petticoat / Inner Skirt' && (
            <div className="content-card" style={{ padding: '20px', borderRadius: '14px', marginBottom: '20px', background: '#fff9fa', border: '1px solid #ffc1e3' }}>
              <h3 style={{ margin: '0 0 10px', color: '#880e4f' }}>👗 Petticoat Stitching Details</h3>
              <div className="form-group">
                <label>Waist Closure Type:</label>
                <select value={petticoatClosure} onChange={(e) => setPetticoatClosure(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px' }}>
                  <option value="Drawstring">Traditional Cotton Drawstring (Naada)</option>
                  <option value="Zip & Button">Concealed Side Zip & Hooks</option>
                </select>
              </div>
            </div>
          )}

          {/* DRESS CUSTOMIZATION OPTIONS */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '14px', marginBottom: '20px', background: '#fff' }}>
            <h3 style={{ margin: '0 0 14px', color: '#880e4f' }}>2. Women's Style & Stitching Options</h3>
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Neck Style</label>
                <select value={neckStyle} onChange={(e) => setNeckStyle(e.target.value)}>
                  <option value="Round Neck">Round Neck</option>
                  <option value="U Neck">U Neck</option>
                  <option value="V Neck">V Neck</option>
                  <option value="Square">Square Neck</option>
                  <option value="Boat">Boat Neck</option>
                  <option value="Sweetheart">Sweetheart Neck</option>
                  <option value="High Neck">High Neck</option>
                  <option value="Designer Neck">Designer Cutwork Neck</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sleeve Style</label>
                <select value={sleeveStyle} onChange={(e) => setSleeveStyle(e.target.value)}>
                  <option value="Sleeveless">Sleeveless</option>
                  <option value="Short Sleeve">Short Sleeve (5")</option>
                  <option value="Elbow Sleeve">Elbow Length (11")</option>
                  <option value="Full Sleeve">Full Sleeve (22")</option>
                  <option value="Puff Sleeve">Traditional Puff Sleeve</option>
                  <option value="Bell Sleeve">Bell Sleeve</option>
                </select>
              </div>

              <div className="form-group">
                <label>Back Style</label>
                <select value={backStyle} onChange={(e) => setBackStyle(e.target.value)}>
                  <option value="U Back">U Back</option>
                  <option value="V Back">V Back</option>
                  <option value="Deep Back">Deep Back with Latkan</option>
                  <option value="Keyhole">Keyhole Back</option>
                  <option value="Designer Back">Designer Cutout Back</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fabric Material</label>
                <select value={fabricType} onChange={(e) => setFabricType(e.target.value)}>
                  <option value="Raw Silk">Raw Silk</option>
                  <option value="Bridal Silk">Heavy Kanchipuram Silk</option>
                  <option value="Micro Velvet">Micro Velvet</option>
                  <option value="Pure Cotton">Pure Cotton</option>
                  <option value="Georgette">Heavy Georgette</option>
                  <option value="Chiffon">Pure Chiffon</option>
                </select>
              </div>

              <div className="form-group">
                <label>Embroidery Work</label>
                <select value={embroideryType} onChange={(e) => setEmbroideryType(e.target.value)}>
                  <option value="None">None (Plain Stitching)</option>
                  <option value="Aari Work">Aari Handwork (+₹1200)</option>
                  <option value="Zari Work">Pure Gold Zari (+₹1500)</option>
                  <option value="Zardosi Work">Royal Zardosi (+₹2200)</option>
                  <option value="Stone Work">Swarovski Stone (+₹1000)</option>
                  <option value="Thread Embroidery">Silk Threadwork (+₹800)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Color Palette</label>
                <select value={color} onChange={(e) => setColor(e.target.value)}>
                  <option value="Maroon">Royal Maroon</option>
                  <option value="Red">Bridal Red</option>
                  <option value="Navy Blue">Midnight Navy</option>
                  <option value="Emerald Green">Emerald Green</option>
                  <option value="Gold">Antique Gold</option>
                  <option value="Pink">Blush Pink</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ margin: 0 }}>Special Tailoring Instructions</label>
                <button
                  type="button"
                  onClick={handleVoiceRequirement}
                  style={{
                    background: isListening ? '#dc2626' : '#880e4f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{isListening ? '🔴 Recording...' : '🎙️ Speak Your Requirement (தமிழ் / Eng)'}</span>
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="e.g. Please make the sleeve length exactly like my uploaded reference photo or speak your instructions."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>

            {/* NEARBY LOCAL TAILOR NETWORK DIRECTORY */}
            <div className="form-group" style={{ marginTop: '14px', background: '#fff0f5', padding: '12px', borderRadius: '10px', border: '1px solid #f8bbd0' }}>
              <label style={{ color: '#880e4f', fontWeight: 'bold' }}>📍 Select Nearby Local Tailor Shop (Pickup & Fitting)</label>
              <select
                value={selectedTailorShop}
                onChange={(e) => setSelectedTailorShop(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
              >
                {NEARBY_TAILORS.map((tlr) => (
                  <option key={tlr.id} value={tlr.id}>
                    🏬 {tlr.shopName} — {tlr.distance} ({tlr.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* EMBROIDERY DESIGNER MODULE */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '14px', marginBottom: '20px', background: '#fff' }}>
            <h3 style={{ margin: '0 0 14px', color: '#880e4f' }}>3. Select Specialist Embroidery Designer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {EMBROIDERY_DESIGNERS.map((des) => (
                <div
                  key={des.id}
                  onClick={() => setSelectedDesignerId(des.id)}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: selectedDesignerId === des.id ? '2px solid #d81b60' : '1px solid #eee',
                    background: selectedDesignerId === des.id ? '#fff0f5' : '#fafafa',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <b style={{ color: '#880e4f' }}>{des.name}</b>
                    <span style={{ display: 'block', fontSize: '12px', color: '#666' }}>{des.specialization}</span>
                    <span style={{ fontSize: '11px', color: '#e65100', fontWeight: 'bold' }}>★ {des.rating} rating • Est. {des.estimatedTime}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 'bold', color: '#ad1457', fontSize: '14px' }}>+₹{des.startingPrice}</span>
                    <span style={{ display: 'block', fontSize: '11px', color: selectedDesignerId === des.id ? '#d81b60' : '#888' }}>
                      {selectedDesignerId === des.id ? '✓ Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DRESS-SPECIFIC MEASUREMENTS & PAYMENT ESTIMATION */}
        <div className="summary-col">
          {/* SMART DRESS-SPECIFIC MEASUREMENTS FORM */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '14px', marginBottom: '20px', background: '#fff' }}>
            <h3 style={{ margin: '0 0 6px', color: '#880e4f' }}>
              4. Smart Dress-Specific Measurements ({selectedDressType})
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#666' }}>
              Showing precision body measurements required for <b>{selectedDressType}</b>.
            </p>

            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {activeMeasSchema.map((field) => (
                <div className="form-group" key={field.key}>
                  <label style={{ fontSize: '12px' }}>{field.label}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={measValues[field.key] || ''}
                    onChange={(e) => setMeasValues({ ...measValues, [field.key]: e.target.value })}
                    placeholder={`e.g. ${field.placeholder}`}
                    style={{ padding: '8px', fontSize: '13px' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ITEMIZED PRICE ESTIMATION & ADVANCE PAYMENT CARD */}
          <div className="content-card" style={{ padding: '20px', borderRadius: '14px', background: '#fff', border: '2px solid #f8bbd0' }}>
            <h3 style={{ margin: '0 0 14px', color: '#880e4f' }}>5. Smart Price & Payment Option</h3>

            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Stitching Fee ({selectedDressType}):</span>
                <b>₹{priceBreakdown.stitchingFee}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Fabric Material:</span>
                <b>{priceBreakdown.fabricFee > 0 ? `₹${priceBreakdown.fabricFee}` : 'Customer Fabric (₹0)'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Embroidery Work ({embroideryType}):</span>
                <b>₹{priceBreakdown.embroideryFee}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Embroidery Designer Fee ({priceBreakdown.designer?.name}):</span>
                <b>₹{priceBreakdown.designerFee}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: '#ad1457', marginTop: '6px' }}>
                <span>TOTAL QUOTE:</span>
                <span>₹{priceBreakdown.grandTotal}</span>
              </div>
            </div>

            {/* PAYMENT MODE CHOICES */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Select Payment Option:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentOption('advance')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: paymentOption === 'advance' ? '2px solid #d81b60' : '1px solid #ccc',
                    background: paymentOption === 'advance' ? '#fff0f5' : '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#880e4f',
                  }}
                >
                  <div>₹{priceBreakdown.advanceAmount} Advance</div>
                  <span style={{ fontSize: '10px', opacity: 0.8 }}>Balance ₹{priceBreakdown.remainingBalance} later</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('full')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: paymentOption === 'full' ? '2px solid #d81b60' : '1px solid #ccc',
                    background: paymentOption === 'full' ? '#fff0f5' : '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#880e4f',
                  }}
                >
                  <div>₹{priceBreakdown.grandTotal} Full Pay</div>
                  <span style={{ fontSize: '10px', opacity: 0.8 }}>Pay 100% upfront</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              className="primary-btn-lg"
              onClick={handleAddToCartOrder}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🧵 Place Custom Women's Order →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
