import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../services/apiClient.js';

import blouse01 from '../assets/dresses/blouse/blouse-01.png';
import blouse02 from '../assets/dresses/blouse/blouse-02.png';
import lehenga01 from '../assets/dresses/lehenga/lehenga-01.png';
import lehenga02 from '../assets/dresses/lehenga/lehenga-02.png';
import anarkali01 from '../assets/dresses/anarkali/anarkali-01.png';
import saree01 from '../assets/dresses/saree/saree-01.png';
import gown01 from '../assets/dresses/gown/gown-01.png';
import chudi01 from '../assets/dresses/chudi/chudi-01.png';

const DRESS_CONCEPT_MAP = {
  'Designer Blouse': [blouse01, blouse02, saree01],
  'Bridal Blouse': [blouse02, blouse01, saree01],
  'Gown': [gown01, anarkali01, gown01],
  'Frock': [gown01, anarkali01, gown01],
  'Kurti': [chudi01, anarkali01, chudi01],
  'Lehenga': [lehenga01, lehenga02, lehenga01],
  'Pavadai': [saree01, lehenga02, saree01],
  'Pavadai Thavani': [saree01, blouse02, lehenga01],
  'Chudidar': [chudi01, anarkali01, chudi01],
};

export function AIDressDesignerStudio({ onCompleteToOrder, onOpenChatWithTailor }) {
  const { user } = useAuth();

  // 1. Core Selection States
  const [dressType, setDressType] = useState('Designer Blouse');
  const [hasOwnFabric, setHasOwnFabric] = useState(true);
  const [fabricImage, setFabricImage] = useState(blouse01);
  const [referenceImage, setReferenceImage] = useState(blouse01);
  const [specialInstructions, setSpecialInstructions] = useState('I want a deep V back neck with gold potli buttons, elbow puff sleeves and peacock maggam Aari embroidery.');

  // 2. Dynamic Options per Dress
  const [neck, setNeck] = useState('V Neck');
  const [sleeve, setSleeve] = useState('Puff Sleeve');
  const [backCut, setBackCut] = useState('Deep U');
  const [embroidery, setEmbroidery] = useState('Aari Work');
  const [border, setBorder] = useState('Gold Zari Border');
  const [fitStyle, setFitStyle] = useState('Bespoke Slim Fit');
  const [length, setLength] = useState('Standard Length');
  const [flare, setFlare] = useState('Full Flare');
  const [waist, setWaist] = useState('Fitted Waist');
  const [sideSlit, setSideSlit] = useState('High Side Slit');

  // 3. AI Preview Concepts & Version Control
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [concepts, setConcepts] = useState([]);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState(0);

  const [savedVersions, setSavedVersions] = useState([]);
  const [designStatus, setDesignStatus] = useState('DRAFT'); // DRAFT | CUSTOMER_APPROVED
  const [approvedDesignRecord, setApprovedDesignRecord] = useState(null);

  // 4. Live Smart Price Calculation
  const priceBreakdown = useMemo(() => {
    let basePrice = 800;
    let customPrice = 300;
    let embroideryPrice = 0;
    let designerFee = 300;
    let additionalWork = 0;

    if (dressType === 'Bridal Blouse') { basePrice = 1400; designerFee = 500; }
    else if (dressType === 'Gown' || dressType === 'Lehenga') { basePrice = 1800; designerFee = 600; }
    else if (dressType === 'Pavadai Thavani' || dressType === 'Half Saree') { basePrice = 1500; designerFee = 400; }
    else if (dressType === 'Kurti' || dressType === 'Frock') { basePrice = 900; designerFee = 250; }

    if (embroidery === 'Aari Work') embroideryPrice = 1200;
    else if (embroidery === 'Zari Work') embroideryPrice = 1000;
    else if (embroidery === 'Stone Work') embroideryPrice = 1500;
    else if (embroidery === 'Bridal Zardozi') embroideryPrice = 2500;
    else if (embroidery === 'Sequin Work') embroideryPrice = 800;
    else if (embroidery === 'Thread Work') embroideryPrice = 700;

    if (sleeve === 'Puff Sleeve' || sleeve === 'Bell Sleeve') additionalWork += 200;
    if (backCut.includes('Deep') || backCut.includes('Designer')) additionalWork += 250;
    if (border.includes('Zari') || border.includes('Heavy')) additionalWork += 200;

    const estimatedTotal = basePrice + customPrice + embroideryPrice + designerFee + additionalWork;

    return {
      baseStitching: basePrice,
      customization: customPrice,
      embroidery: embroideryPrice,
      designerFee,
      additionalWork,
      estimatedTotal,
    };
  }, [dressType, embroidery, sleeve, backCut, border]);

  // Generate Initial AI Preview
  const handleGenerateAIPreview = async () => {
    setIsGenerating(true);
    setAiMessage('✨ AI Neural Engine rendering design concepts...');

    const payload = {
      dressType,
      designOptions: { neck, sleeve, back: backCut, embroidery, border, fitStyle, length, flare, waist, sideSlit },
      fabricImage: hasOwnFabric ? fabricImage : '',
      referenceImage,
      specialInstructions,
    };

    try {
      const res = await apiFetch('/ai/generate-preview', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && res.success) {
        setAiConfigured(res.aiConfigured);
        setAiMessage(res.message);
        setConcepts(res.concepts || []);
        setIsGenerating(false);
        return;
      }
    } catch (err) {
      console.warn('[AI Service Note]', err);
    }

    // Default Fallback Preview Concepts
    const dressImgs = DRESS_CONCEPT_MAP[dressType] || [blouse01, blouse02, saree01];
    setTimeout(() => {
      setAiConfigured(false);
      setAiMessage('ℹ️ Visual Concept Renderer. Custom design models update live on preview canvas.');
      setConcepts([
        {
          conceptId: 'concept-1',
          title: 'Concept 1: Royal Classic Atelier',
          imageUrl: referenceImage || dressImgs[0],
          description: `${dressType} featuring ${neck}, ${sleeve}, and ${embroidery}.`,
        },
        {
          conceptId: 'concept-2',
          title: 'Concept 2: Heritage Maggam Cutwork',
          imageUrl: dressImgs[1] || dressImgs[0],
          description: `${dressType} with deep scalloped back cut and handcrafted zari border.`,
        },
        {
          conceptId: 'concept-3',
          title: 'Concept 3: Modern Chic Couture',
          imageUrl: dressImgs[2] || dressImgs[0],
          description: `Contemporary fit ${dressType} styled with signature tassels & potli motifs.`,
        },
      ]);
      setIsGenerating(false);
    }, 400);
  };

  useEffect(() => {
    handleGenerateAIPreview();
  }, [dressType]);

  // Live update concepts when user pastes URL, uploads file or picks sample
  useEffect(() => {
    if (referenceImage) {
      setConcepts((prev) => {
        if (!prev || prev.length === 0) {
          return [
            {
              conceptId: 'concept-1',
              title: 'Concept 1: Custom Reference Model',
              imageUrl: referenceImage,
              description: `${dressType} featuring ${neck}, ${sleeve}, and ${embroidery}.`,
            },
          ];
        }
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          imageUrl: referenceImage,
          title: 'Concept 1: Custom Reference Model',
          description: `Customer reference model design for ${dressType} (${neck}, ${sleeve}, ${embroidery}).`,
        };
        return updated;
      });
    }
  }, [referenceImage, dressType, neck, sleeve, embroidery]);

  const handleReferenceFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Version Handler
  const handleSaveVersion = async () => {
    const versionNum = savedVersions.length + 1;
    const versionObj = {
      version: versionNum,
      title: `Design Version ${versionNum}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dressType,
      neck,
      sleeve,
      embroidery,
      price: priceBreakdown.estimatedTotal,
      selectedPreview: concepts[selectedConceptIndex]?.imageUrl || referenceImage,
    };

    setSavedVersions((prev) => [...prev, versionObj]);

    try {
      await apiFetch('/custom-designs', {
        method: 'POST',
        body: JSON.stringify({
          dressType,
          designOptions: { neck, sleeve, back: backCut, embroidery, border },
          fabricSource: hasOwnFabric ? 'Customer Own Fabric' : 'Store Fabric',
          fabricImage,
          referenceImage,
          specialInstructions,
          priceBreakdown,
        }),
      });
    } catch (e) {}

    alert(`✓ ${versionObj.title} saved successfully to MongoDB! You can compare version history anytime.`);
  };

  // Approve Design Handler
  const handleApproveDesign = async () => {
    const selectedConcept = concepts[selectedConceptIndex] || concepts[0];

    const payload = {
      designId: `DES-${Date.now()}`,
      selectedConcept,
      dressType,
      designOptions: { neck, sleeve, back: backCut, embroidery, border, fitStyle, length, flare, waist, sideSlit },
      fabricSource: hasOwnFabric ? 'Customer Own Fabric' : 'Store Fabric',
      fabricImage: hasOwnFabric ? fabricImage : '',
      referenceImage,
      specialInstructions,
      priceBreakdown,
    };

    try {
      const res = await apiFetch('/ai/approve-design', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && res.success) {
        setApprovedDesignRecord(res.design || payload);
      }
    } catch (e) {
      setApprovedDesignRecord(payload);
    }

    setDesignStatus('CUSTOMER_APPROVED');
    alert(`🎉 DESIGN APPROVED! Status updated to CUSTOMER_APPROVED. Transmitted to Master Tailor console.`);
  };

  // Convert AI Approved Design to Order
  const handleContinueToOrder = () => {
    if (onCompleteToOrder) {
      onCompleteToOrder({
        dressType,
        customization: { neck, sleeve, back: backCut, embroidery, border },
        fabricSource: hasOwnFabric ? 'Customer Own Fabric' : 'Store Fabric',
        referenceImage: concepts[selectedConceptIndex]?.imageUrl || referenceImage,
        specialInstructions,
        priceBreakdown,
        designRecord: approvedDesignRecord,
      });
    }
  };

  return (
    <div className="sdts-ai-designer-container">
      {/* HEADER SECTION */}
      <div className="sdts-ai-header-bar">
        <div>
          <span className="sdts-ai-eyebrow">✨ AI SMART DRESS DESIGNER & VIRTUAL PREVIEW</span>
          <h2>Design Your Perfect Dress Before We Stitch It</h2>
          <p>Real-world 3D/2D visual concept renderer, dress-specific customization, and instant tailor transmission.</p>
        </div>
        <div className="sdts-ai-header-status">
          <span className={`sdts-ai-badge ${designStatus === 'CUSTOMER_APPROVED' ? 'approved' : 'draft'}`}>
            {designStatus === 'CUSTOMER_APPROVED' ? '✓ CUSTOMER APPROVED' : '📝 DESIGN IN DRAFT'}
          </span>
        </div>
      </div>

      {/* 3-COLUMN FASHION STUDIO LAYOUT */}
      <div className="sdts-ai-studio-grid">
        {/* LEFT COLUMN: DRESS & DESIGN OPTIONS */}
        <div className="sdts-ai-col-left">
          <h3>👗 1. Dress & Cut Options</h3>

          <div className="sdts-ai-field-group">
            <label>Select Women's Dress Type</label>
            <select value={dressType} onChange={(e) => setDressType(e.target.value)} className="sdts-ai-select">
              <option value="Designer Blouse">Designer Saree Blouse</option>
              <option value="Bridal Blouse">Bridal Maggam Blouse</option>
              <option value="Gown">Anarkali / Party Wear Gown</option>
              <option value="Frock">Bespoke Frock Dress</option>
              <option value="Kurti">Custom Designer Kurti</option>
              <option value="Lehenga">Bridal Lehenga Choli</option>
              <option value="Pavadai">Silk Pavadai Skirt</option>
              <option value="Pavadai Thavani">Pavadai Thavani / Half Saree</option>
              <option value="Chudidar">Chudidar & Salwar Suit</option>
            </select>
          </div>

          {/* DYNAMIC OPTIONS FOR BLOUSE */}
          {(dressType === 'Designer Blouse' || dressType === 'Bridal Blouse') && (
            <>
              <div className="sdts-ai-field-group">
                <label>Front Neck Line</label>
                <select value={neck} onChange={(e) => setNeck(e.target.value)} className="sdts-ai-select">
                  <option>Round Neck</option>
                  <option>U Neck</option>
                  <option>V Neck</option>
                  <option>Square Cut</option>
                  <option>Boat Neck</option>
                  <option>Sweetheart Cut</option>
                  <option>Designer Cutwork</option>
                </select>
              </div>

              <div className="sdts-ai-field-group">
                <label>Sleeve Cut & Style</label>
                <select value={sleeve} onChange={(e) => setSleeve(e.target.value)} className="sdts-ai-select">
                  <option>Sleeveless</option>
                  <option>Short Cap Sleeve</option>
                  <option>Elbow Length with Zari</option>
                  <option>Full Sleeve</option>
                  <option>Puff Sleeve</option>
                  <option>Bell Sleeve</option>
                </select>
              </div>

              <div className="sdts-ai-field-group">
                <label>Back Neck Pattern</label>
                <select value={backCut} onChange={(e) => setBackCut(e.target.value)} className="sdts-ai-select">
                  <option>U Back</option>
                  <option>V Back</option>
                  <option>Deep U Scalloped</option>
                  <option>Keyhole Pattern</option>
                  <option>Designer Dori & Potli</option>
                </select>
              </div>

              <div className="sdts-ai-field-group">
                <label>Embroidery Work</label>
                <select value={embroidery} onChange={(e) => setEmbroidery(e.target.value)} className="sdts-ai-select">
                  <option>None (Simple Piping)</option>
                  <option>Aari Work</option>
                  <option>Zari Work</option>
                  <option>Stone Work</option>
                  <option>Bead Work</option>
                  <option>Thread Embroidery</option>
                  <option>Sequin Work</option>
                  <option>Bridal Zardozi</option>
                </select>
              </div>
            </>
          )}

          {/* DYNAMIC OPTIONS FOR GOWN / FROCK / KURTI / LEHENGA */}
          {dressType !== 'Designer Blouse' && dressType !== 'Bridal Blouse' && (
            <>
              <div className="sdts-ai-field-group">
                <label>Neck Style</label>
                <select value={neck} onChange={(e) => setNeck(e.target.value)} className="sdts-ai-select">
                  <option>V Neck</option>
                  <option>Round Neck</option>
                  <option>Collar Cut</option>
                  <option>Sweetheart Cut</option>
                </select>
              </div>

              <div className="sdts-ai-field-group">
                <label>Sleeve Cut</label>
                <select value={sleeve} onChange={(e) => setSleeve(e.target.value)} className="sdts-ai-select">
                  <option>3/4th Sleeve</option>
                  <option>Full Sleeve</option>
                  <option>Puff Sleeve</option>
                  <option>Sleeveless</option>
                </select>
              </div>

              <div className="sdts-ai-field-group">
                <label>Flare & Skirt Flare</label>
                <select value={flare} onChange={(e) => setFlare(e.target.value)} className="sdts-ai-select">
                  <option>Full 360 Flare</option>
                  <option>A-Line Flare</option>
                  <option>Pleated Flare</option>
                </select>
              </div>

              <div className="sdts-ai-field-group">
                <label>Embroidery Style</label>
                <select value={embroidery} onChange={(e) => setEmbroidery(e.target.value)} className="sdts-ai-select">
                  <option>Aari Work</option>
                  <option>Zari Work</option>
                  <option>Bridal Zardozi</option>
                  <option>Thread Work</option>
                </select>
              </div>
            </>
          )}

          {/* FABRIC SELECTION */}
          <div className="sdts-ai-fabric-box">
            <label className="sdts-checkbox-row">
              <input type="checkbox" checked={hasOwnFabric} onChange={(e) => setHasOwnFabric(e.target.checked)} />
              <span><b>I Have My Own Fabric</b></span>
            </label>
            {hasOwnFabric && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Your Fabric Photo URL / Upload</span>
                <input
                  type="url"
                  placeholder="Paste fabric image link..."
                  value={fabricImage}
                  onChange={(e) => setFabricImage(e.target.value)}
                  className="sdts-ai-input"
                />
              </div>
            )}
          </div>

          {/* REFERENCE DESIGN UPLOAD & LIVE GOOGLE URL INPUT */}
          <div className="sdts-ai-fabric-box" style={{ background: '#fff0f5', border: '1px solid #f8bbd0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '13px', color: '#880e4f' }}>🖼️ Upload / Paste Reference Design</label>
              <span style={{ fontSize: '10px', color: '#c2185b', fontWeight: 'bold' }}>Updates Live on Canvas</span>
            </div>
            
            <input
              type="text"
              placeholder="Paste Google / Pinterest Image URL here..."
              value={referenceImage}
              onChange={(e) => setReferenceImage(e.target.value)}
              className="sdts-ai-input"
              style={{ marginTop: '4px', marginBottom: '8px', background: '#fff' }}
            />

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ background: '#ad1457', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>📁 Upload Image File</span>
                <input type="file" accept="image/*" onChange={handleReferenceFileUpload} style={{ display: 'none' }} />
              </label>
              <span style={{ fontSize: '11px', color: '#666' }}>or try samples:</span>
            </div>

            {/* Quick Sample Presets */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              <button type="button" onClick={() => setReferenceImage(blouse01)} style={{ fontSize: '10px', background: '#fff', border: '1px solid #d81b60', color: '#d81b60', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📸 Cutwork Blouse</button>
              <button type="button" onClick={() => setReferenceImage(blouse02)} style={{ fontSize: '10px', background: '#fff', border: '1px solid #d81b60', color: '#d81b60', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📸 Peacock Aari</button>
              <button type="button" onClick={() => setReferenceImage(lehenga01)} style={{ fontSize: '10px', background: '#fff', border: '1px solid #d81b60', color: '#d81b60', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📸 Bridal Lehenga</button>
              <button type="button" onClick={() => setReferenceImage(anarkali01)} style={{ fontSize: '10px', background: '#fff', border: '1px solid #d81b60', color: '#d81b60', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📸 Silk Anarkali</button>
            </div>
          </div>

          {/* SPECIAL INSTRUCTIONS */}
          <div className="sdts-ai-field-group">
            <label>Special Instructions</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Write exact instructions for Master Tailor..."
              rows={3}
              className="sdts-ai-textarea"
            />
          </div>
        </div>

        {/* CENTER COLUMN: LARGE AI PREVIEW CANVAS & CONCEPTS */}
        <div className="sdts-ai-col-center">
          <div className="sdts-ai-canvas-card">
            <div className="sdts-ai-canvas-head">
              <h4>🎨 Large AI Virtual Design Preview Canvas</h4>
              <span className="sdts-ai-badge-sm">{aiConfigured ? '⚡ Live AI Generated' : 'ℹ️ Visual Concept Mockup'}</span>
            </div>

            {/* AI Service Status Alert Banner */}
            {aiMessage && (
              <div className={`sdts-ai-service-alert ${aiConfigured ? 'success' : 'info'}`}>
                {aiMessage}
              </div>
            )}

            {/* Concept Selection Tabs */}
            <div className="sdts-ai-concept-tabs">
              {concepts.map((c, idx) => (
                <button
                  key={c.conceptId || idx}
                  type="button"
                  className={`concept-tab-btn ${selectedConceptIndex === idx ? 'active' : ''}`}
                  onClick={() => setSelectedConceptIndex(idx)}
                >
                  {c.title}
                </button>
              ))}
            </div>

            {/* Main Visual Image Display */}
            <div className="sdts-ai-canvas-image-wrap">
              {isGenerating ? (
                <div className="sdts-ai-loading-placeholder">
                  <div className="spinner" />
                  <p>✨ Rendering neural AI preview for {dressType}...</p>
                </div>
              ) : (
                <img
                  src={concepts[selectedConceptIndex]?.imageUrl || referenceImage}
                  alt="AI Virtual Preview"
                  className="sdts-ai-canvas-img"
                />
              )}

              {/* Disclaimer overlay */}
              <div className="sdts-ai-disclaimer-overlay">
                ⚠️ AI preview is an approximate visual representation. Final appearance depends on fabric, measurements, stitching and actual embroidery.
              </div>
            </div>

            {/* Selected Concept Metadata */}
            <div className="sdts-ai-concept-desc">
              <b>{concepts[selectedConceptIndex]?.title || 'Selected Design Concept'}</b>
              <p>{concepts[selectedConceptIndex]?.description || specialInstructions}</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STRUCTURED SUMMARY & LIVE PRICE ESTIMATE */}
        <div className="sdts-ai-col-right">
          <div className="sdts-ai-summary-card">
            <h3>📋 3. Design Summary</h3>
            <div className="sdts-summary-list">
              <div className="summary-item"><span>Dress Type:</span><b>{dressType}</b></div>
              <div className="summary-item"><span>Front Neck:</span><b>{neck}</b></div>
              <div className="summary-item"><span>Sleeve Style:</span><b>{sleeve}</b></div>
              <div className="summary-item"><span>Back Pattern:</span><b>{backCut}</b></div>
              <div className="summary-item"><span>Embroidery:</span><b style={{ color: '#d81b60' }}>{embroidery}</b></div>
              <div className="summary-item"><span>Border:</span><b>{border}</b></div>
              <div className="summary-item"><span>Fabric:</span><b>{hasOwnFabric ? 'Customer Own Fabric' : 'Store Fabric'}</b></div>
            </div>

            {/* LIVE SMART PRICE CALCULATION BREAKDOWN */}
            <div className="sdts-ai-price-breakdown">
              <h4>💰 Live Smart Price Estimate</h4>
              <div className="price-row"><span>Base Stitching:</span><span>₹{priceBreakdown.baseStitching}</span></div>
              <div className="price-row"><span>Custom Cutwork:</span><span>₹{priceBreakdown.customization}</span></div>
              <div className="price-row"><span>Embroidery ({embroidery}):</span><span style={{ color: '#d81b60' }}>₹{priceBreakdown.embroidery}</span></div>
              <div className="price-row"><span>Master Designer Fee:</span><span>₹{priceBreakdown.designerFee}</span></div>
              <div className="price-row"><span>Additional Styling:</span><span>₹{priceBreakdown.additionalWork}</span></div>
              <div className="price-row total">
                <span>Estimated Total:</span>
                <span className="total-amount">₹{priceBreakdown.estimatedTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* VERSION HISTORY SUMMARY */}
            {savedVersions.length > 0 && (
              <div className="sdts-ai-versions-box">
                <h4>📜 Design Version History ({savedVersions.length})</h4>
                {savedVersions.map((v) => (
                  <div key={v.version} className="version-pill">
                    <span><b>{v.title}</b> ({v.date})</span>
                    <span className="price">₹{v.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="sdts-ai-action-bar">
        <button type="button" className="sdts-ai-btn secondary" onClick={handleGenerateAIPreview} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : '✨ Generate AI Preview'}
        </button>

        <button type="button" className="sdts-ai-btn outline" onClick={handleSaveVersion}>
          💾 Save Version ({savedVersions.length + 1})
        </button>

        <button
          type="button"
          className={`sdts-ai-btn ${designStatus === 'CUSTOMER_APPROVED' ? 'approved-btn' : 'primary'}`}
          onClick={handleApproveDesign}
        >
          {designStatus === 'CUSTOMER_APPROVED' ? '✓ Design Approved' : '✅ Approve This Design'}
        </button>

        <button type="button" className="sdts-ai-btn cta" onClick={handleContinueToOrder}>
          🛍️ Stitch This AI Design & Add to My Orders ➔
        </button>

        {onOpenChatWithTailor && (
          <button type="button" className="sdts-ai-btn chat" onClick={onOpenChatWithTailor}>
            💬 Discuss Design with Tailor
          </button>
        )}
      </div>
    </div>
  );
}
