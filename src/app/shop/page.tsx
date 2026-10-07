import { Suspense } from "react";
import { MaskText, Reveal } from "@/components/motion-primitives";
import { ProductCard } from "@/components/product-card";
import { FilterBar } from "@/components/shop/filter-bar";
import { CATEGORIES, COLLECTIONS } from "@/lib/catalog";
import { toProductDTO } from "@/lib/dto";
import { listProducts } from "@/lib/store";
import type { ProductDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop — Bliss",
  description: "Every piece in the Bliss collection: traceable, slow-made and built to last.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  let products: ProductDTO[] = [];
  try {
    products = (
      await listProducts({
        category: first(params.category),
        collection: first(params.collection),
        sort: first(params.sort),
        search: first(params.q),
      })
    ).map(toProductDTO);
  } catch {
    products = [];
  }

  const activeCategory = first(params.category) ?? "All";

  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-28 md:px-10">
      <header className="pb-10 pt-14 md:pt-20">
        <p className="label-xs text-mist">The collection</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
          <MaskText
            text={activeCategory === "All" ? "Everything we make" : activeCategory}
            className="font-display max-w-3xl text-[clamp(2.6rem,7vw,5.6rem)] leading-[0.9]"
          />
          <Reveal delay={0.15} className="max-w-sm">
            <p className="text-[14px] leading-relaxed text-ink-soft">
              Fifty-seven considered pieces, restocked rather than replaced. Every garment lists its
              fibre, its mill and its repair plan.
            </p>
          </Reveal>
        </div>
      </header>

      <Suspense fallback={<div className="h-20" />}>
        <FilterBar
          categories={[...CATEGORIES]}
          collections={[...COLLECTIONS]}
          total={products.length}
        />
      </Suspense>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
          <span className="font-display text-4xl">Nothing here yet</span>
          <p className="max-w-sm text-sm text-mist">
            Try removing a filter — or browse the full collection.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}

      <section className="mt-28 grid gap-6 border-t border-ink/12 pt-12 md:grid-cols-3">
        {[
          { title: "Carbon-neutral delivery", body: "Shipped plastic-free in reused paper. Free over ₹250." },
          { title: "Thirty-day returns", body: "Unworn, with tags. Return labels are prepaid worldwide." },
          { title: "Repairs, forever", body: "Send any Bliss piece back and we will mend it at no cost." },
        ].map((item, index) => (
          <Reveal key={item.title} delay={index * 0.08}>
            <h3 className="font-display text-[22px]">{item.title}</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{item.body}</p>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
