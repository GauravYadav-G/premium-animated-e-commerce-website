import Link from "next/link";
import { Counter, MaskText, Parallax, Reveal } from "@/components/motion-primitives";
import { EDITORIAL_IMAGES } from "@/lib/catalog";

export const metadata = {
  title: "The Atelier — Bliss",
  description:
    "How Bliss makes clothing: traceable fibres, eleven family workshops, published impact and free repairs for life.",
};

const MATERIALS = [
  { name: "Regenerative merino", origin: "New South Wales, AU", note: "Carbon-insetting farm collective, mulesing-free." },
  { name: "European flax linen", origin: "Normandy, FR", note: "Rain-fed, zero irrigation, scutched within 60km." },
  { name: "Undyed baby alpaca", origin: "Arequipa, PE", note: "Natural fibre colour — the dye house is skipped entirely." },
  { name: "Deadstock Italian wool", origin: "Biella, IT", note: "Rescued mill surplus, limited to the metres that exist." },
  { name: "Vegetable-tanned leather", origin: "Tuscany, IT", note: "Bark-tanned, chromium-free, food-industry by-product." },
  { name: "Regenerated cashmere", origin: "Prato, IT", note: "Colour-sorted and re-spun. 90% less water than virgin." },
];

const TIMELINE = [
  { year: "2019", title: "A room and a loom", body: "Bliss begins in a Lisbon apartment with forty linen shirts." },
  { year: "2021", title: "Open ledger", body: "We publish our first full cost and mill breakdown. Nobody asked us to." },
  { year: "2023", title: "The Mending Service", body: "Free lifetime repairs launch. 1,900 garments mended since." },
  { year: "2026", title: "Circular by default", body: "Every new piece designed for disassembly and resale." },
];

export default function AtelierPage() {
  return (
    <div className="pb-28">
      <section className="mx-auto max-w-[1500px] px-5 pt-16 md:px-10 md:pt-24">
        <p className="label-xs text-mist">The house</p>
        <MaskText
          text="We make fewer things, and we make them properly."
          className="font-display mt-6 max-w-5xl text-[clamp(2.6rem,7vw,6rem)] leading-[0.88]"
        />
        <Reveal delay={0.2}>
          <p className="mt-10 max-w-xl text-[16px] leading-relaxed text-ink-soft">
            Bliss is a small sustainable fashion house working between Lisbon and Copenhagen. We
            design slowly, produce in batches of roughly 180, and publish what everything costs —
            including the parts that are uncomfortable.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto mt-16 max-w-[1500px] px-5 md:px-10">
        <Parallax distance={60}>
          <div className="relative aspect-[16/9] overflow-hidden rounded-[2px] bg-sand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={EDITORIAL_IMAGES.atelier}
              alt="The Bliss atelier"
              className="h-full w-full object-cover"
            />
          </div>
        </Parallax>
      </section>

      <section id="impact" className="mx-auto mt-24 max-w-[1500px] px-5 md:mt-32 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="label-xs text-mist">Impact — published twice a year</p>
            <MaskText
              text="The numbers, unretouched"
              className="font-display mt-5 text-[clamp(2rem,4.6vw,3.6rem)] leading-[0.98]"
            />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {[
              { value: 92, suffix: "%", label: "Less water than industry average" },
              { value: 180, suffix: "", label: "Average pieces per production run" },
              { value: 1900, suffix: "+", label: "Garments repaired, not replaced" },
              { value: 11, suffix: "", label: "Family-run partner workshops" },
              { value: 100, suffix: "%", label: "Renewable energy in facilities" },
              { value: 0, suffix: "", label: "Virgin plastic in packaging" },
            ].map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.06}>
                <p className="font-display text-[clamp(2.2rem,4vw,3.2rem)] leading-none">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-mist">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="materials" className="mx-auto mt-24 max-w-[1500px] px-5 md:mt-32 md:px-10">
        <p className="label-xs text-mist">Materials index</p>
        <MaskText
          text="Six fibres, fully traced"
          className="font-display mt-5 text-[clamp(2rem,4.6vw,3.6rem)] leading-[0.98]"
        />
        <div className="mt-12 border-t border-ink/12">
          {MATERIALS.map((material, index) => (
            <Reveal key={material.name} delay={index * 0.05}>
              <div className="group grid gap-2 border-b border-ink/12 py-6 transition-colors hover:bg-bone-deep/40 md:grid-cols-[1fr_1fr_1.4fr] md:items-center md:px-4">
                <h3 className="font-display text-[22px]">{material.name}</h3>
                <p className="text-[12px] uppercase tracking-[0.16em] text-mist">
                  {material.origin}
                </p>
                <p className="text-[14px] leading-relaxed text-ink-soft">{material.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-[1500px] px-5 md:mt-32 md:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Parallax distance={40}>
            <div className="aspect-[4/5] overflow-hidden rounded-[2px] bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={EDITORIAL_IMAGES.pins}
                alt="Hand finishing in the atelier"
                className="h-full w-full object-cover"
              />
            </div>
          </Parallax>
          <div>
            <p className="label-xs text-mist">Timeline</p>
            <MaskText
              text="Seven years, slowly"
              className="font-display mt-5 text-[clamp(2rem,4.6vw,3.4rem)] leading-[0.98]"
            />
            <div className="mt-10 space-y-8">
              {TIMELINE.map((item, index) => (
                <Reveal key={item.year} delay={index * 0.08}>
                  <div className="flex gap-6 border-b border-ink/10 pb-8">
                    <span className="font-display w-16 shrink-0 text-[20px] text-clay">
                      {item.year}
                    </span>
                    <div>
                      <h3 className="text-[16px]">{item.title}</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{item.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="care" className="mx-auto mt-24 max-w-[1500px] px-5 md:mt-32 md:px-10">
        <div className="rounded-[2px] bg-ink px-6 py-16 text-bone md:px-16 md:py-24">
          <p className="label-xs text-bone/40">Care & repairs</p>
          <MaskText
            text="Send it back and we will mend it. Forever."
            className="font-display mt-6 max-w-3xl text-[clamp(2rem,5vw,4rem)] leading-[0.95]"
          />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { k: "01", t: "Tell us what happened", b: "A photo and a sentence is enough. No receipts required." },
              { k: "02", t: "We send a label", b: "Prepaid and carbon-neutral, wherever you are in the world." },
              { k: "03", t: "It comes home mended", b: "Darned, re-lined or re-dyed by the workshop that made it." },
            ].map((step, index) => (
              <Reveal key={step.k} delay={index * 0.08}>
                <span className="label-xs text-clay">{step.k}</span>
                <h3 className="font-display mt-4 text-[24px]">{step.t}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-bone/60">{step.b}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <Link
              href="/shop"
              className="label-xs mt-14 inline-block border-b border-bone pb-1.5 transition-opacity hover:opacity-60"
            >
              Shop pieces built to be kept
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
