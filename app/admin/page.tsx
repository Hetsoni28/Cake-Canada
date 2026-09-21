import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Package, Users, ShoppingBag, TrendingUp } from "lucide-react";
import { OrderStatusBadge } from "@/components/ui/badge";

export const metadata = { title: "Dashboard | Admin" };

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

async function getStats(supabase: SupabaseClient) {
  const [orders, customers, products] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total_amount, status", { count: "exact" }),
    supabase
      .from("profiles")
      .select("id", { count: "exact" })
      .eq("role", "CUSTOMER"),
    supabase
      .from("products")
      .select("id", { count: "exact" })
      .eq("is_active", true),
  ]);
  const rows = (orders.data ?? []) as {
    status: string;
    total_amount: number;
  }[];
  const revenue = rows
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return {
    totalOrders: orders.count ?? 0,
    totalCustomers: customers.count ?? 0,
    totalProducts: products.count ?? 0,
    totalRevenue: revenue,
    pendingOrders: rows.filter((o) => o.status === "PENDING").length,
  };
}

export default async function AdminOverviewPage() {
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

  const stats = await getStats(supabase);
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total_amount, status, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  const orders = (recentOrders ?? []) as OrderRow[];

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Here's what's happening at Maison Cake Co. today.</p>
        </div>
      </div>

      {stats.pendingOrders > 0 && (
        <div
          style={{
            background: "#fff8e1",
            border: "1px solid #ffe082",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 28,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <Package size={20} style={{ color: "#f9a825" }} />
          <p style={{ margin: 0, fontSize: 14, color: "#856404" }}>
            You have <strong>{stats.pendingOrders}</strong> pending{" "}
            {stats.pendingOrders === 1 ? "order" : "orders"} awaiting review.
            <a
              href="/admin/orders"
              style={{ marginLeft: 12, color: "#b5763a", fontWeight: 600 }}
            >
              Review now →
            </a>
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}
      >
        {[
          {
            icon: TrendingUp,
            label: "Total Revenue",
            value: `$${stats.totalRevenue.toFixed(2)} CAD`,
            color: "var(--caramel)",
          },
          {
            icon: Package,
            label: "Total Orders",
            value: stats.totalOrders,
            color: "#1976d2",
          },
          {
            icon: Users,
            label: "Customers",
            value: stats.totalCustomers,
            color: "#388e3c",
          },
          {
            icon: ShoppingBag,
            label: "Active Products",
            value: stats.totalProducts,
            color: "#7b1fa2",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 24,
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "var(--cream)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--taupe)",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </span>
              </div>
              <p
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  margin: 0,
                  fontFamily: "var(--font-heading)",
                }}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 18, margin: 0 }}>Recent Orders</h2>
        <a href="/admin/orders" className="btn btn-outline btn-sm">
          View All
        </a>
      </div>

      <div className="admin-table-card">
        {orders.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "var(--taupe)",
            }}
          >
            No orders yet.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.order_number}</td>
                  <td>{order.customer_name}</td>
                  <td style={{ fontWeight: 500 }}>
                    ${Number(order.total_amount).toFixed(2)}
                  </td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td style={{ color: "var(--taupe)" }}>
                    {new Date(order.created_at).toLocaleDateString("en-CA", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
