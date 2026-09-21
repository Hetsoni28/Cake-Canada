import { Navbar } from "@/components/navbar";
import { CakeSlice, Heart, Sparkles, MapPin } from "lucide-react";

export const metadata = {
  title: "About Us",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-ivory text-espresso">
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <p>Free delivery on orders over $80 across the GTA 🎂</p>
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">OUR STORY</p>
          <h1>Made with love, crafted with care.</h1>
          <p className="page-hero-subtitle">
            Maison Cake Co. is a Canadian artisan bakery dedicated to creating
            beautiful, indulgent cakes for every occasion — baked fresh, with
            nothing but the finest ingredients.
          </p>
        </div>
      </section>

      {/* About Intro */}
      <section className="section shell">
        <div className="about-intro">
          <div className="about-intro-image">
            <img
              src="https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=90"
              alt="Beautifully decorated cakes at Maison Cake Co."
            />
          </div>
          <div className="about-copy">
            <p className="eyebrow">WHO WE ARE</p>
            <h2>A Canadian bakery built on a love for beautiful things.</h2>
            <p>
              Founded in 2026, Maison Cake Co. started as a family dream — to
              bring European-inspired pâtisserie artistry to everyday
              celebrations across Canada. What began in a home kitchen has grown
              into a beloved GTA bakery, driven by the same passion for flavour
              and beauty that started it all.
            </p>
            <p>
              We are a family-run operation and proud of it. Every cake that
              leaves our kitchen has been touched by hands that genuinely care
              — from the careful sourcing of premium, locally-inspired
              ingredients to the final brushstroke of edible gold. There are no
              shortcuts here, only craft.
            </p>
            <p>
              We deliver across the Greater Toronto Area, bringing fresh,
              handcrafted cakes directly to your door. Whether it's a birthday,
              a wedding, or a Tuesday that deserves celebrating — we're here to
              make it sweeter.
            </p>
            <a href="/cakes" className="btn btn-dark">
              Shop Our Cakes
            </a>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section cream">
        <div className="shell">
          <div className="section-heading centered">
            <p className="eyebrow">OUR VALUES</p>
            <h2>What we stand for.</h2>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <CakeSlice size={32} />
              <h3>Freshly Baked</h3>
              <p>
                Every cake is baked to order — never frozen, never pre-made.
                You receive your cake at peak freshness, exactly as it was
                meant to be enjoyed.
              </p>
            </div>
            <div className="value-card">
              <Heart size={32} />
              <h3>Made with Care</h3>
              <p>
                From the first sketch to the final flourish, every cake is
                handled with attention and intention. We treat each order as
                if it were our own celebration.
              </p>
            </div>
            <div className="value-card">
              <Sparkles size={32} />
              <h3>Premium Ingredients</h3>
              <p>
                We source the finest couverture chocolate, real Madagascar
                vanilla, and seasonal fruits to ensure every bite delivers
                on the promise of our name.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Promise */}
      <section className="signature">
        <div className="shell signature-grid">
          <div className="signature-image">
            <img
              src="https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1200&q=90"
              alt="An elegantly decorated signature Maison Cake Co. cake"
            />
          </div>
          <div className="signature-copy">
            <p className="eyebrow light">OUR PROMISE</p>
            <h2>Every cake is made to be remembered.</h2>
            <p style={{ color: "var(--blush)" }}>
              We don't just bake cakes — we craft memories. Whether you choose
              from our curated collection or work with us to design something
              entirely your own, we promise a cake that looks stunning,
              tastes extraordinary, and arrives exactly when you need it. Your
              moment deserves nothing less.
            </p>
            <a href="/custom-cake" className="btn btn-light">
              Create Your Custom Cake
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
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
