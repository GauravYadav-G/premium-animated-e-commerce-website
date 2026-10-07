import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/commerce-config";
import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, carts, orders, products, subscribers } from "@/db/schema";
import { SEED_PRODUCTS } from "@/lib/catalog";
import type { Order, Product } from "@/db/schema";
import type { CartLine, CartPayload } from "@/lib/types";

let bootstrapPromise: Promise<void> | null = null;

// --- In-Memory Mock Store ---
type MockCartItem = {
  id: number;
  cartId: string;
  productId: number;
  size: string;
  quantity: number;
  createdAt: Date;
};

type MockStoreState = {
  products: Product[];
  carts: Set<string>;
  cartItems: MockCartItem[];
  orders: Order[];
  subscribers: Set<string>;
  nextCartItemId: number;
  nextOrderId: number;
};

const INITIAL_MOCK_PRODUCTS: Product[] = SEED_PRODUCTS.map((seed, index) => ({
  id: index + 1,
  slug: seed.slug,
  name: seed.name,
  tagline: seed.tagline,
  description: seed.description,
  priceCents: seed.priceCents,
  compareAtCents: seed.compareAtCents ?? null,
  category: seed.category,
  collection: seed.collection,
  colorName: seed.colorName,
  colorHex: seed.colorHex,
  material: seed.material,
  images: seed.images,
  sizes: seed.sizes,
  details: seed.details,
  badge: seed.badge ?? null,
  ratingX10: seed.ratingX10,
  reviewCount: seed.reviewCount,
  stock: seed.stock,
  isFeatured: seed.isFeatured,
  sortOrder: seed.sortOrder,
  createdAt: new Date("2025-01-01T00:00:00Z"),
}));

const globalForMock = globalThis as typeof globalThis & {
  __blissMockStore?: MockStoreState;
};

function getMockStore(): MockStoreState {
  if (!globalForMock.__blissMockStore) {
    globalForMock.__blissMockStore = {
      products: [...INITIAL_MOCK_PRODUCTS],
      carts: new Set<string>(),
      cartItems: [],
      orders: [],
      subscribers: new Set<string>(),
      nextCartItemId: 1,
      nextOrderId: 1,
    };
  } else {
    // Keep products synchronized with INITIAL_MOCK_PRODUCTS
    globalForMock.__blissMockStore.products = [...INITIAL_MOCK_PRODUCTS];
  }
  return globalForMock.__blissMockStore;
}

