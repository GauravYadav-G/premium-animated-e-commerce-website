"use client";

import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { MaskText } from "@/components/motion-primitives";
import { pexelsWide } from "@/lib/catalog";

const LOOKS = [
  { id: "01", title: "The long line", note: "Aura trench over Terra rib", image: pexelsWide(7760026, 900, 1200), href: "/product/aura-oversized-trench" },
  { id: "02", title: "Undyed", note: "Meridian wrap in raw alpaca", image: pexelsWide(11718661, 900, 1200), href: "/product/meridian-wrap-coat" },
  { id: "03", title: "Soft tailoring", note: "Ivory blazer, deadstock wool", image: pexelsWide(8484013, 900, 1200), href: "/product/ivory-tailored-blazer" },
  { id: "04", title: "Night, quietly", note: "Noir slip on the true bias", image: pexelsWide(18516743, 900, 1200), href: "/product/noir-silk-slip-dress" },
  { id: "05", title: "Sand on sand", note: "Lumen suit, two ways", image: pexelsWide(36742654, 900, 1200), href: "/product/lumen-minimal-suit" },
];

function LookCard({ look, wide = false }: { look: (typeof LOOKS)[number]; wide?: boolean }) {
  return (
    <Link
      href={look.href}
      className={`group relative block shrink-0 overflow-hidden rounded-[2px] bg-sand ${
        wide ? "h-[68vh] w-[clamp(260px,34vw,440px)]" : "h-[420px] w-[280px]"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={look.image}
        alt={look.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.07]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-bone">
        <div>
          <p className="label-xs text-bone/60">Look {look.id}</p>
          <h3 className="font-display mt-2 text-[26px] leading-none">{look.title}</h3>
          <p className="mt-2 text-[12px] text-bone/65">{look.note}</p>
        </div>
        <span className="label-xs translate-y-2 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
          Shop →
        </span>
      </div>
    </Link>
  );
}

export function Lookbook() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, [0, 1], ["1%", "-64%"]);
  const x = useSpring(raw, { stiffness: 80, damping: 24, mass: 0.5 });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 26 });

  return (
    <>
      {/* desktop: sticky horizontal scroll */}
      <section ref={ref} className="relative hidden h-[340vh] bg-bone md:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="mx-auto flex w-full max-w-[1500px] items-end justify-between px-10 pb-8">
            <div>
              <p className="label-xs text-mist">Lookbook — 05</p>
              <MaskText
                text="The Quiet Season"
                className="font-display mt-4 text-[clamp(2rem,4.4vw,3.6rem)] leading-none"
              />
            </div>
            <p className="max-w-xs text-[13px] leading-relaxed text-mist">
              Five looks photographed in a single morning of Lisbon light. Scroll sideways.
            </p>
          </div>

          <motion.div style={{ x }} className="flex gap-5 pl-10 will-change-transform">
            {LOOKS.map((look) => (
              <LookCard key={look.id} look={look} wide />
            ))}
            <div className="flex h-[68vh] w-[clamp(260px,26vw,360px)] shrink-0 flex-col justify-between rounded-[2px] border border-ink/15 p-8">
              <p className="label-xs text-mist">End of lookbook</p>
              <div>
                <h3 className="font-display text-[clamp(2rem,3vw,2.8rem)] leading-[0.95]">
                  See every piece in the edit
                </h3>
                <Link
                  href="/shop"
                  className="label-xs mt-8 inline-block border-b border-ink pb-1.5 transition-opacity hover:opacity-60"
                >
                  Shop the collection
                </Link>
              </div>
            </div>
          </motion.div>

          <div className="mx-auto mt-10 w-full max-w-[1500px] px-10">
            <div className="h-px w-full bg-ink/12">
              <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-ink" />
            </div>
          </div>
        </div>
      </section>

      {/* mobile: swipe rail */}
      <section className="bg-bone py-20 md:hidden">
        <div className="px-5">
          <p className="label-xs text-mist">Lookbook — 05</p>
          <h2 className="font-display mt-4 text-[34px] leading-none">The Quiet Season</h2>
        </div>
        <div className="hide-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2">
          {LOOKS.map((look) => (
            <div key={look.id} className="snap-start">
              <LookCard look={look} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
