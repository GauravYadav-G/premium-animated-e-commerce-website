"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { EASE_SILK, Magnetic, MaskText } from "@/components/motion-primitives";
import { formatPrice } from "@/lib/utils";
import type { ProductDTO } from "@/lib/types";

export function Hero({ spotlight }: { spotlight: ProductDTO | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto grid max-w-[1500px] items-center gap-10 px-5 pb-16 pt-10 md:px-10 lg:grid-cols-[1.02fr_1fr] lg:gap-6 lg:pb-24 lg:pt-16">
        <motion.div style={{ y: textY, opacity: fade }} className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE_SILK }} className="flex items-center gap-3">
            <span className="h-px w-10 bg-ink/30" /><span className="label-xs text-ink-soft">Spring / Summer 2026 — The Quiet Season</span>
          </motion.div>
          <h1 className="mt-7">
            <MaskText text="Clothes that" className="font-display text-[clamp(3rem,8.4vw,7.4rem)] leading-[0.88]" delay={0.08} />
            <MaskText text="hold their" className="font-display text-[clamp(3rem,8.4vw,7.4rem)] leading-[0.88]" delay={0.18} />
            <MaskText text="silence." className="font-display text-[clamp(3rem,8.4vw,7.4rem)] italic leading-[0.88] text-clay" delay={0.28} />
          </h1>
          <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.55, ease: EASE_SILK }} className="mt-8 max-w-md text-[15px] leading-relaxed text-ink-soft">A small house making traceable, slow-stitched essentials from regenerative and reclaimed fibres. No seasons shouting over each other — just pieces built to stay.</motion.p>
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.68, ease: EASE_SILK }} className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic strength={0.28}><Link href="/shop" className="btn-sweep btn-sweep-light group flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-bone transition-colors duration-500 hover:text-ink"><span className="label-xs">Shop the edit</span><span className="relative z-10"><ArrowUpRight size={15} strokeWidth={1.6} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span></Link></Magnetic>
            <Link href="/atelier" className="label-xs border-b border-ink/40 pb-1.5 text-ink-soft transition-colors hover:border-ink hover:text-ink">Inside the atelier</Link>
          </motion.div>
          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.9 }} className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-ink/12 pt-7">
            {[{ value: "100%", label: "Traceable fibre" }, { value: "41", label: "Partner artisans" }, { value: "0", label: "Virgin plastic" }].map(stat => <div key={stat.label}><dt className="font-display text-[34px] leading-none">{stat.value}</dt><dd className="mt-2 text-[11px] uppercase tracking-[0.16em] text-mist">{stat.label}</dd></div>)}
          </motion.dl>
        </motion.div>
        <div className="relative">
          <motion.div initial={{ clipPath: "inset(14% 14% 14% 14% round 2px)", opacity: 0 }} animate={{ clipPath: "inset(0% 0% 0% 0% round 2px)", opacity: 1 }} transition={{ duration: 1.6, delay: 0.2, ease: EASE_SILK }} className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-sand lg:aspect-[4/4.6]">
            <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-[-8%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/campaign-editorial.png" alt="Bliss campaign portrait in camel tailoring and ivory trousers" fetchPriority="high" className="h-full w-full object-cover object-[center_30%]" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 1, ease: EASE_SILK }} className="absolute -left-4 top-6 hidden h-[118px] w-[118px] items-center justify-center rounded-full bg-bone/80 backdrop-blur md:flex lg:-left-10">
            <svg viewBox="0 0 100 100" className="animate-spin-slow h-full w-full"><defs><path id="seal" d="M50,50 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0" fill="none" /></defs><text className="fill-ink text-[9.2px] uppercase tracking-[0.26em]"><textPath href="#seal">slow made · traceable · since 2019 ·</textPath></text></svg>
            <span className="absolute font-display text-xl">✦</span>
          </motion.div>
          {spotlight && <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 1.1, ease: EASE_SILK }} className="absolute -bottom-7 left-4 right-4 sm:left-auto sm:right-6 sm:w-[300px]">
            <Link href={`/product/${spotlight.slug}`} className="group flex items-center gap-4 rounded-[2px] bg-bone/95 p-3 shadow-[0_18px_50px_-24px_rgba(21,20,15,0.45)] backdrop-blur">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={spotlight.images[0]} alt={spotlight.name} className="h-[70px] w-[56px] rounded-[2px] object-cover" />
              <div className="min-w-0 flex-1"><p className="label-xs text-mist">From the collection</p><p className="mt-1.5 truncate text-[14px]">{spotlight.name}</p><p className="mt-0.5 text-[13px] text-ink-soft">{formatPrice(spotlight.priceCents)}</p></div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-colors duration-500 group-hover:bg-ink group-hover:text-bone"><ArrowUpRight size={14} strokeWidth={1.6} /></span>
            </Link>
          </motion.div>}
        </div>
      </div>
      <motion.div style={{ opacity: fade }} className="relative mx-auto flex max-w-[1500px] items-center gap-3 px-5 pb-10 md:px-10">
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20"><ArrowDown size={13} strokeWidth={1.5} /></motion.span>
        <span className="label-xs text-mist">Scroll to explore</span>
      </motion.div>
    </section>
  );
}
