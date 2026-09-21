import { createAdminClient } from '@/lib/supabase/admin'
import { Plus, Edit2, CheckCircle2, XCircle, Trash2 } from 'lucide-react'

export const metadata = {
  title: 'Categories - Admin | Maison Cake Co.',
}

export default async function AdminCategoriesPage() {
  const admin = createAdminClient()
  
  const { data: categories } = await admin
    .from('categories')
    .select(`
      id,
      name,
      slug,
      is_active,
      products (id)
    `)
    .order('display_order')

  return (
    <div className="admin-container shell" style={{ padding: '2rem' }}>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Categories</h1>
          <p style={{ color: '#64748b' }}>Manage product categories ({categories?.length || 0} categories)</p>
        </div>
        <a href="/admin/categories/new" className="btn btn-dark" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Add Category
        </a>
      </div>

      <div className="admin-table-card" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: 500, color: '#475569' }}>Name</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: '#475569' }}>Slug</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: '#475569' }}>Products</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: '#475569' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: '#475569', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((category: any) => (
              <tr key={category.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 500 }}>{category.name}</div>
                </td>
                <td style={{ padding: '1rem', color: '#64748b' }}>
                  {category.slug}
                </td>
                <td style={{ padding: '1rem', color: '#64748b' }}>
                  {category.products?.length || 0}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className="admin-badge" style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    background: category.is_active ? '#dcfce7' : '#f1f5f9',
                    color: category.is_active ? '#166534' : '#475569'
                  }}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <form action={`/api/admin/categories/${category.id}`} method="POST">
                      <input type="hidden" name="_method" value="PATCH" />
                      <input type="hidden" name="is_active" value={String(!category.is_active)} />
                      <button 
                        type="submit" 
                        title="Toggle Status"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}
                      >
                        {category.is_active ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                      </button>
                    </form>
                    
                    <a 
                      href={`/admin/categories/${category.id}/edit`} 
                      style={{ color: '#64748b', padding: '0.25rem' }}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </a>
                    
                    <form action={`/api/admin/categories/${category.id}`} method="POST" onSubmit={(e) => {
                      if (!confirm('Are you sure you want to delete this category?')) {
                        e.preventDefault()
                      }
                    }}>
                      <input type="hidden" name="_method" value="DELETE" />
                      <button 
                        type="submit" 
                        title="Delete"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(!categories || categories.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No categories found. Add your first category!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
