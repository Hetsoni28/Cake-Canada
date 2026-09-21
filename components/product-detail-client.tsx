"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/lib/products";
import type { ProductAddon, ProductOptionPrice } from "@/lib/addons";

/* ─────────────────────────────────────────────────────────── */
/*  Sub-components                                             */
/* ─────────────────────────────────────────────────────────── */

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

function PrepTime({ minutes }: { minutes: number }) {
  if (minutes < 60) return <span>{minutes}m</span>;
  const h = Math.floor(minutes / 60);
  return <span>{h} hr{h !== 1 ? "s" : ""}</span>;
}

/* Live cake message preview */
function CakeMessagePreview({ message }: { message: string }) {
  const display = message.trim() || "Your message here…";
  return (
    <div className="cake-preview">
      <div className="cake-preview-plate">
        {/* decorative circles */}
        <div className="cake-preview-deco cake-preview-deco-1" />
        <div className="cake-preview-deco cake-preview-deco-2" />
        <p className="cake-preview-text">{display}</p>
        <p className="cake-preview-hint">Preview — actual placement may vary</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Types                                                      */
/* ─────────────────────────────────────────────────────────── */

interface PriceBreakdown { name: string; amount: number }

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

/* ─────────────────────────────────────────────────────────── */
/*  Main component                                             */
/* ─────────────────────────────────────────────────────────── */

export function ProductDetailClient({ product, addons, optionPrices }: ProductDetailClientProps) {
  const { addItem } = useCart();

  /* Image gallery */
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  /* Core options */
  const [variantId, setVariantId]       = useState(product.variants[0]?.id ?? "");
  const [flavor, setFlavor]             = useState(STATIC_FLAVORS[0]);
  const [eggless, setEggless]           = useState(false);
  const [frostingId, setFrostingId]     = useState("");
  const [designId, setDesignId]         = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity]         = useState(1);

  /* Cake message */
  const [cakeMessage, setCakeMessage]   = useState("");
  const [showPreview, setShowPreview]   = useState(false);

  /* Wishlist */
  const [wishlisted, setWishlisted]     = useState(false);

  /* Pricing */
  const [isVerifying, setIsVerifying]   = useState(false);
  const [priceData, setPriceData]       = useState<PriceCheckResult | null>(null);

  /* Derived option groups */
  const egglessOpt = optionPrices.find(o => o.option_type === "eggless");
  const frostings  = optionPrices.filter(o => o.option_type === "frosting");
  const designs    = optionPrices.filter(o => o.option_type === "design");
  const currentVariant = product.variants.find(v => v.id === variantId);

  /* ── Debounced server price-check ── */
  useEffect(() => {
    if (!variantId) return;
    setIsVerifying(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/price-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variant_id: variantId, eggless, frosting_id: frostingId, design_id: designId, addon_ids: selectedAddons, quantity }),
        });
        const data = await res.json();
        if (res.ok) setPriceData(data);
      } catch (err) { console.error("Price check failed:", err); }
      finally { setIsVerifying(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [variantId, eggless, frostingId, designId, selectedAddons, quantity]);

  /* ── Handlers ── */
  function toggleAddon(id: string) {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function prevImage() {
    setSelectedImageIdx(i => (i === 0 ? product.images.length - 1 : i - 1));
  }
  function nextImage() {
    setSelectedImageIdx(i => (i === product.images.length - 1 ? 0 : i + 1));
  }

  function handleAddToCart() {
    if (!priceData) return;
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) return;

    addItem({
      productId:           product.id,
      variantId:           variant.id,
      name:                product.name,
      variantLabel:        `${variant.weight} · ${flavor}${eggless ? " (Eggless)" : ""}`,
      price:               variant.price,
      serverVerifiedPrice: priceData.per_item_price,
      quantity,
      image:               product.images[0]?.image_url ?? "",
      slug:                product.slug,
      flavor,
      eggless,
      frosting: frostings.find(f => f.id === frostingId)?.name,
      design:   designs.find(d => d.id === designId)?.name,
      addons:   priceData.verifiedAddons,
    });
  }

  /* ── Prep time label ── */
  function prepLabel(mins: number) {
    if (mins <= 480)  return "Same Day";
    if (mins <= 1440) return "1–2 Days";
    if (mins <= 2880) return "2–3 Days";
    return "3–5 Days";
  }

  const isAvailable = product.is_available !== false;
  const prepMins    = product.preparation_time_minutes ?? 1440;
  const charLimit   = 60;

  /* ─────────────────────────────────────────────────────────── */
  /*  Render                                                     */
  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="product-detail">

      {/* ════════════════════════ LEFT ════════════════════════ */}
      <div className="product-detail-images">

        {/* Main image with nav arrows */}
        <div className="primary-image">
          <img
            src={product.images[selectedImageIdx]?.image_url}
            alt={product.images[selectedImageIdx]?.alt_text ?? product.name}
          />
          {product.images.length > 1 && (
            <>
              <button className="img-nav img-nav-prev" onClick={prevImage} aria-label="Previous image">
                <ChevronLeft size={20} />
              </button>
              <button className="img-nav img-nav-next" onClick={nextImage} aria-label="Next image">
                <ChevronRight size={20} />
              </button>
              <div className="img-dots">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIdx(i)}
                    className={`img-dot${selectedImageIdx === i ? " active" : ""}`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges overlaid on image */}
          <div className="img-badge-row">
            {product.is_best_seller && <span className="badge badge-gold">Best Seller</span>}
            {product.is_featured    && <span className="badge badge-dark">Featured</span>}
            {!isAvailable           && <span className="badge badge-red">Out of Stock</span>}
          </div>
        </div>

        {/* Thumbnail strip */}
        {product.images.length > 1 && (
          <div className="image-thumbs">
            {product.images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageIdx(idx)}
                className={`thumb-btn${selectedImageIdx === idx ? " active" : ""}`}
                aria-label={`View image ${idx + 1}`}
              >
                <img src={img.image_url} alt={img.alt_text ?? product.name} className="thumb-btn-img" />
              </button>
            ))}
          </div>
        )}

        {/* ── Cake Message Preview (lives under image on mobile, above on desktop) ── */}
        {showPreview && (
          <div className="cake-preview-wrap">
            <CakeMessagePreview message={cakeMessage} />
          </div>
        )}
      </div>

      {/* ════════════════════════ RIGHT ════════════════════════ */}
      <div className="product-detail-info">

        {/* Category breadcrumb */}
        {product.category_slug && (
          <a href={`/categories/${product.category_slug}`} className="pd-breadcrumb">
            {product.category_slug.replace(/-/g, " ")}
          </a>
        )}

        <h1 className="product-title">{product.name}</h1>

        {/* Rating row */}
        <div className="rating-row">
          <StarRating rating={product.rating || 5} />
          <a href="#reviews" className="text-link review-link">
            {product.review_count || 12} reviews
          </a>
        </div>

        {/* Availability + Prep time pill row */}
        <div className="pd-meta-row">
          {isAvailable ? (
            <span className="pd-avail-pill available">
              <CheckCircle size={13} /> In Stock
            </span>
          ) : (
            <span className="pd-avail-pill unavailable">
              <XCircle size={13} /> Out of Stock
            </span>
          )}
          <span className="pd-prep-pill">
            <Clock size={13} /> Ready in {prepLabel(prepMins)} · <PrepTime minutes={prepMins} />
          </span>
        </div>

        {/* Live price */}
        <div className={`price-display${isVerifying ? " verifying" : ""}`}>
          <p className="product-price">
            ${(priceData?.per_item_price ?? currentVariant?.price ?? product.base_price).toFixed(2)} CAD
          </p>
          {isVerifying && <Loader2 className="spinner" size={16} />}
        </div>

        <p className="product-description">{product.description}</p>

        <div className="pd-divider" />

        {/* ── 1. Size & Weight ── */}
        {product.variants.length > 0 && (
          <div className="option-group">
            <h3 className="option-label">Size & Weight</h3>
            <div className="variant-grid">
              {product.variants.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  className={`variant-btn${variantId === v.id ? " active" : ""}`}
                >
                  <span className="variant-weight">{v.weight}</span>
                  <span className="variant-price">${v.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 2. Sponge Flavor ── */}
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

        {/* ── 3. Eggless ── */}
        {product.is_eggless_available && egglessOpt && (
          <div className="option-group">
            <h3 className="option-label">Dietary Preference</h3>
            <button
              onClick={() => setEggless(!eggless)}
              className={`eggless-toggle${eggless ? " active" : ""}`}
            >
              🌿 {egglessOpt.name}
              {egglessOpt.surcharge > 0 && <span>(+${egglessOpt.surcharge})</span>}
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
                  className={`radio-btn${frostingId === f.id ? " active" : ""}`}
                >
                  <span className="radio-circle" />
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
                  className={`radio-btn${designId === d.id ? " active" : ""}`}
                >
                  <span className="radio-circle" />
                  <div className="radio-content">
                    <span className="radio-name">{d.name}</span>
                    {d.surcharge > 0 && <span className="radio-price">+${d.surcharge}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. Cake Message ── */}
        <div className="option-group">
          <div className="cake-msg-header">
            <h3 className="option-label">Cake Message</h3>
            <span className="cake-msg-chars">
              {cakeMessage.length}/{charLimit}
            </span>
          </div>
          <div className="cake-msg-wrap">
            <textarea
              className="cake-msg-input"
              placeholder="e.g. Happy Birthday Sarah ❤️"
              maxLength={charLimit}
              rows={2}
              value={cakeMessage}
              onChange={e => {
                setCakeMessage(e.target.value);
                if (e.target.value.trim()) setShowPreview(true);
                else setShowPreview(false);
              }}
            />
            {cakeMessage.trim() && (
              <button
                className={`cake-preview-btn${showPreview ? " active" : ""}`}
                onClick={() => setShowPreview(v => !v)}
              >
                {showPreview ? "Hide Preview" : "👁 Preview on Cake"}
              </button>
            )}
          </div>

          {/* Inline preview panel */}
          {showPreview && cakeMessage.trim() && (
            <CakeMessagePreview message={cakeMessage} />
          )}
        </div>

        {/* ── 7. Add-ons ── */}
        {addons.length > 0 && (
          <div className="option-group">
            <h3 className="option-label">Add-ons</h3>
            <div className="addon-grid">
              {addons.map(a => {
                const checked = selectedAddons.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAddon(a.id)}
                    className={`addon-item${checked ? " checked" : ""}`}
                  >
                    <div className="checkbox" />
                    <span className="addon-name">{a.name}</span>
                    <span className="addon-price">+${a.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Price Breakdown ── */}
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
              <span>Per item</span>
              <strong>${priceData.per_item_price.toFixed(2)}</strong>
            </div>
          </div>
        )}

        <div className="pd-divider" />

        {/* ── Quantity ── */}
        <div className="option-group">
          <h3 className="option-label">Quantity</h3>
          <div className="qty-controls">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease">-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} aria-label="Increase">+</button>
          </div>
        </div>

        {/* ── CTA Row ── */}
        <div className="add-to-cart-section">
          <button
            className="btn btn-dark add-to-cart-btn-main"
            onClick={handleAddToCart}
            disabled={isVerifying || !priceData || !isAvailable}
          >
            {!isAvailable
              ? "Out of Stock"
              : isVerifying
                ? "Calculating…"
                : `Add to Cart — $${(priceData?.total ?? 0).toFixed(2)}`}
          </button>
          <button
            className={`btn btn-outline wishlist-btn-icon${wishlisted ? " wishlisted" : ""}`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => setWishlisted(v => !v)}
          >
            <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        {/* ── Perks ── */}
        <div className="product-perks">
          <div className="perk-item">
            <span className="perk-icon">🎂</span>
            <div>
              <strong>Made fresh to order</strong>
              <p>Baked and decorated after you place your order</p>
            </div>
          </div>
          <div className="perk-item">
            <span className="perk-icon">🚚</span>
            <div>
              <strong>Local delivery across GTA</strong>
              <p>Same-day delivery available in select areas</p>
            </div>
          </div>
          <div className="perk-item">
            <span className="perk-icon">🌿</span>
            <div>
              <strong>Premium ingredients</strong>
              <p>No artificial colours or preservatives</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
