import React from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';

// Category-specific fallback images (Women Only)
const CATEGORY_FALLBACK_IMAGES = {
  Traditional: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=780&fit=crop&auto=format',
  Modern: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=780&fit=crop&auto=format',
  SpecialOccasion: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format',
  Default: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=780&fit=crop&auto=format',
};

export function ProductCard({ product, onViewDetails, onCustomize }) {
  const { wishlist, toggleWishlist, addToCart } = useCustomer();
  const isWished = wishlist.some((item) => item.id === product.id);

  const fallbackSrc = CATEGORY_FALLBACK_IMAGES[product.category] || CATEGORY_FALLBACK_IMAGES.Default;

  return (
    <div className="product-card-box">
      <div className="product-card-img-wrap">
        <img
          src={product.imgUrl}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackSrc;
          }}
        />
        <span className="subcat-badge">
          💃 Women's Outfit • {product.subcategory || product.subCategory || product.category}
        </span>
        <button
          type="button"
          className={`wishlist-heart-icon ${isWished ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isWished ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="product-card-details">
        <div className="product-card-rating">
          <span className="stars-gold">★ {product.rating || 4.8}</span>
          <span className="reviews-count">({product.reviewsCount || 24} reviews)</span>
        </div>

        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>

        <div className="product-card-meta">
          <span className="fabric-info">🧵 {product.fabric}</span>
          <span className="price-info">₹{product.price}</span>
        </div>

        <div className="product-card-actions">
          <button type="button" className="btn-secondary" onClick={() => onViewDetails && onViewDetails(product)}>
            View Details
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              addToCart(product);
              alert(`✓ Added ${product.name} to Tailoring Cart`);
            }}
          >
            Add to Cart
          </button>
        </div>

        {onCustomize && (
          <button type="button" className="btn-customize-link" onClick={() => onCustomize(product)}>
            ✨ Customize & Stitch This Dress →
          </button>
        )}
      </div>
    </div>
  );
}

