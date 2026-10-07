"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus, Star } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { EASE_SILK } from "@/components/motion-primitives";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductDTO } from "@/lib/types";

export function ProductCard({
  product,
  index = 0,
  compact = false,
}: {
  product: ProductDTO;
  index?: number;
  compact?: boolean;
}) {
  const { addItem, isBusy } = useCart();
  const [hovered, setHovered] = useState(false);
  const [picker, setPicker] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: (index % 4) * 0.08, ease: EASE_SILK }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPicker(false);
      }}
      className="product-card group relative"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[8px] bg-sand",
          compact ? "aspect-[4/5]" : "aspect-[3/4]",
        )}
      >
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name} />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading={index < 4 ? "eager" : "lazy"}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)]",
            hovered && product.images[1] ? "scale-[1.06] opacity-0" : "scale-100 opacity-100",
          )}
        />
        {product.images[1] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[1]}
            alt=""
            loading="lazy"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)]",
              hovered ? "scale-100 opacity-100" : "scale-[1.08] opacity-0",
            )}
          />
        )}

        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3">
          {product.badge ? (
            <span className="label-xs rounded-full bg-bone/90 px-3 py-1.5 text-ink backdrop-blur">
              {product.badge}
            </span>
          ) : (
            <span />
          )}
          {product.compareAtCents && (
            <span className="label-xs rounded-full bg-ember px-3 py-1.5 text-bone">Sale</span>
          )}
        </div>

        {/* quick add */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-3">
          <AnimatePresence mode="wait">
            {picker ? (
              <motion.div
                key="sizes"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: EASE_SILK }}
                className="flex flex-wrap items-center gap-1.5 rounded-full bg-bone/95 p-1.5 backdrop-blur"
              >
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      void addItem({
                        productId: product.id,
                        size,
                        name: product.name,
                        image: product.images[0],
                      })
                    }
                    className="flex-1 rounded-full px-2.5 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-bone"
                  >
                    {size}
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.button
                key="trigger"
                aria-label={`Choose size for ${product.name}`}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 16 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.5, ease: EASE_SILK }}
                onClick={() => setPicker(true)}
                className="quick-add flex w-full items-center justify-center gap-2 rounded-full bg-bone/95 py-3 backdrop-blur transition-colors hover:bg-ink hover:text-bone"
              >
                <Plus size={13} strokeWidth={1.6} />
                <span className="label-xs">Quick add</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 pt-4">
        <div>
          <Link href={`/product/${product.slug}`} className="link-sweep text-[15px] leading-snug">
            {product.name}
          </Link>
          <p className="mt-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-mist">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-ink/15"
              style={{ backgroundColor: product.colorHex }}
            />
            {product.colorName}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[15px]">{formatPrice(product.priceCents)}</p>
          {product.compareAtCents && (
            <p className="text-[12px] text-mist line-through">
              {formatPrice(product.compareAtCents)}
            </p>
          )}
        </div>
      </div>
      <p className="product-rating"><Star size={11} fill="currentColor" /> <span>{(product.ratingX10 / 10).toFixed(1)}</span><span className="text-mist">({product.reviewCount} reviews)</span></p>
    </motion.article>
  );
}
