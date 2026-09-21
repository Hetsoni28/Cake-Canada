-- ============================================================
-- CANADIAN CAKE ORDERING PLATFORM
-- Migration 002 — Secure Server-Side Functions
--
-- These functions run with SECURITY DEFINER meaning they execute
-- with the privileges of the function owner (postgres), NOT the
-- calling user. This is intentional — it allows us to enforce
-- server-side business logic that clients cannot bypass via RLS.
-- ============================================================

-- ============================================================
-- 1. GENERATE ORDER NUMBER
-- ============================================================

create or replace function public.generate_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_date   text := to_char(now() at time zone 'America/Toronto', 'YYYYMMDD');
  v_seq    bigint;
  v_result text;
begin
  -- Simple atomic sequence using a counter in site_settings is an option,
  -- but here we use a date-scoped count of existing orders for simplicity.
  select count(*) + 1
  into   v_seq
  from   public.orders
  where  created_at::date = (now() at time zone 'America/Toronto')::date;

  v_result := 'ORD-' || v_date || '-' || lpad(v_seq::text, 4, '0');
  return v_result;
end;
$$;

revoke all on function public.generate_order_number() from public;
grant execute on function public.generate_order_number() to service_role;

-- ============================================================
-- 2. VALIDATE COUPON
-- Returns discount_amount (0 if invalid/expired/exhausted)
-- ============================================================

