-- Migration 011: Coupons + Wishlists

-- ── 1. Coupons ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2) DEFAULT 0,
  max_uses        INTEGER,
  times_used      INTEGER NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active coupons"
  ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Owner manage coupons"
  ON coupons FOR ALL USING (is_owner());

-- Seed test coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses, expires_at) VALUES
  ('WELCOME10',  'percentage', 10,  0,   500, NOW() + INTERVAL '1 year'),
  ('SAVE15',     'percentage', 15, 50,   200, NOW() + INTERVAL '6 months'),
  ('FLAT20',     'fixed',      20, 80,   100, NOW() + INTERVAL '3 months'),
  ('BIRTHDAY25', 'percentage', 25, 100,   50, NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;

-- ── 2. Wishlists ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own wishlist"
  ON wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own wishlist"
  ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own wishlist"
  ON wishlists FOR DELETE USING (auth.uid() = user_id);
