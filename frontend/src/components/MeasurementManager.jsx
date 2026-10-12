import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { DRESS_SPECIFIC_MEASUREMENTS_SCHEMA, getMeasurementSchemaForDress, getDressCategoryDetails } from '../data/womenTailoringData.js';

export function MeasurementManager({ onNavigateTab }) {
  const {
    profiles,
    activeProfile,
    activeProfileId,
    setActiveProfileId,
    addMeasurementProfile,
    updateMeasurementProfile,
    deleteMeasurementProfile,
    addToCart,
  } = useCustomer();

  // Mode: 'view' | 'edit' | 'create'
  const [mode, setMode] = useState('view');
  const [profileName, setProfileName] = useState(activeProfile?.name || 'My Fit Profile');
  const [selectedDressCategory, setSelectedDressCategory] = useState('Saree Blouse');

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

  const nameInputRef = useRef(null);
  const firstInputRef = useRef(null);

  // Active Measurement Schema based on selected women's dress category
  const activeSchema = useMemo(() => {
    return getMeasurementSchemaForDress(selectedDressCategory);
  }, [selectedDressCategory]);

  const selectProfile = useCallback((profileId) => {
    setActiveProfileId(profileId);
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      setProfileName(target.name);
      setMeasValues(target.values || {});
      setMode('view');
    }
  }, [profiles, setActiveProfileId]);

  const handleStartCreate = useCallback(() => {
    setProfileName('New Women Fit Profile');
    setMeasValues({
      bust: '',
      underBust: '',
      shoulder: '',
      armhole: '',
      sleeveLength: '',
      blouseLength: '',
      frontNeckDepth: '',
      backNeckDepth: '',
      waist: '',
      hip: '',
      topLength: '',
      bottomLength: '',
      gownLength: '',
      frockLength: '',
      kurtiLength: '',
      lehengaLength: '',
      skirtLength: '',
    });
    setMode('create');
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }, []);

  const handleStartEdit = useCallback(() => {
    setProfileName(activeProfile?.name || 'My Fit Profile');
    setMeasValues(activeProfile?.values || {});
    setMode('edit');
    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [activeProfile]);

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (mode === 'create') {
      addMeasurementProfile(profileName, measValues);
    } else if (mode === 'edit') {
      updateMeasurementProfile(activeProfileId, profileName, measValues);
    }

    // Auto add ₹10 service item to Cart & navigate to Checkout/Cart
    const price = 10;
    const details = getDressCategoryDetails(selectedDressCategory);
    addToCart({
      id: `custom-meas-${Date.now()}`,
      title: `Custom ${selectedDressCategory} (${profileName})`,
      name: `Custom ${selectedDressCategory} (${profileName})`,
      category: selectedDressCategory,
      dressType: selectedDressCategory,
      price,
      image: details.image,
      imgUrl: details.image,
      customization: {
        fitProfileName: profileName,
        schemaCategory: selectedDressCategory,
        measurements: measValues,
      }
    });

    setMode('view');
    alert(`✓ Saved "${profileName}" & Added ₹10 Custom Fit item to Tailoring Cart!\n\nRedirecting to Cart & Payment Gateway...`);
    if (onNavigateTab) {
      onNavigateTab('cart');
    }
  };

  const handleDeleteCurrent = useCallback(() => {
    if (profiles.length <= 1) {
      alert('You must maintain at least one saved women measurement profile.');
      return;
    }
    if (confirm(`Are you sure you want to delete profile "${activeProfile?.name}"?`)) {
      deleteMeasurementProfile(activeProfileId);
      setMode('view');
    }
  }, [profiles, activeProfile, activeProfileId, deleteMeasurementProfile]);

  // Compute completion stats for active dress schema
  const completionStats = useMemo(() => {
    const total = activeSchema.length;
    const filledCount = activeSchema.filter((f) => !!measValues[f.key]).length;
    const percentage = Math.round((filledCount / Math.max(total, 1)) * 100);
    return { filledCount, total, percentage };
  }, [activeSchema, measValues]);

  return (
    <div className="measurement-manager-container">
      {/* Profile Selector Toolbar */}
      <div className="profile-toolbar-card">
        <div className="toolbar-left">
          <label className="toolbar-label">Active Saved Fit Profile:</label>
          <div className="profile-chips-group">
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`profile-chip-btn ${p.id === activeProfileId ? 'active' : ''}`}
                onClick={() => selectProfile(p.id)}
              >
                {p.id === activeProfileId ? '✓ ' : ''}
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-actions">
          <button type="button" className="btn-primary-sm" onClick={handleStartCreate}>
            ＋ Add New Fit Profile
          </button>
        </div>
      </div>

      {/* INNOVATION: SMART DRESS-SPECIFIC MEASUREMENT SYSTEM BANNER */}
      <div className="content-card smart-recommendation-box" style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e9 100%)', border: '1px solid #ffb6c1' }}>
        <div className="card-header-row">
          <div>
            <h3 style={{ color: '#d81b60', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📏</span> Smart Dress-Specific Measurement System
            </h3>
            <p className="subtitle" style={{ color: '#555' }}>
              Dynamic measurement form automatically adjusts to show only the precise body dimensions required for your chosen women's dress.
            </p>
          </div>
          <div className="garment-type-selector">
            <label style={{ fontWeight: 'bold', color: '#880e4f' }}>Select Dress Type:</label>
            <select
              value={selectedDressCategory}
              onChange={(e) => setSelectedDressCategory(e.target.value)}
              className="cat-select-sm"
              style={{ fontWeight: 'bold', borderColor: '#d81b60' }}
            >
              {Object.keys(DRESS_SPECIFIC_MEASUREMENTS_SCHEMA).map((cat) => (
                <option key={cat} value={cat}>👗 {cat} Fit</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rec-values-row" style={{ flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
          {activeSchema.slice(0, 4).map((f) => (
            <span key={f.key} style={{ background: '#ffffff', padding: '4px 10px', borderRadius: '14px', border: '1px solid #f8bbd0', fontSize: '13px' }}>
              {f.label.split('(')[0]}: <b>{measValues[f.key] || f.placeholder}"</b>
            </span>
          ))}
        </div>
      </div>

      {/* Main Dynamic Measurement Form */}
      <div className="content-card measurement-form-card">
        <div className="card-header-row">
          <div>
            <h3>
              📏 {mode === 'create' ? 'Create New Fit Profile' : mode === 'edit' ? `Edit: ${profileName}` : profileName}
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#d81b60', marginLeft: '10px' }}>
                ({selectedDressCategory} Schema)
              </span>
            </h3>
            <span className="subtitle">
              {completionStats.filledCount} of {completionStats.total} required body fit dimensions recorded ({completionStats.percentage}%)
            </span>
          </div>

          <div className="action-buttons-group">
            {mode === 'view' && (
              <>
                <button type="button" className="secondary-btn" onClick={handleStartEdit}>
                  ✏️ Edit Measurements
                </button>
                <button type="button" className="danger-btn-outline" onClick={handleDeleteCurrent}>
                  🗑️ Delete Profile
                </button>
              </>
            )}
            {mode !== 'view' && (
              <button type="button" className="secondary-btn" onClick={() => setMode('view')}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveSubmit} className="meas-grid-form">
          {mode !== 'view' && (
            <div className="form-group full-width-field">
              <label>Profile Name</label>
              <input
                ref={nameInputRef}
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Saree Blouse Profile, Bridal Lehenga Fit, Chudidar Fit"
                required
              />
            </div>
          )}

          {/* DYNAMIC DRESS-SPECIFIC MEASUREMENT FIELDS */}
          <div className="form-grid-3">
            {activeSchema.map((field, idx) => (
              <div className="form-group" key={field.key}>
                <label>{idx + 1}. {field.label}</label>
                <input
                  ref={idx === 0 ? firstInputRef : null}
                  type="number"
                  step="0.5"
                  value={measValues[field.key] || ''}
                  onChange={(e) => setMeasValues({ ...measValues, [field.key]: e.target.value })}
                  disabled={mode === 'view'}
                  placeholder={`e.g. ${field.placeholder}`}
                  required={idx < 3}
                />
              </div>
            ))}
          </div>

          {mode !== 'view' && (
            <div className="form-submit-row" style={{ marginTop: '20px' }}>
              <button type="submit" className="primary-btn">
                💾 Save Women Fit Profile
              </button>
            </div>
          )}
        </form>

        {mode === 'view' && (
          <div className="use-saved-meas-banner" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <b style={{ color: '#880e4f' }}>✓ Currently active profile: "{activeProfile?.name || profileName}"</b>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>Our master tailors will cut your fabric according to these dress-specific dimensions.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  alert(`✓ Applied "${activeProfile?.name || profileName}" (${selectedDressCategory} schema) for your active order!`);
                }}
                style={{ padding: '10px 18px', borderRadius: '20px', fontWeight: 'bold' }}
              >
                ✓ Apply to Active Order
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  const price = 10; // Explicit ₹10 micro-service / custom fit charge
                  const details = getDressCategoryDetails(selectedDressCategory);
                  addToCart({
                    id: `custom-meas-${Date.now()}`,
                    title: `Custom ${selectedDressCategory} (${activeProfile?.name || 'Saved Fit'})`,
                    name: `Custom ${selectedDressCategory} (${activeProfile?.name || 'Saved Fit'})`,
                    category: selectedDressCategory,
                    dressType: selectedDressCategory,
                    price,
                    image: details.image,
                    imgUrl: details.image,
                    customization: {
                      fitProfileName: activeProfile?.name || profileName,
                      schemaCategory: selectedDressCategory,
                      measurements: measValues,
                    }
                  });
                  alert(`🛒 Added "Custom ${selectedDressCategory}" (₹10 Service) with "${activeProfile?.name || profileName}" measurements to your Tailoring Cart!\n\nRedirecting to Tailoring Cart & Payment Gateway...`);
                  if (onNavigateTab) {
                    onNavigateTab('cart');
                  }
                }}
                style={{ padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', background: 'linear-gradient(135deg, #d81b60, #880e4f)', color: '#fff' }}
              >
                🛒 Add Item with Fits to Cart (₹10) →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
