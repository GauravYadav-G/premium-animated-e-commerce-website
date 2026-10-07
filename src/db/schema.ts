import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    priceCents: integer("price_cents").notNull(),
    compareAtCents: integer("compare_at_cents"),
    category: text("category").notNull(),
    collection: text("collection").notNull(),
    colorName: text("color_name").notNull(),
    colorHex: text("color_hex").notNull(),
    material: text("material").notNull(),
    images: jsonb("images").$type<string[]>().notNull(),
    sizes: jsonb("sizes").$type<string[]>().notNull(),
    details: jsonb("details").$type<string[]>().notNull(),
    badge: text("badge"),
    ratingX10: integer("rating_x10").notNull().default(48),
    reviewCount: integer("review_count").notNull().default(0),
    stock: integer("stock").notNull().default(25),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("products_category_idx").on(table.category)],
);

export const carts = pgTable("carts", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    cartId: text("cart_id").notNull(),
    productId: integer("product_id").notNull(),
    size: text("size").notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("cart_items_unique_idx").on(table.cartId, table.productId, table.size),
    index("cart_items_cart_idx").on(table.cartId),
  ],
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  note: text("note"),
  shippingMethod: text("shipping_method").notNull().default("standard"),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  status: text("status").notNull().default("confirmed"),
  items: jsonb("items")
    .$type<
      {
        productId: number;
        name: string;
        slug: string;
        size: string;
        quantity: number;
        priceCents: number;
        image: string;
      }[]
    >()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type CartItemRow = typeof cartItems.$inferSelect;
