-- Migration 008_product_seed.sql

-- 1. Chocolate Truffle Cake
INSERT INTO products (name, slug, short_description, description, base_price, is_featured, is_best_seller, is_available, is_customizable, is_eggless_available, preparation_time_minutes, category_id)
VALUES (
    'Chocolate Truffle Cake', 'chocolate-truffle', 'Rich chocolate with truffle ganache.', 'A decadent layered chocolate cake with rich truffle ganache.', 45, true, true, true, false, false, 120, (SELECT id FROM categories WHERE slug = 'birthday')
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, name, weight_kg, price, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'chocolate-truffle'), '0.5 kg', 0.5, 45, 1),
    ((SELECT id FROM products WHERE slug = 'chocolate-truffle'), '1 kg', 1.0, 71.99, 2),
    ((SELECT id FROM products WHERE slug = 'chocolate-truffle'), '1.5 kg', 1.5, 94.99, 3),
    ((SELECT id FROM products WHERE slug = 'chocolate-truffle'), '2 kg', 2.0, 121.99, 4)
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, storage_path, alt_text, is_primary, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'chocolate-truffle'), 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85', 'Chocolate Truffle Cake', true, 1),
    ((SELECT id FROM products WHERE slug = 'chocolate-truffle'), 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85', 'Chocolate Truffle Cake slice', false, 2)
ON CONFLICT DO NOTHING;

-- 2. Red Velvet Cake
INSERT INTO products (name, slug, short_description, description, base_price, is_featured, is_best_seller, is_available, is_customizable, is_eggless_available, preparation_time_minutes, category_id)
VALUES (
    'Red Velvet Cake', 'red-velvet', 'Signature red velvet with cream cheese.', 'Signature red velvet with whipped cream cheese frosting.', 50, true, false, true, false, false, 120, (SELECT id FROM categories WHERE slug = 'birthday')
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, name, weight_kg, price, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'red-velvet'), '0.5 kg', 0.5, 50, 1),
    ((SELECT id FROM products WHERE slug = 'red-velvet'), '1 kg', 1.0, 79.99, 2),
    ((SELECT id FROM products WHERE slug = 'red-velvet'), '1.5 kg', 1.5, 104.99, 3),
    ((SELECT id FROM products WHERE slug = 'red-velvet'), '2 kg', 2.0, 134.99, 4)
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, storage_path, alt_text, is_primary, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'red-velvet'), 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=900&q=85', 'Red Velvet Cake', true, 1),
    ((SELECT id FROM products WHERE slug = 'red-velvet'), 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=900&q=85', 'Red Velvet Cake slice', false, 2)
ON CONFLICT DO NOTHING;

-- 3. Black Forest Cake
INSERT INTO products (name, slug, short_description, description, base_price, is_featured, is_best_seller, is_available, is_customizable, is_eggless_available, preparation_time_minutes, category_id)
VALUES (
    'Black Forest Cake', 'black-forest', 'Dark chocolate sponge with cherry kirsch.', 'Traditional Black Forest reinvented.', 55, false, true, true, false, false, 120, (SELECT id FROM categories WHERE slug = 'anniversary')
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, name, weight_kg, price, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'black-forest'), '0.5 kg', 0.5, 55, 1),
    ((SELECT id FROM products WHERE slug = 'black-forest'), '1 kg', 1.0, 87.99, 2),
    ((SELECT id FROM products WHERE slug = 'black-forest'), '1.5 kg', 1.5, 115.49, 3),
    ((SELECT id FROM products WHERE slug = 'black-forest'), '2 kg', 2.0, 148.49, 4)
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, storage_path, alt_text, is_primary, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'black-forest'), 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=85', 'Black Forest Cake', true, 1)
ON CONFLICT DO NOTHING;

-- 4. Vanilla Dream Cake
INSERT INTO products (name, slug, short_description, description, base_price, is_featured, is_best_seller, is_available, is_customizable, is_eggless_available, preparation_time_minutes, category_id)
VALUES (
    'Vanilla Dream Cake', 'vanilla-dream', 'Classic French vanilla sponge.', 'Classic French vanilla sponge with silky buttercream.', 40, false, false, true, false, false, 120, (SELECT id FROM categories WHERE slug = 'anniversary')
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, name, weight_kg, price, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'vanilla-dream'), '0.5 kg', 0.5, 40, 1),
    ((SELECT id FROM products WHERE slug = 'vanilla-dream'), '1 kg', 1.0, 63.99, 2),
    ((SELECT id FROM products WHERE slug = 'vanilla-dream'), '1.5 kg', 1.5, 83.99, 3),
    ((SELECT id FROM products WHERE slug = 'vanilla-dream'), '2 kg', 2.0, 107.99, 4)
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, storage_path, alt_text, is_primary, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'vanilla-dream'), 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=85', 'Vanilla Dream Cake', true, 1)
ON CONFLICT DO NOTHING;

