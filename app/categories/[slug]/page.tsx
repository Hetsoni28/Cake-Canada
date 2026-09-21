import type { Metadata } from "next";
import { MapPin, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { getProductsByCategory } from "@/lib/products";
import { getCategoryBySlug } from "@/lib/categories";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category ? `${category.name} Cakes | Maison Cake Co.` : 'Category Not Found' };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(slug);

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      {/* Announcement bar */}
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>

      <Navbar />

      {/* Back link */}
      <div className="shell">
        <a
          href="/categories"
          className="text-link"
          style={{
            display: "inline-flex",
            gap: 8,
            alignItems: "center",
            padding: "20px 0",
            textDecoration: "none"
          }}
        >
          <ArrowLeft size={16} /> Back to all categories
        </a>
      </div>

      {/* Page hero */}
      <section className="page-hero" style={{ paddingTop: 20 }}>
        <h1>{category.name}</h1>
        <p className="page-hero-subtitle">
          {category.description}
        </p>
      </section>

      {/* Catalogue */}
      <div className="shell" style={{ paddingBottom: 80 }}>
        {/* We use the catalogue-grid from globals.css without the sidebar layout */}
        <div className="catalogue-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="catalogue-empty" style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center' }}>
              No cakes found in this category yet.
            </p>
          )}
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
