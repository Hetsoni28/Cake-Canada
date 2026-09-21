"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/lib/products";
import type { ProductAddon, ProductOptionPrice } from "@/lib/addons";

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

interface PriceBreakdown {
  name: string;
  amount: number;
}

interface PriceCheckResult {
  base_price: number;
  surcharges: number;
  addons_price: number;
  per_item_price: number;
  total: number;
  breakdown: PriceBreakdown[];
  verifiedAddons: { id: string; name: string; price: number }[];
}

interface ProductDetailClientProps {
  product: Product;
  addons: ProductAddon[];
  optionPrices: ProductOptionPrice[];
}

const STATIC_FLAVORS = ["Vanilla", "Chocolate", "Red Velvet", "Strawberry", "Lemon"];

export function ProductDetailClient({ product, addons, optionPrices }: ProductDetailClientProps) {
  const { addItem } = useCart();
  
  // Base states
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Option states
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [flavor, setFlavor] = useState(STATIC_FLAVORS[0]);
  const [eggless, setEggless] = useState(false);
  const [frostingId, setFrostingId] = useState("");
  const [designId, setDesignId] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  // Pricing states
  const [isVerifying, setIsVerifying] = useState(false);
  const [priceData, setPriceData] = useState<PriceCheckResult | null>(null);

  const egglessOpt = optionPrices.find(o => o.option_type === 'eggless');
  const frostings = optionPrices.filter(o => o.option_type === 'frosting');
  const designs = optionPrices.filter(o => o.option_type === 'design');

  // Debounced price check
  useEffect(() => {
    if (!variantId) return;
    
    setIsVerifying(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/price-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variant_id: variantId,
            eggless,
            frosting_id: frostingId,
            design_id: designId,
            addon_ids: selectedAddons,
            quantity
          })
        });
        const data = await res.json();
        if (res.ok) setPriceData(data);
      } catch (err) {
        console.error("Price check failed:", err);
      } finally {
        setIsVerifying(false);
      }
    }, 400); // 400ms debounce
    
    return () => clearTimeout(timeout);
  }, [variantId, eggless, frostingId, designId, selectedAddons, quantity]);

  function handleAddonToggle(id: string) {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function handleAddToCart() {
    if (!priceData) return;
    
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) return;

    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantLabel: `${variant.weight} · ${flavor}${eggless ? ' (Eggless)' : ''}`,
      price: variant.price, // fallback display
      serverVerifiedPrice: priceData.per_item_price,
      quantity,
      image: product.images[0]?.image_url ?? "",
      slug: product.slug,
      flavor,
      eggless,
      frosting: frostings.find(f => f.id === frostingId)?.name,
      design: designs.find(d => d.id === designId)?.name,
      addons: priceData.verifiedAddons
    });
  }

  const currentVariant = product.variants.find(v => v.id === variantId);

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
        
        {/* Dynamic Price Display */}
        <div className={`price-display ${isVerifying ? 'verifying' : ''}`}>
          {priceData ? (
            <p className="product-price">${priceData.per_item_price.toFixed(2)} CAD</p>
          ) : (
            <p className="product-price">${currentVariant?.price.toFixed(2) ?? '0.00'} CAD</p>
          )}
          {isVerifying && <Loader2 className="spinner" size={16} />}
        </div>
        
        <p className="product-description">{product.description}</p>

        {/* ── 1. Weight ── */}
        {product.variants.length > 0 && (
          <div className="option-group">
            <h3 className="option-label">Size & Weight</h3>
            <div className="variant-grid">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  className={`variant-btn${variantId === v.id ? " active" : ""}`}
                >
                  <span className="variant-weight">{v.weight}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 2. Flavor ── */}
        <div className="option-group">
          <h3 className="option-label">Sponge Flavor</h3>
          <div className="variant-grid">
            {STATIC_FLAVORS.map(f => (
              <button
                key={f}
                onClick={() => setFlavor(f)}
                className={`variant-btn${flavor === f ? " active" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. Dietary (Eggless) ── */}
        {product.is_eggless_available && egglessOpt && (
          <div className="option-group">
            <h3 className="option-label">Dietary Preference</h3>
            <button
              onClick={() => setEggless(!eggless)}
              className={`eggless-toggle ${eggless ? 'active' : ''}`}
            >
              {egglessOpt.name} <span>(+${egglessOpt.surcharge})</span>
            </button>
          </div>
        )}

        {/* ── 4. Frosting ── */}
        {product.is_customizable && frostings.length > 0 && (
          <div className="option-group">
            <h3 className="option-label">Frosting Type</h3>
            <div className="radio-grid">
              {frostings.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFrostingId(f.id === frostingId ? "" : f.id)}
                  className={`radio-btn ${frostingId === f.id ? "active" : ""}`}
                >
                  <span className="radio-circle"></span>
                  <div className="radio-content">
                    <span className="radio-name">{f.name}</span>
                    {f.surcharge > 0 && <span className="radio-price">+${f.surcharge}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. Design ── */}
        {product.is_customizable && designs.length > 0 && (
          <div className="option-group">
            <h3 className="option-label">Design & Decoration</h3>
            <div className="radio-grid">
              {designs.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDesignId(d.id === designId ? "" : d.id)}
                  className={`radio-btn ${designId === d.id ? "active" : ""}`}
                >
                  <span className="radio-circle"></span>
                  <div className="radio-content">
                    <span className="radio-name">{d.name}</span>
                    {d.surcharge > 0 && <span className="radio-price">+${d.surcharge}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. Add-ons ── */}
        {addons.length > 0 && (
          <div className="option-group">
            <h3 className="option-label">Add-ons</h3>
            <div className="addon-grid">
              {addons.map(a => {
                const isChecked = selectedAddons.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => handleAddonToggle(a.id)}
                    className={`addon-item ${isChecked ? "checked" : ""}`}
                  >
                    <div className="checkbox"></div>
                    <span className="addon-name">{a.name}</span>
                    <span className="addon-price">+${a.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        {priceData && priceData.breakdown.length > 1 && (
          <div className="price-breakdown">
            <h4>Price Breakdown</h4>
            {priceData.breakdown.map((b, i) => (
              <div className="price-breakdown-row" key={i}>
                <span>{b.name}</span>
                <span>${b.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="price-total-row">
              <span>Total per item</span>
              <strong>${priceData.per_item_price.toFixed(2)}</strong>
            </div>
          </div>
        )}

        {/* Add to Cart Actions */}
        <div className="add-to-cart-section mt-16">
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
            disabled={isVerifying || !priceData}
          >
            {isVerifying ? "Calculating..." : `Add to Cart — $${(priceData?.total ?? 0).toFixed(2)}`}
          </button>
          <button
            className="btn btn-outline wishlist-btn-icon"
            aria-label="Add to wishlist"
          >
            <Heart size={20} />
          </button>
        </div>

        <div className="product-perks">
          <p>✨ Made fresh to order</p>
          <p>🚚 Local delivery available</p>
        </div>
      </div>
    </div>
  );
}
