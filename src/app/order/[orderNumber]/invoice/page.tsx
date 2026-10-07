import Link from "next/link";
import { notFound } from "next/navigation";
import { readCartId } from "@/lib/session";
import { getCommerceOrder } from "@/lib/commerce/repository";
import { formatPrice } from "@/lib/utils";
import { PrintInvoice } from "@/components/order/print-invoice";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export default async function InvoicePage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params; const cartId = await readCartId();
  const order = cartId ? getCommerceOrder(orderNumber, cartId) : null;
  if (!order || order.status !== "paid") notFound();
  return <div className="invoice-wrapper mx-auto max-w-4xl px-5 py-14"><div className="invoice-actions mb-6 flex items-center justify-between gap-4"><Link href={`/order/${orderNumber}`} className="text-sm underline">Back to order</Link><PrintInvoice /></div><article className="invoice-sheet border border-ink/15 bg-white p-6 text-ink sm:p-12">
    <div className="flex flex-wrap justify-between gap-6 border-b border-ink/15 pb-8"><div><h1 className="font-display text-4xl">{order.seller.name}</h1>{order.seller.address && <p className="mt-3 whitespace-pre-line text-sm">{order.seller.address}</p>}{order.seller.email && <p className="mt-2 text-sm">{order.seller.email}</p>}{order.seller.gstin && <p className="mt-2 text-sm">GSTIN: {order.seller.gstin}</p>}</div><div className="text-sm"><h2 className="font-display text-3xl">Payment receipt</h2><p className="mt-3">{order.orderNumber}</p><p className="mt-2">{new Date(order.paidAt!).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long" })}</p><p className="mt-2 font-medium">PAID · INR{order.isTest ? " · TEST" : ""}</p></div></div>
    {order.isTest && <p className="my-5 border border-ember/30 bg-bone p-3 text-sm text-ember">TEST PAYMENT RECEIPT — no money was charged.</p>}
    <section className="my-8 text-sm leading-6"><h3 className="label-xs mb-3 text-mist">Billed and delivered to</h3><p>{order.delivery.fullName}</p><p>{order.delivery.address}</p><p>{order.delivery.city}, {order.delivery.state} {order.delivery.postalCode}, India</p><p>{order.delivery.email} · {order.delivery.phone}</p></section>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y border-ink/15"><tr><th className="py-3 font-medium">Item</th><th className="px-3 py-3 text-right font-medium">Qty</th><th className="py-3 text-right font-medium">Unit price</th><th className="py-3 pl-4 text-right font-medium">Amount</th></tr></thead><tbody>{order.items.map(item => <tr key={`${item.productId}-${item.size}`} className="border-b border-ink/10"><td className="py-4">{item.name}<span className="mt-1 block text-xs text-mist">Size: {item.size}</span></td><td className="px-3 py-4 text-right">{item.quantity}</td><td className="whitespace-nowrap py-4 text-right">{formatPrice(item.priceCents)}</td><td className="whitespace-nowrap py-4 pl-4 text-right">{formatPrice(item.priceCents * item.quantity)}</td></tr>)}</tbody></table></div>
    <dl className="ml-auto mt-6 max-w-xs space-y-3 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotalCents)}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd>{formatPrice(order.shippingCents)}</dd></div><div className="flex justify-between border-t border-ink/20 pt-3 font-medium"><dt>Total paid</dt><dd>{formatPrice(order.totalCents)}</dd></div></dl><p className="mt-10 break-all text-xs text-mist">Paid via Razorpay · Payment reference: {order.paymentId}</p><p className="mt-3 text-xs text-mist">This is a payment receipt, not a GST tax invoice. No GST has been separately calculated or collected.</p>
  </article></div>;
}
