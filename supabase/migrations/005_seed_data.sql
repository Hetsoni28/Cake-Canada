-- ============================================================
-- CANADIAN CAKE ORDERING PLATFORM
-- Migration 005 — Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================

insert into public.categories (name, slug, description, display_order, is_active) values
  ('Birthday',       'birthday',       'Cakes made for birthday celebrations.',          1, true),
  ('Anniversary',    'anniversary',    'Elegant cakes for meaningful milestones.',        2, true),
  ('Wedding',        'wedding',        'Refined cakes for beautiful beginnings.',         3, true),
  ('Kids',           'kids',           'Fun and colourful cakes for little celebrations.',4, true),
  ('Chocolate',      'chocolate',      'Rich, indulgent chocolate favourites.',           5, true),
  ('Designer Cakes', 'designer-cakes', 'Statement cakes with handcrafted details.',       6, true),
  ('Eggless',        'eggless',        'Eggless options, made with the same love.',       7, true)
on conflict (slug) do nothing;

-- ============================================================
-- DELIVERY ZONES — Greater Toronto Area (Ontario)
-- Postal code prefixes (first 3 characters of Canadian postal code)
-- HST = 13% in Ontario — owner can update in site_settings
-- ============================================================

insert into public.delivery_zones (name, postal_prefix, delivery_fee, minimum_order, estimated_minutes, is_active) values
  ('Downtown Toronto',   'M5V', 8.99,  40.00, 60,  true),
  ('Midtown Toronto',    'M4Y', 8.99,  40.00, 60,  true),
  ('North Toronto',      'M2N', 9.99,  40.00, 75,  true),
  ('East Toronto',       'M4E', 9.99,  40.00, 75,  true),
  ('West Toronto',       'M6P', 9.99,  40.00, 75,  true),
  ('Scarborough',        'M1P', 12.99, 50.00, 90,  true),
  ('North York',         'M3A', 10.99, 45.00, 80,  true),
  ('Etobicoke',          'M9A', 10.99, 45.00, 80,  true),
  ('Mississauga Central','L5B', 14.99, 60.00, 105, true),
  ('Brampton',           'L6P', 15.99, 60.00, 110, true),
  ('Markham',            'L3P', 13.99, 55.00, 100, true),
  ('Vaughan',            'L4K', 13.99, 55.00, 100, true),
  ('Richmond Hill',      'L4C', 13.99, 55.00, 100, true)
on conflict do nothing;

-- ============================================================
-- DELIVERY SLOTS
-- ============================================================

insert into public.delivery_slots (label, start_time, end_time, max_orders, is_active) values
  ('Morning (10am - 12pm)',   '10:00', '12:00', 8,  true),
  ('Afternoon (12pm - 3pm)',  '12:00', '15:00', 10, true),
  ('Evening (3pm - 6pm)',     '15:00', '18:00', 10, true),
  ('Express (6pm - 7pm)',     '18:00', '19:00', 4,  true)
on conflict do nothing;

-- ============================================================
-- SITE SETTINGS — update tax_rate to your province's rate
-- Ontario HST = 0.1300
-- British Columbia = 0.1200
-- Alberta = 0.0500 (GST only)
-- Quebec = 0.1498 (GST 5% + QST 9.975%)
-- ============================================================

update public.site_settings set
  business_name               = 'Maison Cake Co.',
  phone                       = '+1 (416) 555-0198',
  email                       = 'hello@maisoncakeco.ca',
  city                        = 'Toronto',
  province                    = 'Ontario',
  currency                    = 'CAD',
  tax_rate                    = 0.1300,   -- Ontario HST 13%
  same_day_cutoff             = '10:00',
  minimum_preparation_minutes = 2880,     -- 48 hours
  timezone                    = 'America/Toronto',
  business_hours              = '{
    "monday":    {"open": false},
    "tuesday":   {"open": true, "from": "10:00", "to": "18:00"},
    "wednesday": {"open": true, "from": "10:00", "to": "18:00"},
    "thursday":  {"open": true, "from": "10:00", "to": "18:00"},
    "friday":    {"open": true, "from": "10:00", "to": "18:00"},
    "saturday":  {"open": true, "from": "09:00", "to": "17:00"},
    "sunday":    {"open": true, "from": "10:00", "to": "16:00"}
  }'::jsonb,
  social_links = '{
    "instagram": "https://instagram.com/maisoncakeco",
    "facebook":  "",
    "tiktok":    ""
  }'::jsonb;

-- ============================================================
-- END OF MIGRATION 005 (seed)
-- ============================================================

