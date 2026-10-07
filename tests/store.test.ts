import test from "node:test";
import assert from "node:assert/strict";
import { addToCart, getCart, updateCartItem, listProducts } from "../src/lib/store";

test("search handles whitespace and case and combines category filters", async () => {
  const all = await listProducts();
  const result = await listProducts({ search: "  AURA  " });
  assert.ok(result.some(p => p.slug === "aura-oversized-trench"));
  const filtered = await listProducts({ search: "wool", category: "Outerwear" });
  assert.ok(filtered.every(p => p.category === "Outerwear"));
  assert.equal((await listProducts({ search: "no-such-product-xyzz" })).length, 0);
  assert.ok(all.length > 0);
});
test("cart validates product IDs, size, quantity, and ownership", async () => {
  const product = (await listProducts())[0];
  await assert.rejects(() => addToCart("cart-validate", 999999, "M", 1));
  await assert.rejects(() => addToCart("cart-validate", product.id, "INVALID", 1));
  await assert.rejects(() => addToCart("cart-validate", product.id, "M", -1));
  await assert.rejects(() => addToCart("cart-validate", product.id, "M", 1.5));
  await addToCart("cart-validate", product.id, "M", 2);
  const bag = await getCart("cart-validate");
  assert.equal(bag.count, 2); assert.equal(bag.subtotalCents, product.priceCents * 2);
  await assert.rejects(() => updateCartItem("different-cart", bag.items[0].id, 2));
  assert.equal((await getCart("different-cart")).count, 0);
});
test("stock checks include quantities across sizes and repeated adds", async () => {
  const product = (await listProducts()).find(p => p.stock < 20 && p.stock > 10 && p.sizes.length > 1)!;
  await addToCart("cart-stock", product.id, product.sizes[0], 10);
  await assert.rejects(() => addToCart("cart-stock", product.id, product.sizes[0], 1));
  await assert.rejects(() => addToCart("cart-stock", product.id, product.sizes[1], 10));
});
