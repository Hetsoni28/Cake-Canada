"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Heart, ShoppingBag, Trash2, Loader2, ArrowLeft, MapPin } from "lucide-react";
import { useCart } from "@/components/cart-provider";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  product_images: { image_url: string; is_primary: boolean; display_order: number }[];
  product_variants: { price: number; weight_kg: number }[];
}

interface WishlistEntry {
  id: string;
  created_at: string;
  products: WishlistProduct;
}

export default function WishlistPage() {
  const { addItem } = useCart();
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wishlist")
      .then(async res => {
        if (res.status === 401) {
          window.location.href = `/auth/login?next=/account/wishlist`;
          return;
        }
        const data = await res.json();
        setEntries(data ?? []);
      })
      .catch(() => setError("Failed to load wishlist."))
      .finally(() => setLoading(false));
  }, []);

  async function removeFromWishlist(productId: string) {
    setRemoving(productId);
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    setEntries(prev => prev.filter(e => e.products?.id !== productId));
    setRemoving(null);
  }

  function moveToCart(entry: WishlistEntry) {
    const product = entry.products;
    const cheapest = [...(product.product_variants ?? [])].sort((a, b) => a.price - b.price)[0];
    const image = [...(product.product_images ?? [])]
      .sort((a, b) => (a.is_primary ? -1 : 1) || a.display_order - b.display_order)[0];

    addItem({
      productId:          product.id,
      variantId:          `wl-${product.id}`,
      name:               product.name,
      variantLabel:       cheapest ? `${cheapest.weight_kg} kg` : "Standard",
      price:              cheapest?.price ?? product.base_price,
      serverVerifiedPrice: cheapest?.price ?? product.base_price,
      image:              image?.image_url ?? "",
      slug:               product.slug,
    });
    removeFromWishlist(product.id);
  }

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      <div className="announcement">Freshly baked · Local delivery · Custom cakes available</div>
      <Navbar />

      <div className="shell wishlist-page-wrap">
        <div className="wishlist-page-header">
          <a href="/account" className="cart-back-link"><ArrowLeft size={16} /> My Account</a>
          <h1>My Wishlist <Heart size={22} className="wishlist-heart-title" /></h1>
        </div>

        {loading ? (
          <div className="wishlist-loading"><Loader2 size={24} className="spinner" /> Loading your wishlist…</div>
        ) : error ? (
          <div className="wishlist-error">{error}</div>
        ) : entries.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon"><Heart size={64} strokeWidth={1.2} /></div>
            <h2>Your wishlist is empty</h2>
            <p>Save your favourite cakes to come back to them later.</p>
            <a href="/cakes" className="btn btn-dark">Browse All Cakes</a>
          </div>
        ) : (
          <div className="wishlist-grid">
            {entries.map(entry => {
              const product = entry.products;
              if (!product) return null;

              const image = [...(product.product_images ?? [])]
                .sort((a, b) => (a.is_primary ? -1 : 1) || a.display_order - b.display_order)[0];
              const cheapest = [...(product.product_variants ?? [])].sort((a, b) => a.price - b.price)[0];

              return (
                <div key={entry.id} className="wishlist-card">
                  <a href={`/cakes/${product.slug}`} className="wishlist-card-img">
                    <img
                      src={image?.image_url ?? "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400"}
                      alt={product.name}
                    />
                  </a>
                  <div className="wishlist-card-body">
                    <a href={`/cakes/${product.slug}`} className="wishlist-card-name">{product.name}</a>
                    <p className="wishlist-card-price">
                      from <strong>${(cheapest?.price ?? product.base_price).toFixed(2)} CAD</strong>
                    </p>
                    <div className="wishlist-card-actions">
                      <button
                        className="btn btn-dark wishlist-add-btn"
                        onClick={() => moveToCart(entry)}
                      >
                        <ShoppingBag size={14} /> Add to Cart
                      </button>
                      <button
                        className="wishlist-remove-btn"
                        onClick={() => removeFromWishlist(product.id)}
                        disabled={removing === product.id}
                        aria-label="Remove from wishlist"
                      >
                        {removing === product.id
                          ? <Loader2 size={14} className="spinner" />
                          : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="shell footer-grid">
          <div><div className="brand">MAISON<span>CAKE CO.</span></div><p>Handcrafted cakes for life&apos;s sweetest moments.</p></div>
          <div><h4>Shop</h4><a href="/cakes">All Cakes</a><a href="/custom-cake">Custom Cakes</a></div>
          <div><h4>My Account</h4><a href="/account">Dashboard</a><a href="/account/orders">Orders</a></div>
          <div><h4>Contact</h4><p><MapPin size={14} /> Canada</p><p>hello@maisoncakeco.ca</p></div>
        </div>
        <div className="shell footer-bottom"><span>© 2026 Maison Cake Co.</span><span>Privacy · Terms</span></div>
      </footer>
    </main>
  );
}