// --- Database Bootstrap ---
async function createTables() {
  if (!db) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS products (
      id serial PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      tagline text NOT NULL,
      description text NOT NULL,
      price_cents integer NOT NULL,
      compare_at_cents integer,
      category text NOT NULL,
      collection text NOT NULL,
      color_name text NOT NULL,
      color_hex text NOT NULL,
      material text NOT NULL,
      images jsonb NOT NULL,
      sizes jsonb NOT NULL,
      details jsonb NOT NULL,
      badge text,
      rating_x10 integer NOT NULL DEFAULT 48,
      review_count integer NOT NULL DEFAULT 0,
      stock integer NOT NULL DEFAULT 25,
      is_featured boolean NOT NULL DEFAULT false,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS carts (
      id text PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS cart_items (
      id serial PRIMARY KEY,
      cart_id text NOT NULL,
      product_id integer NOT NULL,
      size text NOT NULL,
      quantity integer NOT NULL DEFAULT 1,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await db.execute(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS cart_items_unique_idx ON cart_items (cart_id, product_id, size);`,
  );
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS orders (
      id serial PRIMARY KEY,
      order_number text NOT NULL UNIQUE,
      email text NOT NULL,
      full_name text NOT NULL,
      address text NOT NULL,
      city text NOT NULL,
      postal_code text NOT NULL,
      country text NOT NULL,
      note text,
      shipping_method text NOT NULL DEFAULT 'standard',
      subtotal_cents integer NOT NULL,
      shipping_cents integer NOT NULL DEFAULT 0,
      total_cents integer NOT NULL,
      status text NOT NULL DEFAULT 'confirmed',
      items jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS subscribers (
      id serial PRIMARY KEY,
      email text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function bootstrap() {
  if (!db) return;
  await createTables();
  await db.insert(products).values(SEED_PRODUCTS).onConflictDoNothing();
}

export async function ensureReady() {
  if (!db) {
    getMockStore();
    return;
  }
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrap().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }
  return bootstrapPromise;
}

export type ProductQuery = {
  category?: string;
  collection?: string;
  sort?: string;
  maxPrice?: number;
  search?: string;
};

export async function listProducts(query: ProductQuery = {}): Promise<Product[]> {
  if (!db) {
    const store = getMockStore();
    let list = [...store.products];

    if (query.category && query.category !== "All") {
      list = list.filter((p) => p.category.toLowerCase() === query.category!.toLowerCase());
    }
    if (query.collection && query.collection !== "All") {
      list = list.filter((p) => p.collection.toLowerCase() === query.collection!.toLowerCase());
    }
    if (query.maxPrice && Number.isFinite(query.maxPrice)) {
      list = list.filter((p) => p.priceCents <= Math.round(query.maxPrice! * 100));
    }
    if (query.search) {
      const term = query.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.material.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term),
      );
    }

    if (query.sort === "price-asc") {
      list.sort((a, b) => a.priceCents - b.priceCents);
    } else if (query.sort === "price-desc") {
      list.sort((a, b) => b.priceCents - a.priceCents);
    } else if (query.sort === "rating") {
      list.sort((a, b) => b.ratingX10 - a.ratingX10);
    } else {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return list;
  }

  await ensureReady();
  const conditions = [];
  if (query.category && query.category !== "All") {
    conditions.push(eq(products.category, query.category));
  }
  if (query.collection && query.collection !== "All") {
    conditions.push(eq(products.collection, query.collection));
  }
  if (query.maxPrice && Number.isFinite(query.maxPrice)) {
    conditions.push(sql`${products.priceCents} <= ${Math.round(query.maxPrice * 100)}`);
  }
  if (query.search) {
    const term = `%${query.search.trim().toLowerCase()}%`;
    conditions.push(
      sql`(lower(${products.name}) LIKE ${term} OR lower(${products.material}) LIKE ${term} OR lower(${products.category}) LIKE ${term} OR lower(${products.description}) LIKE ${term})`,
    );
  }

  const orderBy =
    query.sort === "price-asc"
      ? asc(products.priceCents)
      : query.sort === "price-desc"
        ? desc(products.priceCents)
        : query.sort === "rating"
          ? desc(products.ratingX10)
          : asc(products.sortOrder);

  const base = db.select().from(products);
  const filtered = conditions.length ? base.where(and(...conditions)) : base;
  return filtered.orderBy(orderBy);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  if (!db) {
    const store = getMockStore();
    return store.products
      .filter((p) => p.isFeatured)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, limit);
  }

  await ensureReady();
  return db
    .select()
    .from(products)
    .where(eq(products.isFeatured, true))
    .orderBy(asc(products.sortOrder))
    .limit(limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!db) {
    const store = getMockStore();
    return store.products.find((p) => p.slug === slug) ?? null;
  }

  await ensureReady();
  const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return row ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!db) {
    const store = getMockStore();
    const sameCategory = store.products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, limit);

    if (sameCategory.length >= limit) return sameCategory;

    const remaining = store.products
      .filter((p) => p.id !== product.id && !sameCategory.some((s) => s.id === p.id))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return [...sameCategory, ...remaining].slice(0, limit);
  }

  await ensureReady();
  const sameCategory = await db
    .select()
    .from(products)
    .where(and(eq(products.category, product.category), ne(products.id, product.id)))
    .limit(limit);
  if (sameCategory.length >= limit) return sameCategory;
  const fill = await db
    .select()
    .from(products)
    .where(ne(products.id, product.id))
    .orderBy(asc(products.sortOrder))
    .limit(limit);
  const map = new Map<number, Product>();
  [...sameCategory, ...fill].forEach((p) => map.set(p.id, p));
  return [...map.values()].slice(0, limit);
}

export type { CartLine, CartPayload } from "@/lib/types";

export { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/commerce-config";

export function buildCartPayload(items: CartLine[]): CartPayload {
  const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const shippingCents =
    items.length === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  return {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    freeShippingThresholdCents: FREE_SHIPPING_THRESHOLD,
  };
}

export async function getCart(cartId: string): Promise<CartPayload> {
  if (!db) {
    const store = getMockStore();
    const rows = store.cartItems.filter((item) => item.cartId === cartId);
    if (rows.length === 0) return buildCartPayload([]);

    const byId = new Map(store.products.map((p) => [p.id, p]));
    const lines: CartLine[] = rows.flatMap((row) => {
      const product = byId.get(row.productId);
      if (!product) return [];
      return [
        {
          id: row.id,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0] ?? "",
          colorName: product.colorName,
          material: product.material,
          size: row.size,
          quantity: row.quantity,
          priceCents: product.priceCents,
          lineTotalCents: product.priceCents * row.quantity,
          stock: product.stock,
        },
      ];
    });

    return buildCartPayload(lines);
  }

  await ensureReady();
  const rows = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.id));
  if (rows.length === 0) return buildCartPayload([]);

  const productRows = await db
    .select()
    .from(products)
    .where(
      inArray(
        products.id,
        rows.map((row) => row.productId),
      ),
    );
  const byId = new Map(productRows.map((p) => [p.id, p]));

  const lines: CartLine[] = rows.flatMap((row) => {
    const product = byId.get(row.productId);
    if (!product) return [];
    return [
      {
        id: row.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0] ?? "",
        colorName: product.colorName,
        material: product.material,
        size: row.size,
        quantity: row.quantity,
        priceCents: product.priceCents,
        lineTotalCents: product.priceCents * row.quantity,
        stock: product.stock,
      },
    ];
  });

  return buildCartPayload(lines);
}

export async function ensureCart(cartId: string) {
  if (!db) {
    const store = getMockStore();
    store.carts.add(cartId);
    return;
  }
  await ensureReady();
  await db.insert(carts).values({ id: cartId }).onConflictDoNothing();
}

export async function addToCart(
  cartId: string,
  productId: number,
  size: string,
  quantity: number,
) {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10) throw new Error("Quantity must be between 1 and 10.");
  const catalog = await listProducts();
  const product = catalog.find(p => p.id === productId);
  if (!product || !product.sizes.includes(size)) throw new Error("This product or size is not available.");
  const cart = await getCart(cartId);
  const totalQuantity = cart.items.filter(i => i.productId === productId).reduce((sum, i) => sum + i.quantity, 0) + quantity;
  const sizeQuantity = (cart.items.find(i => i.productId === productId && i.size === size)?.quantity ?? 0) + quantity;
  if (totalQuantity > product.stock || sizeQuantity > 10) throw new Error("This quantity is not available. Please choose fewer items.");
  if (!db) {
    const store = getMockStore();
    store.carts.add(cartId);
    const existing = store.cartItems.find(
      (item) => item.cartId === cartId && item.productId === productId && item.size === size,
    );
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, 10);
    } else {
      store.cartItems.push({
        id: store.nextCartItemId++,
        cartId,
        productId,
        size,
        quantity: Math.min(quantity, 10),
        createdAt: new Date(),
      });
    }
    return;
  }

  await ensureCart(cartId);
  await db
    .insert(cartItems)
    .values({ cartId, productId, size, quantity })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId, cartItems.size],
      set: { quantity: sql`LEAST(${cartItems.quantity} + ${quantity}, 10)` },
    });
}

export async function updateCartItem(cartId: string, itemId: number, quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 10) throw new Error("Invalid quantity.");
  if (quantity > 0) {
    const cart = await getCart(cartId);
    const item = cart.items.find(i => i.id === itemId);
    if (!item) throw new Error("Item not found.");
    const others = cart.items.filter(i => i.productId === item.productId && i.id !== itemId).reduce((sum, i) => sum + i.quantity, 0);
    if (others + quantity > item.stock) throw new Error("Requested quantity is not in stock.");
  }

  if (!db) {
    const store = getMockStore();
    if (quantity <= 0) {
      store.cartItems = store.cartItems.filter(
        (item) => !(item.cartId === cartId && item.id === itemId),
      );
      return;
    }
    const item = store.cartItems.find(
      (item) => item.cartId === cartId && item.id === itemId,
    );
    if (item) {
      item.quantity = Math.min(quantity, 10);
    }
    return;
  }

  await ensureReady();
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.id, itemId)));
    return;
  }
  await db
    .update(cartItems)
    .set({ quantity: Math.min(quantity, 10) })
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.id, itemId)));
}

export async function removeCartItem(cartId: string, itemId: number) {
  if (!db) {
    const store = getMockStore();
    store.cartItems = store.cartItems.filter(
      (item) => !(item.cartId === cartId && item.id === itemId),
    );
    return;
  }

  await ensureReady();
  await db.delete(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.id, itemId)));
}

export async function clearCart(cartId: string) {
  if (!db) {
    const store = getMockStore();
    store.cartItems = store.cartItems.filter((item) => item.cartId !== cartId);
    return;
  }

  await ensureReady();
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

export type CheckoutInput = {
  email: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  note?: string;
  shippingMethod: string;
};

export async function createOrder(cartId: string, input: CheckoutInput) {
  const cart = await getCart(cartId);
  if (cart.items.length === 0) {
    throw new Error("Your bag is empty.");
  }
  const express = input.shippingMethod === "express";
  const shippingCents = express ? 2400 : cart.shippingCents;
  const totalCents = cart.subtotalCents + shippingCents;
  const orderNumber = `BLS-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(
    Math.random() * 90 + 10,
  )}`;

  if (!db) {
    const store = getMockStore();
    const order: Order = {
      id: store.nextOrderId++,
      orderNumber,
      email: input.email,
      fullName: input.fullName,
      address: input.address,
      city: input.city,
      postalCode: input.postalCode,
      country: input.country,
      note: input.note ?? null,
      shippingMethod: input.shippingMethod,
      subtotalCents: cart.subtotalCents,
      shippingCents,
      totalCents,
      status: "confirmed",
      items: cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        size: item.size,
        quantity: item.quantity,
        priceCents: item.priceCents,
        image: item.image,
      })),
      createdAt: new Date(),
    };
    store.orders.push(order);
    await clearCart(cartId);
    return order;
  }

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      email: input.email,
      fullName: input.fullName,
      address: input.address,
      city: input.city,
      postalCode: input.postalCode,
      country: input.country,
      note: input.note ?? null,
      shippingMethod: input.shippingMethod,
      subtotalCents: cart.subtotalCents,
      shippingCents,
      totalCents,
      items: cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        size: item.size,
        quantity: item.quantity,
        priceCents: item.priceCents,
        image: item.image,
      })),
    })
    .returning();

  await clearCart(cartId);
  return order;
}

export async function getOrderByNumber(orderNumber: string) {
  if (!db) {
    const store = getMockStore();
    return store.orders.find((o) => o.orderNumber === orderNumber) ?? null;
  }

  await ensureReady();
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  return row ?? null;
}

export async function subscribe(email: string) {
  if (!db) {
    const store = getMockStore();
    store.subscribers.add(email);
    return;
  }

  await ensureReady();
  await db.insert(subscribers).values({ email }).onConflictDoNothing();
}
