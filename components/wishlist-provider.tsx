"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface WishlistContextValue {
  productIds: string[];            // IDs of wishlisted products
  isWishlisted: (id: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch wishlist on mount (will 401 silently if not logged in)
  useEffect(() => {
    fetch("/api/wishlist")
      .then(async res => {
        if (res.status === 401) { setIsAuthenticated(false); return; }
        setIsAuthenticated(true);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProductIds(data.map((w: any) => w.products?.id).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);

  const isWishlisted = useCallback(
    (id: string) => productIds.includes(id),
    [productIds]
  );

  const toggle = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const alreadyIn = productIds.includes(productId);
    // Optimistic update
    setProductIds(prev =>
      alreadyIn ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    try {
      const res = await fetch("/api/wishlist", {
        method: alreadyIn ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) {
        // Revert on failure
        setProductIds(prev =>
          alreadyIn ? [...prev, productId] : prev.filter(id => id !== productId)
        );
      }
    } catch {
      // Revert
      setProductIds(prev =>
        alreadyIn ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    }
  }, [productIds, isAuthenticated]);

  return (
    <WishlistContext.Provider value={{ productIds, isWishlisted, toggle, isLoading, isAuthenticated }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
