import {
  ArrowRight,
  CakeSlice,
  Heart,
  Instagram,
  MapPin,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { FadeIn, Reveal } from "@/components/motion";
import { Navbar } from "@/components/navbar";

const categories = [
  {
    title: "Birthday",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Anniversary",
    image:
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Wedding",
    image:
      "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Kids",
    image:
      "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=900&q=85",
  },
];

const bestSellers = [
  {
    name: "Chocolate Truffle",
    price: "$45",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=88",
  },
  {
    name: "Strawberry Dream",
    price: "$52",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=88",
  },
  {
    name: "Velvet Bloom",
    price: "$58",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=1000&q=88",
  },
  {
    name: "Vanilla Celebration",
    price: "$42",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=88",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-ivory text-espresso">
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>
      <Navbar />

      <section className="hero shell">
        <div className="hero-copy">
          <FadeIn>
            <p className="eyebrow">
              <Sparkles size={15} /> HANDCRAFTED FOR YOUR MOMENTS
            </p>
            <h1>
              Made to be
              <br />
              <em>remembered.</em>
            </h1>
            <p className="hero-text">
              Beautiful cakes, thoughtfully crafted with premium ingredients for
              birthdays, celebrations, and every sweet occasion.
            </p>
            <div className="button-row">
              <a className="btn btn-dark" href="#best-sellers">
                Shop Cakes <ArrowRight size={17} />
              </a>
              <a className="btn btn-outline" href="#custom">
                Create Your Cake
              </a>
            </div>
            <div className="trust-row">
              <span>
                <CakeSlice size={16} /> Freshly baked
              </span>
              <span>
                <Heart size={16} /> Made with care
              </span>
              <span>
                <Truck size={16} /> Local delivery
              </span>
            </div>
          </FadeIn>
        </div>

        <Reveal className="hero-visual">
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
          </div>
        </Reveal>
      </section>

      <section className="section cream">
        <div className="shell">
          <div className="section-heading centered">
            <p className="eyebrow">SHOP BY OCCASION</p>
            <h2>Something sweet for every celebration.</h2>
          </div>
          <div className="category-grid">
            {categories.map((item) => (
              <a
                className="category-card"
                href="#best-sellers"
                key={item.title}
              >
                <img src={item.image} alt={`${item.title} cake`} />
                <div>
                  <h3>{item.title}</h3>
                  <span>
                    Explore <ArrowRight size={15} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="best-sellers" className="section shell">
        <div className="section-heading split">
          <div>
            <p className="eyebrow">CUSTOMER FAVOURITES</p>
            <h2>Our best sellers.</h2>
          </div>
          <a className="text-link" href="/cakes">
            View all cakes <ArrowRight size={16} />
          </a>
        </div>
        <div className="product-grid">
          {bestSellers.map((item) => (
            <article className="product-card" key={item.name}>
              <div className="product-image">
                <img src={item.image} alt={item.name} />
                <button aria-label={`Add ${item.name} to wishlist`}>
                  <Heart size={18} />
                </button>
                <span>Best seller</span>
              </div>
              <div className="product-info">
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    ★★★★★ <small>{item.rating}</small>
                  </p>
                </div>
                <strong>From {item.price} CAD</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="signature">
        <div className="shell signature-grid">
          <div className="signature-image">
            <img
              src="https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1200&q=90"
              alt="Signature celebration cake"
            />
          </div>
          <div className="signature-copy">
            <p className="eyebrow light">THE SIGNATURE COLLECTION</p>
            <h2>Elegant cakes for moments that deserve more.</h2>
            <p>
              From refined florals to rich chocolate finishes, our signature
              collection brings a little extra magic to the table.
            </p>
            <a className="btn btn-light" href="/cakes">
              Explore collection <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>

      <section id="custom" className="section shell">
        <div className="custom-banner">
          <div>
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
          <img
            src="https://images.unsplash.com/photo-1558301211-0daf9d24d8b7?auto=format&fit=crop&w=1100&q=90"
            alt="Custom decorated cake"
          />
        </div>
      </section>

      <section className="section cream">
        <div className="shell">
          <div className="section-heading centered">
            <p className="eyebrow">THE MAISON PROMISE</p>
            <h2>Made with intention.</h2>
          </div>
          <div className="feature-grid">
            {[
              [
                "Freshly Baked",
                "Every order is prepared fresh for your celebration.",
                CakeSlice,
              ],
              [
                "Premium Ingredients",
                "Thoughtfully selected ingredients in every recipe.",
                Sparkles,
              ],
              ["Made With Care", "Beautiful details, finished by hand.", Heart],
              [
                "Reliable Delivery",
                "Carefully packed and delivered on schedule.",
                Truck,
              ],
            ].map(([title, text, Icon]) => (
              <div className="feature" key={title as string}>
                <Icon size={24} />
                <h3>{title as string}</h3>
                <p>{text as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading centered">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>From our kitchen to your celebration.</h2>
        </div>
        <div className="steps">
          {[
            "Choose your cake",
            "Customize your order",
            "Pick a delivery time",
            "Celebrate",
          ].map((step, i) => (
            <div className="step" key={step}>
              <span>0{i + 1}</span>
              <h3>{step}</h3>
              <p>
                {
                  [
                    "Browse our collection and find your favourite.",
                    "Add your flavour, size, message and extras.",
                    "Choose a date and available delivery slot.",
                    "We bake, pack and deliver with care.",
                  ][i]
                }
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="promo">
        <div className="shell promo-inner">
          <div>
            <p className="eyebrow">SEASONAL SPECIAL</p>
            <h2>Make their celebration a little sweeter.</h2>
            <p>
              Discover limited seasonal creations made for the moments you’ll
              remember.
            </p>
          </div>
          <a className="btn btn-dark" href="/cakes">
            Shop seasonal cakes <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading centered">
          <p className="eyebrow">KIND WORDS</p>
          <h2>Loved at first bite.</h2>
        </div>
        <div className="reviews">
          {[
            [
              "“The cake looked beautiful and tasted even better. The whole experience was effortless.”",
              "Sarah M.",
              "Toronto, ON",
            ],
            [
              "“The attention to detail was incredible. It made our anniversary feel extra special.”",
              "Emily R.",
              "Mississauga, ON",
            ],
            [
              "“Fresh, elegant and exactly what we hoped for. We’ll definitely order again.”",
              "Daniel K.",
              "Brampton, ON",
            ],
          ].map(([quote, name, city]) => (
            <blockquote key={name}>
              <p>★★★★★</p>
              <span>{quote}</span>
              <footer>
                {name}
                <small>{city}</small>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="gallery-section">
        <div className="shell">
          <div className="section-heading split">
            <div>
              <p className="eyebrow">SWEET MOMENTS</p>
              <h2>From our kitchen to your table.</h2>
            </div>
            <a className="text-link" href="#">
              @maisoncakeco <Instagram size={16} />
            </a>
          </div>
          <div className="gallery">
            {[
              "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
              "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85",
              "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=900&q=85",
              "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=85",
            ].map((src, i) => (
              <img src={src} alt={`Bakery gallery ${i + 1}`} key={src} />
            ))}
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="shell newsletter-inner">
          <div>
            <p className="eyebrow light">STAY IN THE LOOP</p>
            <h2>A little sweetness, delivered.</h2>
            <p>Get new cake launches, seasonal treats and special offers.</p>
          </div>
          <form>
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
            />
            <button type="submit">
              Subscribe <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="shell footer-grid">
          <div>
            <div className="brand">
              MAISON<span>CAKE CO.</span>
            </div>
            <p>Handcrafted cakes made for life’s sweetest moments.</p>
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
