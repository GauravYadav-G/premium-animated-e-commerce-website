import { getCart, updateCartItem } from "../store";
import { claimCartCleanup, type CommerceOrder } from "./repository";
export async function cleanupPaidCart(order: CommerceOrder) {
  if (order.status !== "paid") return;
  const cart = await getCart(order.cartId);
  if (!claimCartCleanup(order.orderNumber)) return;
  for (const line of order.items) {
    const current = cart.items.find(i => i.id === line.id && i.productId === line.productId && i.size === line.size && i.priceCents === line.priceCents);
    if (current) await updateCartItem(order.cartId, current.id, Math.max(0, current.quantity - line.quantity));
  }
}
