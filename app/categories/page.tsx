import { ArrowRight, MapPin } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { getCategories } from "@/lib/categories";

export const metadata = { title: "Collections" };

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>
      <Navbar />

      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow" style={{ justifyContent: "center" }}>
            SHOP BY OCCASION
          </p>
          <h1>Every celebration deserves the perfect cake.</h1>
          <p>
            Browse our curated collections and find the cake made for your
            moment — from birthdays to weddings, and everything in between.
          </p>
        </div>
      </section>

      <section className="section shell">
        <div className="category-hero-grid">
          {categories.map((category) => (
            <a
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="category-hero-card"
            >
              <img src={category.image_url} alt={category.name} />
              <div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </a>
          ))}
        </div>
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
