export type DeliveryDetails = {
  email: string; fullName: string; phone: string; address: string; city: string;
  state: string; postalCode: string; country: "India"; note: string; shippingMethod: "standard" | "express";
};
export function parseDelivery(input: unknown): DeliveryDetails {
  if (!input || typeof input !== "object") throw new Error("Please enter your delivery details.");
  const body = input as Record<string, unknown>;
  const text = (key: string, max = 200) => typeof body[key] === "string" ? (body[key] as string).trim().slice(0, max) : "";
  const phone = text("phone").replace(/[\s()-]/g, "").replace(/^\+91/, "");
  const details: DeliveryDetails = { email: text("email", 254).toLowerCase(), fullName: text("fullName", 100), phone, address: text("address", 400), city: text("city", 100), state: text("state", 100), postalCode: text("postalCode", 6), country: "India", note: text("note", 500), shippingMethod: body.shippingMethod === "express" ? "express" : "standard" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) throw new Error("Enter a valid email address.");
  if (details.fullName.length < 2 || details.address.length < 5 || details.city.length < 2 || details.state.length < 2) throw new Error("Enter your full name, address, city, and state.");
  if (!/^[6-9]\d{9}$/.test(phone)) throw new Error("Enter a valid 10-digit Indian mobile number.");
  if (!/^[1-9]\d{5}$/.test(text("postalCode", 20))) throw new Error("Enter a valid six-digit PIN code.");
  if (body.country && !["India", "IN"].includes(String(body.country))) throw new Error("Delivery is currently available within India.");
  return details;
}
export function validateQuantity(value: unknown, allowZero = false): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < (allowZero ? 0 : 1) || value > 10) throw new Error("Quantity must be a whole number between 1 and 10.");
  return value;
}
export function validateId(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) throw new Error("Invalid item.");
  return value;
}
