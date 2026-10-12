import React, { useMemo } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { ALL_PRODUCTS } from '../data/dresses.js';
import { ProductCard } from './ProductCard.jsx';

export function SmartDressRecommendations({ onCustomize }) {
  const { wishlist, orders, savedDesigns } = useCustomer();

  // useMemo: Calculate personalized dress recommendation scores
  const recommendedDresses = useMemo(() => {
    // Collect user preference keywords from wishlist, past orders, and saved designs
    const likedFabrics = new Set();
    const likedCategories = new Set();

    wishlist.forEach((w) => {
      if (w.fabric) likedFabrics.add(w.fabric.toLowerCase());
      if (w.department) likedCategories.add(w.department.toLowerCase());
      if (w.subCategory) likedCategories.add(w.subCategory.toLowerCase());
    });

    orders.forEach((o) => {
      o.items?.forEach((i) => {
        if (i.fabric) likedFabrics.add(i.fabric.toLowerCase());
        if (i.department) likedCategories.add(i.department.toLowerCase());
      });
    });

    savedDesigns.forEach((sd) => {
      if (sd.details?.fabric) likedFabrics.add(sd.details.fabric.toLowerCase());
      if (sd.details?.dressType) likedCategories.add(sd.details.dressType.toLowerCase());
    });

    // Default favorites if user has no history yet
    if (likedFabrics.size === 0) likedFabrics.add('silk').add('cotton');
    if (likedCategories.size === 0) likedCategories.add('women').add('traditional').add('blouse');

    // Score all products in catalog
    const scored = ALL_PRODUCTS.map((prod) => {
      let score = 50; // base score
      const prodFabric = (prod.fabric || '').toLowerCase();
      const prodCategory = (prod.department || '').toLowerCase();
      const prodSub = (prod.subCategory || '').toLowerCase();

      if (likedFabrics.has(prodFabric)) score += 25;
      if (likedCategories.has(prodCategory) || likedCategories.has(prodSub)) score += 25;
      if (prod.rating >= 4.8) score += 10;

      return { product: prod, score };
    });

    // Sort descending by match score and pick top 4 outfits
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => ({ ...item.product, matchScore: item.score }));
  }, [wishlist, orders, savedDesigns]);

  return (
    <div className="content-card smart-recommendations-card">
      <div className="card-header-row">
        <div>
          <h3>✨ Recommended For You</h3>
          <p className="subtitle">Smart personalized outfit recommendations based on your wishlist, past orders, and saved designs.</p>
        </div>
        <span className="ai-smart-tag">🧠 SMART ALGORITHM</span>
      </div>

      <div className="recommendations-grid">
        {recommendedDresses.map((dress) => (
          <div className="recommendation-item-wrapper" key={dress.id}>
            <div className="match-score-badge">
              🔥 {dress.matchScore}% Match
            </div>
            <ProductCard product={dress} onCustomize={onCustomize} />
          </div>
        ))}
      </div>
    </div>
  );
}
