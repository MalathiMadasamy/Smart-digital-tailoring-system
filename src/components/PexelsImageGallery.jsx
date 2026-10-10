import React, { useState, useEffect, useCallback } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { ProductCard } from './ProductCard.jsx';
import { ProductDetailsModal } from './ProductDetailsModal.jsx';
import { fetchPexelsImages, WOMEN_PEXELS_CATEGORIES } from '../services/imageService.js';

const PRESET_KEYWORDS = [
  { label: 'Designer Blouse', query: 'Designer Blouse', category: 'Traditional Wear' },
  { label: 'Bridal Blouse', query: 'Bridal Blouse', category: 'Special Occasion' },
  { label: 'Saree Blouse', query: 'Saree Blouse', category: 'Traditional Wear' },
  { label: 'Pavadai', query: 'Pavadai', category: 'Traditional Wear' },
  { label: 'Pavadai Thavani', query: 'Pavadai Thavani', category: 'Traditional Wear' },
  { label: 'Half Saree', query: 'Half Saree', category: 'Traditional Wear' },
  { label: 'Chudidar', query: 'Chudidar', category: 'Traditional Wear' },
  { label: 'Salwar', query: 'Salwar', category: 'Traditional Wear' },
  { label: 'Anarkali', query: 'Anarkali', category: 'Traditional Wear' },
  { label: 'Lehenga', query: 'Lehenga', category: 'Special Occasion' },
  { label: 'Kurti', query: 'Kurti', category: 'Modern Wear' },
  { label: 'Frock', query: 'Frock', category: 'Modern Wear' },
  { label: 'Gown', query: 'Gown', category: 'Modern Wear' },
  { label: 'Maxi Dress', query: 'Maxi Dress', category: 'Modern Wear' },
  { label: 'Party Wear', query: 'Party Wear', category: 'Special Occasion' },
  { label: 'Office Wear', query: 'Office Wear', category: 'Modern Wear' },
  { label: 'Bridal Wear', query: 'Bridal Wear', category: 'Special Occasion' },
  { label: 'Wedding Wear', query: 'Wedding Wear', category: 'Special Occasion' },
  { label: 'Reception Wear', query: 'Reception Wear', category: 'Special Occasion' },
  { label: 'Festival Wear', query: 'Festival Wear', category: 'Traditional Wear' },
];

