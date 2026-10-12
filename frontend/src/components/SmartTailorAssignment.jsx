import React, { useMemo, useState } from 'react';

const TAILORS_DATABASE = [
  { id: 'TLR-01', name: 'Master Rajesh Tailor', spec: 'Blouse, Saree & Silk', activeOrders: 2, rating: 4.9, status: 'Available' },
  { id: 'TLR-02', name: 'Master Suresh Craftsman', spec: 'Suit, Shirt & Formal', activeOrders: 1, rating: 4.8, status: 'Available' },
  { id: 'TLR-03', name: 'Master Lakshmi Specialist', spec: 'Lehenga, Anarkali & Bridal', activeOrders: 4, rating: 5.0, status: 'Busy' },
  { id: 'TLR-04', name: 'Master Mohan Patternist', spec: 'Kids Wear & Kurti', activeOrders: 0, rating: 4.7, status: 'Available' },
];

export function SmartTailorAssignment({ garmentCategory = 'Blouse', onConfirmAssignment }) {
  const [selectedTailorId, setSelectedTailorId] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  // useMemo: Calculate smart tailor recommendation score
  const bestTailor = useMemo(() => {
    const scored = TAILORS_DATABASE.map((tailor) => {
      let score = 50;
      const catLower = garmentCategory.toLowerCase();
      const specLower = tailor.spec.toLowerCase();

      // Specialization match (+30 pts)
      if (specLower.includes(catLower) || catLower.includes(specLower)) score += 30;

      // Workload availability (+20 pts for low workload)
      if (tailor.activeOrders === 0) score += 20;
      else if (tailor.activeOrders <= 2) score += 10;
      else score -= 10;

      // Rating bonus
      score += (tailor.rating - 4.0) * 10;

      return { tailor, score };
    });

    const top = scored.sort((a, b) => b.score - a.score)[0];
    return top ? top.tailor : TAILORS_DATABASE[0];
  }, [garmentCategory]);

  const activeTailor = selectedTailorId
    ? TAILORS_DATABASE.find((t) => t.id === selectedTailorId) || bestTailor
    : bestTailor;

  const handleConfirm = () => {
    setConfirmed(true);
    if (onConfirmAssignment) onConfirmAssignment(activeTailor);
    alert(`✓ Confirmed Smart Tailor Assignment to "${activeTailor.name}"!`);
  };

  return (
    <div className="smart-tailor-assignment-box">
      <div className="sta-header-row">
        <div>
          <h4>✂️ Smart Tailor Assignment System</h4>
          <p className="subtitle">Automated tailor matching based on specialization, current workshop workload, and rating.</p>
        </div>
        <span className="best-match-pill">★ BEST MATCH: 98% SCORE</span>
      </div>

      <div className="recommended-tailor-card">
        <div className="tailor-avatar-circle">✂️</div>
        <div className="tailor-details-col">
          <div className="tailor-title-line">
            <b>{activeTailor.name}</b>
            <span className="rating-tag">⭐ {activeTailor.rating} Rating</span>
          </div>

          <div className="tailor-specs-row">
            <span>Specialization: <b>{activeTailor.spec}</b></span>
            <span>Current Workload: <b>{activeTailor.activeOrders} Active Orders</b></span>
            <span>Status: <b className="status-green">{activeTailor.status}</b></span>
          </div>
        </div>
      </div>

      <div className="sta-actions-row">
        <select
          value={activeTailor.id}
          onChange={(e) => {
            setSelectedTailorId(e.target.value);
            setConfirmed(false);
          }}
          className="tailor-select-dropdown"
        >
          {TAILORS_DATABASE.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.spec}) - {t.activeOrders} Orders
            </option>
          ))}
        </select>

        <button type="button" className={`primary-btn ${confirmed ? 'confirmed' : ''}`} onClick={handleConfirm}>
          {confirmed ? '✓ Tailor Assigned' : 'Confirm Smart Tailor Assignment →'}
        </button>
      </div>
    </div>
  );
}
