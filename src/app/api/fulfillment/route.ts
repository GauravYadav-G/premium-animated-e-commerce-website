import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { updateFulfillment } from "@/lib/commerce/repository";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const expected = process.env.FULFILLMENT_ADMIN_TOKEN;
  const provided = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!expected || provided.length !== expected.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json();
    if (!["shipped", "delivered"].includes(body.status) || typeof body.partner !== "string" || !body.partner.trim() || typeof body.trackingNumber !== "string" || !body.trackingNumber.trim() || typeof body.orderNumber !== "string") throw new Error("Order, courier, tracking number, and shipment status are required.");
    let trackingUrl: string | null = null;
    if (body.trackingUrl) { const url = new URL(body.trackingUrl); if (url.protocol !== "https:" || url.username || url.password) throw new Error("Use an HTTPS tracking link."); trackingUrl = url.href; }
    const order = updateFulfillment(body.orderNumber, { status: body.status, partner: body.partner.trim().slice(0, 100), trackingNumber: body.trackingNumber.trim().slice(0, 100), trackingUrl });
    return NextResponse.json({ orderNumber: order.orderNumber, fulfillment: order.fulfillment });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update shipment." }, { status: 400 }); }
}
