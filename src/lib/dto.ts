import type { Product } from "@/db/schema";
import type { ProductDTO } from "@/lib/types";

export function toProductDTO(product: Product): ProductDTO {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    priceCents: product.priceCents,
    compareAtCents: product.compareAtCents,
    category: product.category,
    collection: product.collection,
    colorName: product.colorName,
    colorHex: product.colorHex,
    material: product.material,
    images: product.images ?? [],
    sizes: product.sizes ?? [],
    details: product.details ?? [],
    badge: product.badge,
    ratingX10: product.ratingX10,
    reviewCount: product.reviewCount,
    stock: product.stock,
  };
}
