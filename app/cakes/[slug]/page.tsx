"use client";

import { use, useState } from "react";
import { ShoppingBag, Heart, ArrowLeft, MapPin } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useCart } from "@/components/cart-provider";
import { STATIC_PRODUCTS } from "@/lib/data";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProductDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(props.params);
  const foundProduct = STATIC_PRODUCTS.find((p) => p.slug === params.slug);

  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // ── 404 state ──────────────────────────────────────────────────────────────
  if (!foundProduct) {
    return (
      <main className="min-h-screen bg-ivory text-espresso">
        <div className="announcement">
          Freshly baked · Local delivery · Custom cakes available
        </div>
        <Navbar />
        <div
          className="shell"
          style={{ padding: "80px 0", textAlign: "center" }}
        >
          <p className="eyebrow">404</p>
          <h1 style={{ marginBottom: 16 }}>Cake not found</h1>
          <p style={{ marginBottom: 32, color: "var(--taupe)" }}>
            We couldn&apos;t find the cake you&apos;re looking for.
          </p>
          <a href="/cakes" className="btn btn-dark">
            Back to all cakes
          </a>
        </div>
      </main>
    );
  }

  // ── Narrowed — product is defined beyond this point ──────────────────────
  const product = foundProduct;
  const variant = product.variants[selectedVariant];

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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-ivory text-espresso">
      {/* ── Announcement bar ── */}
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Back link ── */}
      <div className="shell">
        <a
          href="/cakes"
          className="text-link"
          style={{
            display: "inline-flex",
            gap: 8,
            alignItems: "center",
            padding: "20px 0",
          }}
        >
          <ArrowLeft size={16} /> Back to all cakes
        </a>
      </div>

      {/* ── Product detail ── */}
      <div className="shell">
        <div className="product-detail">
          {/* ── Left: Images ── */}
          <div className="product-detail-images">
            <div className="primary-image">
              <img
                src={product.images[selectedImage]?.image_url}
                alt={product.images[selectedImage]?.alt_text ?? product.name}
              />
            </div>

            {product.images.length > 1 && (
              <div className="image-thumbs">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`thumb-btn${selectedImage === idx ? " active" : ""}`}
                    aria-label={`View image ${idx + 1}`}
                    style={{
                      border:
                        selectedImage === idx
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
            {/* Eyebrow */}
            <p className="eyebrow" style={{ marginBottom: 8 }}>
              {product.category_slug.replace(/-/g, " ").toUpperCase()}
            </p>

            {/* Title */}
            <h1 style={{ marginBottom: 12 }}>{product.name}</h1>

            {/* Rating */}
            <div
              className="rating-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <StarRating rating={product.rating} />
              <span style={{ fontWeight: 600 }}>{product.rating}</span>
              <span style={{ color: "var(--taupe)", fontSize: "0.9rem" }}>
                ({product.review_count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="product-price" style={{ marginBottom: 20 }}>
              <span
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "var(--espresso)",
                }}
              >
                From ${variant.price} CAD
              </span>
            </div>

            {/* Description */}
            <p
              className="product-desc"
              style={{
                color: "var(--taupe)",
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              {product.description}
            </p>

            {/* Variant selector */}
            <div className="variant-group" style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: 10,
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Size
              </label>
              <div
                className="variant-options"
                style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
              >
                {product.variants.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(idx)}
                    className={`variant-btn${selectedVariant === idx ? " active" : ""}`}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 6,
                      border:
                        selectedVariant === idx
                          ? "2px solid var(--espresso)"
                          : "2px solid var(--border)",
                      background:
                        selectedVariant === idx
                          ? "var(--espresso)"
                          : "transparent",
                      color:
                        selectedVariant === idx
                          ? "var(--ivory)"
                          : "var(--espresso)",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {v.weight}
                    {v.flavor ? ` · ${v.flavor}` : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity selector */}
            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: 10,
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Quantity
              </label>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "2px solid var(--border)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  style={{
                    width: 40,
                    height: 40,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    color: "var(--espresso)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    minWidth: 44,
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  style={{
                    width: 40,
                    height: 40,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    color: "var(--espresso)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart row */}
            <div
              className="add-to-cart-row"
              style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
            >
              <button
                className="btn btn-dark"
                onClick={handleAddToCart}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button
                className="btn btn-outline"
                aria-label="Add to wishlist"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Heart size={18} /> Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="shell footer-grid">
          <div>
            <div className="brand">
              MAISON<span>CAKE CO.</span>
            </div>
            <p>Handcrafted cakes made for life's sweetest moments.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <a href="/cakes">All Cakes</a>
            <a href="/categories/birthday">Birthday</a>
            <a href="/custom-cake">Custom Cakes</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
            <a href="/faq">FAQs</a>
          </div>
          <div>
            <h4>Contact</h4>
            <p>
              <MapPin size={15} /> Canada
            </p>
            <p>hello@maisoncakeco.ca</p>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Maison Cake Co.</span>
          <span>Privacy · Terms</span>
        </div>
      </footer>
    </main>
  );
}
