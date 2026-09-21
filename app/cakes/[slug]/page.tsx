import { getProductBySlug } from "@/lib/products";
import { ProductDetailClient } from "@/components/product-detail-client";
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
    notFound();
  }

  const primaryImage = product.images.find(img => img.sort_order === 1) || product.images[0];
  const otherImages = product.images.filter(img => img.id !== primaryImage?.id);

  return (
    <div className="product-page">
      <div className="announcement-bar">Free delivery on orders over $100</div>
      <nav className="navbar">
        <a href="/" className="logo">Cake Canada</a>
        <div className="nav-links">
          <a href="/cakes">All Cakes</a>
          <a href="/categories">Categories</a>
        </div>
      </nav>

      <main className="product-detail-layout">
        <div className="image-gallery">
          {primaryImage && (
            <img src={primaryImage.image_url} alt={primaryImage.alt_text || product.name} className="main-image" />
          )}
          {otherImages.length > 0 && (
            <div className="thumbnails">
              {otherImages.map(img => (
                <img key={img.id} src={img.image_url} alt={img.alt_text || product.name} className="thumbnail" />
              ))}
            </div>
          )}
        </div>

        <ProductDetailClient product={product} />
      </main>

      <footer className="footer">
        <p>&copy; 2026 Cake Canada. All rights reserved.</p>
      </footer>
    </div>
  );
}
