import { MapPin, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ProductDetailClient } from "@/components/product-detail-client";
import { getProductBySlug } from "@/lib/products";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? 'Cake Not Found' };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <main className="min-h-screen bg-ivory text-espresso">
        <div className="announcement">
          Freshly baked · Local delivery · Custom cakes available
        </div>
        <Navbar />
        <div className="shell" style={{ padding: "80px 0", textAlign: "center" }}>
          <p className="eyebrow">404</p>
          <h1 style={{ marginBottom: 16 }}>Cake not found</h1>
          <p style={{ marginBottom: 32, color: "var(--taupe)" }}>
            We couldn't find the cake you're looking for.
          </p>
          <a href="/cakes" className="btn btn-dark">
            Back to all cakes
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      {/* ── Announcement bar ── */}
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Back link ── */}
      <div className="shell">
        <a
          href="/cakes"
          className="text-link"
          style={{
            display: "inline-flex",
            gap: 8,
            alignItems: "center",
            padding: "20px 0",
            textDecoration: "none"
          }}
        >
          <ArrowLeft size={16} /> Back to all cakes
        </a>
      </div>

      {/* ── Product detail ── */}
      <div className="shell">
        <ProductDetailClient product={product} />
      </div>

      {/* ── Footer ── */}
      <footer className="footer" style={{ marginTop: 80 }}>
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
