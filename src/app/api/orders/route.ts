import { NextResponse } from "next/server";
import { resolveCartId } from "@/lib/session";
import { getCart } from "@/lib/store";
import { parseDelivery } from "@/lib/commerce/validation";
import { prepareOrder, pendingOrder } from "@/lib/commerce/repository";
import { ensureGatewayOrder, razorpayKeys } from "@/lib/commerce/razorpay";

import { FREE_SHIPPING_THRESHOLD } from "@/lib/commerce-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const order = pendingOrder(await resolveCartId());
  return NextResponse.json({ pendingOrderNumber: order?.orderNumber ?? null, isTest: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ?? true, savedOrder: order ? { items: order.items, count: order.items.reduce((sum, i) => sum + i.quantity, 0), subtotalCents: order.subtotalCents, shippingCents: order.shippingCents, totalCents: order.totalCents, freeShippingThresholdCents: FREE_SHIPPING_THRESHOLD, delivery: order.delivery } : null }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  try {
    const { keyId } = razorpayKeys();
    const cartId = await resolveCartId();
    const body = await request.json();
    const pending = pendingOrder(cartId);
    const order = pending ?? prepareOrder(cartId, await getCart(cartId), parseDelivery(body));
    const ready = await ensureGatewayOrder(order);
    return NextResponse.json({ orderNumber: ready.orderNumber, keyId, gatewayOrderId: ready.gatewayOrderId, amount: ready.totalCents, currency: "INR", isTest: ready.isTest, prefill: { name: ready.delivery.fullName, email: ready.delivery.email, contact: ready.delivery.phone } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not start checkout." }, { status: 400 });
  }
}
