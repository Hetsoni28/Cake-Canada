"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Navbar } from "@/components/navbar";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight,
  Upload, X, Loader2, Heart, MapPin, ShoppingBag
} from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { createClient } from "@/lib/supabase/client";
import {
  CUSTOM_CAKE_WEIGHTS, OCCASIONS, STATIC_FLAVORS, CUSTOM_STEP_LABELS,
  type CustomCakeWeight, type Occasion, type CakeFlavor
} from "@/lib/custom-cake";

/* ─────────────────────────────────────────────────────────── */
/*  Types                                                      */
/* ─────────────────────────────────────────────────────────── */
interface OptionPrice { id: string; option_type: string; name: string; surcharge: number }
interface Addon       { id: string; name: string; price: number }
interface Bundle      { id: string; name: string; description: string; emoji: string; discount_pct: number; items: Addon[]; total_original: number; total_discounted: number; saving: number; addon_ids: string[] }
interface PriceResult { base_price: number; surcharges: number; addons_price: number; bundle_discount: number; per_item_price: number; total: number; breakdown: {name:string;amount:number}[]; verifiedAddons: Addon[] }

/* ─────────────────────────────────────────────────────────── */
/*  Step Progress Bar                                          */
/* ─────────────────────────────────────────────────────────── */
function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="builder-progress-wrap">
      <div className="builder-progress-bar">
        <div className="builder-progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>
      <p className="builder-progress-label">
        Step {current + 1} of {total} — <strong>{CUSTOM_STEP_LABELS[current]}</strong>
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Cake Message Preview                                       */
/* ─────────────────────────────────────────────────────────── */
function CakePreview({ message }: { message: string }) {
  return (
    <div className="cake-preview">
      <div className="cake-preview-plate">
        <div className="cake-preview-deco cake-preview-deco-1" />
        <div className="cake-preview-deco cake-preview-deco-2" />
        <p className="cake-preview-text">{message || "Your message here…"}</p>
        <p className="cake-preview-hint">Preview — actual placement may vary</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Main Component                                             */
/* ─────────────────────────────────────────────────────────── */
export default function CustomCakePage() {
  const { addItem } = useCart();

  // ── Step navigation ──
  const [step, setStep] = useState<number>(0);
  const TOTAL_STEPS = CUSTOM_STEP_LABELS.length;

  // ── Form state ──
  const [occasion, setOccasion]       = useState<Occasion | null>(null);
  const [weight, setWeight]           = useState<CustomCakeWeight | null>(null);
  const [flavor, setFlavor]           = useState<CakeFlavor | null>(null);
  const [frostingId, setFrostingId]   = useState("");
  const [designId, setDesignId]       = useState("");
  const [eggless, setEggless]         = useState(false);
  const [message, setMessage]         = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedBundleId, setSelectedBundleId] = useState("");
  const [quantity, setQuantity]       = useState(1);

  // ── Reference image ──
  const [imgFile, setImgFile]         = useState<File | null>(null);
  const [imgPreview, setImgPreview]   = useState<string | null>(null);
  const [imgUrl, setImgUrl]           = useState<string | null>(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError]       = useState("");
  const [isDragging, setIsDragging]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── DB data ──
  const [optionPrices, setOptionPrices] = useState<OptionPrice[]>([]);
  const [allAddons, setAllAddons]       = useState<Addon[]>([]);
  const [bundles, setBundles]           = useState<Bundle[]>([]);

  // ── Pricing ──
  const [priceData, setPriceData]   = useState<PriceResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // ── Added to cart ──
  const [added, setAdded] = useState(false);

  const frostings = optionPrices.filter(o => o.option_type === "frosting");
  const designs   = optionPrices.filter(o => o.option_type === "design");
  const egglessOpt = optionPrices.find(o => o.option_type === "eggless");

  // ── Fetch options on mount ──
  useEffect(() => {
    fetch("/api/bundles").then(r => r.json()).then(setBundles).catch(() => {});
    fetch("/api/custom-price-check").then(r => r.json()).catch(() => {}); // warm up
    // Fetch option prices
    const supabase = createClient();
    supabase.from("product_option_prices").select("id,option_type,name,surcharge").eq("is_active", true).order("display_order")
      .then(({ data }) => setOptionPrices(data ?? []));
    supabase.from("product_addons").select("id,name,price").eq("is_active", true).order("display_order")
      .then(({ data }) => setAllAddons(data ?? []));
  }, []);

  // ── Debounced price check (runs on step 9 = Review) ──
  useEffect(() => {
    if (step < 8 || !weight) return;
    setIsVerifying(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/custom-price-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weight_label: weight.label,
            eggless,
            frosting_id: frostingId,
            design_id: designId,
            addon_ids: selectedAddons,
            bundle_id: selectedBundleId,
            quantity,
          }),
        });
        if (res.ok) setPriceData(await res.json());
      } catch(e) { console.error(e); }
      finally { setIsVerifying(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [step, weight, eggless, frostingId, designId, selectedAddons, selectedBundleId, quantity]);

  // ── Image handling ──
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX_SIZE_MB = 5;

  function validateFile(file: File): string {
    if (!ALLOWED_TYPES.includes(file.type)) return "Only JPG, PNG, and WebP images are allowed.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `Image must be under ${MAX_SIZE_MB}MB.`;
    return "";
  }

  async function handleFileSelect(file: File) {
    const err = validateFile(file);
    if (err) { setImgError(err); return; }
    setImgError("");
    setImgFile(file);
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = e => setImgPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    // Upload to Supabase Storage
    setImgUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `public/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("cake-reference-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage
        .from("cake-reference-images")
        .getPublicUrl(path);
      setImgUrl(publicUrl);
    } catch(e: any) {
      setImgError("Upload failed — " + (e.message ?? "please try again."));
    } finally {
      setImgUploading(false);
    }
  }

  // ── Add-ons ──
  function toggleAddon(id: string) {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function selectBundle(b: Bundle) {
    if (selectedBundleId === b.id) {
      setSelectedBundleId("");
      setSelectedAddons([]);
    } else {
      setSelectedBundleId(b.id);
      setSelectedAddons(b.addon_ids);
    }
  }

  // ── Navigation ──
  const canAdvance = (): boolean => {
    if (step === 0) return !!occasion;
    if (step === 1) return !!weight;
    if (step === 2) return !!flavor;
    return true; // all remaining steps are optional
  };

  function goNext() {
    if (step < TOTAL_STEPS - 1 && canAdvance()) setStep(s => s + 1);
  }
  function goBack() {
    if (step > 0) setStep(s => s - 1);
  }

  // ── Add to cart (step 9) ──
  function handleAddToCart() {
    if (!priceData || !weight) return;
    addItem({
      productId: "custom-cake",
      variantId: weight.label,
      name: `Custom Cake — ${occasion?.label ?? ""}`,
      variantLabel: `${weight.label} · ${flavor?.name ?? ""}${eggless ? " (Eggless)" : ""}`,
      price: priceData.per_item_price,
      serverVerifiedPrice: priceData.per_item_price,
      quantity,
      image: imgPreview ?? "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
      slug: "custom-cake",
      flavor: flavor?.name,
      eggless,
      frosting: frostings.find(f => f.id === frostingId)?.name,
      design:   designs.find(d => d.id === designId)?.name,
      addons:   priceData.verifiedAddons,
    });
    setAdded(true);
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Step renderers                                             */
  /* ─────────────────────────────────────────────────────────── */

  function renderStep() {
    switch (step) {
      /* ── Step 0: Occasion ── */
      case 0: return (
        <div className="builder-step-content">
          <div className="builder-step-hero">
            <p className="eyebrow">Step 1</p>
            <h2>What&apos;s the occasion?</h2>
            <p>We&apos;ll personalise your cake recommendation.</p>
          </div>
          <div className="occasion-pick">
            {OCCASIONS.map(o => (
              <button
                key={o.id}
                onClick={() => setOccasion(o)}
                className={`occasion-pick-card${occasion?.id === o.id ? " active" : ""}`}
              >
                <span className="occasion-emoji">{o.emoji}</span>
                <strong>{o.label}</strong>
                <span>{o.tagline}</span>
              </button>
            ))}
          </div>
        </div>
      );

      /* ── Step 1: Size / Weight ── */
      case 1: return (
        <div className="builder-step-content">
          <div className="builder-step-hero">
            <p className="eyebrow">Step 2</p>
            <h2>Choose your size</h2>
            <p>All custom cakes are made fresh to order.</p>
          </div>
          <div className="size-pick">
            {CUSTOM_CAKE_WEIGHTS.map(w => (
              <button
                key={w.label}
                onClick={() => setWeight(w)}
                className={`size-pick-card${weight?.label === w.label ? " active" : ""}`}
              >
                <div className="size-weight">{w.label}</div>
                <div className="size-portions">{w.portions}</div>
                <div className="size-price">from ${w.base_price} CAD</div>
              </button>
            ))}
          </div>
        </div>
      );

      /* ── Step 2: Flavor ── */
      case 2: return (
        <div className="builder-step-content">
          <div className="builder-step-hero">
            <p className="eyebrow">Step 3</p>
            <h2>Choose your sponge flavor</h2>
            <p>Our bakers use only premium, fresh ingredients.</p>
          </div>
          <div className="flavor-pick">
            {STATIC_FLAVORS.map(f => (
              <button
                key={f.name}
                onClick={() => setFlavor(f)}
                className={`flavor-pick-card${flavor?.name === f.name ? " active" : ""}`}
              >
                <span className="flavor-emoji">{f.emoji}</span>
                <strong>{f.name}</strong>
                <span>{f.description}</span>
              </button>
            ))}
          </div>
        </div>
      );

      /* ── Step 3: Frosting & Design ── */
      case 3: return (
        <div className="builder-step-content">
          <div className="builder-step-hero">
            <p className="eyebrow">Step 4</p>
            <h2>Frosting & Design</h2>
            <p>Pick your finishing style — each adds a touch of magic.</p>
          </div>
          {frostings.length > 0 && (
            <div className="builder-option-section">
              <h3 className="option-label">Frosting Type</h3>
              <div className="radio-grid">
                {frostings.map(f => (
                  <button key={f.id} onClick={() => setFrostingId(f.id === frostingId ? "" : f.id)}
                    className={`radio-btn${frostingId === f.id ? " active" : ""}`}>
                    <span className="radio-circle" />
                    <div className="radio-content">
                      <span className="radio-name">{f.name}</span>
                      {f.surcharge > 0 && <span className="radio-price">+${f.surcharge}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {designs.length > 0 && (
            <div className="builder-option-section">
              <h3 className="option-label">Design & Decoration</h3>
              <div className="radio-grid">
                {designs.map(d => (
                  <button key={d.id} onClick={() => setDesignId(d.id === designId ? "" : d.id)}
                    className={`radio-btn${designId === d.id ? " active" : ""}`}>
                    <span className="radio-circle" />
                    <div className="radio-content">
                      <span className="radio-name">{d.name}</span>
                      {d.surcharge > 0 && <span className="radio-price">+${d.surcharge}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {frostings.length === 0 && designs.length === 0 && (
            <p className="builder-loading">Loading options…</p>
          )}
        </div>
      );

      /* ── Step 4: Eggless ── */
      case 4: return (
        <div className="builder-step-content">
          <div className="builder-step-hero">
            <p className="eyebrow">Step 5</p>
            <h2>Dietary preference</h2>
            <p>We accommodate all dietary requirements with no compromise on taste.</p>
          </div>
          <div className="dietary-pick">
            <button onClick={() => setEggless(false)} className={`dietary-card${!eggless ? " active" : ""}`}>
              <span>🥚</span>
              <strong>Standard</strong>
              <span>With eggs — richest texture</span>
            </button>
            <button onClick={() => setEggless(true)} className={`dietary-card${eggless ? " active" : ""}`}>
              <span>🌿</span>
              <strong>Eggless</strong>
              <span>
                Vegetarian-friendly
                {egglessOpt && egglessOpt.surcharge > 0 && ` (+$${egglessOpt.surcharge})`}
              </span>
            </button>
          </div>
        </div>
      );

      /* ── Step 5: Cake Message ── */
      case 5: return (
        <div className="builder-step-content">
          <div className="builder-step-hero">
            <p className="eyebrow">Step 6</p>
            <h2>Add a cake message</h2>
            <p>Your personal touch, written in every slice.</p>
          </div>
          <div className="cake-msg-wrap">
            <div className="cake-msg-header">
              <label htmlFor="cake-msg" className="option-label">Your message</label>
              <span className="cake-msg-chars">{message.length}/60</span>
            </div>
            <textarea
              id="cake-msg"
              className="cake-msg-input"
              placeholder="e.g. Happy Birthday Sarah ❤️"
              maxLength={60}
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          {message.trim() && (
            <div className="builder-preview-block">
              <p className="option-label">Preview</p>
              <CakePreview message={message} />
            </div>
          )}
          {!message.trim() && (
            <p className="builder-skip-hint">Leave blank to skip — our decorator will leave the cake unwritten.</p>
          )}
        </div>
      );

      /* ── Step 6: Reference Image ── */
      case 6: return (
        <div className="builder-step-content">
          <div className="builder-step-hero">
            <p className="eyebrow">Step 7</p>
            <h2>Upload a reference image</h2>
            <p>Show us your inspiration — we&apos;ll bring it to life.</p>
          </div>

          {!imgPreview ? (
            <div
              className={`upload-zone${isDragging ? " dragging" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault(); setIsDragging(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFileSelect(f);
              }}
            >
              <Upload size={36} className="upload-icon" />
              <p className="upload-title">Drop your image here</p>
              <p className="upload-sub">or click to browse — JPG, PNG, WebP up to 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
            </div>
          ) : (
            <div className="upload-preview-wrap">
              <img src={imgPreview} alt="Reference" className="upload-preview-img" />
              <div className="upload-preview-info">
                {imgUploading ? (
                  <div className="upload-status uploading"><Loader2 size={16} className="spinner" /> Uploading…</div>
                ) : imgUrl ? (
                  <div className="upload-status success"><Check size={16} /> Uploaded successfully</div>
                ) : null}
                <button className="upload-remove" onClick={() => { setImgFile(null); setImgPreview(null); setImgUrl(null); setImgError(""); }}>
                  <X size={14} /> Remove
                </button>
              </div>
            </div>
          )}

          {imgError && <p className="upload-error">{imgError}</p>}

          <p className="builder-skip-hint">Optional — skip if you don&apos;t have a reference image.</p>
        </div>
      );

      /* ── Step 7: Add-ons & Bundles ── */
      case 7: return (
        <div className="builder-step-content">
          <div className="builder-step-hero">
            <p className="eyebrow">Step 8</p>
            <h2>Add-ons & Bundles</h2>
            <p>Make it extra special with curated extras.</p>
          </div>

          {/* Bundles */}
          {bundles.length > 0 && (
            <div className="builder-option-section">
              <h3 className="option-label">Occasion Bundles</h3>
              <p className="builder-section-hint">Pick a bundle to save — or choose individual add-ons below.</p>
              <div className="bundle-grid">
                {bundles.map(b => (
                  <button
                    key={b.id}
                    onClick={() => selectBundle(b)}
                    className={`bundle-card${selectedBundleId === b.id ? " active" : ""}`}
                  >
                    <div className="bundle-head">
                      <span className="bundle-emoji">{b.emoji}</span>
                      <div>
                        <strong className="bundle-name">{b.name}</strong>
                        <span className="bundle-discount">Save {b.discount_pct}%</span>
                      </div>
                      {selectedBundleId === b.id && <Check size={16} className="bundle-check" />}
                    </div>
                    <p className="bundle-desc">{b.description}</p>
                    <div className="bundle-items">
                      {b.items.map(i => <span key={i.id} className="bundle-tag">{i.name}</span>)}
                    </div>
                    <div className="bundle-price-row">
                      <span className="bundle-original">${b.total_original.toFixed(2)}</span>
                      <span className="bundle-final">${b.total_discounted.toFixed(2)}</span>
                      <span className="bundle-saving">Save ${b.saving.toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Individual add-ons */}
          <div className="builder-option-section">
            <h3 className="option-label">Individual Add-ons</h3>
            <div className="addon-grid">
              {allAddons.map(a => {
                const checked = selectedAddons.includes(a.id);
                return (
                  <button key={a.id} onClick={() => toggleAddon(a.id)}
                    className={`addon-item${checked ? " checked" : ""}`}>
                    <div className="checkbox" />
                    <span className="addon-name">{a.name}</span>
                    <span className="addon-price">+${a.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );

      /* ── Step 8: Review ── */
      case 8: return (
        <div className="builder-step-content">
          <div className="builder-step-hero">
            <p className="eyebrow">Step 9</p>
            <h2>Review your cake</h2>
            <p>Everything look right? Make changes before adding to cart.</p>
          </div>

          <div className="review-card">
            {[
              { label: "Occasion",  value: occasion ? `${occasion.emoji} ${occasion.label}` : "—",    step: 0 },
              { label: "Size",      value: weight  ? `${weight.label} · ${weight.portions}`  : "—",   step: 1 },
              { label: "Flavor",    value: flavor  ? `${flavor.emoji} ${flavor.name}`         : "—",   step: 2 },
              { label: "Frosting",  value: frostings.find(f => f.id === frostingId)?.name ?? "Standard", step: 3 },
              { label: "Design",    value: designs.find(d => d.id === designId)?.name ?? "Simple & Elegant", step: 3 },
              { label: "Dietary",   value: eggless ? "🌿 Eggless" : "🥚 Standard",             step: 4 },
              { label: "Message",   value: message.trim() || "No message",                     step: 5 },
              { label: "Reference", value: imgUrl ? "✅ Image uploaded" : "No image",           step: 6 },
              { label: "Add-ons",   value: selectedAddons.length > 0 ? `${selectedAddons.length} selected` : "None", step: 7 },
            ].map(row => (
              <div key={row.label} className="review-row">
                <span className="review-label">{row.label}</span>
                <span className="review-value">{row.value}</span>
                <button className="review-edit" onClick={() => setStep(row.step)} aria-label={`Edit ${row.label}`}>
                  Edit
                </button>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="review-price-card">
            {isVerifying ? (
              <div className="price-verifying"><Loader2 className="spinner" size={16} /> Calculating price…</div>
            ) : priceData ? (
              <>
                {priceData.breakdown.map((b, i) => (
                  <div key={i} className="price-breakdown-row">
                    <span>{b.name}</span>
                    <span className={b.amount < 0 ? "price-discount" : ""}>${Math.abs(b.amount).toFixed(2)}{b.amount < 0 ? " off" : ""}</span>
                  </div>
                ))}
                <div className="price-total-row">
                  <span>Total per cake</span>
                  <strong>${priceData.per_item_price.toFixed(2)} CAD</strong>
                </div>
              </>
            ) : (
              <p className="builder-loading">Select all options to see price.</p>
            )}
          </div>

          {/* Quantity */}
          <div className="review-qty-row">
            <span className="option-label">Quantity</span>
            <div className="qty-controls">
              <button onClick={() => setQuantity(q => Math.max(1, q-1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q+1)}>+</button>
            </div>
            {priceData && <span className="review-total-hint">Total: ${(priceData.per_item_price * quantity).toFixed(2)}</span>}
          </div>
        </div>
      );

      /* ── Step 9: Add to Cart ── */
      case 9: return (
        <div className="builder-step-content builder-final-step">
          {added ? (
            <div className="builder-success">
              <div className="builder-success-icon">🎂</div>
              <h2>Your custom cake is in the cart!</h2>
              <p>Our bakers will review your order and confirm the details with you.</p>
              <div className="builder-success-actions">
                <a href="/cart" className="btn btn-dark">View Cart <ShoppingBag size={16} /></a>
                <a href="/cakes" className="btn btn-outline">Keep Shopping</a>
              </div>
            </div>
          ) : (
            <>
              <div className="builder-step-hero">
                <p className="eyebrow">Step 10</p>
                <h2>Add to Cart</h2>
                <p>Your custom cake will be reviewed by our team before baking begins.</p>
              </div>

              {/* Final summary card */}
              <div className="final-summary">
                <div className="final-summary-img">
                  <img
                    src={imgPreview ?? "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"}
                    alt="Cake preview"
                  />
                </div>
                <div className="final-summary-info">
                  <p className="eyebrow">{occasion?.label ?? "Custom Cake"}</p>
                  <h3>{weight?.label} · {flavor?.name ?? "—"}</h3>
                  {message && <p className="final-message">&ldquo;{message}&rdquo;</p>}
                  <div className="final-price">
                    {isVerifying ? (
                      <div className="price-verifying"><Loader2 className="spinner" size={16} /> Calculating…</div>
                    ) : priceData ? (
                      <span className="product-price">${(priceData.per_item_price * quantity).toFixed(2)} CAD</span>
                    ) : null}
                  </div>
                  <button
                    className="btn btn-dark add-to-cart-btn-main"
                    onClick={handleAddToCart}
                    disabled={isVerifying || !priceData}
                  >
                    {isVerifying ? "Calculating…" : "Add Custom Cake to Cart"}
                  </button>
                </div>
              </div>

              <div className="builder-trust">
                <p>✅ Our team will confirm your design within 24 hrs</p>
                <p>✅ Changes can be made up to 48 hrs before delivery</p>
                <p>✅ Secure checkout — pay only at confirmation</p>
              </div>
            </>
          )}
        </div>
      );

      default: return null;
    }
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Render                                                     */
  /* ─────────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-ivory text-espresso">
      <div className="announcement">
        Freshly baked · Local delivery · Custom cakes available
      </div>
      <Navbar />

      <StepProgress current={step} total={TOTAL_STEPS} />

      <div className="builder-wrap shell">
        <div className="builder-main">
          {/* Step card */}
          <div className="builder-card">
            {renderStep()}

            {/* Navigation */}
            {step < TOTAL_STEPS - 1 && !added && (
              <div className="builder-nav">
                {step > 0 && (
                  <button className="btn btn-outline builder-back" onClick={goBack}>
                    <ArrowLeft size={16} /> Back
                  </button>
                )}
                <button
                  className="btn btn-dark builder-next"
                  onClick={goNext}
                  disabled={!canAdvance()}
                >
                  {step === TOTAL_STEPS - 2 ? "Review Cake" : "Continue"}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar summary */}
        <aside className="builder-sidebar">
          <div className="builder-summary-card">
            <h3>Your Cake So Far</h3>
            <div className="summary-lines">
              {occasion && <div className="summary-line"><span>Occasion</span><strong>{occasion.emoji} {occasion.label}</strong></div>}
              {weight   && <div className="summary-line"><span>Size</span><strong>{weight.label}</strong></div>}
              {flavor   && <div className="summary-line"><span>Flavor</span><strong>{flavor.emoji} {flavor.name}</strong></div>}
              {(frostingId || designId) && (
                <div className="summary-line">
                  <span>Extras</span>
                  <strong>{[frostings.find(f=>f.id===frostingId)?.name, designs.find(d=>d.id===designId)?.name].filter(Boolean).join(" + ")}</strong>
                </div>
              )}
              {eggless && <div className="summary-line"><span>Dietary</span><strong>🌿 Eggless</strong></div>}
              {message && <div className="summary-line"><span>Message</span><strong>&ldquo;{message.slice(0,24)}{message.length>24?"…":""}&rdquo;</strong></div>}
              {selectedAddons.length > 0 && <div className="summary-line"><span>Add-ons</span><strong>{selectedAddons.length} item{selectedAddons.length>1?"s":""}</strong></div>}

              {!occasion && !weight && !flavor && (
                <p className="summary-empty">Your selections will appear here as you build your cake.</p>
              )}
            </div>

            {priceData && step >= 8 && (
              <div className="summary-price">
                <span>Est. Price</span>
                <strong>${priceData.per_item_price.toFixed(2)} CAD</strong>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="footer mt-80">
        <div className="shell footer-grid">
          <div>
            <div className="brand">MAISON<span>CAKE CO.</span></div>
            <p>Handcrafted cakes for life&apos;s sweetest moments.</p>
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
            <p><MapPin size={15} /> Canada</p>
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
