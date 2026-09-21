import { getCategoryBySlug } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? 'Category Not Found' };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(slug);

  return (
    <div className="category-detail-page">
      <div className="announcement-bar">Free delivery on orders over $100</div>
      <nav className="navbar">
        <a href="/" className="logo">Cake Canada</a>
        <div className="nav-links">
          <a href="/cakes">All Cakes</a>
          <a href="/categories">Categories</a>
        </div>
      </nav>

      <header className="page-hero" style={{ backgroundImage: `url(${category.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '4rem 2rem', color: 'white', textAlign: 'center' }}>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
        </div>
      </header>

      <main className="shell">
        <div className="catalogue-content" style={{ marginTop: '2rem' }}>
          <div className="results-info">
            Showing {products.length} cakes in {category.name}
          </div>
          
          {products.length === 0 ? (
            <div className="empty-state">No cakes found in this category.</div>
          ) : (
            <div className="catalogue-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Cake Canada. All rights reserved.</p>
      </footer>
    </div>
  );
}
