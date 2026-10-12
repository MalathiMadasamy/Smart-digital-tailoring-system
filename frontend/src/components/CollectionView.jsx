import React, { useState, useMemo, useEffect } from 'react';
import { ALL_PRODUCTS } from '../data/dresses.js';
import { ProductCard } from './ProductCard.jsx';
import { ProductDetailsModal } from './ProductDetailsModal.jsx';
import { PexelsImageGallery } from './PexelsImageGallery.jsx';
import { WOMEN_DRESS_CATEGORIES } from '../data/womenTailoringData.js';

export function CollectionView({ department = 'All', title, subtitle, onCustomize }) {
  const [viewMode, setViewMode] = useState('catalog');

  // Filter States (Women Only)
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');

  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Sync active category if parent changes department prop
  useEffect(() => {
    if (department && department !== 'All') {
      setActiveCategory(department);
      setSelectedSubCategory('All');
    }
  }, [department]);

  // Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filtered Master Catalog Products (Women Only)
  const filteredCatalogProducts = useMemo(() => {
    let result = ALL_PRODUCTS.filter((p) => p.gender !== 'Male' && p.category !== 'Men' && p.category !== 'Kids');

    // Main Category Filter
    if (activeCategory && activeCategory !== 'All') {
      result = result.filter((p) => (p.category || p.department) === activeCategory);
    }

    // Subcategory Filter
    if (selectedSubCategory && selectedSubCategory !== 'All') {
      result = result.filter((p) => (p.subcategory || p.subCategory) === selectedSubCategory);
    }

    // Search Query Filter
    const q = debouncedQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.fabric && p.fabric.toLowerCase().includes(q)) ||
          (p.subcategory || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
      );
    }

    // Price Filter
    result = result.filter((p) => p.price <= maxPrice);

    // Rating Filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [activeCategory, selectedSubCategory, debouncedQuery, maxPrice, minRating, sortBy]);

  // Available Subcategories based on active main category
  const subCategories = useMemo(() => {
    if (activeCategory === 'Traditional Wear') return ['All', ...WOMEN_DRESS_CATEGORIES.traditional];
    if (activeCategory === 'Modern Wear') return ['All', ...WOMEN_DRESS_CATEGORIES.modern];
    if (activeCategory === 'Special Occasion') return ['All', ...WOMEN_DRESS_CATEGORIES.specialOccasion];
    return ['All', 'Saree Blouse', 'Designer Blouse', 'Pavadai Thavani', 'Lehenga', 'Chudidar', 'Kurti', 'Gown', 'Frock', 'Bridal Blouse'];
  }, [activeCategory]);

  return (
    <div className="collection-view-container">
      {/* MARKETPLACE HERO HEADER */}
      <div className="marketplace-hero-card" style={{ background: 'linear-gradient(135deg, #880e4f 0%, #ad1457 100%)', color: '#fff', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div className="hero-content">
          <span className="eyebrow-tag" style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', textTransform: 'uppercase' }}>
            💃 WOMEN-ONLY SMART TAILORING COLLECTION
          </span>
          <h2 style={{ fontSize: '26px', margin: '8px 0' }}>{title || "Women's Bespoke Tailoring Collection"}</h2>
          <p className="subtitle" style={{ opacity: 0.9 }}>
            {subtitle || "Discover women's styles, choose your favourite silhouette, or bring your own fabric to customize with DigiTailor."}
          </p>
          <div className="hero-trust-badges" style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px' }}>
            <span>✨ 100% Women Fit Guarantee</span>
            <span>📐 Smart Dress-Specific Measurements</span>
            <span>🧵 Real Tailor Fitting & Alteration Workflow</span>
          </div>
        </div>

        <div className="hero-mode-switch-box" style={{ marginTop: '16px' }}>
          <div className="source-toggle-pills" style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className={`source-pill-btn ${viewMode === 'catalog' ? 'active' : ''}`}
              onClick={() => setViewMode('catalog')}
              style={{ padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}
            >
              📦 Women's Curated Catalog ({filteredCatalogProducts.length})
            </button>
            <button
              type="button"
              className={`source-pill-btn ${viewMode === 'pexels' ? 'active' : ''}`}
              onClick={() => setViewMode('pexels')}
              style={{ padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}
            >
              🌐 Dynamic Women Fashion Gallery
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'catalog' && (
        <>
          {/* WOMEN'S CATEGORY SELECTOR TABS */}
          <div className="category-main-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { id: 'All', label: '✨ All Women Outfits' },
              { id: 'Traditional Wear', label: '🥻 Traditional Wear' },
              { id: 'Modern Wear', label: '👗 Modern Wear' },
              { id: 'Special Occasion', label: '👑 Special Occasion & Bridal' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cat-main-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedSubCategory('All');
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: activeCategory === cat.id ? '2px solid #d81b60' : '1px solid #ddd',
                  background: activeCategory === cat.id ? '#880e4f' : '#fff',
                  color: activeCategory === cat.id ? '#fff' : '#333',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* SUBCATEGORY PILLS */}
          {subCategories.length > 1 && (
            <div className="subcat-pills-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px' }}>
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  className={`subcat-pill-btn ${selectedSubCategory === sub ? 'active' : ''}`}
                  onClick={() => setSelectedSubCategory(sub)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    border: selectedSubCategory === sub ? '1px solid #d81b60' : '1px solid #ccc',
                    background: selectedSubCategory === sub ? '#fce4ec' : '#fff',
                    color: selectedSubCategory === sub ? '#d81b60' : '#555',
                    fontWeight: selectedSubCategory === sub ? 'bold' : 'normal',
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* FILTER TOOLBAR */}
          <div className="collection-filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
            <div className="search-wrap" style={{ flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search women's outfits (e.g. saree blouse, chudidar, gown, kurti, pavadai, lehenga)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Rating:</label>
              <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="filter-select" style={{ padding: '8px', borderRadius: '6px' }}>
                <option value={0}>All Ratings</option>
                <option value={4.8}>★ 4.8 & Above</option>
                <option value={5.0}>★ 5.0 Top Rated</option>
              </select>
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Sort By:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select" style={{ padding: '8px', borderRadius: '6px' }}>
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: High to Low</option>
              </select>
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="collection-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {filteredCatalogProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={(p) => setActiveModalProduct(p)}
                onCustomize={onCustomize}
              />
            ))}
          </div>

          {filteredCatalogProducts.length === 0 && (
            <div className="no-products-box content-card" style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
              <div className="no-res-icon" style={{ fontSize: '40px' }}>👗</div>
              <h3>No Women's Outfits Match Your Filter Criteria</h3>
              <p>Try clearing your search query or selecting another dress category.</p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setActiveCategory('All');
                  setSelectedSubCategory('All');
                  setSearchQuery('');
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* CALLOUT BANNER */}
          <div className="customize-callout-banner" style={{ marginTop: '30px', background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e9 100%)', padding: '24px', borderRadius: '14px', border: '1px solid #ffb6c1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div className="callout-text">
              <h3 style={{ color: '#880e4f', margin: '0 0 4px' }}>Have your own fabric or reference photo?</h3>
              <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>
                Use our Women's Smart Tailoring Studio to upload your fabric, fitting dress, or reference design with dress-specific measurements.
              </p>
            </div>
            <button
              type="button"
              className="primary-btn-lg"
              onClick={() => onCustomize && onCustomize(null)}
              style={{ background: '#ad1457', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🧵 Open Women's Tailoring Studio →
            </button>
          </div>
        </>
      )}

      {viewMode === 'pexels' && (
        <PexelsImageGallery onCustomize={onCustomize} />
      )}

      {activeModalProduct && (
        <ProductDetailsModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onCustomize={onCustomize}
        />
      )}
    </div>
  );
}
