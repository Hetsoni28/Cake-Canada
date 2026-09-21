"use client";

import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "./cart-provider";

export function CartDrawer() {
  const { items, count, total, isOpen, closeCart, removeItem, updateQty } =
    useCart();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="cart-backdrop" onClick={closeCart} aria-hidden />
      )}

      {/* Drawer panel */}
      <aside className={`cart-drawer${isOpen ? " cart-drawer--open" : ""}`}>
        <div className="cart-header">
          <h2>
            <ShoppingBag size={18} /> Cart
            {count > 0 && <span className="cart-count-badge">{count}</span>}
          </h2>
          <button onClick={closeCart} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={40} />
            <p>Your cart is empty.</p>
            <a href="/cakes" className="btn btn-dark" onClick={closeCart}>
              Browse cakes
            </a>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId}`}
                  className="cart-item"
                >
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-variant">{item.variantLabel}</p>
                    <div className="cart-item-actions">
                      <div className="qty-ctrl">
                        <button
                          aria-label="Decrease"
                          onClick={() =>
                            updateQty(
                              item.productId,
                              item.variantId,
                              item.quantity - 1,
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={13} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          aria-label="Increase"
                          onClick={() =>
                            updateQty(
                              item.productId,
                              item.variantId,
                              item.quantity + 1,
                            )
                          }
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <strong>
                        ${(item.price * item.quantity).toFixed(2)}
                      </strong>
                      <button
                        className="cart-remove"
                        aria-label="Remove"
                        onClick={() =>
                          removeItem(item.productId, item.variantId)
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-footer">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>${total.toFixed(2)} CAD</strong>
              </div>
              <p className="cart-note">
                Taxes and delivery calculated at checkout.
              </p>
              <a href="/checkout" className="btn btn-dark cart-checkout-btn">
                Proceed to Checkout
              </a>
              <button className="cart-continue" onClick={closeCart}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
