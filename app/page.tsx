import {
  ArrowRight,
  CakeSlice,
  CheckCircle,
  Heart,
  Instagram,
  MapPin,
  Package,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";
import { FadeIn, Reveal, ScaleIn, StaggerChildren, StaggerItem } from "@/components/motion";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { getBestSellers, getFeaturedProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Maison Cake Co. — Handcrafted Cakes in Canada",
  description:
    "Premium handcrafted cakes for birthdays, anniversaries, weddings and every sweet occasion. Local delivery across the GTA.",
};

const OCCASIONS = [
  { title: "Birthday", slug: "birthday", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85" },
  { title: "Anniversary", slug: "anniversary", image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=85" },
  { title: "Wedding", slug: "wedding", image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=85" },
  { title: "Kids", slug: "kids", image: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=900&q=85" },
  { title: "Eggless", slug: "eggless", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85" },
  { title: "Designer", slug: "specialty", image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=85" },
];

const GALLERY = [
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=85",
];

const REVIEWS = [
  {
    quote: "The cake looked beautiful and tasted even better. The whole experience was effortless.",
    name: "Sarah M.",
    city: "Toronto, ON",
    rating: 5,
  },
  {
    quote: "The attention to detail was incredible. It made our anniversary feel extra special.",
    name: "Emily R.",
    city: "Mississauga, ON",
    rating: 5,
  },
  {
    quote: "Fresh, elegant and exactly what we hoped for. We'll definitely order again.",
    name: "Daniel K.",
    city: "Brampton, ON",
    rating: 5,
  },
];

const STEPS = [
  { num: "01", title: "Choose your cake", desc: "Browse our collection and find your favourite.", icon: CakeSlice },
  { num: "02", title: "Customize your order", desc: "Add your flavour, size, message and extras.", icon: Sparkles },
  { num: "03", title: "Pick a delivery time", desc: "Choose a date and available delivery slot.", icon: Package },
  { num: "04", title: "Celebrate", desc: "We bake, pack and deliver with care.", icon: CheckCircle },
];

export default async function Home() {
  const [bestSellers, featured] = await Promise.all([
    getBestSellers(),
    getFeaturedProducts(),
  ]);

  return (
    <main className="homepage">
      {/* ── Announcement bar ─────────────────────────────────────── */}
      <div className="announcement">
        🎂 Free delivery on orders over $100 · Custom cakes available · Order 5 days ahead
      </div>

      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="hero shell">
        <div className="hero-copy">
          <FadeIn>
            <p className="eyebrow">
              <Sparkles size={14} /> HANDCRAFTED FOR YOUR MOMENTS
            </p>
            <h1>
              Made to be
              <br />
              <em>remembered.</em>
            </h1>
            <p className="hero-text">
              Beautiful cakes, thoughtfully crafted with premium ingredients
              for birthdays, celebrations, and every sweet occasion.
            </p>
            <div className="button-row">
              <a className="btn btn-dark" href="/cakes">
                Shop Cakes <ArrowRight size={17} />
              </a>
              <a className="btn btn-outline" href="/custom-cake">
                Create Your Cake
              </a>
            </div>
            <div className="trust-row">
              <span><CakeSlice size={15} /> Freshly baked</span>
              <span><Heart size={15} /> Made with care</span>
              <span><Truck size={15} /> Local delivery</span>
            </div>
          </FadeIn>
        </div>

        <ScaleIn className="hero-visual" delay={0.2}>
          <div className="hero-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1400&q=90"
              alt="Elegant handcrafted cake"
            />
            <div className="hero-badge">
              <span>Since</span>
              <strong>2026</strong>
              <small>made with love</small>
            </div>
            <div className="hero-float-tag">
              <Star size={13} className="hero-float-star" />
              <span>4.9 — 200+ happy customers</span>
            </div>
          </div>
        </ScaleIn>
      </section>

      {/* ── SHOP BY OCCASION ─────────────────────────────────────── */}
      <section className="section cream">
        <div className="shell">
          <Reveal>
            <div className="section-heading centered">
              <p className="eyebrow">SHOP BY OCCASION</p>
              <h2>Something sweet for every celebration.</h2>
            </div>
          </Reveal>

          <StaggerChildren className="occasion-grid">
            {OCCASIONS.map((item) => (
              <StaggerItem key={item.title}>
                <a className="occasion-card" href={`/categories/${item.slug}`}>
                  <div className="occasion-img-wrap">
                    <img src={item.image} alt={`${item.title} cake`} />
                  </div>
                  <div className="occasion-label">
                    <h3>{item.title}</h3>
                    <span>Explore <ArrowRight size={13} /></span>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────────────────── */}
      <section id="best-sellers" className="section shell">
        <Reveal>
          <div className="section-heading split">
            <div>
              <p className="eyebrow">CUSTOMER FAVOURITES</p>
              <h2>Our best sellers.</h2>
            </div>
            <a className="text-link" href="/cakes">
              View all cakes <ArrowRight size={16} />
            </a>
          </div>
        </Reveal>

        <StaggerChildren className="product-grid">
          {bestSellers.length > 0
            ? bestSellers.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))
            : /* Fallback skeletons while DB is warming up */
              [1, 2, 3, 4].map((n) => (
                <div className="product-card-skeleton" key={n} />
              ))}
        </StaggerChildren>
      </section>

      {/* ── SIGNATURE COLLECTION ─────────────────────────────────── */}
      <section className="signature">
        <div className="shell signature-grid">
          <Reveal direction="left" className="signature-image">
            <img
              src="https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1200&q=90"
              alt="Signature celebration cake"
            />
          </Reveal>
          <Reveal direction="right" className="signature-copy">
            <p className="eyebrow light">THE SIGNATURE COLLECTION</p>
            <h2>Elegant cakes for moments that deserve more.</h2>
            <p>
              From refined florals to rich chocolate finishes, our signature
              collection brings a little extra magic to the table.
            </p>
            <a className="btn btn-light" href="/cakes">
              Explore collection <ArrowRight size={17} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="section shell">
          <Reveal>
            <div className="section-heading split">
              <div>
                <p className="eyebrow">HANDPICKED FOR YOU</p>
                <h2>Staff picks this season.</h2>
              </div>
              <a className="text-link" href="/cakes">
                See all <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
          <StaggerChildren className="product-grid">
            {featured.slice(0, 4).map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}

      {/* ── CUSTOM CAKE CTA ───────────────────────────────────────── */}
      <section id="custom" className="section shell">
        <Reveal>
          <div className="custom-banner">
            <div className="custom-banner-copy">
              <p className="eyebrow">MAKE IT YOURS</p>
              <h2>
                Your idea.
                <br />
                Your cake.
              </h2>
              <p>
                Choose the flavour, size, design and message — then make your
                celebration uniquely yours.
              </p>
              <a className="btn btn-dark" href="/custom-cake">
                Create a custom cake <ArrowRight size={17} />
              </a>
            </div>
            <div className="custom-banner-img">
              <img
                src="https://images.unsplash.com/photo-1558301211-0daf9d24d8b7?auto=format&fit=crop&w=1100&q=90"
                alt="Custom decorated cake"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────────────────── */}
      <section className="section cream">
        <div className="shell">
          <Reveal>
            <div className="section-heading centered">
              <p className="eyebrow">THE MAISON PROMISE</p>
              <h2>Made with intention.</h2>
            </div>
          </Reveal>
          <StaggerChildren className="feature-grid">
            {[
              { Icon: CakeSlice, title: "Freshly Baked", text: "Every order is prepared fresh for your celebration." },
              { Icon: Sparkles,  title: "Premium Ingredients", text: "Thoughtfully selected ingredients in every recipe." },
              { Icon: Heart,     title: "Made With Care", text: "Beautiful details, finished by hand with love." },
              { Icon: Truck,     title: "Reliable Delivery", text: "Carefully packed and delivered on schedule." },
            ].map(({ Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="feature">
                  <div className="feature-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="section shell">
        <Reveal>
          <div className="section-heading centered">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2>From our kitchen to your celebration.</h2>
          </div>
        </Reveal>
        <StaggerChildren className="steps">
          {STEPS.map(({ num, title, desc, icon: Icon }) => (
            <StaggerItem key={num}>
              <div className="step">
                <div className="step-icon">
                  <Icon size={24} />
                </div>
                <span className="step-num">{num}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* ── SEASONAL PROMO ────────────────────────────────────────── */}
      <section className="promo">
        <div className="shell promo-inner">
          <Reveal direction="left">
            <div>
              <p className="eyebrow">SEASONAL SPECIAL</p>
              <h2>Make their celebration a little sweeter.</h2>
              <p>
                Discover limited seasonal creations made for the moments
                you'll remember.
              </p>
              <a className="btn btn-dark promo-btn" href="/cakes">
                Shop seasonal cakes <ArrowRight size={17} />
              </a>
            </div>
          </Reveal>
          <ScaleIn className="promo-img-wrap" delay={0.15}>
            <img
              src="https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=85"
              alt="Seasonal cake"
            />
          </ScaleIn>
        </div>
      </section>

      {/* ── REVIEWS ───────────────────────────────────────────────── */}
      <section className="section shell">
        <Reveal>
          <div className="section-heading centered">
            <p className="eyebrow">KIND WORDS</p>
            <h2>Loved at first bite.</h2>
          </div>
        </Reveal>
        <StaggerChildren className="reviews">
          {REVIEWS.map(({ quote, name, city, rating }) => (
            <StaggerItem key={name}>
              <blockquote className="review-card">
                <p className="review-stars">{"★".repeat(rating)}</p>
                <span className="review-quote">{`"${quote}"`}</span>
                <footer className="review-footer">
                  <strong>{name}</strong>
                  <small>{city}</small>
                </footer>
              </blockquote>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* ── INSTAGRAM / GALLERY ───────────────────────────────────── */}
      <section className="gallery-section">
        <div className="shell">
          <Reveal>
            <div className="section-heading split">
              <div>
                <p className="eyebrow">SWEET MOMENTS</p>
                <h2>From our kitchen to your table.</h2>
              </div>
              <a className="text-link gallery-ig-link" href="#">
                @maisoncakeco <Instagram size={16} />
              </a>
            </div>
          </Reveal>
          <div className="gallery">
            {GALLERY.map((src, i) => (
              <a href="#" className="gallery-item" key={src}>
                <img src={src} alt={`Maison Cake Co gallery ${i + 1}`} />
                <div className="gallery-overlay">
                  <Instagram size={20} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────── */}
      <section className="newsletter">
        <div className="shell newsletter-inner">
          <Reveal direction="left">
            <div>
              <p className="eyebrow light">STAY IN THE LOOP</p>
              <h2>A little sweetness, delivered.</h2>
              <p>Get new cake launches, seasonal treats and special offers.</p>
            </div>
          </Reveal>
          <Reveal direction="right" className="newsletter-form-wrap">
            <form className="newsletter-form">
              <input
                type="email"
                className="newsletter-input"
                placeholder="Your email address"
                aria-label="Email address"
              />
              <button type="submit" className="btn btn-dark newsletter-btn">
                Subscribe <ArrowRight size={16} />
              </button>
            </form>
            <p className="newsletter-note">
              No spam, ever. Unsubscribe anytime.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="shell footer-grid">
          <div>
            <div className="brand">
              MAISON<span>CAKE CO.</span>
            </div>
            <p>Handcrafted cakes made for life's sweetest moments.</p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            </div>
          </div>
          <div>
            <h4>Shop</h4>
            <a href="/cakes">All Cakes</a>
            <a href="/categories/birthday">Birthday</a>
            <a href="/categories/wedding">Wedding</a>
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
            <p><MapPin size={14} /> Greater Toronto Area</p>
            <p>hello@maisoncakeco.ca</p>
            <p>+1 (416) 555-0198</p>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Maison Cake Co. All rights reserved.</span>
          <span>Privacy Policy · Terms of Service</span>
        </div>
      </footer>
    </main>
  );
}
