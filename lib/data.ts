// ─── Static product & category data ────────────────────────────────────────
// This data is used as a fallback when Supabase is not configured.
// Once you connect Supabase, the server queries in lib/products.ts and
// lib/categories.ts will fetch live data instead.

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  weight: string;
  flavor?: string;
  price: number;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  base_price: number;
  is_featured: boolean;
  is_best_seller: boolean;
  category_id: string;
  category_slug: string;
  rating: number;
  review_count: number;
  variants: ProductVariant[];
  images: ProductImage[];
}

export const STATIC_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Birthday",
    slug: "birthday",
    description: "Cakes made for birthday celebrations.",
    image_url:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
    sort_order: 1,
  },
  {
    id: "cat-2",
    name: "Anniversary",
    slug: "anniversary",
    description: "Elegant cakes for meaningful milestones.",
    image_url:
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=85",
    sort_order: 2,
  },
  {
    id: "cat-3",
    name: "Wedding",
    slug: "wedding",
    description: "Refined cakes for beautiful beginnings.",
    image_url:
      "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=85",
    sort_order: 3,
  },
  {
    id: "cat-4",
    name: "Kids",
    slug: "kids",
    description: "Fun cakes for little celebrations.",
    image_url:
      "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=900&q=85",
    sort_order: 4,
  },
  {
    id: "cat-5",
    name: "Chocolate",
    slug: "chocolate",
    description: "Rich chocolate favourites.",
    image_url:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
    sort_order: 5,
  },
  {
    id: "cat-6",
    name: "Designer Cakes",
    slug: "designer-cakes",
    description: "Statement cakes with handcrafted details.",
    image_url:
      "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=900&q=85",
    sort_order: 6,
  },
  {
    id: "cat-7",
    name: "Eggless",
    slug: "eggless",
    description: "Eggless options made with care.",
    image_url:
      "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=85",
    sort_order: 7,
  },
];

