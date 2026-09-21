"use client";

import { useState } from "react";
import { Product, ProductVariant } from "@/lib/products"; // wait I'll import from data.ts since it's the same type but let's just use what's there
// To avoid type issues, I will define them here or import from lib/products
// Actually, I'll import from "@/lib/products" because that's where I redefined them. Wait, data.ts has Product.
// Let's import from "@/lib/products".

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0] || { id: '', weight: '', price: product.base_price });
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    alert(`Added ${quantity}x ${product.name} (${selectedVariant.weight}) to cart!`);
    // useCart implementation would go here
  };

  return (
    <div className="product-info-client">
      <h1>{product.name}</h1>
      <p className="price">${selectedVariant.price.toFixed(2)}</p>
      
      <div className="badges">
        {product.is_best_seller && <span className="badge best-seller">Best Seller</span>}
        {product.is_featured && <span className="badge featured">Featured</span>}
      </div>

      <p className="description">{product.description}</p>
      
      {product.variants.length > 0 && (
        <div className="variant-selector">
          <h3>Select Size</h3>
          <div className="variant-options">
            {product.variants.map(variant => (
              <button
                key={variant.id}
                className={`variant-btn ${selectedVariant.id === variant.id ? 'active' : ''}`}
                onClick={() => setSelectedVariant(variant)}
              >
                {variant.weight}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="quantity-selector">
        <h3>Quantity</h3>
        <div className="qty-controls">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>
      </div>

      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}
