import React, { useState } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';

export function ProductDetailsModal({ product, onClose, onCustomize }) {
  const { wishlist, toggleWishlist, addToCart } = useCustomer();

  const isWished = product ? wishlist.some((item) => item.id === product.id) : false;
  const images = product && product.additionalImages && product.additionalImages.length > 0
    ? product.additionalImages
    : product?.imgUrl
    ? [product.imgUrl]
    : [];

  const [activeImage, setActiveImage] = useState(images[0] || '');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Default');

  if (!product) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog product-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product.name}</h3>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="product-modal-body">
          <div className="product-gallery-side">
            <div className="main-gallery-img">
              <img src={activeImage} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="gallery-thumbs-row">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="thumbnail"
                    className={`thumb-img ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info-side">
            <div className="subcat-chip">💃 Women's Outfit • {product.subCategory || product.category}</div>
            <h2>{product.name}</h2>

            <div className="stars-row">
              <span className="stars-gold">★ {product.rating || 4.8}</span>
              <span className="reviews-count">({product.reviewsCount || 24} customer reviews)</span>
            </div>

            <div className="modal-price">₹{product.price}</div>

            <p className="product-description">{product.desc}</p>

            <div className="spec-row">
              <b>Fabric:</b> <span>{product.fabric}</span>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="spec-row">
                <b>Available Colors:</b>
                <div className="color-chips-group">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-chip-btn ${selectedColor === c ? 'active' : ''}`}
                      onClick={() => setSelectedColor(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-action-buttons">
              <button
                type="button"
                className="primary-btn flex-1"
                onClick={() => {
                  addToCart({ ...product, color: selectedColor });
                  alert(`✓ Added ${product.name} (${selectedColor}) to Tailoring Cart`);
                  onClose();
                }}
              >
                Add to Tailoring Cart
              </button>

              {onCustomize && (
                <button
                  type="button"
                  className="secondary-btn flex-1"
                  onClick={() => {
                    onClose();
                    onCustomize(product);
                  }}
                >
                  ✨ Customize & Stitch
                </button>
              )}

              <button
                type="button"
                className={`wishlist-toggle-btn ${isWished ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
              >
                {isWished ? '❤️ Wishlisted' : '🤍 Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
