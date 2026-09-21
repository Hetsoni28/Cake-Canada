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
          className={n <= Math.round(rating) ? "star-filled" : "star-empty"}
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

  const variant = product.variants[selectedVariantIdx] ?? {
    id: "unknown",
    weight: "Standard",
    price: product.base_price,
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
                className={`thumb-btn${selectedImageIdx === idx ? " active" : ""}`}
                aria-label={`View image ${idx + 1}`}
              >
                <img
                  src={img.image_url}
                  alt={img.alt_text ?? product.name}
                  className="thumb-btn-img"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Info ── */}
      <div className="product-detail-info">
        <h1 className="product-title">{product.name}</h1>
        <div className="rating-row">
          <StarRating rating={product.rating || 5} />
          <a href="#reviews" className="text-link review-link">
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
                  <span className="variant-weight">{v.weight}</span>
                  {v.flavor && (
                    <span className="variant-flavor">{v.flavor}</span>
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
          <button
            className="btn btn-dark add-to-cart-btn-main"
            onClick={handleAddToCart}
          >
            Add to Cart — ${(variant.price * quantity).toFixed(2)}
          </button>
          <button
            className="btn btn-outline wishlist-btn-icon"
            aria-label="Add to wishlist"
          >
            <Heart size={20} />
          </button>
        </div>

        <div className="product-perks">
          <p>✓ Made fresh to order</p>
          <p>✓ Local delivery available</p>
        </div>
      </div>
    </div>
  );
}
