import { MapPin, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ProductDetailClient } from "@/components/product-detail-client";
import { getProductBySlug } from "@/lib/products";
import { getAddons, getOptionPrices } from "@/lib/addons";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? 'Cake Not Found' };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, addons, optionPrices] = await Promise.all([
    getProductBySlug(slug),
    getAddons(),
    getOptionPrices()
  ]);

  if (!product) {
    return (
      <main className="min-h-screen bg-ivory text-espresso">
        <div className="announcement">
          Freshly baked · Local delivery · Custom cakes available
        </div>
        <Navbar />
        <div className="shell not-found-wrap">
          <p className="eyebrow">404</p>
          <h1 className="not-found-title">Cake not found</h1>
          <p className="not-found-msg">
            We couldn&apos;t find the cake you&apos;re looking for.
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
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>

      <Navbar />

      <div className="shell">
        <a href="/cakes" className="back-link text-link">
          <ArrowLeft size={16} /> Back to all cakes
        </a>
      </div>

      <div className="shell">
        <ProductDetailClient 
          product={product} 
          addons={addons} 
          optionPrices={optionPrices} 
        />
      </div>

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
