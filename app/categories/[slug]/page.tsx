import { ArrowRight, MapPin } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { getCategoryBySlug } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  return { title: cat?.name ?? "Category" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return (
      <main className="min-h-screen bg-ivory text-espresso">
        <div className="announcement">
          Freshly baked · Local delivery · Custom cakes available
        </div>
        <Navbar />
        <section className="page-hero">
          <div className="shell">
            <h1>Collection not found.</h1>
            <p>
              The category you&apos;re looking for doesn&apos;t exist.{" "}
              <a href="/categories">View all collections →</a>
            </p>
          </div>
        </section>
      </main>
    );
  }

  const products = await getProductsByCategory(slug);

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>
      <Navbar />

      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow" style={{ justifyContent: "center" }}>
            COLLECTION
          </p>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading split">
          <h2>
            {category.name} cakes.
          </h2>
          <a className="text-link" href="/cakes">
            View all cakes <ArrowRight size={16} />
          </a>
        </div>

        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--taupe)", fontSize: "15px" }}>
            No cakes in this category yet.
          </p>
        )}
      </section>

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
