"use client";

/**
 * Skeleton Components — Layout-aware shimmer placeholders
 * Each skeleton exactly mirrors the real component's DOM structure and dimensions.
 */

function Shimmer({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`skeleton ${className}`} style={style} />;
}

// ─── Single line ───────────────────────────────────────────────
export function SkeletonLine({
  width = "100%",
  height = 14,
  style = {},
}: {
  width?: string | number;
  height?: number;
  style?: React.CSSProperties;
}) {
  return <Shimmer style={{ width, height, borderRadius: 6, ...style }} />;
}

// ─── Product Card Skeleton ─────────────────────────────────────
// Matches: components/product-card.tsx exactly
export function ProductCardSkeleton() {
  return (
    <div className="product-card skeleton-card">
      {/* Image */}
      <Shimmer
        style={{
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: "8px 8px 0 0",
        }}
      />
      <div className="product-card-body">
        {/* Eyebrow / category */}
        <Shimmer
          style={{
            width: "40%",
            height: 10,
            borderRadius: 4,
            marginBottom: 10,
          }}
        />
        {/* Product name */}
        <Shimmer
          style={{ width: "85%", height: 18, borderRadius: 6, marginBottom: 6 }}
        />
        <Shimmer
          style={{
            width: "60%",
            height: 18,
            borderRadius: 6,
            marginBottom: 14,
          }}
        />
        {/* Description */}
        <Shimmer
          style={{
            width: "100%",
            height: 12,
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <Shimmer
          style={{
            width: "75%",
            height: 12,
            borderRadius: 4,
            marginBottom: 18,
          }}
        />
        {/* Price + button row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Shimmer style={{ width: 70, height: 20, borderRadius: 6 }} />
          <Shimmer style={{ width: 90, height: 36, borderRadius: 6 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Product Grid Skeleton ─────────────────────────────────────
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Category Card Skeleton ────────────────────────────────────
export function CategoryCardSkeleton() {
  return (
    <div
      className="category-hero-card skeleton-card"
      style={{ pointerEvents: "none" }}
    >
      <Shimmer style={{ width: "100%", aspectRatio: "3/2", borderRadius: 0 }} />
      <div style={{ padding: "24px 28px" }}>
        <Shimmer
          style={{
            width: "55%",
            height: 20,
            borderRadius: 6,
            marginBottom: 10,
          }}
        />
        <Shimmer
          style={{ width: "80%", height: 13, borderRadius: 4, marginBottom: 6 }}
        />
        <Shimmer style={{ width: "50%", height: 13, borderRadius: 4 }} />
      </div>
    </div>
  );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="category-hero-grid">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Product Detail Skeleton ───────────────────────────────────
// Matches: app/cakes/[slug]/page.tsx layout
export function ProductDetailSkeleton() {
  return (
    <div className="product-detail">
      {/* Left — images */}
      <div className="product-detail-images">
        <Shimmer
          style={{ width: "100%", aspectRatio: "1/1", borderRadius: 12 }}
        />
        <div
          className="image-thumbs"
          style={{ marginTop: 12, display: "flex", gap: 10 }}
        >
          {[1, 2, 3].map((i) => (
            <Shimmer
              key={i}
              style={{ width: 72, height: 72, borderRadius: 8 }}
            />
          ))}
        </div>
      </div>

      {/* Right — info */}
      <div className="product-detail-info">
        <Shimmer
          style={{
            width: "35%",
            height: 11,
            borderRadius: 4,
            marginBottom: 14,
          }}
        />
        <Shimmer
          style={{ width: "90%", height: 32, borderRadius: 8, marginBottom: 8 }}
        />
        <Shimmer
          style={{
            width: "65%",
            height: 32,
            borderRadius: 8,
            marginBottom: 20,
          }}
        />

        {/* Rating */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <Shimmer style={{ width: 100, height: 14, borderRadius: 4 }} />
          <Shimmer style={{ width: 60, height: 14, borderRadius: 4 }} />
        </div>

        {/* Price */}
        <Shimmer
          style={{ width: 120, height: 28, borderRadius: 6, marginBottom: 24 }}
        />

        {/* Description */}
        <Shimmer
          style={{
            width: "100%",
            height: 13,
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <Shimmer
          style={{ width: "95%", height: 13, borderRadius: 4, marginBottom: 6 }}
        />
        <Shimmer
          style={{
            width: "70%",
            height: 13,
            borderRadius: 4,
            marginBottom: 28,
          }}
        />

        {/* Variant selector */}
        <Shimmer
          style={{
            width: "25%",
            height: 12,
            borderRadius: 4,
            marginBottom: 12,
          }}
        />
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[1, 2, 3].map((i) => (
            <Shimmer
              key={i}
              style={{ width: 80, height: 38, borderRadius: 6 }}
            />
          ))}
        </div>

        {/* Qty + Add to cart */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Shimmer style={{ width: 110, height: 48, borderRadius: 6 }} />
          <Shimmer style={{ flex: 1, height: 48, borderRadius: 6 }} />
          <Shimmer style={{ width: 48, height: 48, borderRadius: 6 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Catalogue Page Skeleton ───────────────────────────────────
// Matches: app/cakes/page.tsx — sidebar + grid
export function CatalogueSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="catalogue-layout">
      {/* Sidebar */}
      <aside>
        <Shimmer
          style={{
            width: "60%",
            height: 14,
            borderRadius: 4,
            marginBottom: 20,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Shimmer
              key={i}
              style={{
                width: `${50 + (i % 4) * 12}%`,
                height: 13,
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      </aside>
      {/* Grid */}
      <ProductGridSkeleton count={count} />
    </div>
  );
}

// ─── Order Card Skeleton ───────────────────────────────────────
// Matches: app/account/orders/page.tsx order card
export function OrderCardSkeleton() {
  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <Shimmer
            style={{ width: 120, height: 15, borderRadius: 4, marginBottom: 8 }}
          />
          <Shimmer style={{ width: 90, height: 11, borderRadius: 4 }} />
        </div>
        <Shimmer style={{ width: 80, height: 26, borderRadius: 20 }} />
      </div>
      <Shimmer
        style={{
          width: "70%",
          height: 12,
          borderRadius: 4,
          marginTop: 12,
          marginBottom: 10,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Shimmer style={{ width: 60, height: 15, borderRadius: 4 }} />
        <Shimmer style={{ width: 90, height: 13, borderRadius: 4 }} />
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="orders-list">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Checkout Skeleton ─────────────────────────────────────────
export function CheckoutSkeleton() {
  return (
    <div className="checkout-layout">
      {/* Form col */}
      <div>
        {[1, 2, 3].map((section) => (
          <div key={section} className="checkout-section-card">
            <Shimmer
              style={{
                width: "40%",
                height: 16,
                borderRadius: 6,
                marginBottom: 20,
              }}
            />
            <div className="form-row-2">
              <div className="form-field">
                <Shimmer
                  style={{
                    width: "50%",
                    height: 11,
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                />
                <Shimmer
                  style={{ width: "100%", height: 42, borderRadius: 6 }}
                />
              </div>
              <div className="form-field">
                <Shimmer
                  style={{
                    width: "50%",
                    height: 11,
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                />
                <Shimmer
                  style={{ width: "100%", height: 42, borderRadius: 6 }}
                />
              </div>
            </div>
            <div className="form-field">
              <Shimmer
                style={{
                  width: "40%",
                  height: 11,
                  borderRadius: 4,
                  marginBottom: 8,
                }}
              />
              <Shimmer style={{ width: "100%", height: 42, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
      {/* Summary col */}
      <div className="checkout-summary-card">
        <Shimmer
          style={{
            width: "50%",
            height: 16,
            borderRadius: 6,
            marginBottom: 20,
          }}
        />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="checkout-item-row"
            style={{ marginBottom: 14 }}
          >
            <div>
              <Shimmer
                style={{
                  width: 140,
                  height: 13,
                  borderRadius: 4,
                  marginBottom: 6,
                }}
              />
              <Shimmer style={{ width: 90, height: 10, borderRadius: 4 }} />
            </div>
            <Shimmer style={{ width: 50, height: 13, borderRadius: 4 }} />
          </div>
        ))}
        <div className="checkout-divider" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="checkout-total-row"
            style={{ marginBottom: 10 }}
          >
            <Shimmer style={{ width: 70, height: 12, borderRadius: 4 }} />
            <Shimmer style={{ width: 50, height: 12, borderRadius: 4 }} />
          </div>
        ))}
        <div className="checkout-divider" />
        <Shimmer
          style={{ width: "100%", height: 48, borderRadius: 6, marginTop: 16 }}
        />
      </div>
    </div>
  );
}

// ─── Hero Skeleton ─────────────────────────────────────────────
export function HeroSkeleton() {
  return (
    <div
      style={{
        padding: "80px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Shimmer style={{ width: 120, height: 11, borderRadius: 4 }} />
      <Shimmer style={{ width: "55%", height: 40, borderRadius: 8 }} />
      <Shimmer style={{ width: "35%", height: 40, borderRadius: 8 }} />
      <Shimmer
        style={{ width: "45%", height: 16, borderRadius: 4, marginTop: 8 }}
      />
    </div>
  );
}

// ─── Page Skeleton (full page) ─────────────────────────────────
export function PageSkeleton({
  variant = "catalogue",
}: {
  variant?: "catalogue" | "detail" | "orders" | "checkout";
}) {
  return (
    <div className="shell" style={{ padding: "0 0 80px" }}>
      <HeroSkeleton />
      {variant === "catalogue" && <CatalogueSkeleton />}
      {variant === "detail" && <ProductDetailSkeleton />}
      {variant === "orders" && <OrderListSkeleton />}
      {variant === "checkout" && <CheckoutSkeleton />}
    </div>
  );
}

// ─── Generic inline skeleton ───────────────────────────────────
export { Shimmer as Skeleton };