-- 5. Strawberry Fresh Cream
INSERT INTO products (name, slug, short_description, description, base_price, is_featured, is_best_seller, is_available, is_customizable, is_eggless_available, preparation_time_minutes, category_id)
VALUES (
    'Strawberry Fresh Cream', 'strawberry-fresh-cream', 'Light vanilla chiffon layers.', 'Light vanilla chiffon layers filled with fresh strawberry compote.', 38, false, false, true, false, false, 120, (SELECT id FROM categories WHERE slug = 'kids')
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, name, weight_kg, price, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'strawberry-fresh-cream'), '0.5 kg', 0.5, 38, 1),
    ((SELECT id FROM products WHERE slug = 'strawberry-fresh-cream'), '1 kg', 1.0, 60.79, 2),
    ((SELECT id FROM products WHERE slug = 'strawberry-fresh-cream'), '1.5 kg', 1.5, 79.79, 3),
    ((SELECT id FROM products WHERE slug = 'strawberry-fresh-cream'), '2 kg', 2.0, 102.59, 4)
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, storage_path, alt_text, is_primary, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'strawberry-fresh-cream'), 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85', 'Strawberry Fresh Cream', true, 1)
ON CONFLICT DO NOTHING;

-- 6. Wedding Fondant Cake
INSERT INTO products (name, slug, short_description, description, base_price, is_featured, is_best_seller, is_available, is_customizable, is_eggless_available, preparation_time_minutes, category_id)
VALUES (
    'Wedding Fondant Cake', 'wedding-fondant', 'A three-tier masterpiece.', 'A three-tier masterpiece with ivory fondant.', 120, true, false, true, false, false, 240, (SELECT id FROM categories WHERE slug = 'wedding')
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, name, weight_kg, price, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'wedding-fondant'), '0.5 kg', 0.5, 120, 1),
    ((SELECT id FROM products WHERE slug = 'wedding-fondant'), '1 kg', 1.0, 191.99, 2),
    ((SELECT id FROM products WHERE slug = 'wedding-fondant'), '1.5 kg', 1.5, 251.99, 3),
    ((SELECT id FROM products WHERE slug = 'wedding-fondant'), '2 kg', 2.0, 323.99, 4)
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, storage_path, alt_text, is_primary, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'wedding-fondant'), 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=85', 'Wedding Fondant Cake', true, 1)
ON CONFLICT DO NOTHING;

-- 7. Designer Ganache Cake
INSERT INTO products (name, slug, short_description, description, base_price, is_featured, is_best_seller, is_available, is_customizable, is_eggless_available, preparation_time_minutes, category_id)
VALUES (
    'Designer Ganache Cake', 'designer-ganache', 'Statement cake with handcrafted details.', 'Statement cakes with handcrafted details.', 65, true, false, true, false, false, 180, (SELECT id FROM categories WHERE slug = 'designer-cakes')
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, name, weight_kg, price, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'designer-ganache'), '0.5 kg', 0.5, 65, 1),
    ((SELECT id FROM products WHERE slug = 'designer-ganache'), '1 kg', 1.0, 103.99, 2),
    ((SELECT id FROM products WHERE slug = 'designer-ganache'), '1.5 kg', 1.5, 136.49, 3),
    ((SELECT id FROM products WHERE slug = 'designer-ganache'), '2 kg', 2.0, 175.49, 4)
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, storage_path, alt_text, is_primary, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'designer-ganache'), 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=85', 'Designer Ganache Cake', true, 1)
ON CONFLICT DO NOTHING;

-- 8. Eggless Butterscotch
INSERT INTO products (name, slug, short_description, description, base_price, is_featured, is_best_seller, is_available, is_customizable, is_eggless_available, preparation_time_minutes, category_id)
VALUES (
    'Eggless Butterscotch', 'eggless-butterscotch', 'Eggless butterscotch layer cake.', 'Eggless options made with care.', 42, false, false, true, false, true, 120, (SELECT id FROM categories WHERE slug = 'eggless')
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, name, weight_kg, price, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'eggless-butterscotch'), '0.5 kg', 0.5, 42, 1),
    ((SELECT id FROM products WHERE slug = 'eggless-butterscotch'), '1 kg', 1.0, 67.19, 2),
    ((SELECT id FROM products WHERE slug = 'eggless-butterscotch'), '1.5 kg', 1.5, 88.19, 3),
    ((SELECT id FROM products WHERE slug = 'eggless-butterscotch'), '2 kg', 2.0, 113.39, 4)
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, storage_path, alt_text, is_primary, display_order)
VALUES 
    ((SELECT id FROM products WHERE slug = 'eggless-butterscotch'), 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85', 'Eggless Butterscotch', true, 1)
ON CONFLICT DO NOTHING;
