import { validateId, validateQuantity } from "@/lib/commerce/validation";
import { pendingOrder } from "@/lib/commerce/repository";
import { NextResponse } from "next/server";
import { resolveCartId } from "@/lib/session";
import {
  addToCart,
  buildCartPayload,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cartId = await resolveCartId();
    const cart = await getCart(cartId);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json(buildCartPayload([]));
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productId?: number;
      size?: string;
      quantity?: number;
    };
    if (!body.productId || !body.size) {
      return NextResponse.json({ error: "Missing product or size." }, { status: 400 });
    }
    const cartId = await resolveCartId();
    if (pendingOrder(cartId)) return NextResponse.json({ error: "Your bag is linked to a pending payment. Resume or check status in checkout." }, { status: 409 });
    const quantity = validateQuantity(body.quantity ?? 1);
    validateId(body.productId);
    if (typeof body.size !== "string") throw new Error("Invalid size.");
    await addToCart(cartId, Number(body.productId), body.size, quantity);
    const cart = await getCart(cartId);
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not add to bag." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { itemId?: number; quantity?: number };
    if (!body.itemId) {
      return NextResponse.json({ error: "Missing item." }, { status: 400 });
    }
    const cartId = await resolveCartId();
    if (pendingOrder(cartId)) return NextResponse.json({ error: "Check your pending payment in checkout before editing the bag." }, { status: 409 });
    await updateCartItem(cartId, validateId(body.itemId), validateQuantity(body.quantity ?? 0, true));
    const cart = await getCart(cartId);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({ error: "Could not update bag." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = Number(searchParams.get("itemId"));
    if (!itemId) {
      return NextResponse.json({ error: "Missing item." }, { status: 400 });
    }
    const cartId = await resolveCartId();
    if (pendingOrder(cartId)) return NextResponse.json({ error: "Check your pending payment in checkout before editing the bag." }, { status: 409 });
    await removeCartItem(cartId, validateId(itemId));
    const cart = await getCart(cartId);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({ error: "Could not remove item." }, { status: 400 });
  }
}
