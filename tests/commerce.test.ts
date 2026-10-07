import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseDelivery, validateQuantity } from "../src/lib/commerce/validation";
import { formatPrice } from "../src/lib/utils";
import { prepareOrder, attachGateway, getCommerceOrder, markPaid, updateFulfillment, claimCartCleanup } from "../src/lib/commerce/repository";
import { assertCaptured, validSignature } from "../src/lib/commerce/razorpay";
import type { CartPayload } from "../src/lib/types";

process.env.COMMERCE_DB_PATH = join(mkdtempSync(join(tmpdir(), "bliss-test-")), "test.sqlite");
process.env.RAZORPAY_KEY_ID = "rzp_test_fixture";
const details = { email: "buyer@example.com", fullName: "Test Buyer", phone: "9876543210", address: "10 Example Road", city: "Mumbai", state: "Maharashtra", postalCode: "400001", country: "India", note: "", shippingMethod: "standard" };
function cart(id = 901, quantity = 1, stock = 4): CartPayload {
  return { items: [{ id, productId: id, slug: "test-product", name: "Test product", image: "", colorName: "Sand", material: "Cotton", size: "M", quantity, priceCents: 42800, lineTotalCents: quantity * 42800, stock }], count: quantity, subtotalCents: quantity * 42800, shippingCents: 0, totalCents: quantity * 42800, freeShippingThresholdCents: 25000 };
}
test("Indian money keeps numeric price and preserves paise", () => {
  assert.equal(formatPrice(42800), "₹428"); assert.equal(formatPrice(42850), "₹428.5"); assert.equal(formatPrice(12345600), "₹1,23,456");
});
test("delivery validates mobile, six-digit PIN, required state, country", () => {
  assert.equal(parseDelivery({ ...details, phone: "+91 9876543210" }).phone, "9876543210");
  for (const bad of [{ phone: "123" }, { postalCode: "4000017" }, { postalCode: "000000" }, { state: "" }, { country: "Portugal" }, { email: "invalid" }]) assert.throws(() => parseDelivery({ ...details, ...bad }));
});
test("quantity rejects fractions, negative values, NaN, strings, and overflow", () => {
  for (const bad of [-1, 0, 1.5, 11, NaN, Infinity, "2"]) assert.throws(() => validateQuantity(bad));
  assert.equal(validateQuantity(0, true), 0); assert.equal(validateQuantity(10), 10);
});
test("signature validation rejects forgery and changed raw webhook bytes", () => {
  const sig = createHmac("sha256", "test-secret").update("order_1|pay_1").digest("hex");
  assert.ok(validSignature("order_1|pay_1", sig, "test-secret"));
  assert.equal(validSignature("order_2|pay_1", sig, "test-secret"), false);
  assert.equal(validSignature("order_1|pay_1", "bad", "test-secret"), false);
  const raw = '{"event":"payment.captured"}'; const signed = createHmac("sha256", "secret").update(raw).digest("hex");
  assert.equal(validSignature(raw + " ", signed, "secret"), false);
});
test("checkout is idempotent, scoped to its owner, and protects stock", () => {
  const order = prepareOrder("cart-a", cart(), parseDelivery(details));
  assert.equal(prepareOrder("cart-a", cart(), parseDelivery(details)).orderNumber, order.orderNumber);
  assert.equal(getCommerceOrder(order.orderNumber, "cart-b"), null);
  assert.throws(() => prepareOrder("cart-a", cart(902), parseDelivery(details)), /pending payment/);
  assert.throws(() => prepareOrder("cart-b", cart(901, 4), parseDelivery(details)), /no longer available/);
  assert.equal(order.totalCents, 42800);
});
test("payment matching requires captured status, exact INR amount and gateway order", () => {
  const order = attachGateway(prepareOrder("cart-c", cart(903), parseDelivery(details)).orderNumber, "order_fixture");
  const payment = { id: "pay_fixture", order_id: "order_fixture", amount: 42800, currency: "INR", status: "captured" };
  assert.doesNotThrow(() => assertCaptured(order, payment));
  for (const change of [{ order_id: "order_someone_else" }, { amount: 1 }, { currency: "USD" }, { status: "authorized" }, { status: "failed" }]) assert.throws(() => assertCaptured(order, { ...payment, ...change }));
});
test("duplicate callbacks settle once; payment IDs cannot be reused; test orders cannot ship", () => {
  const order = prepareOrder("cart-d", cart(904), parseDelivery(details));
  const paid = markPaid(order.orderNumber, "pay_unique");
  assert.equal(markPaid(order.orderNumber, "pay_unique").paidAt, paid.paidAt);
  assert.throws(() => markPaid(order.orderNumber, "pay_other"));
  const other = prepareOrder("cart-e", cart(905), parseDelivery(details));
  assert.throws(() => markPaid(other.orderNumber, "pay_unique"));
  assert.throws(() => updateFulfillment(paid.orderNumber, { status: "shipped", partner: "Test", trackingNumber: "1", trackingUrl: null }), /Test orders/);
  assert.equal(claimCartCleanup(paid.orderNumber), true); assert.equal(claimCartCleanup(paid.orderNumber), false);
});
test("checkout ignores supplied line totals and recalculates totals from unit prices", () => {
  const bag = cart(906); bag.items[0].lineTotalCents = 1; bag.subtotalCents = 1; bag.totalCents = 1; bag.shippingCents = -100;
  const order = prepareOrder("cart-totals", bag, parseDelivery(details));
  assert.equal(order.subtotalCents, 42800); assert.equal(order.totalCents, 42800);
});
test("gateway fetch confirms actual capture and duplicate verification remains idempotent", async () => {
  const { settlePayment } = await import("../src/lib/commerce/razorpay");
  process.env.RAZORPAY_KEY_SECRET = "fixture-not-a-real-secret";
  const order = attachGateway(prepareOrder("cart-remote", cart(907), parseDelivery(details)).orderNumber, "order_remote");
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({ id: "pay_remote", order_id: "order_remote", amount: 1, currency: "INR", status: "captured" });
    await assert.rejects(() => settlePayment(order, "pay_remote"));
    assert.equal(getCommerceOrder(order.orderNumber)?.status, "pending");
    globalThis.fetch = async () => Response.json({ id: "pay_remote", order_id: "order_remote", amount: 42800, currency: "INR", status: "captured" });
    const paid = await settlePayment(order, "pay_remote");
    assert.equal(paid.status, "paid"); assert.equal((await settlePayment(order, "pay_remote")).paidAt, paid.paidAt);
  } finally { globalThis.fetch = original; }
});
test("test checkout reservations never consume live inventory", () => {
  prepareOrder("cart-test-stock", cart(908, 4), parseDelivery(details));
  process.env.RAZORPAY_KEY_ID = "rzp_live_fixture";
  try { assert.doesNotThrow(() => prepareOrder("cart-live-stock", cart(908, 4), parseDelivery(details))); }
  finally { process.env.RAZORPAY_KEY_ID = "rzp_test_fixture"; }
});
