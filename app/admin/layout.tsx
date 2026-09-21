import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import {
  Package,
  Users,
  ShoppingBag,
  LayoutDashboard,
  MapPin,
  LogOut,
  Tag,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {}, // read-only in layout
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "OWNER") redirect("/");

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <a href="/">
            MAISON<span>CAKE CO.</span>
          </a>
          <span className="admin-badge">ADMIN</span>
        </div>

        <nav className="admin-nav">
          <a href="/admin" className="admin-nav-link">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="/admin/orders" className="admin-nav-link">
            <Package size={18} /> Orders
          </a>
          <a href="/admin/products" className="admin-nav-link">
            <ShoppingBag size={18} /> Products
          </a>
          <a href="/admin/categories" className="admin-nav-link">
            <Tag size={18} /> Categories
          </a>
          <a href="/admin/customers" className="admin-nav-link">
            <Users size={18} /> Customers
          </a>
          <a href="/admin/delivery" className="admin-nav-link">
            <MapPin size={18} /> Delivery Zones
          </a>
        </nav>

        <div className="admin-user">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {profile.full_name?.charAt(0) ?? "A"}
            </div>
            <div>
              <p className="admin-name">{profile.full_name}</p>
              <p className="admin-email">{user.email}</p>
            </div>
          </div>
          <form action="/auth/logout" method="POST">
            <button className="admin-logout" title="Sign out">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="admin-main">{children}</main>
    </div>
  );
}
