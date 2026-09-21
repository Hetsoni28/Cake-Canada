"use client";

import { Heart } from "lucide-react";
import { useCart } from "./cart-provider";
import type { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  showBadge?: boolean;
}

export function ProductCard({ product, showBadge = true }: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const primaryImage = product.images[0];
  const cheapestVariant = product.variants.reduce((a, b) =>
    a.price < b.price ? a : b,
  );

  function handleAddToCart() {
    addItem({
      productId: product.id,
      variantId: cheapestVariant.id,
      name: product.name,
      variantLabel: `${cheapestVariant.weight}${cheapestVariant.flavor ? ` · ${cheapestVariant.flavor}` : ""}`,
      price: cheapestVariant.price,
      serverVerifiedPrice: cheapestVariant.price,
      image: primaryImage?.image_url ?? "",
      slug: product.slug,
    });
  }

  return (
    <article className="product-card">
      <a href={`/cakes/${product.slug}`} className="product-image-link">
        <div className="product-image">
          <img src={primaryImage?.image_url} alt={product.name} />
          <button
            className="wishlist-btn"
            aria-label={`Add ${product.name} to wishlist`}
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={18} />
          </button>
          {showBadge && product.is_best_seller && <span>Best seller</span>}
        </div>
      </a>
      <div className="product-info">
        <div>
          <h3>
            <a href={`/cakes/${product.slug}`}>{product.name}</a>
          </h3>
          <p>
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}{" "}
            <small>{product.rating}</small>
          </p>
        </div>
        <strong>From ${cheapestVariant.price} CAD</strong>
      </div>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </article>
  );
}
