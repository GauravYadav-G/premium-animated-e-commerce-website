import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { Lookbook } from "@/components/home/lookbook";
import { AtelierStory, CategoryRail, ImpactStrip, Testimonials, WordMarquee } from "@/components/home/sections";
import { MaskText, Reveal } from "@/components/motion-primitives";
import { ProductCard } from "@/components/product-card";
import { toProductDTO } from "@/lib/dto";
import { getFeaturedProducts } from "@/lib/store";
import type { ProductDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featured: ProductDTO[] = [];
  try { featured = (await getFeaturedProducts(8)).map(toProductDTO); } catch { featured = []; }
  return (
    <>
      <Hero spotlight={featured[0] ?? null} />
      <WordMarquee />
      <CategoryRail />
      <section className="mx-auto max-w-[1500px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-ink/12 pt-10">
          <div>
            <p className="label-xs text-mist">The edit — 03</p>
            <MaskText text="Pieces we would keep forever" className="font-display mt-5 max-w-2xl text-[clamp(2.2rem,5vw,4rem)] leading-[0.98]" />
          </div>
          <Reveal delay={0.1}>
            <Link href="/shop" className="group inline-flex items-center gap-3 rounded-full border border-ink/20 px-6 py-3.5 transition-colors duration-500 hover:border-ink">
              <span className="label-xs">Shop everything</span>
              <ArrowUpRight size={14} strokeWidth={1.6} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>
        {featured.length > 0 ? <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">{featured.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <p className="mt-14 text-sm text-mist">The catalogue is warming up. Refresh in a moment.</p>}
      </section>
      <Lookbook />
      <AtelierStory />
      <ImpactStrip />
      <Testimonials />
      <section className="mx-auto max-w-[1500px] px-5 pb-28 md:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2px] border border-ink/12 bg-bone-deep/50 px-6 py-16 text-center md:px-16 md:py-24">
            <div className="hairline-grid pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative">
              <p className="label-xs text-mist">Book an appointment</p>
              <h2 className="font-display mx-auto mt-6 max-w-3xl text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[0.95]">Visit the studio in Lisbon, or let the wardrobe come to you.</h2>
              <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-ink-soft">One-to-one fittings, alterations and archive access — Tuesday through Saturday, by appointment only.</p>
              <Link href="/atelier" className="btn-sweep btn-sweep-light group mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-bone transition-colors duration-500 hover:text-ink"><span className="label-xs">Request a fitting</span><span className="relative z-10"><ArrowUpRight size={15} strokeWidth={1.6} /></span></Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
