-- Migration 010: Bundles, Extended Add-ons, Supabase Storage Bucket

-- ── 1. More Add-ons (Phase 10) ─────────────────────────────────────────────
INSERT INTO product_addons (name, price, display_order) VALUES
  ('Fresh Flower Arrangement',    18.00, 7),
  ('Balloon Bouquet (5 pieces)',  12.00, 8),
  ('Belgian Chocolate Box',       22.00, 9),
  ('Premium Gift Box Packaging',   8.00, 10),
  ('Sparkler Candles (4 pcs)',     5.00, 11),
  ('Cake Topper (Custom Text)',   14.00, 12)
ON CONFLICT DO NOTHING;

-- ── 2. Occasion Bundles (Phase 10) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS occasion_bundles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  emoji         TEXT DEFAULT '🎁',
  discount_pct  NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bundle_items (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES occasion_bundles(id) ON DELETE CASCADE,
  addon_id  UUID NOT NULL REFERENCES product_addons(id)   ON DELETE CASCADE,
  UNIQUE(bundle_id, addon_id)
);

ALTER TABLE occasion_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read occasion_bundles"
  ON occasion_bundles FOR SELECT USING (is_active = true);
CREATE POLICY "Public read bundle_items"
  ON bundle_items FOR SELECT USING (true);
CREATE POLICY "Owner manage occasion_bundles"
  ON occasion_bundles FOR ALL USING (is_owner());
CREATE POLICY "Owner manage bundle_items"
  ON bundle_items FOR ALL USING (is_owner());

-- ── 3. Seed Bundles ─────────────────────────────────────────────────────────
INSERT INTO occasion_bundles (name, description, emoji, discount_pct, display_order) VALUES
  ('Birthday Celebration', 'Candles, balloons & a card — the perfect birthday trio!',  '🎂', 10, 1),
  ('Anniversary Romance',  'Flowers, chocolates & a custom topper for your sweetheart.','💑', 15, 2),
  ('Kids Party Pack',      'Balloons, candles, card & gift box — kids go wild!',        '🎈', 12, 3),
  ('Luxury Gift Set',      'Flowers, chocolates, gift box & topper — purely indulgent.','✨', 20, 4);

-- Seed bundle items via PL/pgSQL to ensure proper order
DO $$
DECLARE
  b_birthday    UUID;
  b_anniversary UUID;
  b_kids        UUID;
  b_luxury      UUID;
BEGIN
  SELECT id INTO b_birthday    FROM occasion_bundles WHERE name = 'Birthday Celebration' LIMIT 1;
  SELECT id INTO b_anniversary FROM occasion_bundles WHERE name = 'Anniversary Romance'  LIMIT 1;
  SELECT id INTO b_kids        FROM occasion_bundles WHERE name = 'Kids Party Pack'       LIMIT 1;
  SELECT id INTO b_luxury      FROM occasion_bundles WHERE name = 'Luxury Gift Set'       LIMIT 1;

  -- Birthday: Candles + Balloons + Greeting Card
  INSERT INTO bundle_items (bundle_id, addon_id)
  SELECT b_birthday, a.id FROM product_addons a
  WHERE a.name IN ('Birthday Candles (Pack of 12)', 'Balloon Bouquet (5 pieces)', 'Greeting Card')
  ON CONFLICT DO NOTHING;

  -- Anniversary: Flowers + Chocolate Box + Message Topper
  INSERT INTO bundle_items (bundle_id, addon_id)
  SELECT b_anniversary, a.id FROM product_addons a
  WHERE a.name IN ('Fresh Flower Arrangement', 'Belgian Chocolate Box', 'Custom Message Topper (Acrylic)')
  ON CONFLICT DO NOTHING;

  -- Kids Party: Balloons + Candles + Greeting Card + Gift Packaging
  INSERT INTO bundle_items (bundle_id, addon_id)
  SELECT b_kids, a.id FROM product_addons a
  WHERE a.name IN ('Balloon Bouquet (5 pieces)', 'Birthday Candles (Pack of 12)', 'Greeting Card', 'Premium Gift Box Packaging')
  ON CONFLICT DO NOTHING;

  -- Luxury: Flowers + Chocolate Box + Gift Packaging + Topper
  INSERT INTO bundle_items (bundle_id, addon_id)
  SELECT b_luxury, a.id FROM product_addons a
  WHERE a.name IN ('Fresh Flower Arrangement', 'Belgian Chocolate Box', 'Premium Gift Box Packaging', 'Custom Message Topper (Acrylic)')
  ON CONFLICT DO NOTHING;
END $$;

-- ── 4. Supabase Storage Bucket ──────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cake-reference-images',
  'cake-reference-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read cake references') THEN
    EXECUTE 'CREATE POLICY "Public read cake references" ON storage.objects FOR SELECT USING (bucket_id = ''cake-reference-images'')';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Anyone can upload cake references') THEN
    EXECUTE 'CREATE POLICY "Anyone can upload cake references" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''cake-reference-images'')';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Anyone can delete cake references') THEN
    EXECUTE 'CREATE POLICY "Anyone can delete cake references" ON storage.objects FOR DELETE USING (bucket_id = ''cake-reference-images'')';
  END IF;
END $$;
