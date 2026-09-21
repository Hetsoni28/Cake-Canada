import type { Metadata } from "next";
import { MapPin, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "All Cakes | Maison Cake Co.",
};

export const dynamic = 'force-dynamic';

export default async function CakesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const { products, total } = await getProducts({
    search: params.q,
    category: params.category,
    sort: params.sort as any,
    page,
    limit: 12,
  });

  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      {/* Announcement bar */}
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>

      <Navbar />

      {/* Page hero */}
      <section className="page-hero pb-24">
        <p className="eyebrow">OUR COLLECTION</p>
        <h1>Every cake, a work of art.</h1>
        <p className="page-hero-subtitle">
          Browse our full collection of handcrafted cakes — made fresh for
          birthdays, anniversaries, weddings, and every sweet occasion in between.
        </p>
      </section>

      {/* Search bar */}
      <div className="shell search-bar-container">
        <form className="search-bar" action="/cakes" method="GET">
          <input
            type="text"
            name="q"
            className="search-input"
            placeholder="Search cakes..."
            defaultValue={params.q}
          />
          {params.category && <input type="hidden" name="category" value={params.category} />}
          {params.sort && <input type="hidden" name="sort" value={params.sort} />}
          <button type="submit" className="btn btn-dark search-btn">
            <Search size={18} /> Search
          </button>
        </form>
      </div>

      {/* Catalogue */}
      <div className="shell">
        <div className="catalogue-layout">
          {/* Sidebar filters */}
          <aside className="catalogue-filters">
            <h3 className="filter-title">Filter by</h3>
            <ul className="filter-list">
              <li>
                <a href="/cakes" className={!params.category ? "active" : ""}>
                  All Cakes
                </a>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/cakes?category=${cat.slug}${params.sort ? `&sort=${params.sort}` : ""}`}
                    className={params.category === cat.slug ? "active" : ""}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="filter-title mt-32">Sort by</h3>
            <ul className="filter-list">
              {[
                { label: "Newest", value: "newest" },
                { label: "Price: Low to High", value: "price_asc" },
                { label: "Price: High to Low", value: "price_desc" },
                { label: "Name: A to Z", value: "name_asc" },
              ].map(({ label, value }) => (
                <li key={value}>
                  <a
                    href={`/cakes?${new URLSearchParams({ ...params, sort: value }).toString()}`}
                    className={
                      params.sort === value || (!params.sort && value === "newest")
                        ? "active"
                        : ""
                    }
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product grid */}
          <div className="catalogue-main">
            <p className="catalogue-results-count">
              Showing {products.length} of {total} cakes
            </p>
            <div className="catalogue-grid">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="catalogue-empty">
                  <p>No cakes found matching your search. Try adjusting your filters.</p>
                  <a href="/cakes" className="btn btn-outline catalogue-empty-btn">
                    Clear Filters
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer mt-80">
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
