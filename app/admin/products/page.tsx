import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Plus, Edit2, Archive } from "lucide-react";

export const metadata = { title: "Products | Admin" };

export default async function AdminProductsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const { data: products } = await supabase
    .from("products")
    .select(
      `
      id, name, is_active,
      product_variants ( price )
    `,
    )
    .order("name");

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Products</h1>
          <p>Manage your cake catalogue and variants.</p>
        </div>
        <button
          className="btn btn-dark"
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Starting Price</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => {
              const prices = p.product_variants.map((v: any) => v.price);
              const minPrice = prices.length ? Math.min(...prices) : 0;
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        background: p.is_active ? "#e8f5e9" : "#f5f5f5",
                        color: p.is_active ? "#2e7d32" : "var(--taupe)",
                      }}
                    >
                      {p.is_active ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td>${minPrice.toFixed(2)} CAD</td>
                  <td style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--taupe)",
                          cursor: "pointer",
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--taupe)",
                          cursor: "pointer",
                        }}
                      >
                        <Archive size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