export function PexelsImageGallery({ onCustomize }) {
  const { addToCart, wishlist, toggleWishlist } = useCustomer();

  const [query, setQuery] = useState('Designer Blouse');
  const [activeKeyword, setActiveKeyword] = useState('Designer Blouse');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);

  const [products, setProducts] = useState([]);
  const [displayedPhotoIds, setDisplayedPhotoIds] = useState(new Set());
  const [displayedUrls, setDisplayedUrls] = useState(new Set());

  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Fetch images using Pexels Image Service with deduplication
  const fetchImages = useCallback(async (searchQuery, catFilter, pageNum, isAppend = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await fetchPexelsImages(searchQuery, pageNum, perPage);

      if (data.success && Array.isArray(data.products)) {
        const womenProducts = data.products.filter((p) => p.gender !== 'Male' && p.category !== 'Men' && p.category !== 'Kids');

        if (isAppend) {
          setProducts((prevProducts) => {
            const currentIds = new Set(prevProducts.map((p) => p.photoId || p.id));
            const currentUrls = new Set(prevProducts.map((p) => p.imgUrl));

            const newUniqueItems = womenProducts.filter((p) => {
              const pid = p.photoId || p.id;
              if (currentIds.has(pid) || currentUrls.has(p.imgUrl)) {
                return false;
              }
              currentIds.add(pid);
              currentUrls.add(p.imgUrl);
              return true;
            });

            return [...prevProducts, ...newUniqueItems];
          });
        } else {
          const seenIds = new Set();
          const seenUrls = new Set();

          const uniqueInitial = womenProducts.filter((p) => {
            const pid = p.photoId || p.id;
            if (seenIds.has(pid) || seenUrls.has(p.imgUrl)) {
              return false;
            }
            seenIds.add(pid);
            seenUrls.add(p.imgUrl);
            return true;
          });

          setProducts(uniqueInitial);
          setDisplayedPhotoIds(seenIds);
          setDisplayedUrls(seenUrls);
        }

        setTotalResults(data.totalResults || 20);
      } else {
        throw new Error('Failed to load fashion images');
      }
    } catch (err) {
      console.error('[Pexels Gallery Error]', err);
      setError(err.message || 'Could not connect to image search service.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [perPage]);

  // Fetch initial images on mount or keyword / category change
  useEffect(() => {
    setPage(1);
    fetchImages(activeKeyword, selectedCategory, 1, false);
  }, [activeKeyword, selectedCategory, fetchImages]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setActiveKeyword(query.trim());
  };

  const handleKeywordClick = (kwItem) => {
    setQuery(kwItem.query);
    setActiveKeyword(kwItem.query);
    if (kwItem.category) {
      setSelectedCategory(kwItem.category);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchImages(activeKeyword, selectedCategory, nextPage, true);
  };

  return (
    <div className="pexels-gallery-container content-card">
      <div className="card-header-row">
        <div>
          <h3 style={{ color: '#880e4f' }}>🌐 Dynamic Women's Fashion Gallery</h3>
          <p className="subtitle">Explore real-world women's tailoring photography for blouse, lehenga, kurti and gown inspirations.</p>
        </div>
        <div className="header-badge-wrap" style={{ textAlign: 'right' }}>
          <span className="ai-smart-tag">PEXELS FASHION API</span>
          <small className="pexels-attribution-badge" style={{ display: 'block' }}>Photos provided by Pexels</small>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-main-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {['All', 'Traditional Wear', 'Modern Wear', 'Special Occasion'].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`cat-main-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: selectedCategory === cat ? '2px solid #d81b60' : '1px solid #ddd',
              background: selectedCategory === cat ? '#880e4f' : '#fff',
              color: selectedCategory === cat ? '#fff' : '#333',
            }}
          >
            {cat === 'All' ? '✨ All Women Categories' : cat}
          </button>
        ))}
      </div>

      {/* Quick Search Preset Keywords */}
      <div className="pexels-keywords-bar" style={{ marginBottom: '14px' }}>
        <span className="kw-label" style={{ fontWeight: 'bold', fontSize: '13px', color: '#880e4f' }}>Popular Women Searches:</span>
        <div className="kw-chips-wrapper" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
          {PRESET_KEYWORDS.map((kwItem) => (
            <button
              key={kwItem.label}
              type="button"
              className={`kw-chip-btn ${activeKeyword.toLowerCase() === kwItem.query.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleKeywordClick(kwItem)}
              style={{
                padding: '4px 12px',
                borderRadius: '14px',
                fontSize: '12px',
                cursor: 'pointer',
                border: activeKeyword.toLowerCase() === kwItem.query.toLowerCase() ? '1px solid #d81b60' : '1px solid #ccc',
                background: activeKeyword.toLowerCase() === kwItem.query.toLowerCase() ? '#fce4ec' : '#fff',
                color: activeKeyword.toLowerCase() === kwItem.query.toLowerCase() ? '#d81b60' : '#555',
                fontWeight: activeKeyword.toLowerCase() === kwItem.query.toLowerCase() ? 'bold' : 'normal',
              }}
            >
              {kwItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar Input */}
      <form onSubmit={handleSearchSubmit} className="pexels-search-form" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Type any women's dress (e.g. saree blouse, chudidar, lehenga, kurti, gown)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pexels-search-input"
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button type="submit" className="primary-btn" style={{ background: '#ad1457', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
          🔍 Search Women Gallery
        </button>
      </form>

      {loading && (
        <div className="pexels-skeleton-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div className="skeleton-card-item" key={idx} style={{ height: '260px', background: '#f5f5f5', borderRadius: '10px' }} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="pexels-error-box" style={{ padding: '20px', textAlign: 'center', background: '#fff' }}>
          <div className="error-icon">⚠️</div>
          <h4>Image Search Error</h4>
          <p>{error}</p>
          <button type="button" className="secondary-btn" onClick={() => fetchImages(activeKeyword, selectedCategory, 1, false)}>
            🔄 Retry Search
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="pexels-no-results-box" style={{ padding: '30px', textAlign: 'center', background: '#fff' }}>
          <div className="no-res-icon" style={{ fontSize: '36px' }}>👗</div>
          <h4>No Women's Fashion Results Found</h4>
          <p>We couldn't find photos for "{activeKeyword}". Select one of our preset women's searches above.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="pexels-results-info-bar" style={{ marginBottom: '14px', fontSize: '13px', color: '#555' }}>
            <span>
              Showing <b>{products.length} UNIQUE</b> women's designs for <b>"{activeKeyword}"</b>
            </span>
          </div>

          <div className="collection-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={(p) => setActiveModalProduct(p)}
                onCustomize={(p) => {
                  if (onCustomize) {
                    onCustomize(p);
                  }
                }}
              />
            ))}
          </div>

          <div className="pexels-load-more-wrap" style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              type="button"
              className="primary-btn-lg"
              onClick={handleLoadMore}
              disabled={loadingMore}
              style={{ background: '#880e4f', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold' }}
            >
              {loadingMore ? '⌛ Fetching More Unique Images...' : `📥 Load More Results (Page ${page + 1})`}
            </button>
          </div>
        </>
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