export const STATIC_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Chocolate Truffle",
    slug: "chocolate-truffle",
    description:
      "A decadent layered chocolate cake with rich truffle ganache and hand-piped rosettes. Made with Belgian dark chocolate and finished with a mirror glaze.",
    short_description:
      "Rich Belgian chocolate with truffle ganache and mirror glaze.",
    base_price: 45,
    is_featured: true,
    is_best_seller: true,
    category_id: "cat-1",
    category_slug: "birthday",
    rating: 4.9,
    review_count: 128,
    variants: [
      { id: "v1-1", weight: "500g", flavor: "Dark Chocolate", price: 45 },
      { id: "v1-2", weight: "1 kg", flavor: "Dark Chocolate", price: 72 },
      { id: "v1-3", weight: "2 kg", flavor: "Dark Chocolate", price: 130 },
    ],
    images: [
      {
        id: "img-1-1",
        image_url:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=88",
        alt_text: "Chocolate Truffle Cake",
        sort_order: 0,
      },
      {
        id: "img-1-2",
        image_url:
          "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=88",
        alt_text: "Chocolate Truffle Cake slice",
        sort_order: 1,
      },
    ],
  },
  {
    id: "prod-2",
    name: "Strawberry Dream",
    slug: "strawberry-dream",
    description:
      "Light vanilla chiffon layers filled with fresh strawberry compote and Chantilly cream. Draped in blush-toned fondant and crowned with real strawberries.",
    short_description: "Vanilla chiffon with fresh strawberry compote & cream.",
    base_price: 52,
    is_featured: true,
    is_best_seller: true,
    category_id: "cat-2",
    category_slug: "anniversary",
    rating: 4.8,
    review_count: 94,
    variants: [
      { id: "v2-1", weight: "500g", flavor: "Strawberry", price: 52 },
      { id: "v2-2", weight: "1 kg", flavor: "Strawberry", price: 84 },
      { id: "v2-3", weight: "2 kg", flavor: "Strawberry", price: 155 },
    ],
    images: [
      {
        id: "img-2-1",
        image_url:
          "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=88",
        alt_text: "Strawberry Dream Cake",
        sort_order: 0,
      },
    ],
  },
  {
    id: "prod-3",
    name: "Velvet Bloom",
    slug: "velvet-bloom",
    description:
      "Our signature red velvet with whipped cream cheese frosting, adorned with hand-sculpted sugar florals in blush, ivory, and dusty rose.",
    short_description:
      "Red velvet with cream cheese frosting & sugar floral décor.",
    base_price: 58,
    is_featured: true,
    is_best_seller: true,
    category_id: "cat-6",
    category_slug: "designer-cakes",
    rating: 4.9,
    review_count: 77,
    variants: [
      { id: "v3-1", weight: "500g", flavor: "Red Velvet", price: 58 },
      { id: "v3-2", weight: "1 kg", flavor: "Red Velvet", price: 92 },
      { id: "v3-3", weight: "2 kg", flavor: "Red Velvet", price: 168 },
    ],
    images: [
      {
        id: "img-3-1",
        image_url:
          "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=1000&q=88",
        alt_text: "Velvet Bloom Cake",
        sort_order: 0,
      },
    ],
  },
  {
    id: "prod-4",
    name: "Vanilla Celebration",
    slug: "vanilla-celebration",
    description:
      "Classic French vanilla sponge with silky buttercream, finished with a clean naked-cake aesthetic and edible gold leaf accents.",
    short_description:
      "French vanilla sponge with buttercream and gold leaf accents.",
    base_price: 42,
    is_featured: false,
    is_best_seller: true,
    category_id: "cat-1",
    category_slug: "birthday",
    rating: 4.8,
    review_count: 61,
    variants: [
      { id: "v4-1", weight: "500g", flavor: "Vanilla", price: 42 },
      { id: "v4-2", weight: "1 kg", flavor: "Vanilla", price: 68 },
      { id: "v4-3", weight: "2 kg", flavor: "Vanilla", price: 120 },
    ],
    images: [
      {
        id: "img-4-1",
        image_url:
          "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=88",
        alt_text: "Vanilla Celebration Cake",
        sort_order: 0,
      },
    ],
  },
  {
    id: "prod-5",
    name: "Royal Wedding Tier",
    slug: "royal-wedding-tier",
    description:
      "A three-tier masterpiece with ivory fondant, hand-piped lace patterns, and fresh roses. Serves 50–80 guests. Available in any flavour combination.",
    short_description: "Three-tier ivory fondant with lace piping & roses.",
    base_price: 285,
    is_featured: true,
    is_best_seller: false,
    category_id: "cat-3",
    category_slug: "wedding",
    rating: 5.0,
    review_count: 22,
    variants: [
      {
        id: "v5-1",
        weight: "3-tier (50 guests)",
        flavor: "Vanilla",
        price: 285,
      },
      {
        id: "v5-2",
        weight: "3-tier (80 guests)",
        flavor: "Vanilla",
        price: 380,
      },
    ],
    images: [
      {
        id: "img-5-1",
        image_url:
          "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1000&q=88",
        alt_text: "Royal Wedding Tier Cake",
        sort_order: 0,
      },
    ],
  },
  {
    id: "prod-6",
    name: "Unicorn Sprinkle",
    slug: "unicorn-sprinkle",
    description:
      "A bright and playful funfetti cake topped with swirled pastel buttercream, a fondant unicorn horn, and rainbow sprinkles. Kids love it.",
    short_description: "Funfetti with pastel buttercream & unicorn topper.",
    base_price: 48,
    is_featured: false,
    is_best_seller: false,
    category_id: "cat-4",
    category_slug: "kids",
    rating: 4.9,
    review_count: 43,
    variants: [
      { id: "v6-1", weight: "500g", flavor: "Funfetti", price: 48 },
      { id: "v6-2", weight: "1 kg", flavor: "Funfetti", price: 78 },
    ],
    images: [
      {
        id: "img-6-1",
        image_url:
          "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=1000&q=88",
        alt_text: "Unicorn Sprinkle Cake",
        sort_order: 0,
      },
    ],
  },
  {
    id: "prod-7",
    name: "Dark Forest Gateau",
    slug: "dark-forest-gateau",
    description:
      "Traditional Black Forest reinvented — dark chocolate sponge layers with cherry kirsch compote, chantilly rosettes, and chocolate shavings.",
    short_description:
      "Dark chocolate sponge with cherry compote & chantilly cream.",
    base_price: 55,
    is_featured: false,
    is_best_seller: false,
    category_id: "cat-5",
    category_slug: "chocolate",
    rating: 4.7,
    review_count: 38,
    variants: [
      {
        id: "v7-1",
        weight: "500g",
        flavor: "Dark Chocolate & Cherry",
        price: 55,
      },
      {
        id: "v7-2",
        weight: "1 kg",
        flavor: "Dark Chocolate & Cherry",
        price: 88,
      },
      {
        id: "v7-3",
        weight: "2 kg",
        flavor: "Dark Chocolate & Cherry",
        price: 160,
      },
    ],
    images: [
      {
        id: "img-7-1",
        image_url:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=88",
        alt_text: "Dark Forest Gateau",
        sort_order: 0,
      },
    ],
  },
  {
    id: "prod-8",
    name: "Lotus Biscoff Bliss",
    slug: "lotus-biscoff-bliss",
    description:
      "Layers of vanilla sponge with Biscoff spread filling, whipped Biscoff buttercream, and whole lotus cookies on top. Eggless available.",
    short_description: "Vanilla sponge with Biscoff filling & cookie topping.",
    base_price: 60,
    is_featured: false,
    is_best_seller: false,
    category_id: "cat-7",
    category_slug: "eggless",
    rating: 4.8,
    review_count: 29,
    variants: [
      { id: "v8-1", weight: "500g", flavor: "Biscoff", price: 60 },
      { id: "v8-2", weight: "1 kg", flavor: "Biscoff", price: 96 },
    ],
    images: [
      {
        id: "img-8-1",
        image_url:
          "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=88",
        alt_text: "Lotus Biscoff Bliss Cake",
        sort_order: 0,
      },
    ],
  },
];
