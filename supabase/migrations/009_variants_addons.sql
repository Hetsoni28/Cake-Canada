-- Drop tables if they exist to ensure clean state
DROP TABLE IF EXISTS product_addons CASCADE;
DROP TABLE IF EXISTS product_option_prices CASCADE;

-- Create product addons table
CREATE TABLE product_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create product option prices table (for structural add-ons like frosting/design)
CREATE TABLE product_option_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_type TEXT NOT NULL, -- e.g. 'eggless', 'frosting', 'design'
    name TEXT NOT NULL,
    surcharge NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_prices ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read product_addons" 
    ON product_addons FOR SELECT USING (is_active = true);
    
CREATE POLICY "Public read product_option_prices" 
    ON product_option_prices FOR SELECT USING (is_active = true);

-- Owner manage access (requires the is_owner() function from previous migrations)
CREATE POLICY "Owner manage product_addons" 
    ON product_addons FOR ALL USING (is_owner());
    
CREATE POLICY "Owner manage product_option_prices" 
    ON product_option_prices FOR ALL USING (is_owner());

-- Insert default Addons
INSERT INTO product_addons (name, price, display_order) VALUES
('Greeting Card', 3.50, 1),
('Birthday Candles (Pack of 12)', 2.00, 2),
('Premium Gift Wrap', 6.00, 3),
('Edible Photo Print', 12.00, 4),
('Cake Knife & Server Set', 15.00, 5),
('Custom Message Topper (Acrylic)', 10.00, 6)
ON CONFLICT DO NOTHING;

-- Insert default Option Prices
INSERT INTO product_option_prices (option_type, name, surcharge, display_order) VALUES
('eggless', 'Eggless (Vegetarian)', 5.00, 1),

('frosting', 'Standard Buttercream', 0.00, 1),
('frosting', 'Premium Cream Cheese', 8.00, 2),
('frosting', 'Belgian Chocolate Ganache', 12.00, 3),
('frosting', 'Fresh Cream & Fruit', 15.00, 4),

('design', 'Standard (Simple & Elegant)', 0.00, 1),
('design', 'Floral Arrangement', 25.00, 2),
('design', 'Custom Fondant Accents', 35.00, 3)
ON CONFLICT DO NOTHING;
