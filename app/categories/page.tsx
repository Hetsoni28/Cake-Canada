import { MapPin } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { getCategories } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Categories | Maison Cake Co.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  
  // Fetch product counts per category
  const supabase = await createClient();
  const { data: counts } = await supabase
    .from('products')
    .select('category_id')
    .eq('is_available', true);

  const categoryCounts: Record<string, number> = {};
  counts?.forEach(p => {
    categoryCounts[p.category_id] = (categoryCounts[p.category_id] || 0) + 1;
  });

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      {/* Announcement bar */}
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>

      <Navbar />

      {/* Page hero */}
      <section className="page-hero">
        <p className="eyebrow">CURATED COLLECTIONS</p>
        <h1>Shop by Category</h1>
        <p className="page-hero-subtitle">
          Find the perfect cake for your specific occasion.
        </p>
      </section>

      {/* Categories Grid */}
      <div className="shell" style={{ paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 32 }}>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/categories/${cat.slug}`}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                background: '#fff',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ height: 240, overflow: 'hidden' }}>
                <img 
                  src={cat.image_url} 
                  alt={cat.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>{cat.name}</h3>
                <p style={{ margin: '0 0 16px 0', color: 'var(--taupe)', fontSize: 14 }}>
                  {cat.description}
                </p>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--caramel)' }}>
                  {categoryCounts[cat.id] || 0} Products →
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="shell footer-grid">
          <div>
            <div className="brand">
              MAISON<span>CAKE CO.</span>
            </div>
            <p>Handcrafted cakes made for life's sweetest moments.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <a href="/cakes">All Cakes</a>
            <a href="/categories/birthday">Birthday</a>
            <a href="/custom-cake">Custom Cakes</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
            <a href="/faq">FAQs</a>
          </div>
          <div>
            <h4>Contact</h4>
            <p>
              <MapPin size={15} /> Canada
            </p>
            <p>hello@maisoncakeco.ca</p>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Maison Cake Co.</span>
          <span>Privacy · Terms</span>
        </div>
      </footer>
    </main>
  );
}
