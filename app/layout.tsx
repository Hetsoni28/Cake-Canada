import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: {
    default: "Maison Cake Co. | Handcrafted Cakes",
    template: "%s | Maison Cake Co.",
  },
  description:
    "Premium handcrafted cakes made for life's sweetest moments. Custom birthday, wedding, and celebration cakes delivered across Canada.",
  keywords: [
    "cake",
    "custom cake",
    "birthday cake",
    "wedding cake",
    "Canada",
    "bakery",
  ],
  openGraph: {
    title: "Maison Cake Co.",
    description: "Handcrafted cakes for life's sweetest moments.",
    type: "website",
    locale: "en_CA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
