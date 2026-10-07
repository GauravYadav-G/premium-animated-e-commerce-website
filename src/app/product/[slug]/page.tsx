import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MaskText } from "@/components/motion-primitives";
import { ProductCard } from "@/components/product-card";
import { ProductDetail } from "@/components/product/product-detail";
import { toProductDTO } from "@/lib/dto";
import { getProductBySlug, getRelatedProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Not found — Fashion by Gaurav" };
    return {
      title: `${product.name} — Fashion by Gaurav`,
      description: product.tagline,
    };
  } catch {
    return { title: "Fashion by Gaurav" };
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  const related = (await getRelatedProducts(product, 4).catch(() => [])).map(toProductDTO);

  return (
    <>
      <ProductDetail product={toProductDTO(product)} />

      {related.length > 0 && (
        <section className="mx-auto max-w-[1500px] border-t border-ink/12 px-5 py-20 md:px-10 md:py-28">
          <p className="label-xs text-mist">Complete the look</p>
          <MaskText
            text="Pairs beautifully with"
            className="font-display mt-5 text-[clamp(2rem,4.4vw,3.4rem)] leading-[0.98]"
          />
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
            {related.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} compact />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
