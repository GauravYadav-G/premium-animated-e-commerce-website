import { NextResponse } from "next/server";
import { getByGateway } from "@/lib/commerce/repository";
import { validSignature, settlePayment } from "@/lib/commerce/razorpay";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  const raw = await request.text();
  if (raw.length > 1000000 || !validSignature(raw, request.headers.get("x-razorpay-signature") ?? "", secret)) return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  try {
    const event = JSON.parse(raw);
    if (!["payment.captured", "order.paid"].includes(event.event)) return NextResponse.json({ received: true });
    const payment = event.payload?.payment?.entity;
    if (typeof payment?.order_id !== "string" || typeof payment.id !== "string") return NextResponse.json({ error: "Invalid payment event." }, { status: 400 });
    const order = getByGateway(payment.order_id);
    // The imported account may also serve another store; ignore its unrelated orders.
    if (!order) return NextResponse.json({ received: true });
    await settlePayment(order, payment.id);
    return NextResponse.json({ received: true });
  } catch { return NextResponse.json({ error: "Payment confirmation will be retried." }, { status: 503 }); }
}
