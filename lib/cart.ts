// ─── Cart types & localStorage persistence ──────────────────────────────────

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string; // e.g. "1 kg · Vanilla"
  price: number;
  quantity: number;
  image: string;
  slug: string;
}

const STORAGE_KEY = "maison_cart";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
