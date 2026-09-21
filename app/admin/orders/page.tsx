import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { OrderStatusBadge } from "@/components/ui/badge";
import { Eye, CheckCircle, Package } from "lucide-react";

export const metadata = { title: "Orders | Admin" };

export default async function AdminOrdersPage() {
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

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, total_amount, status, created_at, delivery_date",
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Orders</h1>
          <p>Review and manage customer orders.</p>
        </div>
      </div>

      <div className="admin-table-card">
        {!orders || orders.length === 0 ? (
          <div
            style={{
              padding: "64px",
              textAlign: "center",
              color: "var(--taupe)",
            }}
          >
            <Package
              size={32}
              style={{ opacity: 0.5, margin: "0 auto 16px" }}
            />
            <p>No orders received yet.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Delivery Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.order_number}</td>
                  <td>{order.customer_name}</td>
                  <td style={{ color: "var(--taupe)" }}>
                    {order.delivery_date
                      ? new Date(order.delivery_date).toLocaleDateString(
                          "en-CA",
                          { weekday: "short", month: "short", day: "numeric" },
                        )
                      : "N/A"}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    ${Number(order.total_amount).toFixed(2)}
                  </td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: "flex-end",
                      }}
                    >
                      {order.status === "PENDING" && (
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            color: "#388e3c",
                            cursor: "pointer",
                          }}
                          title="Mark Confirmed"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--taupe)",
                          cursor: "pointer",
                        }}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
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
