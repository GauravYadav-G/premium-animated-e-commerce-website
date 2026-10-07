export type CartLine = {
  id: number;
  productId: number;
  slug: string;
  name: string;
  image: string;
  colorName: string;
  material: string;
  size: string;
  quantity: number;
  priceCents: number;
  lineTotalCents: number;
  stock: number;
};

export type CartPayload = {
  items: CartLine[];
  count: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingThresholdCents: number;
};

export const EMPTY_CART: CartPayload = {
  items: [],
  count: 0,
  subtotalCents: 0,
  shippingCents: 0,
  totalCents: 0,
  freeShippingThresholdCents: 499900,
};

export type ProductDTO = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  priceCents: number;
  compareAtCents: number | null;
  category: string;
  collection: string;
  colorName: string;
  colorHex: string;
  material: string;
  images: string[];
  sizes: string[];
  details: string[];
  badge: string | null;
  ratingX10: number;
  reviewCount: number;
  stock: number;
};
