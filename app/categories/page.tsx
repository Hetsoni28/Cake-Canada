import { getCategories } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

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
    <div className="categories-page">
      <div className="announcement-bar">Free delivery on orders over $100</div>
      <nav className="navbar">
        <a href="/" className="logo">Cake Canada</a>
        <div className="nav-links">
          <a href="/cakes">All Cakes</a>
          <a href="/categories">Categories</a>
        </div>
      </nav>

      <header className="page-hero">
        <h1>Shop by Category</h1>
      </header>

      <main className="shell">
        <div className="categories-grid">
          {categories.map(cat => (
            <a key={cat.id} href={`/categories/${cat.slug}`} className="category-card">
              <img src={cat.image_url} alt={cat.name} className="category-img" />
              <div className="category-info">
                <h2>{cat.name}</h2>
                <p>{cat.description}</p>
                <span className="product-count">{categoryCounts[cat.id] || 0} cakes</span>
              </div>
            </a>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Cake Canada. All rights reserved.</p>
      </footer>
    </div>
  );
}
