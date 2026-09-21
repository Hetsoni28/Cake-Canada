-- ============================================================
-- MAISON CAKE CO.
-- Migration 006 — RLS Hardening & Security Audit
-- ============================================================
-- This migration:
--   1. Drops and replaces any weak policies with strict ones
--   2. Blocks direct INSERT on orders/payments (webhook-only)
--   3. Ensures cart_items WITH CHECK cannot cross-user
--   4. Revokes public schema privileges
--   5. Tightens audit_logs (service_role only for INSERT)
-- ============================================================

-- ── 0. Lock down public schema ────────────────────────────────
-- Revoke default CREATE privilege from public schema so anon
-- users cannot create tables or functions.
revoke create on schema public from public;

-- ============================================================
-- 1. PROFILES — tighten
-- ============================================================
-- Drop and recreate so we can add WITH CHECK on update
drop policy if exists "Users read own profile"   on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Owner manages profiles"   on public.profiles;

-- Customers can only read their own row
create policy "profiles: customer read own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

-- Customers can update ONLY their own row, and CANNOT change role
create policy "profiles: customer update own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = 'CUSTOMER'         -- cannot elevate own role
  );

-- Owner can do anything on any profile
create policy "profiles: owner full access"
  on public.profiles for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- 2. ORDERS — customers cannot INSERT directly
-- ============================================================
-- Orders are created ONLY via create_pending_order() RPC (SECURITY DEFINER).
-- Customers can only SELECT their own orders.
-- Customers CANNOT update or delete orders.
-- Owner has full access.

drop policy if exists "Customers read own orders" on public.orders;
drop policy if exists "Owner manages orders"       on public.orders;

-- Customers: read only, own orders
create policy "orders: customer read own"
  on public.orders for select to authenticated
  using (user_id = auth.uid());

-- NO insert policy for customers — create_pending_order() runs as SECURITY DEFINER
-- NO update policy for customers — status is changed by owner or webhook RPC
-- NO delete policy for customers

-- Owner: full control
create policy "orders: owner full access"
  on public.orders for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- 3. ORDER ITEMS — read-only for customers via orders join
-- ============================================================
drop policy if exists "Customers read own order items" on public.order_items;
drop policy if exists "Owner manages order items"      on public.order_items;

create policy "order_items: customer read own"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

create policy "order_items: owner full access"
  on public.order_items for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- 4. ORDER ITEM ADDONS — read-only for customers via orders join
-- ============================================================
drop policy if exists "Customers read own order addons" on public.order_item_addons;
drop policy if exists "Owner manages order addons"      on public.order_item_addons;

create policy "order_item_addons: customer read own"
  on public.order_item_addons for select to authenticated
  using (
    exists (
      select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.id = order_item_id
        and o.user_id = auth.uid()
    )
  );

create policy "order_item_addons: owner full access"
  on public.order_item_addons for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- 5. PAYMENTS — customers read only via orders join
-- ============================================================
-- Payments are written ONLY by confirm_order_payment() (SECURITY DEFINER).
-- Customers cannot insert, update, or delete payments.

drop policy if exists "Customers read own payments" on public.payments;
drop policy if exists "Owner manages payments"       on public.payments;

create policy "payments: customer read own"
  on public.payments for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

create policy "payments: owner full access"
  on public.payments for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- 6. CARTS — strict user isolation
-- ============================================================
drop policy if exists "Users manage own cart" on public.carts;

