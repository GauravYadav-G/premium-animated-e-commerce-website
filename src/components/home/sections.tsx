"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Counter, EASE_SILK, Magnetic, MaskText, Parallax, Reveal } from "@/components/motion-primitives";
import { EDITORIAL_IMAGES, pexelsWide } from "@/lib/catalog";

const MARQUEE_WORDS = [
  "Slow made",
  "Traceable",
  "Regenerative",
  "Repairable",
  "Undyed",
  "Circular",
];

export function WordMarquee() {
  return (
    <section className="marquee-pause border-y border-ink/10 bg-bone-deep/50 py-7">
      <div className="flex w-max animate-marquee items-center">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center">
            {MARQUEE_WORDS.map((word) => (
              <span
                key={`${dup}-${word}`}
                className="font-display flex items-center gap-10 px-9 text-[clamp(2rem,4.6vw,3.6rem)] leading-none"
              >
                {word}
                <span className="text-[0.4em] text-clay">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

const CATEGORIES = [
  { name: "Outerwear", count: 8, image: pexelsWide(9619654, 900, 1200), href: "/shop?category=Outerwear" },
  { name: "Knitwear", count: 8, image: pexelsWide(9594667, 900, 1200), href: "/shop?category=Knitwear" },
  { name: "Tailoring", count: 6, image: pexelsWide(8484013, 900, 1200), href: "/shop?category=Tailoring" },
  { name: "Shirts", count: 7, image: pexelsWide(5384423, 900, 1200), href: "/shop?category=Shirts" },
  { name: "Bottoms", count: 7, image: pexelsWide(15906267, 900, 1200), href: "/shop?category=Bottoms" },
  { name: "Dresses", count: 5, image: pexelsWide(3289711, 900, 1200), href: "/shop?category=Dresses" },
  { name: "Bags", count: 6, image: pexelsWide(9595073, 900, 1200), href: "/shop?category=Bags" },
  { name: "Accessories", count: 5, image: pexelsWide(4066293, 900, 1200), href: "/shop?category=Accessories" },
  { name: "Shoes", count: 5, image: pexelsWide(11124742, 900, 1200), href: "/shop?category=Shoes" },
];

export function CategoryRail() {
  return (
    <section className="mx-auto max-w-[1500px] px-5 py-24 md:px-10 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label-xs text-mist">Browse — 02</p>
          <MaskText
            text="Nine families, one wardrobe"
            className="font-display mt-5 max-w-2xl text-[clamp(2.2rem,5vw,4rem)] leading-[0.98]"
          />
        </div>
        <Link href="/shop" className="label-xs link-sweep text-ink-soft">
          View all 57 pieces
        </Link>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3">
        {CATEGORIES.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1, delay: index * 0.07, ease: EASE_SILK }}
          >
            <Link href={category.href} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.09]"
                />
                <div className="absolute inset-0 bg-ink/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <span className="absolute left-3 top-3 font-display text-sm text-bone mix-blend-difference">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-bone text-ink opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight size={15} strokeWidth={1.6} />
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="font-display text-[22px]">{category.name}</h3>
                <span className="text-[11px] uppercase tracking-[0.16em] text-mist">
                  {category.count} pieces
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function AtelierStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-4, 4]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-bone-deep/60 py-24 md:py-32">
      <div className="mx-auto grid max-w-[1500px] items-center gap-14 px-5 md:px-10 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <Parallax distance={48}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={EDITORIAL_IMAGES.atelier}
                alt="Inside the Fashion by Gaurav atelier"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Parallax>
          <motion.div
            style={{ rotate }}
            className="absolute -bottom-8 -right-4 hidden w-[220px] overflow-hidden rounded-[2px] bg-bone p-3 shadow-[0_24px_60px_-30px_rgba(21,20,15,0.5)] sm:block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={EDITORIAL_IMAGES.fabric}
              alt="Fabric swatches"
              loading="lazy"
              className="h-[150px] w-full object-cover"
            />
            <p className="label-xs mt-3 text-mist">Swatch book — deadstock wool, no. 14</p>
          </motion.div>
        </div>

        <div>
          <p className="label-xs text-mist">The house — 03</p>
          <MaskText
            text="Every seam has an address."
            className="font-display mt-5 text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.98]"
          />
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              We work with eleven family-run workshops across Portugal, Peru and Italy. Each garment
              carries the name of the atelier that made it and the farm that grew its fibre. Nothing
              is produced before it is understood.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[2px] bg-ink/10 sm:grid-cols-2">
            {[
              { k: "Fibre first", v: "Regenerative, reclaimed or undyed — in that order." },
              { k: "Small runs", v: "Average batch of 180 pieces. We restock, never dump." },
              { k: "Open ledger", v: "Costs, margins and mill names published twice a year." },
              { k: "Kept for life", v: "Free repairs, forever. Resale through Gaurav Archive." },
            ].map((item, index) => (
              <Reveal key={item.k} delay={index * 0.07} className="bg-bone p-6">
                <h4 className="label-xs">{item.k}</h4>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{item.v}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1} className="mt-10">
            <Magnetic strength={0.25}>
              <Link
                href="/atelier"
                className="btn-sweep btn-sweep-light group inline-flex items-center gap-3 rounded-full border border-ink px-7 py-4 transition-colors duration-500 hover:text-bone"
              >
                <span className="label-xs">Read the impact report</span>
                <span className="relative z-10">
                  <ArrowUpRight size={15} strokeWidth={1.6} />
                </span>
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function ImpactStrip() {
  const stats: { value: number; suffix: string; label: string; decimals?: number }[] = [
    { value: 92, suffix: "%", label: "Lower water use vs. industry average" },
    { value: 41, suffix: "", label: "Artisan partners on long-term contracts" },
    { value: 100, suffix: "%", label: "Renewable energy across all facilities" },
    { value: 4.9, suffix: "", decimals: 1, label: "Average client rating, 2,100+ reviews" },
  ];

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-bone md:py-32">
      <div className="absolute inset-0 opacity-[0.14]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={EDITORIAL_IMAGES.studio}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <p className="label-xs text-bone/40">Impact — 04</p>
        <MaskText
          text="Numbers we are willing to publish."
          className="font-display mt-5 max-w-3xl text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.98]"
        />
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div className="border-t border-bone/20 pt-6">
                <p className="font-display text-[clamp(3rem,6vw,4.6rem)] leading-none">
                  <Counter to={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
                </p>
                <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-bone/55">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const QUOTES = [
  {
    quote:
      "The trench arrived folded in paper, no plastic anywhere. Three winters later it still looks new.",
    name: "Amara O.",
    city: "Copenhagen",
  },
  {
    quote: "I own four Fashion by Gaurav pieces and they have quietly replaced about twenty others.",
    name: "Jonas R.",
    city: "Berlin",
  },
  {
    quote: "They repaired a cuff for free after two years. That is the whole brand in one gesture.",
    name: "Lía M.",
    city: "Madrid",
  },
  {
    quote: "The undyed alpaca coat is the softest thing I have ever put on my body.",
    name: "Hana T.",
    city: "Kyoto",
  },
  {
    quote: "Finally a label that tells you exactly who sewed the garment. More of this, please.",
    name: "Pierre D.",
    city: "Lyon",
  },
];

export function Testimonials() {
  return (
    <section className="overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <p className="label-xs text-mist">Kept & worn — 06</p>
        <MaskText
          text="Letters from the wardrobe"
          className="font-display mt-5 text-[clamp(2.2rem,5vw,4rem)] leading-[0.98]"
        />
      </div>
      <div className="marquee-pause mt-14 flex w-max animate-marquee-fast gap-5 px-5">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex gap-5">
            {QUOTES.map((item) => (
              <figure
                key={`${dup}-${item.name}`}
                className="flex w-[330px] shrink-0 flex-col justify-between rounded-[2px] border border-ink/10 bg-bone-deep/40 p-7 transition-colors duration-500 hover:bg-bone-deep"
              >
                <blockquote className="font-display text-[21px] leading-[1.25]">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-8 flex items-center justify-between">
                  <span className="label-xs">{item.name}</span>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-mist">
                    {item.city}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
