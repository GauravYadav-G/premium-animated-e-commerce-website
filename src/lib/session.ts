import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

export const CART_COOKIE = "bliss_cart_id";

function newId() {
  return `c_${randomUUID()}`;
}

/** Read the cart id without mutating cookies (safe for server components). */
export async function readCartId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(CART_COOKIE)?.value ?? null;
}

/** Read or create the cart id. Only call from route handlers / server actions. */
export async function resolveCartId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const id = newId();
  jar.set(CART_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  return id;
}
