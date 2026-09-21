import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "All Cakes",
};

export default async function CakesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const products = category
    ? allProducts.filter((p) => p.category_slug === category)
    : allProducts;

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      {/* Announcement bar */}
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>

      <Navbar />

      {/* Page hero */}
      <section className="page-hero">
        <p className="eyebrow">OUR COLLECTION</p>
        <h1>Every cake, a work of art.</h1>
        <p className="page-hero-subtitle">
          Browse our full collection of handcrafted cakes — made fresh for
          birthdays, anniversaries, weddings, and every sweet occasion in
          between.
        </p>
      </section>

      {/* Catalogue */}
      <div className="shell">
        <div className="catalogue-layout">
          {/* Sidebar filters */}
          <aside className="catalogue-filters">
            <h3>Filter by</h3>
            <ul className="filter-list">
              <li>
                <a href="/cakes" className={!category ? "active" : ""}>
                  All Cakes
                </a>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/cakes?category=${cat.slug}`}
                    className={category === cat.slug ? "active" : ""}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product grid */}
          <div className="catalogue-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="catalogue-empty">
                No cakes found in this category. Try another filter.
              </p>
            )}
          </div>
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
