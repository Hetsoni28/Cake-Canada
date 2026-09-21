-- ============================================================
-- CANADIAN CAKE ORDERING PLATFORM
-- Supabase / PostgreSQL
-- Migration 001 — Initial Schema
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. ENUMS
-- ============================================================

do $$ begin
  create type public.user_role as enum ('CUSTOMER', 'OWNER');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum (
    'PENDING', 'CONFIRMED', 'PREPARING', 'READY',
    'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum (
    'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_provider as enum ('STRIPE');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.discount_type as enum ('PERCENTAGE', 'FIXED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.reservation_status as enum (
    'ACTIVE', 'RELEASED', 'EXPIRED', 'CONSUMED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_type as enum (
    'ORDER_CONFIRMED', 'PAYMENT_CONFIRMED', 'ORDER_PREPARING',
    'ORDER_READY', 'OUT_FOR_DELIVERY', 'ORDER_DELIVERED',
    'ORDER_CANCELLED', 'REFUND_ISSUED', 'REVIEW_REQUEST'
  );
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 2. COMMON UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 3. PROFILES — connected to auth.users
-- ============================================================

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text,
  role          public.user_role not null default 'CUSTOMER',
  avatar_url    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- 4. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 5. OWNER HELPER FUNCTION
-- ============================================================

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'OWNER' and is_active = true
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- ============================================================
-- 6. CATEGORIES
-- ============================================================

create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  image_url     text,
  display_order integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_categories_active_order
  on public.categories(is_active, display_order);

create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ============================================================
-- 7. PRODUCTS
-- ============================================================

create table if not exists public.products (
  id                          uuid primary key default gen_random_uuid(),
  category_id                 uuid references public.categories(id) on delete set null,
  name                        text not null,
  slug                        text not null unique,
  short_description           text,
  description                 text,
  base_price                  numeric(12,2) not null default 0 check (base_price >= 0),
  preparation_time_minutes    integer not null default 1440 check (preparation_time_minutes >= 0),
  is_featured                 boolean not null default false,
  is_best_seller              boolean not null default false,
  is_available                boolean not null default true,
  is_customizable             boolean not null default false,
  is_eggless_available        boolean not null default false,
  meta_title                  text,
  meta_description            text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists idx_products_category    on public.products(category_id);
create index if not exists idx_products_available   on public.products(is_available);
create index if not exists idx_products_featured    on public.products(is_featured);
create index if not exists idx_products_best_seller on public.products(is_best_seller);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================
-- 8. PRODUCT VARIANTS
-- ============================================================

create table if not exists public.product_variants (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products(id) on delete cascade,
  name             text not null,
  weight_kg        numeric(5,2),
  flavor           text,
  frosting         text,
  eggless          boolean not null default false,
  price            numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  is_available     boolean not null default true,
  display_order    integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_product_variants_product   on public.product_variants(product_id);
create index if not exists idx_product_variants_available on public.product_variants(is_available);

create trigger trg_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ============================================================
-- 9. PRODUCT IMAGES
-- ============================================================

create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  storage_path  text not null,
  alt_text      text,
  display_order integer not null default 0,
  is_primary    boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_product_images_product on public.product_images(product_id);

-- ============================================================
-- 10. ADD-ONS
-- ============================================================

create table if not exists public.addons (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  price         numeric(12,2) not null default 0 check (price >= 0),
  image_url     text,
  is_available  boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_addons_available on public.addons(is_available);

create trigger trg_addons_updated_at
  before update on public.addons
  for each row execute function public.set_updated_at();

-- ============================================================
-- 11. PRODUCT ↔ ADDON JOIN
-- ============================================================

create table if not exists public.product_addons (
  product_id uuid not null references public.products(id) on delete cascade,
  addon_id   uuid not null references public.addons(id)   on delete cascade,
  primary key (product_id, addon_id)
);

-- ============================================================
-- 12. BUNDLES
-- ============================================================

create table if not exists public.bundles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  price       numeric(12,2) not null check (price >= 0),
  image_url   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_bundles_updated_at
  before update on public.bundles
  for each row execute function public.set_updated_at();

create table if not exists public.bundle_items (
  id         uuid primary key default gen_random_uuid(),
  bundle_id  uuid not null references public.bundles(id)  on delete cascade,
  product_id uuid          references public.products(id) on delete set null,
  addon_id   uuid          references public.addons(id)   on delete set null,
  quantity   integer not null default 1 check (quantity > 0),
  check (
    (product_id is not null and addon_id is null)
    or
    (product_id is null and addon_id is not null)
  )
);

-- ============================================================
-- 13. WISHLIST
-- ============================================================

create table if not exists public.wishlists (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ============================================================
-- 14. CARTS
-- ============================================================

create table if not exists public.carts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_carts_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

-- ============================================================
-- 15. CART ITEMS
-- ============================================================

create table if not exists public.cart_items (
  id                    uuid primary key default gen_random_uuid(),
  cart_id               uuid not null references public.carts(id)            on delete cascade,
  product_id            uuid          references public.products(id)         on delete set null,
  variant_id            uuid          references public.product_variants(id) on delete set null,
  quantity              integer not null check (quantity > 0),
  unit_price            numeric(12,2) not null check (unit_price >= 0),
  customization         jsonb not null default '{}'::jsonb,
  reference_image_path  text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_cart_items_cart on public.cart_items(cart_id);

create trigger trg_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- ============================================================
-- 16. CART ITEM ADDONS
-- ============================================================

create table if not exists public.cart_item_addons (
  id           uuid primary key default gen_random_uuid(),
  cart_item_id uuid not null references public.cart_items(id) on delete cascade,
  addon_id     uuid          references public.addons(id)     on delete set null,
  addon_name   text not null,
  unit_price   numeric(12,2) not null check (unit_price >= 0),
  quantity     integer not null default 1 check (quantity > 0)
);

-- ============================================================
-- 17. ADDRESSES
-- ============================================================

create table if not exists public.addresses (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  full_name             text not null,
  phone                 text not null,
  address_line_1        text not null,
  address_line_2        text,
  city                  text not null,
  province              text not null,
  postal_code           text not null,
  delivery_instructions text,
  is_default            boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_addresses_user on public.addresses(user_id);

create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

-- ============================================================
-- 18. DELIVERY ZONES
-- ============================================================

create table if not exists public.delivery_zones (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  postal_prefix     text not null unique,  -- unique so seed on conflict works
  delivery_fee      numeric(12,2) not null default 0 check (delivery_fee >= 0),
  minimum_order     numeric(12,2) not null default 0 check (minimum_order >= 0),
  estimated_minutes integer,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_delivery_zones_prefix on public.delivery_zones(postal_prefix);

create trigger trg_delivery_zones_updated_at
  before update on public.delivery_zones
  for each row execute function public.set_updated_at();

-- ============================================================
-- 19. DELIVERY SLOTS
-- ============================================================

create table if not exists public.delivery_slots (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  start_time  time not null,
  end_time    time not null,
  max_orders  integer not null check (max_orders > 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (end_time > start_time)
);

create trigger trg_delivery_slots_updated_at
  before update on public.delivery_slots
  for each row execute function public.set_updated_at();

-- ============================================================
-- 20. DELIVERY BLACKOUT DATES
-- ============================================================

create table if not exists public.delivery_blackout_dates (
  id           uuid primary key default gen_random_uuid(),
  blackout_date date not null unique,
  reason       text,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- 21. SITE SETTINGS
-- ============================================================

create table if not exists public.site_settings (
  id                          uuid primary key default gen_random_uuid(),
  business_name               text not null,
  phone                       text,
  email                       text,
  address                     text,
  province                    text,
  city                        text,
  currency                    text not null default 'CAD',
  -- tax_rate is configurable per province/product type
  -- HST (ON) = 0.13, GST only (AB) = 0.05, etc. — set by owner
  tax_rate                    numeric(6,4) not null default 0 check (tax_rate >= 0),
  same_day_cutoff             time,
  minimum_preparation_minutes integer not null default 1440 check (minimum_preparation_minutes >= 0),
  timezone                    text not null default 'America/Toronto',
  business_hours              jsonb not null default '{}'::jsonb,
  social_links                jsonb not null default '{}'::jsonb,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ============================================================
-- 22. COUPONS
-- ============================================================

create table if not exists public.coupons (
  id                      uuid primary key default gen_random_uuid(),
  code                    text not null unique,
  discount_type           public.discount_type not null,
  discount_value          numeric(12,2) not null check (discount_value > 0),
  minimum_order_amount    numeric(12,2) not null default 0 check (minimum_order_amount >= 0),
  maximum_discount_amount numeric(12,2),
  usage_limit             integer check (usage_limit is null or usage_limit > 0),
  per_customer_limit      integer check (per_customer_limit is null or per_customer_limit > 0),
  starts_at               timestamptz,
  expires_at              timestamptz,
  is_active               boolean not null default true,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (
    (discount_type = 'PERCENTAGE' and discount_value <= 100)
    or discount_type = 'FIXED'
  ),
  check (expires_at is null or starts_at is null or expires_at > starts_at)
);

create index if not exists idx_coupons_code on public.coupons(code);

create trigger trg_coupons_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

-- ============================================================
-- 23. ORDERS
-- Snapshot all customer + delivery + pricing at time of order.
-- ============================================================

create table if not exists public.orders (
  id                          uuid primary key default gen_random_uuid(),
  order_number                text not null unique,
  user_id                     uuid references public.profiles(id) on delete set null,
  status                      public.order_status   not null default 'PENDING',
  payment_status              public.payment_status not null default 'PENDING',
  currency                    text not null default 'CAD',
  -- Customer snapshot
  customer_name               text not null,
  customer_email              text not null,
  customer_phone              text not null,
  -- Delivery snapshot
  delivery_full_name          text not null,
  delivery_phone              text not null,
  delivery_address_line_1     text not null,
  delivery_address_line_2     text,
  delivery_city               text not null,
  delivery_province           text not null,
  delivery_postal_code        text not null,
  delivery_date               date not null,
  delivery_slot_id            uuid references public.delivery_slots(id) on delete set null,
  delivery_slot_label         text,
  delivery_instructions       text,
  -- Pricing (all calculated server-side, never trusted from client)
  subtotal                    numeric(12,2) not null default 0 check (subtotal >= 0),
  discount_amount             numeric(12,2) not null default 0 check (discount_amount >= 0),
  delivery_fee                numeric(12,2) not null default 0 check (delivery_fee >= 0),
  tax_rate                    numeric(6,4)  not null default 0 check (tax_rate >= 0),
  tax_amount                  numeric(12,2) not null default 0 check (tax_amount >= 0),
  total_amount                numeric(12,2) not null default 0 check (total_amount >= 0),
  -- Coupon snapshot
  coupon_id                   uuid references public.coupons(id) on delete set null,
  coupon_code                 text,
  -- Stripe (set by server/webhook ONLY — never by client)
  stripe_checkout_session_id  text unique,
  stripe_payment_intent_id    text unique,
  -- Notes
  customer_note               text,
  internal_note               text,
  -- Timestamps
  placed_at                   timestamptz,
  confirmed_at                timestamptz,
  delivered_at                timestamptz,
  cancelled_at                timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists idx_orders_user          on public.orders(user_id);
create index if not exists idx_orders_status        on public.orders(status);
create index if not exists idx_orders_payment       on public.orders(payment_status);
create index if not exists idx_orders_delivery_date on public.orders(delivery_date);
create index if not exists idx_orders_created_at    on public.orders(created_at desc);

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- 24. ORDER ITEMS — historical price snapshot
-- ============================================================

create table if not exists public.order_items (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references public.orders(id)           on delete cascade,
  product_id            uuid          references public.products(id)         on delete set null,
  variant_id            uuid          references public.product_variants(id) on delete set null,
  product_name          text not null,
  variant_name          text,
  unit_price            numeric(12,2) not null check (unit_price >= 0),
  quantity              integer not null check (quantity > 0),
  line_total            numeric(12,2) not null check (line_total >= 0),
  customization         jsonb not null default '{}'::jsonb,
  reference_image_path  text,
  created_at            timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ============================================================
-- 25. ORDER ITEM ADDONS — historical snapshot
-- ============================================================

create table if not exists public.order_item_addons (
  id            uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  addon_id      uuid          references public.addons(id)      on delete set null,
  addon_name    text not null,
  unit_price    numeric(12,2) not null check (unit_price >= 0),
  quantity      integer not null default 1 check (quantity > 0),
  line_total    numeric(12,2) not null check (line_total >= 0)
);

-- ============================================================
-- 26. ORDER STATUS HISTORY
-- ============================================================

create table if not exists public.order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id)   on delete cascade,
  old_status  public.order_status,
  new_status  public.order_status not null,
  changed_by  uuid references public.profiles(id)          on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_order_status_history_order
  on public.order_status_history(order_id, created_at);

-- ============================================================
-- 27. PAYMENTS — updated by Stripe webhook ONLY
-- ============================================================

create table if not exists public.payments (
  id                          uuid primary key default gen_random_uuid(),
  order_id                    uuid not null references public.orders(id) on delete cascade,
  provider                    public.payment_provider not null default 'STRIPE',
  provider_payment_id         text,
  provider_checkout_session_id text,
  amount                      numeric(12,2) not null check (amount >= 0),
  currency                    text not null default 'CAD',
  status                      public.payment_status not null default 'PENDING',
  raw_event_id                text unique,
  paid_at                     timestamptz,
  refunded_at                 timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists idx_payments_order       on public.payments(order_id);
create index if not exists idx_payments_provider_id on public.payments(provider_payment_id);

create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ============================================================
-- 28. DELIVERY SLOT RESERVATIONS
-- ============================================================

create table if not exists public.delivery_slot_reservations (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null unique references public.orders(id)         on delete cascade,
  delivery_slot_id uuid not null references public.delivery_slots(id)        on delete restrict,
  delivery_date    date not null,
  status           public.reservation_status not null default 'ACTIVE',
  expires_at       timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_slot_reservations_slot_date
  on public.delivery_slot_reservations(delivery_slot_id, delivery_date);

-- ============================================================
-- 29. COUPON USAGE
-- ============================================================

create table if not exists public.coupon_usages (
  id              uuid primary key default gen_random_uuid(),
  coupon_id       uuid not null references public.coupons(id)  on delete cascade,
  user_id         uuid          references public.profiles(id) on delete set null,
  order_id        uuid not null unique references public.orders(id) on delete cascade,
  discount_amount numeric(12,2) not null check (discount_amount >= 0),
  created_at      timestamptz not null default now()
);

create index if not exists idx_coupon_usage_coupon on public.coupon_usages(coupon_id);
create index if not exists idx_coupon_usage_user   on public.coupon_usages(user_id);

-- ============================================================
-- 30. REVIEWS
-- ============================================================

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id)  on delete cascade,
  user_id     uuid not null references public.profiles(id)  on delete cascade,
  order_id    uuid          references public.orders(id)    on delete set null,
  rating      integer not null check (rating between 1 and 5),
  title       text,
  review_text text,
  image_url   text,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, product_id, order_id)
);

create index if not exists idx_reviews_product  on public.reviews(product_id);
create index if not exists idx_reviews_approved on public.reviews(is_approved);

create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ============================================================
-- 31. NOTIFICATIONS
-- ============================================================

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  order_id   uuid          references public.orders(id)  on delete set null,
  type       public.notification_type not null,
  title      text not null,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user
  on public.notifications(user_id, created_at desc);

-- ============================================================
-- 32. HOMEPAGE / CONTENT SECTIONS
-- ============================================================

create table if not exists public.homepage_sections (
  id            uuid primary key default gen_random_uuid(),
  section_key   text not null unique,
  title         text,
  subtitle      text,
  content       jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_homepage_sections_order
  on public.homepage_sections(display_order);

create trigger trg_homepage_sections_updated_at
  before update on public.homepage_sections
  for each row execute function public.set_updated_at();

-- ============================================================
-- 33. AUDIT LOG
-- ============================================================

create table if not exists public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action        text not null,
  entity_type   text not null,
  entity_id     uuid,
  old_data      jsonb,
  new_data      jsonb,
  ip_address    inet,
  user_agent    text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_audit_logs_actor   on public.audit_logs(actor_user_id);
create index if not exists idx_audit_logs_entity  on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);

-- ============================================================
-- 34. STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public) values
  ('product-images',   'product-images',   true),
  ('category-images',  'category-images',  true),
  ('cake-references',  'cake-references',  false),
  ('review-images',    'review-images',    false)
on conflict (id) do nothing;

-- ============================================================
-- 35. STORAGE POLICIES
-- ============================================================

-- Product images: public read, owner write
create policy "Product images public read"   on storage.objects for select using (bucket_id = 'product-images');
create policy "Owner product image upload"   on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_owner());
create policy "Owner product image update"   on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_owner()) with check (bucket_id = 'product-images' and public.is_owner());
create policy "Owner product image delete"   on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_owner());

-- Category images: public read, owner write
create policy "Category images public read"  on storage.objects for select using (bucket_id = 'category-images');
create policy "Owner category image upload"  on storage.objects for insert to authenticated with check (bucket_id = 'category-images' and public.is_owner());
create policy "Owner category image update"  on storage.objects for update to authenticated using (bucket_id = 'category-images' and public.is_owner()) with check (bucket_id = 'category-images' and public.is_owner());
create policy "Owner category image delete"  on storage.objects for delete to authenticated using (bucket_id = 'category-images' and public.is_owner());

-- Cake reference images: authenticated upload (customer), owner reads all
create policy "Customers upload cake references" on storage.objects for insert to authenticated with check (bucket_id = 'cake-references');
create policy "Owner reads cake references"      on storage.objects for select to authenticated using (bucket_id = 'cake-references' and public.is_owner());

-- Review images: authenticated upload, public read
create policy "Customers upload review images"   on storage.objects for insert to authenticated with check (bucket_id = 'review-images');
create policy "Review images public read"        on storage.objects for select using (bucket_id = 'review-images');

-- ============================================================
-- 36. ROW LEVEL SECURITY — ENABLE
-- ============================================================

alter table public.profiles                    enable row level security;
alter table public.categories                  enable row level security;
alter table public.products                    enable row level security;
alter table public.product_variants            enable row level security;
alter table public.product_images              enable row level security;
alter table public.addons                      enable row level security;
alter table public.product_addons              enable row level security;
alter table public.bundles                     enable row level security;
alter table public.bundle_items                enable row level security;
alter table public.wishlists                   enable row level security;
alter table public.carts                       enable row level security;
alter table public.cart_items                  enable row level security;
alter table public.cart_item_addons            enable row level security;
alter table public.addresses                   enable row level security;
alter table public.delivery_zones              enable row level security;
alter table public.delivery_slots              enable row level security;
alter table public.delivery_blackout_dates     enable row level security;
alter table public.site_settings               enable row level security;
alter table public.coupons                     enable row level security;
alter table public.orders                      enable row level security;
alter table public.order_items                 enable row level security;
alter table public.order_item_addons           enable row level security;
alter table public.order_status_history        enable row level security;
alter table public.payments                    enable row level security;
alter table public.delivery_slot_reservations  enable row level security;
alter table public.coupon_usages               enable row level security;
alter table public.reviews                     enable row level security;
alter table public.notifications               enable row level security;
alter table public.homepage_sections           enable row level security;
alter table public.audit_logs                  enable row level security;

-- ============================================================
-- 37. PROFILES POLICIES
-- ============================================================

create policy "Users read own profile"    on public.profiles for select to authenticated using (id = auth.uid() or public.is_owner());
create policy "Users update own profile"  on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Owner manages profiles"    on public.profiles for all    to authenticated using (public.is_owner()) with check (public.is_owner());

-- ============================================================
-- 38. CATALOG POLICIES
-- ============================================================

create policy "Anyone reads active categories"   on public.categories      for select using (is_active = true or public.is_owner());
create policy "Owner manages categories"         on public.categories      for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads available products"  on public.products        for select using (is_available = true or public.is_owner());
create policy "Owner manages products"           on public.products        for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads available variants"  on public.product_variants for select using (is_available = true or public.is_owner());
create policy "Owner manages variants"           on public.product_variants for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads product images"      on public.product_images  for select using (true);
create policy "Owner manages product images"     on public.product_images  for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads available addons"    on public.addons          for select using (is_available = true or public.is_owner());
create policy "Owner manages addons"             on public.addons          for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads product addons"      on public.product_addons  for select using (true);
create policy "Owner manages product addons"     on public.product_addons  for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads active bundles"      on public.bundles         for select using (is_active = true or public.is_owner());
create policy "Owner manages bundles"            on public.bundles         for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads bundle items"        on public.bundle_items    for select using (true);
create policy "Owner manages bundle items"       on public.bundle_items    for all    to authenticated using (public.is_owner()) with check (public.is_owner());

-- ============================================================
-- 39. WISHLIST, CART, ADDRESSES POLICIES
-- ============================================================

create policy "Users manage own wishlist"      on public.wishlists         for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Owner views wishlists"          on public.wishlists         for select to authenticated using (public.is_owner());

create policy "Users manage own cart"          on public.carts             for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users manage own cart items"    on public.cart_items        for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

create policy "Users manage own cart addons"   on public.cart_item_addons  for all to authenticated
  using (exists (select 1 from public.cart_items ci join public.carts c on c.id = ci.cart_id where ci.id = cart_item_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.cart_items ci join public.carts c on c.id = ci.cart_id where ci.id = cart_item_id and c.user_id = auth.uid()));

create policy "Users manage own addresses"     on public.addresses         for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Owner reads addresses"          on public.addresses         for select to authenticated using (public.is_owner());

-- ============================================================
-- 40. DELIVERY, SETTINGS, COUPON POLICIES
-- ============================================================

create policy "Anyone reads active delivery zones"    on public.delivery_zones           for select using (is_active = true or public.is_owner());
create policy "Owner manages delivery zones"          on public.delivery_zones           for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads active delivery slots"    on public.delivery_slots           for select using (is_active = true or public.is_owner());
create policy "Owner manages delivery slots"          on public.delivery_slots           for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads delivery blackouts"       on public.delivery_blackout_dates  for select using (true);
create policy "Owner manages delivery blackouts"      on public.delivery_blackout_dates  for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads site settings"            on public.site_settings            for select using (true);
create policy "Owner manages site settings"           on public.site_settings            for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Customers read active coupons"         on public.coupons                  for select to authenticated using (is_active = true or public.is_owner());
create policy "Owner manages coupons"                 on public.coupons                  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- ============================================================
-- 41. ORDER, PAYMENT, REVIEW, NOTIFICATION POLICIES
-- ============================================================

create policy "Customers read own orders"         on public.orders              for select to authenticated using (user_id = auth.uid());
create policy "Owner manages orders"              on public.orders              for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Customers read own order items"    on public.order_items         for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Owner manages order items"         on public.order_items         for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Customers read own order addons"   on public.order_item_addons   for select to authenticated using (exists (select 1 from public.order_items oi join public.orders o on o.id = oi.order_id where oi.id = order_item_id and o.user_id = auth.uid()));
create policy "Owner manages order addons"        on public.order_item_addons   for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Customers read own status history" on public.order_status_history for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Owner manages order history"       on public.order_status_history for all    to authenticated using (public.is_owner()) with check (public.is_owner());

-- Payments: customers READ only — Stripe webhook/server writes
create policy "Customers read own payments"       on public.payments            for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Owner manages payments"            on public.payments            for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Customers read own reservations"   on public.delivery_slot_reservations for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Owner manages reservations"        on public.delivery_slot_reservations for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Customers read own coupon usage"   on public.coupon_usages       for select to authenticated using (user_id = auth.uid());
create policy "Owner manages coupon usage"        on public.coupon_usages       for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads approved reviews"     on public.reviews             for select using (is_approved = true or (auth.uid() is not null and user_id = auth.uid()) or public.is_owner());
create policy "Customers create own reviews"      on public.reviews             for insert to authenticated with check (user_id = auth.uid());
create policy "Customers update own reviews"      on public.reviews             for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Owner manages reviews"             on public.reviews             for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Users read own notifications"      on public.notifications       for select to authenticated using (user_id = auth.uid());
create policy "Users update own notifications"    on public.notifications       for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Owner manages notifications"       on public.notifications       for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Anyone reads active homepage sections" on public.homepage_sections for select using (is_active = true or public.is_owner());
create policy "Owner manages homepage sections"       on public.homepage_sections for all    to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "Owner reads audit logs"            on public.audit_logs          for select to authenticated using (public.is_owner());
create policy "Owner inserts audit logs"          on public.audit_logs          for insert to authenticated with check (public.is_owner());

-- ============================================================
-- 42. DEFAULT SITE SETTINGS SEED
-- ============================================================

insert into public.site_settings (business_name, currency, tax_rate, timezone)
values ('Maison Cake Co.', 'CAD', 0, 'America/Toronto')
on conflict do nothing;

-- ============================================================
-- END OF MIGRATION 001
-- ============================================================