create or replace function public.validate_coupon(
  p_code             text,
  p_subtotal         numeric,
  p_user_id          uuid
)
returns table (
  is_valid            boolean,
  discount_type       public.discount_type,
  discount_value      numeric,
  discount_amount     numeric,
  error_message       text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon     public.coupons%rowtype;
  v_usage_count integer;
  v_user_usage  integer;
  v_discount    numeric;
begin
  -- Fetch coupon
  select * into v_coupon
  from   public.coupons c
  where  upper(c.code) = upper(p_code)
    and  c.is_active = true;

  if not found then
    return query select false, null::public.discount_type, null::numeric, 0::numeric, 'Coupon not found or inactive'::text;
    return;
  end if;

  -- Check validity window
  if v_coupon.starts_at is not null and now() < v_coupon.starts_at then
    return query select false, null::public.discount_type, null::numeric, 0::numeric, 'Coupon not yet active'::text;
    return;
  end if;

  if v_coupon.expires_at is not null and now() > v_coupon.expires_at then
    return query select false, null::public.discount_type, null::numeric, 0::numeric, 'Coupon has expired'::text;
    return;
  end if;

  -- Check minimum order
  if p_subtotal < v_coupon.minimum_order_amount then
    return query select false, null::public.discount_type, null::numeric, 0::numeric,
      ('Minimum order of $' || v_coupon.minimum_order_amount || ' required')::text;
    return;
  end if;

  -- Check total usage limit
  if v_coupon.usage_limit is not null then
    select count(*) into v_usage_count
    from   public.coupon_usages
    where  coupon_id = v_coupon.id;

    if v_usage_count >= v_coupon.usage_limit then
      return query select false, null::public.discount_type, null::numeric, 0::numeric, 'Coupon usage limit reached'::text;
      return;
    end if;
  end if;

  -- Check per-customer limit
  if v_coupon.per_customer_limit is not null and p_user_id is not null then
    select count(*) into v_user_usage
    from   public.coupon_usages
    where  coupon_id = v_coupon.id
      and  user_id = p_user_id;

    if v_user_usage >= v_coupon.per_customer_limit then
      return query select false, null::public.discount_type, null::numeric, 0::numeric, 'You have already used this coupon'::text;
      return;
    end if;
  end if;

  -- Calculate discount
  if v_coupon.discount_type = 'PERCENTAGE' then
    v_discount := round(p_subtotal * (v_coupon.discount_value / 100), 2);
    if v_coupon.maximum_discount_amount is not null then
      v_discount := least(v_discount, v_coupon.maximum_discount_amount);
    end if;
  else
    v_discount := least(v_coupon.discount_value, p_subtotal);
  end if;

  return query select true, v_coupon.discount_type, v_coupon.discount_value, v_discount, null::text;
end;
$$;

revoke all on function public.validate_coupon(text, numeric, uuid) from public;
grant execute on function public.validate_coupon(text, numeric, uuid) to authenticated, service_role;

-- ============================================================
-- 3. CALCULATE DELIVERY FEE
-- ============================================================

create or replace function public.calculate_delivery_fee(
  p_postal_code text
)
returns table (
  zone_id        uuid,
  zone_name      text,
  delivery_fee   numeric,
  minimum_order  numeric,
  is_serviceable boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text := upper(substring(p_postal_code from 1 for 3));
  v_zone   public.delivery_zones%rowtype;
begin
  select * into v_zone
  from   public.delivery_zones
  where  upper(postal_prefix) = v_prefix
    and  is_active = true
  limit  1;

  if found then
    return query select v_zone.id, v_zone.name, v_zone.delivery_fee, v_zone.minimum_order, true;
  else
    return query select null::uuid, 'Outside delivery area'::text, 0::numeric, 0::numeric, false;
  end if;
end;
$$;

revoke all on function public.calculate_delivery_fee(text) from public;
grant execute on function public.calculate_delivery_fee(text) to anon, authenticated, service_role;

-- ============================================================
-- 4. CHECK SLOT AVAILABILITY
-- ============================================================

create or replace function public.check_slot_availability(
  p_slot_id     uuid,
  p_date        date
)
returns table (
  is_available  boolean,
  slots_left    integer,
  reason        text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot          public.delivery_slots%rowtype;
  v_reserved      integer;
  v_is_blackout   boolean;
begin
  -- Check slot exists
  select * into v_slot
  from   public.delivery_slots
  where  id = p_slot_id and is_active = true;

  if not found then
    return query select false, 0, 'Delivery slot not available'::text;
    return;
  end if;

  -- Check blackout
  select exists (
    select 1 from public.delivery_blackout_dates
    where blackout_date = p_date
  ) into v_is_blackout;

  if v_is_blackout then
    return query select false, 0, 'No deliveries on this date'::text;
    return;
  end if;

  -- Count active reservations
  select count(*) into v_reserved
  from   public.delivery_slot_reservations
  where  delivery_slot_id = p_slot_id
    and  delivery_date = p_date
    and  status in ('ACTIVE', 'CONSUMED');

  if v_reserved >= v_slot.max_orders then
    return query select false, 0, 'This delivery slot is fully booked'::text;
    return;
  end if;

  return query select true, (v_slot.max_orders - v_reserved)::integer, null::text;
end;
$$;

revoke all on function public.check_slot_availability(uuid, date) from public;
grant execute on function public.check_slot_availability(uuid, date) to anon, authenticated, service_role;

-- ============================================================
-- 5. CREATE PENDING ORDER (server-side, called from Next.js)
-- This function validates everything and creates the order.
-- The client NEVER sets prices — they are always re-calculated here.
-- ============================================================

create or replace function public.create_pending_order(
  p_user_id              uuid,
  p_customer_name        text,
  p_customer_email       text,
  p_customer_phone       text,
  p_delivery_full_name   text,
  p_delivery_phone       text,
  p_delivery_address_1   text,
  p_delivery_address_2   text,
  p_delivery_city        text,
  p_delivery_province    text,
  p_delivery_postal_code text,
  p_delivery_date        date,
  p_delivery_slot_id     uuid,
  p_coupon_code          text,
  p_customer_note        text,
  -- Cart items array as JSON: [{variant_id, quantity, customization, addon_ids[]}]
  p_items                jsonb
)
returns table (
  success       boolean,
  order_id      uuid,
  order_number  text,
  total_amount  numeric,
  error         text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id       uuid := gen_random_uuid();
  v_order_number   text;
  v_subtotal       numeric := 0;
  v_delivery_fee   numeric := 0;
  v_discount       numeric := 0;
  v_tax_rate       numeric;
  v_tax_amount     numeric := 0;
  v_total          numeric := 0;
  v_coupon         public.coupons%rowtype;
  v_item           jsonb;
  v_variant        public.product_variants%rowtype;
  v_product        public.products%rowtype;
  v_line_total     numeric;
  v_slot_check     record;
  v_delivery_zone  record;
  v_settings       public.site_settings%rowtype;
  v_order_item_id  uuid;
  v_addon          public.addons%rowtype;
  v_addon_id       uuid;
begin
  -- Load site settings (tax rate)
  select * into v_settings from public.site_settings limit 1;
  v_tax_rate := coalesce(v_settings.tax_rate, 0);

  -- Validate delivery slot
  select * into v_slot_check
  from public.check_slot_availability(p_delivery_slot_id, p_delivery_date);

  if not v_slot_check.is_available then
    return query select false, null::uuid, null::text, null::numeric, v_slot_check.reason;
    return;
  end if;

  -- Calculate delivery fee
  select * into v_delivery_zone
  from public.calculate_delivery_fee(p_delivery_postal_code);

  if not v_delivery_zone.is_serviceable then
    return query select false, null::uuid, null::text, null::numeric, 'Delivery not available to this postal code';
    return;
  end if;

  v_delivery_fee := v_delivery_zone.delivery_fee;

  -- Process items and calculate subtotal from DB prices (never client prices)
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select pv.* into v_variant
    from   public.product_variants pv
    where  pv.id = (v_item->>'variant_id')::uuid
      and  pv.is_available = true;

    if not found then
      return query select false, null::uuid, null::text, null::numeric,
        ('Product variant not available: ' || (v_item->>'variant_id'))::text;
      return;
    end if;

    select p.* into v_product
    from   public.products p
    where  p.id = v_variant.product_id
      and  p.is_available = true;

    if not found then
      return query select false, null::uuid, null::text, null::numeric, 'Product not available';
      return;
    end if;

    v_line_total := v_variant.price * (v_item->>'quantity')::integer;
    v_subtotal   := v_subtotal + v_line_total;

    -- Insert order item
    v_order_item_id := gen_random_uuid();
    insert into public.order_items (
      id, order_id, product_id, variant_id,
      product_name, variant_name,
      unit_price, quantity, line_total,
      customization, reference_image_path
    ) values (
      v_order_item_id, v_order_id, v_product.id, v_variant.id,
      v_product.name, v_variant.name,
      v_variant.price, (v_item->>'quantity')::integer, v_line_total,
      coalesce(v_item->'customization', '{}'::jsonb),
      v_item->>'reference_image_path'
    );

    -- Process addons for this item
    for v_addon_id in
      select (value)::uuid
      from   jsonb_array_elements_text(coalesce(v_item->'addon_ids', '[]'::jsonb))
    loop
      select * into v_addon
      from   public.addons
      where  id = v_addon_id and is_available = true;

      if found then
        v_line_total := v_addon.price * 1; -- quantity 1 per addon per item
        v_subtotal   := v_subtotal + v_line_total;

        insert into public.order_item_addons (
          order_item_id, addon_id, addon_name, unit_price, quantity, line_total
        ) values (
          v_order_item_id, v_addon.id, v_addon.name, v_addon.price, 1, v_line_total
        );
      end if;
    end loop;
  end loop;

  -- Validate minimum order for delivery zone
  if v_subtotal < v_delivery_zone.minimum_order then
    return query select false, null::uuid, null::text, null::numeric,
      ('Minimum order of $' || v_delivery_zone.minimum_order || ' required for delivery to this area')::text;
    return;
  end if;

  -- Validate and apply coupon
  if p_coupon_code is not null and p_coupon_code != '' then
    declare
      v_coupon_result record;
    begin
      select * into v_coupon_result
      from   public.validate_coupon(p_coupon_code, v_subtotal, p_user_id);

      if not v_coupon_result.is_valid then
        return query select false, null::uuid, null::text, null::numeric, v_coupon_result.error_message;
        return;
      end if;

      v_discount := v_coupon_result.discount_amount;

      select * into v_coupon
      from   public.coupons
      where  upper(code) = upper(p_coupon_code);
    end;
  end if;

  -- Calculate tax and total
  v_tax_amount := round((v_subtotal - v_discount + v_delivery_fee) * v_tax_rate, 2);
  v_total      := v_subtotal - v_discount + v_delivery_fee + v_tax_amount;

  -- Generate order number
  v_order_number := public.generate_order_number();

  -- Insert order
  insert into public.orders (
    id, order_number, user_id,
    customer_name, customer_email, customer_phone,
    delivery_full_name, delivery_phone,
    delivery_address_line_1, delivery_address_line_2,
    delivery_city, delivery_province, delivery_postal_code,
    delivery_date, delivery_slot_id,
    subtotal, discount_amount, delivery_fee,
    tax_rate, tax_amount, total_amount,
    coupon_id, coupon_code,
    customer_note
  ) values (
    v_order_id, v_order_number, p_user_id,
    p_customer_name, p_customer_email, p_customer_phone,
    p_delivery_full_name, p_delivery_phone,
    p_delivery_address_1, p_delivery_address_2,
    p_delivery_city, p_delivery_province, p_delivery_postal_code,
    p_delivery_date, p_delivery_slot_id,
    v_subtotal, v_discount, v_delivery_fee,
    v_tax_rate, v_tax_amount, v_total,
    v_coupon.id, p_coupon_code,
    p_customer_note
  );

  -- Reserve slot
  insert into public.delivery_slot_reservations (
    order_id, delivery_slot_id, delivery_date,
    expires_at
  ) values (
    v_order_id, p_delivery_slot_id, p_delivery_date,
    now() + interval '30 minutes'
  );

  -- Record coupon usage
  if v_coupon.id is not null then
    insert into public.coupon_usages (
      coupon_id, user_id, order_id, discount_amount
    ) values (
      v_coupon.id, p_user_id, v_order_id, v_discount
    );
  end if;

  -- Record initial status history
  insert into public.order_status_history (order_id, old_status, new_status, note)
  values (v_order_id, null, 'PENDING', 'Order created');

  return query select true, v_order_id, v_order_number, v_total, null::text;
end;
$$;

revoke all on function public.create_pending_order from public;
grant execute on function public.create_pending_order to authenticated, service_role;

-- ============================================================
-- 6. CONFIRM ORDER AFTER STRIPE PAYMENT
-- Called ONLY by server-side Stripe webhook handler.
-- Uses service_role key — never exposed to client.
-- ============================================================

create or replace function public.confirm_order_payment(
  p_order_id                   uuid,
  p_stripe_payment_intent_id   text,
  p_stripe_checkout_session_id text,
  p_amount_paid                numeric,
  p_raw_event_id               text
)
returns table (
  success       boolean,
  error         text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  -- Idempotency check: has this event already been processed?
  if exists (
    select 1 from public.payments where raw_event_id = p_raw_event_id
  ) then
    return query select true, 'Already processed'::text;
    return;
  end if;

  -- Fetch order
  select * into v_order from public.orders where id = p_order_id;

  if not found then
    return query select false, 'Order not found'::text;
    return;
  end if;

  -- Verify amount matches (within 1 cent tolerance for currency rounding)
  if abs(v_order.total_amount - p_amount_paid) > 0.01 then
    return query select false,
      ('Amount mismatch: expected ' || v_order.total_amount || ' received ' || p_amount_paid)::text;
    return;
  end if;

  -- Update order
  update public.orders set
    status                      = 'CONFIRMED',
    payment_status              = 'PAID',
    stripe_payment_intent_id    = p_stripe_payment_intent_id,
    stripe_checkout_session_id  = p_stripe_checkout_session_id,
    confirmed_at                = now(),
    placed_at                   = now()
  where id = p_order_id;

  -- Insert payment record
  insert into public.payments (
    order_id, provider, provider_payment_id,
    provider_checkout_session_id,
    amount, currency, status,
    raw_event_id, paid_at
  ) values (
    p_order_id, 'STRIPE', p_stripe_payment_intent_id,
    p_stripe_checkout_session_id,
    p_amount_paid, 'CAD', 'PAID',
    p_raw_event_id, now()
  );

  -- Update slot reservation to CONSUMED
  update public.delivery_slot_reservations
  set    status = 'CONSUMED'
  where  order_id = p_order_id;

  -- Record status history
  insert into public.order_status_history (order_id, old_status, new_status, note)
  values (p_order_id, 'PENDING', 'CONFIRMED', 'Payment confirmed via Stripe');

  return query select true, null::text;
end;
$$;

revoke all on function public.confirm_order_payment from public;
grant execute on function public.confirm_order_payment to service_role;

-- ============================================================
-- 7. UPDATE ORDER STATUS (Owner only)
-- ============================================================

create or replace function public.update_order_status(
  p_order_id   uuid,
  p_new_status public.order_status,
  p_note       text default null
)
returns table (
  success boolean,
  error   text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_status public.order_status;
begin
  if not public.is_owner() then
    return query select false, 'Unauthorized'::text;
    return;
  end if;

  select status into v_old_status
  from   public.orders
  where  id = p_order_id;

  if not found then
    return query select false, 'Order not found'::text;
    return;
  end if;

  update public.orders set
    status       = p_new_status,
    delivered_at = case when p_new_status = 'DELIVERED' then now() else delivered_at end,
    cancelled_at = case when p_new_status = 'CANCELLED' then now() else cancelled_at end
  where id = p_order_id;

  insert into public.order_status_history (order_id, old_status, new_status, changed_by, note)
  values (p_order_id, v_old_status, p_new_status, auth.uid(), p_note);

  -- Release slot reservation if cancelled
  if p_new_status = 'CANCELLED' then
    update public.delivery_slot_reservations
    set    status = 'RELEASED'
    where  order_id = p_order_id;
  end if;

  return query select true, null::text;
end;
$$;

revoke all on function public.update_order_status from public;
grant execute on function public.update_order_status to authenticated, service_role;

-- ============================================================
-- 8. EXPIRE STALE SLOT RESERVATIONS (run via pg_cron or edge function)
-- ============================================================

create or replace function public.expire_stale_reservations()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.delivery_slot_reservations
  set    status = 'EXPIRED'
  where  status = 'ACTIVE'
    and  expires_at < now();
end;
$$;

revoke all on function public.expire_stale_reservations() from public;
grant execute on function public.expire_stale_reservations() to service_role;

-- ============================================================
-- END OF MIGRATION 002
-- ============================================================

