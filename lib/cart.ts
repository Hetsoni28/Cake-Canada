// ─── Cart types & localStorage persistence ──────────────────────────────────

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;          // e.g. "1 kg · Vanilla"
  price: number;                 // fallback display price
  serverVerifiedPrice: number;   // server-calculated price per item
  quantity: number;
  image: string;
  slug: string;

  // Configuration
  flavor?: string;
  eggless?: boolean;
  frosting?: string;
  design?: string;
  addons?: { id: string; name: string; price: number }[];

  // Custom cake extras
  cakeMessage?: string;
  referenceImageUrl?: string;
}

export interface AppliedCoupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
}

export interface CartTotals {
  subtotal: number;
  delivery_fee: number;
  tax: number;
  discount: number;
  grand_total: number;
  coupon?: AppliedCoupon;
}

const STORAGE_KEY = 'maison_cart';
const COUPON_KEY  = 'maison_coupon';

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch { return []; }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function loadCoupon(): AppliedCoupon | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COUPON_KEY);
    return raw ? (JSON.parse(raw) as AppliedCoupon) : null;
  } catch { return null; }
}

export function saveCoupon(coupon: AppliedCoupon | null): void {
  if (typeof window === 'undefined') return;
  if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
  else localStorage.removeItem(COUPON_KEY);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce(
    (sum, i) => sum + (i.serverVerifiedPrice || i.price) * i.quantity,
    0
  );
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
