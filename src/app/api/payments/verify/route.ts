import { NextResponse } from "next/server";
import { readCartId } from "@/lib/session";
import { getCommerceOrder } from "@/lib/commerce/repository";
import { razorpayKeys, validSignature, settlePayment, reconcileOrder } from "@/lib/commerce/razorpay";
import { cleanupPaidCart } from "@/lib/commerce/cleanup";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cartId = await readCartId();
    const order = cartId && typeof body.orderNumber === "string" ? getCommerceOrder(body.orderNumber, cartId) : null;
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    let result;
    if (body.checkStatus === true) result = await reconcileOrder(order);
    else {
      if (typeof body.razorpay_payment_id !== "string" || typeof body.razorpay_signature !== "string" || body.razorpay_order_id !== order.gatewayOrderId || !validSignature(`${order.gatewayOrderId}|${body.razorpay_payment_id}`, body.razorpay_signature, razorpayKeys().secret)) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
      result = await settlePayment(order, body.razorpay_payment_id);
    }
    if (result.status === "paid") await cleanupPaidCart(result);
    return NextResponse.json({ orderNumber: result.orderNumber, status: result.status });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to verify payment. Check payment status before retrying." }, { status: 400 }); }
}
