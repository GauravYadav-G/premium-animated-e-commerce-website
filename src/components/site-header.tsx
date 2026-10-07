"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { EASE_SILK, useScrollProgress } from "@/components/motion-primitives";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=Outerwear", label: "Outerwear" },
  { href: "/shop?category=Knitwear", label: "Knitwear" },
  { href: "/shop?category=Bags", label: "Bags" },
  { href: "/atelier", label: "Atelier" },
];


const TICKER = [
  "Carbon-neutral delivery worldwide",
  "Free shipping over ₹4,999",
  "Lifetime repairs on every piece",
  "Certified B Corp since 2019",
  "100% traceable supply chain",
];

export function SiteHeader() {
  const { cart, openCart } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const progress = useScrollProgress();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 24);
    setHidden(latest > previous && latest > 320 && !menuOpen);
  });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -120 }}
        animate={{ y: hidden ? -120 : 0 }}
        transition={{ duration: 0.7, ease: EASE_SILK }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="overflow-hidden border-b border-ink/10 bg-ink text-bone marquee-pause">
          <div className="flex w-max animate-marquee items-center py-2">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center">
                {TICKER.map((item) => (
                  <span key={`${dup}-${item}`} className="label-xs flex items-center gap-6 px-6 opacity-80">
                    {item}<span className="text-clay">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "relative transition-all duration-700",
            scrolled
              ? "bg-bone/85 backdrop-blur-xl shadow-[0_1px_0_rgba(21,20,15,0.08)]"
              : "bg-transparent",
          )}
        >
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-10">
            <div className="flex items-center gap-10">
              <Link href="/" className="group relative">
                <span className="font-display text-[22px] leading-none tracking-[-0.02em] md:text-[26px]">
                  Fashion by Gaurav
                </span>
                <span className="absolute -right-3 top-0 h-1 w-1 rounded-full bg-ember transition-transform duration-500 group-hover:scale-[2.4]" />
              </Link>
              <nav className="hidden items-center gap-7 lg:flex">
                {NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="label-xs link-sweep text-ink-soft transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-5">
              <Link
                href="/shop#shop-search"
                aria-label="Search the store"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 transition-all duration-500 hover:border-ink hover:bg-ink hover:text-bone"
              >
                <Search size={15} strokeWidth={1.5} />
              </Link>
              <button
                type="button"
                onClick={openCart}
                className="group flex items-center gap-2.5 rounded-full border border-ink/15 px-4 py-2 transition-all duration-500 hover:border-ink hover:bg-ink hover:text-bone"
              >
                <ShoppingBag size={15} strokeWidth={1.5} />
                <span className="label-xs">Bag</span>
                <motion.span
                  key={cart.count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: EASE_SILK }}
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-bone group-hover:bg-bone group-hover:text-ink"
                >
                  {cart.count}
                </motion.span>
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-bone lg:hidden"
              >
                <Menu size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <motion.div
            style={{ scaleX: progress }}
            className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-ember/70"
          />
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[70] bg-ink text-bone"
          >
            <motion.div
              initial={{ y: "-6%" }}
              animate={{ y: 0 }}
              exit={{ y: "-6%" }}
              transition={{ duration: 0.8, ease: EASE_SILK }}
              className="flex h-full flex-col px-6 py-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl">Fashion by Gaurav</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/25"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
              <nav className="mt-16 flex flex-1 flex-col gap-2">
                {NAV.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index + 0.15, duration: 0.8, ease: EASE_SILK }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="font-display block border-b border-bone/10 py-4 text-[38px] leading-none"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <p className="label-xs text-bone/50">hello@bliss.studio — Lisbon · Copenhagen</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
