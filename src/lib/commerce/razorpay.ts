import { createHmac, timingSafeEqual } from "node:crypto";
import { attachGateway, getCommerceOrder, markPaid, type CommerceOrder } from "./repository";

export function razorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID; const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) throw new Error("Payments are not configured yet. Please contact the store.");
  return { keyId, secret };
}
export function validSignature(message: string, signature: string, secret: string) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(message).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
async function gateway<T>(path: string, body?: unknown): Promise<T> {
  const { keyId, secret } = razorpayKeys();
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, { method: body ? "POST" : "GET", headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000), cache: "no-store" });
  if (!response.ok) throw new Error("Razorpay is unavailable or the account configuration needs attention. Please try again.");
  return response.json() as Promise<T>;
}
type GatewayOrder = { id: string; amount: number; currency: string; receipt: string };
type GatewayPayment = { id: string; order_id: string; amount: number; currency: string; status: string };
const inflight = new Map<string, Promise<CommerceOrder>>();
export async function ensureGatewayOrder(order: CommerceOrder) {
  if (order.gatewayOrderId) return order;
  const pending = inflight.get(order.orderNumber); if (pending) return pending;
  const request = (async () => {
    // Recover a successful remote creation if the process stopped before saving the response.
    const previous = await gateway<{ items: GatewayOrder[] }>(`orders?receipt=${encodeURIComponent(order.orderNumber)}&count=100`);
    const matching = previous.items.find(o => o.receipt === order.orderNumber && o.amount === order.totalCents && o.currency === "INR");
    const remote = matching ?? await gateway<GatewayOrder>("orders", { amount: order.totalCents, currency: "INR", receipt: order.orderNumber, partial_payment: false });
    if (!remote.id || remote.amount !== order.totalCents || remote.currency !== "INR") throw new Error("Invalid payment order received.");
    return attachGateway(order.orderNumber, remote.id);
  })();
  inflight.set(order.orderNumber, request);
  try { return await request; } finally { inflight.delete(order.orderNumber); }
}
export function assertCaptured(order: CommerceOrder, payment: GatewayPayment) {
  if (payment.order_id !== order.gatewayOrderId || payment.amount !== order.totalCents || payment.currency !== "INR" || payment.status !== "captured") throw new Error("Payment is not yet confirmed. If debited, wait a moment and check payment status; do not pay again.");
}
export async function settlePayment(order: CommerceOrder, paymentId: string) {
  if (!/^pay_[a-zA-Z0-9]+$/.test(paymentId)) throw new Error("Invalid payment reference.");
  const payment = await gateway<GatewayPayment>(`payments/${encodeURIComponent(paymentId)}`);
  assertCaptured(order, payment);
  return markPaid(order.orderNumber, payment.id);
}
export async function reconcileOrder(order: CommerceOrder) {
  if (order.status === "paid" || !order.gatewayOrderId) return order;
  const payments = await gateway<{ items: GatewayPayment[] }>(`orders/${encodeURIComponent(order.gatewayOrderId)}/payments`);
  const captured = payments.items.find(p => p.status === "captured" && p.order_id === order.gatewayOrderId && p.amount === order.totalCents && p.currency === "INR");
  return captured ? settlePayment(order, captured.id) : getCommerceOrder(order.orderNumber)!;
}
