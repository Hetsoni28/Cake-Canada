"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ArrowLeft } from "lucide-react"

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(console.error)
  }, [])

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    category_id: "",
    base_price: "0",
    preparation_time_minutes: "1440",
    is_featured: false,
    is_best_seller: false,
    is_available: true,
    is_customizable: true,
    is_eggless_available: true
  })

  const [variants, setVariants] = useState([
    { id: 'v1', name: "0.5kg", weight_kg: "0.5", flavor: "Signature", price: "45" },
    { id: 'v2', name: "1kg", weight_kg: "1", flavor: "Signature", price: "80" },
    { id: 'v3', name: "1.5kg", weight_kg: "1.5", flavor: "Signature", price: "115" },
    { id: 'v4', name: "2kg", weight_kg: "2", flavor: "Signature", price: "145" }
  ])

  const [images, setImages] = useState([
    { id: 'i1', url: "" }
  ])

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    setFormData({ ...formData, name, slug })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          base_price: Number(formData.base_price),
          preparation_time_minutes: Number(formData.preparation_time_minutes),
          variants: variants.map(v => ({
            name: v.name,
            weight_kg: Number(v.weight_kg),
            flavor: v.flavor,
            price: Number(v.price)
          })),
          images: images.filter(img => img.url.trim() !== '').map(img => img.url)
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create product')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="shell" style={{ padding: '2rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Products
        </a>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Add New Product</h1>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Basic Info */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 500 }}>Basic Information</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name *</label>
              <input 
                type="text" 
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                value={formData.name}
                onChange={e => handleNameChange(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Slug *</label>
              <input 
                type="text" 
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category *</label>
              <select 
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Base Price ($) *</label>
              <input 
                type="number" 
                step="0.01"
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                value={formData.base_price}
                onChange={e => setFormData({...formData, base_price: e.target.value})}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Short Description (Max 160 chars)</label>
            <textarea 
              maxLength={160}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', height: '80px' }}
              value={formData.short_description}
              onChange={e => setFormData({...formData, short_description: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Detailed Description</label>
            <textarea 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', height: '150px' }}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Preparation Time</label>
            <select 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              value={formData.preparation_time_minutes}
              onChange={e => setFormData({...formData, preparation_time_minutes: e.target.value})}
            >
              <option value="720">12 Hours</option>
              <option value="1440">24 Hours</option>
              <option value="2880">48 Hours</option>
              <option value="4320">72 Hours</option>
            </select>
          </div>
        </div>

        {/* Settings / Checkboxes */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 500 }}>Product Settings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { id: 'is_available', label: 'Available (Active)' },
              { id: 'is_featured', label: 'Featured Product' },
              { id: 'is_best_seller', label: 'Best Seller' },
              { id: 'is_customizable', label: 'Customizable' },
              { id: 'is_eggless_available', label: 'Eggless Available' },
            ].map(setting => (
              <label key={setting.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  // @ts-ignore
                  checked={formData[setting.id]}
                  // @ts-ignore
                  onChange={e => setFormData({...formData, [setting.id]: e.target.checked})}
                />
                {setting.label}
              </label>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Variants</h2>
            <button 
              type="button" 
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
              onClick={() => setVariants([...variants, { id: Date.now().toString(), name: "", weight_kg: "", flavor: "", price: formData.base_price }])}
            >
              <Plus size={16} /> Add Variant
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.5rem' }}>Name</th>
                  <th style={{ padding: '0.5rem' }}>Weight (kg)</th>
                  <th style={{ padding: '0.5rem' }}>Flavor</th>
                  <th style={{ padding: '0.5rem' }}>Price ($)</th>
                  <th style={{ padding: '0.5rem', width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr key={variant.id}>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="text" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        value={variant.name} onChange={e => { const v = [...variants]; v[index].name = e.target.value; setVariants(v); }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="number" step="0.1" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        value={variant.weight_kg} onChange={e => { const v = [...variants]; v[index].weight_kg = e.target.value; setVariants(v); }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="text" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        value={variant.flavor} onChange={e => { const v = [...variants]; v[index].flavor = e.target.value; setVariants(v); }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="number" step="0.01" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        value={variant.price} onChange={e => { const v = [...variants]; v[index].price = e.target.value; setVariants(v); }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <button 
                        type="button" 
                        onClick={() => setVariants(variants.filter(v => v.id !== variant.id))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Images */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Images (URLs)</h2>
            <button 
              type="button" 
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
              onClick={() => setImages([...images, { id: Date.now().toString(), url: "" }])}
            >
              <Plus size={16} /> Add Image
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {images.map((img, index) => (
              <div key={img.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/photo-..."
                  style={{ flex: 1, padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  value={img.url}
                  onChange={e => { const i = [...images]; i[index].url = e.target.value; setImages(i); }}
                />
                <button 
                  type="button" 
                  onClick={() => setImages(images.filter(i => i.id !== img.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <a href="/admin/products" className="btn btn-outline" style={{ textDecoration: 'none', padding: '0.75rem 1.5rem' }}>
            Cancel
          </a>
          <button type="submit" className="btn btn-dark" disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>

      </form>
    </div>
  )
}
