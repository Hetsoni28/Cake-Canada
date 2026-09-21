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

  const supabase = await createClient();
  const { data: counts } = await supabase
    .from('products')
    .select('category_id')
    .eq('is_available', true);

  const categoryCounts: Record<string, number> = {};
  counts?.forEach((p) => {
    categoryCounts[p.category_id] = (categoryCounts[p.category_id] || 0) + 1;
  });

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>

      <Navbar />

      <section className="page-hero">
        <p className="eyebrow">CURATED COLLECTIONS</p>
        <h1>Shop by Category</h1>
        <p className="page-hero-subtitle">
          Find the perfect cake for your specific occasion.
        </p>
      </section>

      <div className="shell categories-container">
        <div className="categories-grid">
          {categories.map((cat) => (
            <a key={cat.id} href={`/categories/${cat.slug}`} className="category-card">
              <div className="category-card-img-wrapper">
                <img src={cat.image_url} alt={cat.name} className="category-card-img" />
              </div>
              <div className="category-card-content">
                <h3 className="category-card-title">{cat.name}</h3>
                <p className="category-card-desc">{cat.description}</p>
                <span className="category-card-link">
                  {categoryCounts[cat.id] || 0} Products →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

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
