"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { EASE_SILK } from "@/components/motion-primitives";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, isBusy } = useCart();
  const remaining = Math.max(cart.freeShippingThresholdCents - cart.subtotalCents, 0);
  const progress = Math.min(cart.subtotalCents / cart.freeShippingThresholdCents, 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            type="button"
            aria-label="Close bag"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeCart}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/40 backdrop-blur-[3px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.85, ease: EASE_SILK }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-bone shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <div>
                <p className="label-xs text-mist">Your selection</p>
                <h2 className="font-display mt-1 text-2xl">
                  Shopping bag <span className="text-mist">({cart.count})</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close bag"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-bone"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="border-b border-ink/10 px-6 py-4">
              <p className="text-[12px] text-ink-soft">
                {remaining > 0 ? (
                  <>
                    You are <strong className="font-medium">{formatPrice(remaining)}</strong> away
                    from free carbon-neutral shipping.
                  </>
                ) : (
                  <>Free carbon-neutral shipping unlocked ✦</>
                )}
              </p>
              <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-ink/10">
                <motion.div
                  animate={{ scaleX: progress }}
                  initial={{ scaleX: 0 }}
                  transition={{ duration: 0.9, ease: EASE_SILK }}
                  className="h-full origin-left bg-moss"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {cart.items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                  <div className="h-24 w-24 rounded-full border border-dashed border-ink/20" />
                  <p className="font-display text-2xl">Your bag is quiet</p>
                  <p className="max-w-[240px] text-sm text-mist">
                    Pieces made to be kept. Start with the season&apos;s essentials.
                  </p>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="label-xs border-b border-ink pb-1 transition-opacity hover:opacity-60"
                  >
                    Continue browsing
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-ink/10">
                  <AnimatePresence initial={false}>
                    {cart.items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.5, ease: EASE_SILK }}
                        className="flex gap-4 py-5"
                      >
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="relative h-[116px] w-[88px] shrink-0 overflow-hidden rounded-sm bg-sand"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Link
                                href={`/product/${item.slug}`}
                                onClick={closeCart}
                                className="text-[15px] leading-tight hover:underline"
                              >
                                {item.name}
                              </Link>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-mist">
                                {item.colorName} · {item.size}
                              </p>
                            </div>
                            <span className="text-[14px]">{formatPrice(item.lineTotalCents)}</span>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center gap-3 rounded-full border border-ink/15 px-3 py-1.5">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void updateItem(item.id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="transition-opacity hover:opacity-50 disabled:opacity-30"
                              >
                                <Minus size={12} strokeWidth={1.8} />
                              </button>
                              <span className="w-4 text-center text-[13px]">{item.quantity}</span>
                              <button
                                type="button"
                                disabled={isBusy || item.quantity >= 10}
                                onClick={() => void updateItem(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="transition-opacity hover:opacity-50 disabled:opacity-30"
                              >
                                <Plus size={12} strokeWidth={1.8} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => void removeItem(item.id)}
                              className="text-[11px] uppercase tracking-[0.16em] text-mist underline-offset-4 hover:text-ink hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="border-t border-ink/10 bg-bone-deep/60 px-6 py-5">
                <dl className="space-y-2 text-[13px]">
                  <div className="flex justify-between">
                    <dt className="text-mist">Subtotal</dt>
                    <dd>{formatPrice(cart.subtotalCents)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-mist">Shipping</dt>
                    <dd>{cart.shippingCents === 0 ? "Complimentary" : formatPrice(cart.shippingCents)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-ink/10 pt-3 text-[16px]">
                    <dt className="font-display text-xl">Total</dt>
                    <dd className="font-display text-xl">{formatPrice(cart.totalCents)}</dd>
                  </div>
                </dl>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-sweep btn-sweep-light mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-ink py-4 text-bone transition-colors duration-500 hover:text-ink"
                >
                  <span className="label-xs">Proceed to checkout</span>
                </Link>
                <p className="mt-3 text-center text-[11px] text-mist">
                  Taxes calculated at checkout · 30-day returns
                </p>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Toasts() {
  const { toasts } = useCart();
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[90] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE_SILK }}
            className="flex items-center gap-3 rounded-full border border-ink/10 bg-ink/95 py-2 pl-2 pr-5 text-bone shadow-xl backdrop-blur"
          >
            {toast.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={toast.image} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bone/15">✦</span>
            )}
            <div>
              <p className="label-xs">{toast.title}</p>
              {toast.body && <p className="mt-0.5 text-[12px] text-bone/60">{toast.body}</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
