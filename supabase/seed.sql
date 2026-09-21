insert into public.categories (name, slug, description, image_url, sort_order) values
('Birthday', 'birthday', 'Cakes made for birthday celebrations.', null, 1),
('Anniversary', 'anniversary', 'Elegant cakes for meaningful milestones.', null, 2),
('Wedding', 'wedding', 'Refined cakes for beautiful beginnings.', null, 3),
('Kids', 'kids', 'Fun cakes for little celebrations.', null, 4),
('Chocolate', 'chocolate', 'Rich chocolate favourites.', null, 5),
('Designer Cakes', 'designer-cakes', 'Statement cakes with handcrafted details.', null, 6),
('Photo Cakes', 'photo-cakes', 'Personalized cakes for your memories.', null, 7),
('Eggless', 'eggless', 'Eggless options made with care.', null, 8)
on conflict (slug) do nothing;