create policy "carts: customer own"
  on public.carts for all to authenticated
  using    (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- 7. CART ITEMS — strict user isolation via carts
-- ============================================================
drop policy if exists "Users manage own cart items" on public.cart_items;

create policy "cart_items: customer own"
  on public.cart_items for all to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 8. CART ITEM ADDONS — strict user isolation
-- ============================================================
drop policy if exists "Users manage own cart addons" on public.cart_item_addons;

create policy "cart_item_addons: customer own"
  on public.cart_item_addons for all to authenticated
  using (
    exists (
      select 1
      from public.cart_items ci
      join public.carts c on c.id = ci.cart_id
      where ci.id = cart_item_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.cart_items ci
      join public.carts c on c.id = ci.cart_id
      where ci.id = cart_item_id and c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 9. ADDRESSES — strict user isolation
-- ============================================================
drop policy if exists "Users manage own addresses" on public.addresses;
drop policy if exists "Owner reads addresses"       on public.addresses;

create policy "addresses: customer own"
  on public.addresses for all to authenticated
  using    (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "addresses: owner read"
  on public.addresses for select to authenticated
  using (public.is_owner());

-- ============================================================
-- 10. ORDER STATUS HISTORY — read-only for customers
-- ============================================================
drop policy if exists "Customers read own status history" on public.order_status_history;
drop policy if exists "Owner manages order history"       on public.order_status_history;

create policy "order_status_history: customer read own"
  on public.order_status_history for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "order_status_history: owner full access"
  on public.order_status_history for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- 11. DELIVERY SLOT RESERVATIONS
-- ============================================================
drop policy if exists "Customers read own reservations" on public.delivery_slot_reservations;
drop policy if exists "Owner manages reservations"      on public.delivery_slot_reservations;

create policy "reservations: customer read own"
  on public.delivery_slot_reservations for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "reservations: owner full access"
  on public.delivery_slot_reservations for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- 12. COUPON USAGES — customers read own, cannot forge
-- ============================================================
drop policy if exists "Customers read own coupon usage" on public.coupon_usages;
drop policy if exists "Owner manages coupon usage"       on public.coupon_usages;

-- Customers read only, cannot insert (coupon application is done via RPC)
create policy "coupon_usages: customer read own"
  on public.coupon_usages for select to authenticated
  using (user_id = auth.uid());

create policy "coupon_usages: owner full access"
  on public.coupon_usages for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- 13. REVIEWS — tighten
-- ============================================================
drop policy if exists "Anyone reads approved reviews"  on public.reviews;
drop policy if exists "Customers create own reviews"   on public.reviews;
drop policy if exists "Customers update own reviews"   on public.reviews;
drop policy if exists "Owner manages reviews"          on public.reviews;

-- Public can read approved reviews; owner reads all
create policy "reviews: public read approved"
  on public.reviews for select
  using (
    is_approved = true
    or (auth.uid() is not null and user_id = auth.uid())
    or public.is_owner()
  );

-- Customers can only insert a review for their OWN order
create policy "reviews: customer insert own order"
  on public.reviews for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
        and o.status = 'DELIVERED'  -- can only review delivered orders
    )
  );

-- Customers can update only their own pending (not yet approved) reviews
create policy "reviews: customer update own"
  on public.reviews for update to authenticated
  using (user_id = auth.uid() and is_approved = false)
  with check (user_id = auth.uid());

create policy "reviews: owner full access"
  on public.reviews for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- 14. NOTIFICATIONS — tighten
-- ============================================================
drop policy if exists "Users read own notifications"   on public.notifications;
drop policy if exists "Users update own notifications" on public.notifications;
drop policy if exists "Owner manages notifications"    on public.notifications;

create policy "notifications: customer read own"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

-- Customers can only mark their own notifications as read
create policy "notifications: customer mark read"
  on public.notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications: owner full access"
  on public.notifications for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================
-- 15. AUDIT LOGS — owner reads, service_role inserts only
-- ============================================================
drop policy if exists "Owner reads audit logs"   on public.audit_logs;
drop policy if exists "Owner inserts audit logs" on public.audit_logs;

-- Owner can read
create policy "audit_logs: owner read"
  on public.audit_logs for select to authenticated
  using (public.is_owner());

-- NO insert policy — service_role bypasses RLS and writes logs
-- This prevents customers from forging audit entries

-- ============================================================
-- 16. GRANT ONLY NEEDED PERMISSIONS TO anon / authenticated
-- ============================================================

-- anon (unauthenticated): read-only on public catalogue
grant select on public.categories        to anon;
grant select on public.products          to anon;
grant select on public.product_variants  to anon;
grant select on public.product_images    to anon;
grant select on public.product_addons    to anon;
grant select on public.delivery_zones    to anon;
grant select on public.delivery_slots    to anon;
grant select on public.site_settings     to anon;
grant select on public.homepage_sections to anon;
grant select on public.reviews           to anon;

-- authenticated users — RLS handles what they can see/do
grant select, insert, update, delete on public.profiles                  to authenticated;
grant select, insert, update, delete on public.carts                     to authenticated;
grant select, insert, update, delete on public.cart_items                to authenticated;
grant select, insert, update, delete on public.cart_item_addons          to authenticated;
grant select, insert, update, delete on public.addresses                 to authenticated;
grant select, insert, update, delete on public.wishlists                 to authenticated;
grant select                         on public.orders                    to authenticated;
grant select                         on public.order_items               to authenticated;
grant select                         on public.order_item_addons         to authenticated;
grant select                         on public.order_status_history      to authenticated;
grant select                         on public.payments                  to authenticated;
grant select                         on public.delivery_slot_reservations to authenticated;
grant select                         on public.coupon_usages             to authenticated;
grant select                         on public.notifications             to authenticated;
grant update                         on public.notifications             to authenticated;
grant select                         on public.categories                to authenticated;
grant select                         on public.products                  to authenticated;
grant select                         on public.product_variants          to authenticated;
grant select                         on public.product_images            to authenticated;
grant select                         on public.addons                    to authenticated;
grant select                         on public.product_addons            to authenticated;
grant select                         on public.bundles                   to authenticated;
grant select                         on public.bundle_items              to authenticated;
grant select                         on public.delivery_zones            to authenticated;
grant select                         on public.delivery_slots            to authenticated;
grant select                         on public.site_settings             to authenticated;
grant select                         on public.homepage_sections         to authenticated;
grant select                         on public.reviews                   to authenticated;
grant insert, update                 on public.reviews                   to authenticated;
grant select                         on public.coupons                   to authenticated;

-- ============================================================
-- END OF MIGRATION 006
-- ============================================================
