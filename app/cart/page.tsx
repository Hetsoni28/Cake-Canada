"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import {
  Trash2, Plus, Minus, Tag, Loader2, ChevronRight,
  ShoppingBag, ArrowLeft, Check, X, MapPin, Truck
} from "lucide-react";
import { useCart } from "@/components/cart-provider";
import type { CartItem, AppliedCoupon } from "@/lib/cart";
import { loadCoupon, saveCoupon } from "@/lib/cart";

/* ─────────────────────────────────────────────────────────── */
/*  Types                                                      */
/* ─────────────────────────────────────────────────────────── */
interface ServerTotals {
  subtotal: number;
  delivery_fee: number;
  discount: number;
  tax: number;
  grand_total: number;
  coupon: AppliedCoupon | null;
  free_delivery_threshold: number;
}

/* ─────────────────────────────────────────────────────────── */
/*  Cart Item Row                                              */
/* ─────────────────────────────────────────────────────────── */
function CartItemRow({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}) {
  return (
    <div className="cart-item">
      <div className="cart-item-img">
        <img src={item.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200"} alt={item.name} />
      </div>
      <div className="cart-item-body">
        <div className="cart-item-header">
          <div>
            <h3 className="cart-item-name">{item.name}</h3>
            <p className="cart-item-variant">{item.variantLabel}</p>
            {/* Config tags */}
            <div className="cart-item-tags">
              {item.flavor    && <span className="cart-tag">Flavor: {item.flavor}</span>}
              {item.eggless   && <span className="cart-tag eggless-tag">🌿 Eggless</span>}
              {item.frosting  && <span className="cart-tag">Frosting: {item.frosting}</span>}
              {item.design    && <span className="cart-tag">Design: {item.design}</span>}
              {item.addons?.map(a => <span key={a.id} className="cart-tag">+ {a.name}</span>)}
              {item.cakeMessage && (
                <span className="cart-tag msg-tag">💬 &ldquo;{item.cakeMessage.slice(0, 30)}{item.cakeMessage.length > 30 ? "…" : ""}&rdquo;</span>
              )}
              {item.referenceImageUrl && <span className="cart-tag">📎 Reference image</span>}
            </div>
          </div>
          <button className="cart-remove-btn" onClick={onRemove} aria-label="Remove item">
            <Trash2 size={15} />
          </button>
        </div>

        <div className="cart-item-footer">
          <div className="qty-controls">
            <button onClick={() => onUpdateQty(item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease">
              <Minus size={13} />
            </button>
            <span>{item.quantity}</span>
            <button onClick={() => onUpdateQty(item.quantity + 1)} aria-label="Increase">
              <Plus size={13} />
            </button>
          </div>
          <div className="cart-item-price">
            <span className="cart-line-price">${(item.serverVerifiedPrice * item.quantity).toFixed(2)}</span>
            {item.quantity > 1 && (
              <span className="cart-unit-price">${item.serverVerifiedPrice.toFixed(2)} each</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Main Page                                                  */
/* ─────────────────────────────────────────────────────────── */
export default function CartPage() {
  const { items, removeItem, updateQty, clearCart } = useCart();

  const [totals, setTotals]       = useState<ServerTotals | null>(null);
  const [loadingTotals, setLoadingTotals] = useState(false);
  const [couponCode, setCouponCode]       = useState("");
  const [couponError, setCouponError]     = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Load saved coupon on mount
  useEffect(() => {
    const saved = loadCoupon();
    if (saved) setAppliedCoupon(saved);
  }, []);

  // ── Recalculate totals server-side whenever items or coupon changes ──
  const recalculate = useCallback(async (items: CartItem[], coupon: AppliedCoupon | null) => {
    if (items.length === 0) { setTotals(null); return; }
    setLoadingTotals(true);
    try {
      const res = await fetch("/api/cart-total", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, coupon_code: coupon?.code }),
      });
      if (res.ok) setTotals(await res.json());
    } catch(e) { console.error(e); }
    finally { setLoadingTotals(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => recalculate(items, appliedCoupon), 300);
    return () => clearTimeout(t);
  }, [items, appliedCoupon, recalculate]);

  // ── Coupon handlers ──
  async function applyCode() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const subtotal = items.reduce((s, i) => s + i.serverVerifiedPrice * i.quantity, 0);
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        const coupon: AppliedCoupon = {
          code: data.code,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
        };
        setAppliedCoupon(coupon);
        saveCoupon(coupon);
        setCouponCode("");
      } else {
        setCouponError(data.message);
      }
    } catch { setCouponError("Could not validate coupon. Try again."); }
    finally { setCouponLoading(false); }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    saveCoupon(null);
    setCouponError("");
  }

  const isEmpty = items.length === 0;
  const toFreeDelivery = totals ? Math.max(0, totals.free_delivery_threshold - (totals?.subtotal ?? 0)) : null;

  /* ─────────────────────────────────────────────────────────── */
  /*  Render                                                     */
  /* ─────────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-ivory text-espresso">
      <div className="announcement">Freshly baked · Local delivery · Custom cakes available</div>
      <Navbar />

      <div className="shell cart-page-wrap">
        <div className="cart-page-header">
          <a href="/cakes" className="cart-back-link"><ArrowLeft size={16} /> Continue Shopping</a>
          <h1>Your Cart {items.length > 0 && <span className="cart-count-badge">{items.reduce((s,i)=>s+i.quantity,0)}</span>}</h1>
          {!isEmpty && (
            <button className="cart-clear-btn" onClick={() => { if (confirm("Clear entire cart?")) clearCart(); }}>
              Clear cart
            </button>
          )}
        </div>

        {isEmpty ? (
          /* ── Empty state ── */
          <div className="cart-empty">
            <div className="cart-empty-icon"><ShoppingBag size={64} strokeWidth={1.2} /></div>
            <h2>Your cart is empty</h2>
            <p>Browse our collection and add something delicious!</p>
            <a href="/cakes" className="btn btn-dark">Shop All Cakes</a>
            <a href="/custom-cake" className="btn btn-outline">Design a Custom Cake</a>
          </div>
        ) : (
          <div className="cart-layout">
            {/* ── Left: items ── */}
            <div className="cart-items-col">

              {/* Free delivery progress */}
              {toFreeDelivery !== null && toFreeDelivery > 0 && (
                <div className="free-delivery-bar">
                  <Truck size={15} />
                  <span>Add <strong>${toFreeDelivery.toFixed(2)}</strong> more for free delivery!</span>
                  <div className="fdbar-track">
                    <div
                      className="fdbar-fill"
                      style={{ width: `${Math.min(100, ((totals?.subtotal ?? 0) / (totals?.free_delivery_threshold ?? 80)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {toFreeDelivery === 0 && totals && (
                <div className="free-delivery-bar success">
                  <Check size={15} /> <span>🎉 You qualify for <strong>free delivery!</strong></span>
                </div>
              )}

              {/* Cart items */}
              <div className="cart-items-list">
                {items.map(item => (
                  <CartItemRow
                    key={`${item.productId}-${item.variantId}`}
                    item={item}
                    onRemove={() => removeItem(item.productId, item.variantId)}
                    onUpdateQty={qty => updateQty(item.productId, item.variantId, qty)}
                  />
                ))}
              </div>

              {/* Coupon input */}
              <div className="coupon-section">
                <h3 className="coupon-title"><Tag size={15} /> Coupon Code</h3>
                {appliedCoupon ? (
                  <div className="coupon-applied">
                    <div className="coupon-applied-info">
                      <Check size={15} />
                      <strong>{appliedCoupon.code}</strong>
                      <span>
                        {appliedCoupon.discount_type === "percentage"
                          ? `${appliedCoupon.discount_value}% off`
                          : `$${appliedCoupon.discount_value} off`} applied!
                      </span>
                    </div>
                    <button className="coupon-remove" onClick={removeCoupon}>
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input-row">
                    <input
                      type="text"
                      className="coupon-input"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                      onKeyDown={e => e.key === "Enter" && applyCode()}
                    />
                    <button
                      className="btn btn-outline coupon-apply-btn"
                      onClick={applyCode}
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? <Loader2 size={15} className="spinner" /> : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && <p className="coupon-error">{couponError}</p>}
                <p className="coupon-hint">Try: WELCOME10 · SAVE15 · FLAT20 · BIRTHDAY25</p>
              </div>
            </div>

            {/* ── Right: totals ── */}
            <div className="cart-totals-col">
              <div className="cart-totals-card">
                <h3>Order Summary</h3>

                {loadingTotals ? (
                  <div className="totals-loading"><Loader2 size={16} className="spinner" /> Calculating…</div>
                ) : totals ? (
                  <div className="totals-rows">
                    <div className="totals-row">
                      <span>Subtotal</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    {totals.discount > 0 && (
                      <div className="totals-row discount-row">
                        <span>Discount ({appliedCoupon?.code})</span>
                        <span className="discount-amount">−${totals.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="totals-row">
                      <span>Delivery</span>
                      <span>
                        {totals.delivery_fee === 0
                          ? <span className="free-label">FREE</span>
                          : `$${totals.delivery_fee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="totals-row">
                      <span>HST (13%)</span>
                      <span>${totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="totals-row grand-row">
                      <span>Grand Total</span>
                      <strong>${totals.grand_total.toFixed(2)} CAD</strong>
                    </div>
                  </div>
                ) : null}

                <a href="/checkout" className="btn btn-dark cart-checkout-btn">
                  Proceed to Checkout <ChevronRight size={16} />
                </a>

                <div className="cart-trust-badges">
                  <p>🔒 Secure checkout</p>
                  <p>🚚 Tracked local delivery</p>
                  <p>🎂 Made fresh to order</p>
                </div>
              </div>

              {/* Accepted payments */}
              <div className="payment-methods">
                <p className="payment-label">We accept</p>
                <div className="payment-icons">
                  <span className="pay-badge">Visa</span>
                  <span className="pay-badge">Mastercard</span>
                  <span className="pay-badge">Amex</span>
                  <span className="pay-badge">Interac</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="shell footer-grid">
          <div>
            <div className="brand">MAISON<span>CAKE CO.</span></div>
            <p>Handcrafted cakes for life&apos;s sweetest moments.</p>
          </div>
          <div><h4>Shop</h4><a href="/cakes">All Cakes</a><a href="/custom-cake">Custom Cakes</a></div>
          <div><h4>Help</h4><a href="/faq">FAQs</a><a href="/contact">Contact Us</a></div>
          <div><h4>Contact</h4><p><MapPin size={14} /> Canada</p><p>hello@maisoncakeco.ca</p></div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Maison Cake Co.</span><span>Privacy · Terms</span>
        </div>
      </footer>
    </main>
  );
}
