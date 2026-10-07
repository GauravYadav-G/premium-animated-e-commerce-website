"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Lock } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { EASE_SILK, Magnetic } from "@/components/motion-primitives";
import type { CartPayload } from "@/lib/types";
import { EXPRESS_SHIPPING } from "@/lib/commerce-config";
import { loadRazorpay, type RazorpayResult } from "@/lib/razorpay-client";
import { cn, formatPrice } from "@/lib/utils";

const FIELDS = [
  { name: "email", label: "Email", type: "email", placeholder: "you@email.com", span: 2 },
  { name: "fullName", label: "Full name", type: "text", placeholder: "Full name", span: 2 },
  { name: "address", label: "Address", type: "text", placeholder: "House / flat, street, locality", span: 2 },
  { name: "city", label: "City", type: "text", placeholder: "Mumbai", span: 1 },
  { name: "postalCode", label: "PIN code", type: "text", placeholder: "400001", span: 1 },
  { name: "state", label: "State / Union territory", type: "text", placeholder: "Maharashtra", span: 1 },
  { name: "phone", label: "Mobile number", type: "tel", placeholder: "10-digit Indian mobile", span: 1 },
] as const;

export default function CheckoutPage() {
  const { cart: currentCart, refresh } = useCart();
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({ country: "India" });
  const [shipping, setShipping] = useState<"standard" | "express">("standard");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const [pendingNumber, setPendingNumber] = useState<string | null>(null);
  const [savedCart, setSavedCart] = useState<CartPayload | null>(null);
  const [testMode, setTestMode] = useState(true);
  useEffect(() => { fetch("/api/orders").then(r => r.json()).then(data => {
    setPendingNumber(data.pendingOrderNumber ?? null); setTestMode(data.isTest);
    if (data.savedOrder) { setSavedCart(data.savedOrder); setValues(data.savedOrder.delivery); setShipping(data.savedOrder.delivery.shippingMethod); }
  }).catch(() => {}); }, []);
  const cart = savedCart ?? currentCart;

  const shippingCents = savedCart ? savedCart.shippingCents : shipping === "express" ? EXPRESS_SHIPPING : cart.shippingCents;
  const total = cart.subtotalCents + shippingCents;

  async function verify(number: string, response?: RazorpayResult) {
    const res = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber: number, ...(response ?? { checkStatus: true }) }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Payment verification failed.");
    if (data.status !== "paid") throw new Error("Payment is pending. If debited, check status again shortly instead of paying again.");
    await refresh(); router.push(`/order/${number}`);
  }
  async function checkStatus() {
    if (!pendingNumber) return;
    setStatus("loading"); setError("");
    try { await verify(pendingNumber); } catch (err) { setError(err instanceof Error ? err.message : "Unable to check payment."); } finally { setStatus("idle"); }
  }
  async function submit(event?: React.FormEvent) {
    event?.preventDefault(); if (status === "loading") return;
    setStatus("loading"); setError("");
    try {
      await loadRazorpay();
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, shippingMethod: shipping }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.");
      setPendingNumber(data.orderNumber);
      setTestMode(data.isTest);
      const savedResponse = await fetch("/api/orders");
      const saved = await savedResponse.json();
      if (saved.savedOrder) { setSavedCart(saved.savedOrder); setValues(saved.savedOrder.delivery); setShipping(saved.savedOrder.delivery.shippingMethod); }
      if (!window.Razorpay) throw new Error("Payment window unavailable.");
      const checkout = new window.Razorpay({ key: data.keyId, amount: data.amount, currency: data.currency, name: "Bliss", order_id: data.gatewayOrderId, prefill: data.prefill, theme: { color: "#a0522d" }, modal: { ondismiss: () => { setStatus("idle"); setError("Payment window closed. Your order is saved; resume or check payment status below."); } }, handler: async response => {
        try { await verify(data.orderNumber, response); } catch (err) { setError(err instanceof Error ? err.message : "Payment confirmation pending. Check status before retrying."); } finally { setStatus("idle"); }
      } });
      checkout.on("payment.failed", () => { setError("Payment was not completed. You can retry in the payment window or close it and check status."); });
      checkout.open();
    } catch (err) { setError(err instanceof Error ? err.message : "Checkout failed."); setStatus("idle"); }
  }

  if (cart.items.length === 0 && !pendingNumber) {
    return (
      <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-6 px-5 py-40 text-center md:px-10">
        <p className="label-xs text-mist">Checkout</p>
        <h1 className="font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.95]">
          Your bag is empty
        </h1>
        <p className="max-w-sm text-[15px] text-ink-soft">
          Add a piece or two and we will keep them safe here for 60 days.
        </p>
        <Link
          href="/shop"
          className="btn-sweep btn-sweep-light mt-2 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-bone transition-colors duration-500 hover:text-ink"
        >
          <span className="label-xs">Browse the collection</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-28 pt-12 md:px-10 md:pt-16">
      <Link href="/shop" className="label-xs inline-flex items-center gap-2 text-mist hover:text-ink">
        <ArrowLeft size={13} strokeWidth={1.6} /> Continue shopping
      </Link>

      <h1 className="font-display mt-6 text-[clamp(2.6rem,7vw,5.2rem)] leading-[0.9]">
        Checkout
      </h1>

      <div className="mt-12 grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <form onSubmit={submit} className="order-2 lg:order-1">
          {pendingNumber && <div className="mb-8 rounded border border-ink/20 bg-bone-deep/50 p-5 text-sm"><p>Your saved checkout: {pendingNumber}. Resume uses the address and total saved when this payment was started.</p><div className="mt-4 flex flex-wrap gap-4"><button type="button" disabled={status === "loading"} onClick={() => void submit()} className="underline">Resume payment</button><button type="button" disabled={status === "loading"} onClick={() => void checkStatus()} className="underline">Check payment status</button><Link href={`/order/${pendingNumber}`} className="underline">View saved order</Link></div></div>}
          <section>
            <h2 className="label-xs text-mist">01 — Delivery details</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {FIELDS.map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.06, ease: EASE_SILK }}
                  className={field.span === 2 ? "sm:col-span-2" : ""}
                >
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-mist">
                      {field.label}
                    </span>
                    <input
                      required
                      disabled={Boolean(pendingNumber)}
                      type={field.type}
                      name={field.name}
                      inputMode={field.name === "postalCode" || field.name === "phone" ? "numeric" : undefined}
                      pattern={field.name === "postalCode" ? "[1-9][0-9]{5}" : undefined}
                      maxLength={field.name === "postalCode" ? 6 : field.name === "phone" ? 16 : 254}
                      placeholder={field.placeholder}
                      value={values[field.name] ?? ""}
                      onChange={(event) =>
                        setValues((prev) => ({ ...prev, [field.name]: event.target.value }))
                      }
                      className="mt-2 w-full border-b border-ink/20 bg-transparent pb-3 text-[15px] transition-colors placeholder:text-mist/60 focus:border-ink focus:outline-none"
                    />
                  </label>
                </motion.div>
              ))}
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-mist">
                    Delivery note (optional)
                  </span>
                  <textarea
                    disabled={Boolean(pendingNumber)}
                    rows={2}
                    value={values.note ?? ""}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, note: event.target.value }))
                    }
                    placeholder="Leave with the concierge…"
                    className="mt-2 w-full resize-none border-b border-ink/20 bg-transparent pb-3 text-[15px] transition-colors placeholder:text-mist/60 focus:border-ink focus:outline-none"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="label-xs text-mist">02 — Shipping method</h2>
            <div className="mt-6 grid gap-3">
              {[
                {
                  id: "standard" as const,
                  title: "Standard delivery",
                  note: "Estimated 3–7 working days after dispatch",
                  price: cart.shippingCents,
                },
                {
                  id: "express" as const,
                  title: "Express",
                  note: "Estimated 1–3 working days after dispatch",
                  price: EXPRESS_SHIPPING,
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={Boolean(pendingNumber)}
                  onClick={() => setShipping(option.id)}
                  className={cn(
                    "flex items-center justify-between rounded-[2px] border px-5 py-4 text-left transition-all duration-500",
                    shipping === option.id
                      ? "border-ink bg-bone-deep/60"
                      : "border-ink/15 hover:border-ink/40",
                  )}
                >
                  <span className="flex items-center gap-4">
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
                        shipping === option.id ? "border-ink" : "border-ink/30",
                      )}
                    >
                      {shipping === option.id && <span className="h-2 w-2 rounded-full bg-ink" />}
                    </span>
                    <span>
                      <span className="block text-[14px]">{option.title}</span>
                      <span className="mt-1 block text-[12px] text-mist">{option.note}</span>
                    </span>
                  </span>
                  <span className="text-[14px]">
                    {option.price === 0 ? "Free" : formatPrice(option.price)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="label-xs text-mist">03 — Payment</h2>
            {testMode && <p className="mt-4 text-sm text-ember">Test mode — use Razorpay test payment details. No real money will be charged.</p>}
            <div className="mt-6 rounded-[2px] border border-dashed border-ink/25 bg-bone-deep/40 p-6">
              <p className="flex items-center gap-2 text-[13px] text-ink-soft">
                <Lock size={14} strokeWidth={1.6} /> Pay securely with Razorpay using UPI, cards, or netbanking. Payment details are entered directly in Razorpay’s checkout.
              </p>
            </div>
          </section>

          {error && <p className="mt-6 text-[13px] text-ember">{error}</p>}

          <Magnetic strength={0.16} className="mt-10 block w-full">
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-sweep btn-sweep-light flex w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-5 text-bone transition-colors duration-500 hover:text-ink disabled:opacity-60"
            >
              <span className="label-xs">
                {status === "loading" ? "Opening secure payment…" : `Pay securely — ${formatPrice(total)}`}
              </span>
            </button>
          </Magnetic>
        </form>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-[120px] lg:h-fit">
          <div className="rounded-[2px] border border-ink/12 bg-bone-deep/40 p-6">
            <h2 className="font-display text-2xl">Order summary</h2>
            <ul className="mt-6 space-y-5">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="relative h-[92px] w-[70px] shrink-0 overflow-hidden rounded-[2px] bg-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-bone">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-[14px] leading-tight">{item.name}</p>
                    <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-mist">
                      {item.colorName} · {item.size}
                    </p>
                  </div>
                  <span className="text-[14px]">{formatPrice(item.lineTotalCents)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-8 space-y-2.5 border-t border-ink/12 pt-6 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-mist">Subtotal</dt>
                <dd>{formatPrice(cart.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist">Shipping</dt>
                <dd>{shippingCents === 0 ? "Complimentary" : formatPrice(shippingCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist">Currency</dt>
                <dd>Indian rupees (INR)</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-ink/12 pt-4">
                <dt className="font-display text-xl">Total</dt>
                <dd className="font-display text-xl">{formatPrice(total)}</dd>
              </div>
            </dl>
          </div>

          <p className="mt-5 text-[12px] leading-relaxed text-mist">
            Delivery within India. Your courier and tracking details will appear on the order page after dispatch.
          </p>
        </aside>
      </div>
    </div>
  );
}
