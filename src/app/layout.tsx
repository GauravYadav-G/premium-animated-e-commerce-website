import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer, Toasts } from "@/components/cart-drawer";
import { Cursor } from "@/components/cursor";
import { Preloader } from "@/components/preloader";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Fashion by Gaurav — Considered Luxury Fashion, Made to Be Kept",
  description:
    "Fashion by Gaurav is an artisanal luxury house crafting traceable, slow-made designer fashion from regenerative and reclaimed materials.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="grain bg-bone text-ink antialiased">
        <CartProvider>
          <Preloader />
          <Cursor />
          <SiteHeader />
          <main className="pt-[92px]">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <Toasts />
        </CartProvider>
      </body>
    </html>
  );
}
