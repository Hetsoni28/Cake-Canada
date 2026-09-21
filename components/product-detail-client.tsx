"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/lib/data";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            color: n <= Math.round(rating) ? "var(--caramel)" : "var(--border)",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants[selectedVariantIdx] || { 
    id: 'unknown', 
    weight: 'Standard', 
    price: product.base_price 
  };

  function handleAddToCart() {
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantLabel: `${variant.weight}${variant.flavor ? " · " + variant.flavor : ""}`,
      price: variant.price,
      image: product.images[0]?.image_url ?? "",
      slug: product.slug,
      quantity,
    });
  }

  return (
    <div className="product-detail">
      {/* ── Left: Images ── */}
      <div className="product-detail-images">
        <div className="primary-image">
          <img
            src={product.images[selectedImageIdx]?.image_url}
            alt={product.images[selectedImageIdx]?.alt_text ?? product.name}
          />
        </div>

        {product.images.length > 1 && (
          <div className="image-thumbs">
            {product.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageIdx(idx)}
                aria-label={`View image ${idx + 1}`}
                style={{
                  border:
                    selectedImageIdx === idx
                      ? "2px solid var(--espresso)"
                      : "2px solid var(--border)",
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: "pointer",
                  padding: 0,
                  background: "none",
                  flexShrink: 0,
                }}
              >
                <img
                  src={img.image_url}
                  alt={img.alt_text ?? product.name}
                  style={{
                    width: 72,
                    height: 72,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Info ── */}
      <div className="product-detail-info">
        <h1 className="product-title">{product.name}</h1>
        <div className="product-meta">
          <StarRating rating={product.rating || 5} />
          <a href="#reviews" className="text-link" style={{ fontSize: 13 }}>
            {product.review_count || 12} reviews
          </a>
        </div>
        <p className="product-price">${variant.price.toFixed(2)} CAD</p>
        <p className="product-description">{product.description}</p>

        {product.variants.length > 0 && (
          <div className="product-options">
            <h3>Select Size</h3>
            <div className="variant-grid">
              {product.variants.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantIdx(idx)}
                  className={`variant-btn${selectedVariantIdx === idx ? " active" : ""}`}
                >
                  <span style={{ display: "block", fontWeight: 600 }}>
                    {v.weight}
                  </span>
                  {v.flavor && (
                    <span
                      style={{
                        display: "block",
                        fontSize: 12,
                        color:
                          selectedVariantIdx === idx ? "#fff" : "var(--taupe)",
                        marginTop: 2,
                      }}
                    >
                      {v.flavor}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="add-to-cart-section">
          <div className="qty-controls">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button className="btn btn-dark" style={{ flex: 1 }} onClick={handleAddToCart}>
            Add to Cart — ${(variant.price * quantity).toFixed(2)}
          </button>
          <button
            className="btn btn-outline"
            style={{ padding: "0 16px" }}
            aria-label="Add to wishlist"
          >
            <Heart size={20} />
          </button>
        </div>
        
        <div style={{ marginTop: 24, fontSize: 13, color: "var(--taupe)" }}>
          <p style={{ margin: "4px 0" }}>
            ✓ Made fresh to order
          </p>
          <p style={{ margin: "4px 0" }}>
            ✓ Local delivery available
          </p>
        </div>
      </div>
    </div>
  );
}
