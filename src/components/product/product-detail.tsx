"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Check, ChevronDown, Leaf, Minus, Plus, RotateCcw, Truck } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { EASE_SILK, Magnetic, MaskText, Reveal } from "@/components/motion-primitives";
import { cn, formatPrice, formatRating } from "@/lib/utils";
import type { ProductDTO } from "@/lib/types";

const PROMISES = [
  { icon: Truck, label: "Carbon-neutral shipping" },
  { icon: RotateCcw, label: "30-day easy returns" },
  { icon: Leaf, label: "Free repairs for life" },
];

export function ProductDetail({ product }: { product: ProductDTO }) {
  const { addItem, isBusy } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  const sections = [
    { id: "details", title: "Details & fit", body: product.details },
    {
      id: "material",
      title: "Material & care",
      body: [
        product.material,
        "Wash cold on a gentle cycle or hand wash with a pH-neutral detergent.",
        "Dry flat in shade. Steam rather than iron to preserve the fibre.",
        "Store folded; hanging stretches natural knits over time.",
      ],
    },
    {
      id: "shipping",
      title: "Shipping & returns",
      body: [
        "Complimentary carbon-neutral shipping on orders over ₹250.",
        "Delivery estimates are confirmed after dispatch.",
        "30-day returns, prepaid label included in every parcel.",
        "Free lifetime repairs through the Bliss Mending Service.",
      ],
    },
  ];

  async function handleAdd() {
    if (!size) {
      setError("Please choose a size first.");
      return;
    }
    setError("");
    await addItem({
      productId: product.id,
      size,
      quantity,
      name: product.name,
      image: product.images[0],
    });
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-24 pt-10 md:px-10 md:pt-14">
      <nav className="label-xs flex items-center gap-2 text-mist">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <span>/</span>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-ink">
          {product.category}
        </Link>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.08fr_1fr] lg:gap-16">
        {/* Gallery */}
        <div className="flex gap-4">
          <div className="hidden w-[76px] shrink-0 flex-col gap-3 sm:flex">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(index)}
                className={cn(
                  "relative aspect-[3/4] overflow-hidden rounded-[2px] border transition-all duration-500",
                  activeImage === index ? "border-ink" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          <div
            className="relative aspect-[3/4] flex-1 cursor-zoom-in overflow-hidden rounded-[2px] bg-sand"
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setZoom({
                active: true,
                x: ((event.clientX - rect.left) / rect.width) * 100,
                y: ((event.clientY - rect.top) / rect.height) * 100,
              });
            }}
            onMouseLeave={() => setZoom({ active: false, x: 50, y: 50 })}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={product.images[activeImage]}
                src={product.images[activeImage]}
                alt={product.name}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE_SILK }}
                style={{
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                  transform: zoom.active ? "scale(1.55)" : "scale(1)",
                  transition: "transform 0.8s cubic-bezier(0.19,1,0.22,1)",
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            {product.badge && (
              <span className="label-xs absolute left-4 top-4 rounded-full bg-bone/90 px-3 py-1.5 backdrop-blur">
                {product.badge}
              </span>
            )}

            <div className="absolute bottom-4 left-4 flex gap-1.5 sm:hidden">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  aria-label={`Image ${index + 1}`}
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    activeImage === index ? "w-7 bg-ink" : "w-1.5 bg-ink/30",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:sticky lg:top-[120px] lg:h-fit">
          <p className="label-xs text-mist">{product.collection}</p>
          <MaskText
            text={product.name}
            className="font-display mt-4 text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[0.95]"
          />
          <p className="mt-4 text-[15px] italic text-clay">{product.tagline}</p>

          <div className="mt-6 flex flex-wrap items-center gap-5">
            <span className="font-display text-[26px]">{formatPrice(product.priceCents)}</span>
            {product.compareAtCents && (
              <span className="text-[15px] text-mist line-through">
                {formatPrice(product.compareAtCents)}
              </span>
            )}
            <span className="flex items-center gap-2 text-[12px] text-ink-soft">
              <span className="text-clay">★★★★★</span>
              {formatRating(product.ratingX10)} · {product.reviewCount} reviews
            </span>
          </div>

          <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            {product.description}
          </p>

          <div className="mt-8 flex items-center gap-3">
            <span
              className="h-6 w-6 rounded-full ring-1 ring-ink/20 ring-offset-2 ring-offset-bone"
              style={{ backgroundColor: product.colorHex }}
            />
            <span className="label-xs">{product.colorName}</span>
            <span className="text-mist">·</span>
            <span className="text-[12px] text-mist">{product.material}</span>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <span className="label-xs">Select size</span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-mist">
                {product.stock < 15 ? `Only ${product.stock} left` : "In stock"}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSize(option);
                    setError("");
                  }}
                  className={cn(
                    "min-w-[62px] rounded-full border px-5 py-3 text-[12px] uppercase tracking-[0.14em] transition-all duration-500",
                    size === option
                      ? "border-ink bg-ink text-bone"
                      : "border-ink/20 hover:border-ink",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-5 rounded-full border border-ink/20 px-5 py-3.5">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="transition-opacity hover:opacity-50"
              >
                <Minus size={13} strokeWidth={1.7} />
              </button>
              <span className="w-5 text-center text-[14px]">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                className="transition-opacity hover:opacity-50"
              >
                <Plus size={13} strokeWidth={1.7} />
              </button>
            </div>

            <Magnetic strength={0.18} className="flex-1">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleAdd()}
                className="btn-sweep btn-sweep-light group flex w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 text-bone transition-colors duration-500 hover:text-ink disabled:opacity-60"
              >
                <span className="label-xs">
                  {isBusy ? "Adding…" : `Add to bag — ${formatPrice(product.priceCents * quantity)}`}
                </span>
              </button>
            </Magnetic>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-[12px] text-ember"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <ul className="mt-8 grid gap-3 border-y border-ink/10 py-6 sm:grid-cols-3">
            {PROMISES.map((promise) => (
              <li key={promise.label} className="flex items-center gap-2.5 text-[12px] text-ink-soft">
                <promise.icon size={15} strokeWidth={1.5} className="text-moss" />
                {promise.label}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {sections.map((section) => {
              const open = openSection === section.id;
              return (
                <div key={section.id} className="border-b border-ink/10">
                  <button
                    type="button"
                    onClick={() => setOpenSection(open ? null : section.id)}
                    className="flex w-full items-center justify-between py-5 text-left"
                  >
                    <span className="label-xs">{section.title}</span>
                    <motion.span
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.5, ease: EASE_SILK }}
                    >
                      <ChevronDown size={15} strokeWidth={1.5} />
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.55, ease: EASE_SILK }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-2.5 pb-6">
                      {section.body.map((line) => (
                        <li key={line} className="flex gap-3 text-[14px] leading-relaxed text-ink-soft">
                          <Check size={13} strokeWidth={1.6} className="mt-1 shrink-0 text-moss" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              );
            })}
          </div>

          <Reveal delay={0.1} className="mt-8">
            <p className="text-[12px] leading-relaxed text-mist">
              Made in a workshop we have visited. Fibre traceable to farm level. This piece offsets
              1.4kg CO₂e against a conventional equivalent.
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
