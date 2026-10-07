import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import type { CartPayload } from "../types";
import type { DeliveryDetails } from "./validation";
import { EXPRESS_SHIPPING, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "../commerce-config";

export type CommerceOrder = {
  orderNumber: string; cartId: string; fingerprint: string; createdAt: string;
  delivery: DeliveryDetails; items: CartPayload["items"];
  subtotalCents: number; shippingCents: number; totalCents: number; currency: "INR";
  status: "pending" | "paid"; gatewayOrderId: string | null; paymentId: string | null;
  paidAt: string | null; isTest: boolean;
  fulfillment: { status: "unfulfilled" | "shipped" | "delivered"; partner: string | null; trackingNumber: string | null; trackingUrl: string | null };
  seller: { name: string; address: string; email: string; gstin: string };
};
let database: DatabaseSync | undefined;
function storage() {
  if (database) return database;
  const path = resolve(/* turbopackIgnore: true */ process.env.COMMERCE_DB_PATH || ".data/commerce.sqlite");
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  database = new DatabaseSync(path);
  database.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS commerce_orders (
      order_number TEXT PRIMARY KEY, cart_id TEXT NOT NULL, fingerprint TEXT NOT NULL,
      gateway_order_id TEXT UNIQUE, payment_id TEXT UNIQUE, status TEXT NOT NULL,
      payload TEXT NOT NULL, UNIQUE(cart_id, fingerprint)
    );
    CREATE TABLE IF NOT EXISTS commerce_reservations (
      order_number TEXT NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL,
      PRIMARY KEY(order_number, product_id)
    );`);
  return database;
}
function transaction<T>(fn: (db: DatabaseSync) => T): T {
  const db = storage(); db.exec("BEGIN IMMEDIATE");
  try { const result = fn(db); db.exec("COMMIT"); return result; }
  catch (error) { db.exec("ROLLBACK"); throw error; }
}
function decode(row: unknown): CommerceOrder | null {
  return row ? JSON.parse((row as { payload: string }).payload) as CommerceOrder : null;
}
export function getCommerceOrder(number: string, cartId?: string) {
  const order = decode(storage().prepare("SELECT payload FROM commerce_orders WHERE order_number = ?").get(number));
  return order && (cartId === undefined || order.cartId === cartId) ? order : null;
}
export function getByGateway(id: string) { return decode(storage().prepare("SELECT payload FROM commerce_orders WHERE gateway_order_id = ?").get(id)); }
function save(db: DatabaseSync, order: CommerceOrder) {
  db.prepare("UPDATE commerce_orders SET gateway_order_id=?, payment_id=?, status=?, payload=? WHERE order_number=?").run(order.gatewayOrderId, order.paymentId, order.status, JSON.stringify(order), order.orderNumber);
}
export function prepareOrder(cartId: string, cart: CartPayload, delivery: DeliveryDetails): CommerceOrder {
  if (!cart.items.length) throw new Error("Your bag is empty.");
  const fingerprint = createHash("sha256").update(JSON.stringify({ items: cart.items.map(i => [i.id, i.productId, i.size, i.quantity, i.priceCents]), delivery, test: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") })).digest("hex");
  return transaction(db => {
    const existing = decode(db.prepare("SELECT payload FROM commerce_orders WHERE cart_id=? AND fingerprint=?").get(cartId, fingerprint));
    if (existing) return existing;
    // Keep one unresolved checkout per bag to prevent double payment and duplicate stock holds.
    const pending = decode(db.prepare("SELECT payload FROM commerce_orders WHERE cart_id=? AND status='pending' LIMIT 1").get(cartId));
    if (pending) throw new Error(`You have a pending payment (${pending.orderNumber}). Resume it from checkout before changing your order.`);
    const quantities = new Map<number, { quantity: number; stock: number }>();
    for (const item of cart.items) {
      if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10 || !Number.isSafeInteger(item.priceCents) || item.priceCents < 1) throw new Error("Invalid cart item.");
      const prev = quantities.get(item.productId);
      quantities.set(item.productId, { quantity: (prev?.quantity ?? 0) + item.quantity, stock: item.stock });
    }
    for (const [id, item] of quantities) {
      const held = db.prepare("SELECT COALESCE(SUM(r.quantity),0) AS quantity FROM commerce_reservations r JOIN commerce_orders o ON o.order_number=r.order_number WHERE r.product_id=? AND json_extract(o.payload, '$.isTest')=?").get(id, process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ? 1 : 0) as { quantity: number };
      if (item.quantity + held.quantity > item.stock) throw new Error("A piece in your bag is no longer available in that quantity.");
    }
    const subtotalCents = cart.items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
    const shippingCents = delivery.shippingMethod === "express" ? EXPRESS_SHIPPING : subtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
    const order: CommerceOrder = {
      orderNumber: `BLS-${randomUUID().replaceAll("-", "").slice(0, 20).toUpperCase()}`, cartId, fingerprint, createdAt: new Date().toISOString(), delivery, items: cart.items,
      subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents, currency: "INR", status: "pending", gatewayOrderId: null, paymentId: null, paidAt: null,
      isTest: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ?? true,
      fulfillment: { status: "unfulfilled", partner: null, trackingNumber: null, trackingUrl: null },
      seller: { name: process.env.SELLER_NAME || "Bliss", address: process.env.SELLER_ADDRESS || "", email: process.env.SELLER_EMAIL || "", gstin: process.env.SELLER_GSTIN || "" },
    };
    db.prepare("INSERT INTO commerce_orders (order_number,cart_id,fingerprint,status,payload) VALUES (?,?,?,?,?)").run(order.orderNumber, cartId, fingerprint, order.status, JSON.stringify(order));
    for (const [id, item] of quantities) db.prepare("INSERT INTO commerce_reservations VALUES (?,?,?)").run(order.orderNumber, id, item.quantity);
    return order;
  });
}
export function attachGateway(number: string, gatewayId: string) {
  return transaction(db => { const order = getCommerceOrder(number); if (!order) throw new Error("Order not found."); if (order.gatewayOrderId && order.gatewayOrderId !== gatewayId) throw new Error("Order already linked."); order.gatewayOrderId = gatewayId; save(db, order); return order; });
}
export function markPaid(number: string, paymentId: string) {
  return transaction(db => {
    const order = getCommerceOrder(number); if (!order) throw new Error("Order not found.");
    if (order.status === "paid") { if (order.paymentId !== paymentId) throw new Error("Payment already recorded."); return order; }
    order.status = "paid"; order.paymentId = paymentId; order.paidAt = new Date().toISOString(); save(db, order); return order;
  });
}
export function pendingOrder(cartId: string) { return decode(storage().prepare("SELECT payload FROM commerce_orders WHERE cart_id=? AND status='pending' LIMIT 1").get(cartId)); }
export function updateFulfillment(number: string, fulfillment: CommerceOrder["fulfillment"]) {
  return transaction(db => { const order = getCommerceOrder(number); if (!order || order.status !== "paid") throw new Error("A paid order is required."); if (order.isTest) throw new Error("Test orders cannot be dispatched."); order.fulfillment = fulfillment; save(db, order); return order; });
}
export function claimCartCleanup(number: string) {
  return transaction(db => {
    db.exec("CREATE TABLE IF NOT EXISTS commerce_cart_cleanup (order_number TEXT PRIMARY KEY)");
    return db.prepare("INSERT OR IGNORE INTO commerce_cart_cleanup VALUES (?)").run(number).changes === 1;
  });
}
