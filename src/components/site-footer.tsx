"use client";

import Link from "next/link";
import { NewsletterEmailField } from "@/components/newsletter-email-field";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { EASE_SILK, Magnetic, Reveal } from "@/components/motion-primitives";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All pieces", href: "/shop" },
      { label: "Outerwear", href: "/shop?category=Outerwear" },
      { label: "Knitwear", href: "/shop?category=Knitwear" },
      { label: "Tailoring", href: "/shop?category=Tailoring" },
      { label: "Bags", href: "/shop?category=Bags" },
    ],
  },
  {
    title: "House",
    links: [
      { label: "The atelier", href: "/atelier" },
      { label: "Materials index", href: "/atelier#materials" },
      { label: "Impact report", href: "/atelier#impact" },
      { label: "Repairs & care", href: "/atelier#care" },
    ],
  },
  {
    title: "Client care",
    links: [
      { label: "Shipping", href: "/atelier#care" },
      { label: "Returns", href: "/atelier#care" },
      { label: "Size guide", href: "/shop" },
      { label: "Contact", href: "/atelier" },
    ],
  },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setState("done");
      setMessage("Welcome to the list. Look out for first access.");
      setEmail("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <footer className="relative overflow-hidden bg-ink text-bone">
      <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-24 md:px-10 md:pt-32">
        <div className="grid gap-16 lg:grid-cols-[1.15fr_1fr]">
          <Reveal>
            <p className="label-xs text-bone/40">Newsletter — 01</p>
            <h2 className="font-display mt-6 text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[0.95]">
              Slow letters,
              <br />
              <span className="italic text-clay">never noise.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-bone/55">
              One considered email a month: new arrivals, material stories, and private access to
              archive sales. Unsubscribe in a single click.
            </p>

            <form onSubmit={submit} className="mt-10 max-w-lg">
              <div className="flex items-center gap-4 border-b border-bone/25 pb-3 transition-colors focus-within:border-clay">
                <NewsletterEmailField value={email} onChange={setEmail} />
                <Magnetic strength={0.3}>
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="group flex items-center gap-2 whitespace-nowrap rounded-full bg-bone px-5 py-2.5 text-ink transition-colors hover:bg-clay disabled:opacity-60"
                  >
                    <span className="label-xs">{state === "loading" ? "Sending" : "Subscribe"}</span>
                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.6}
                      className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </button>
                </Magnetic>
              </div>
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 text-[12px] ${state === "error" ? "text-ember" : "text-clay"}`}
                >
                  {message}
                </motion.p>
              )}
            </form>
          </Reveal>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((column, index) => (
              <Reveal key={column.title} delay={index * 0.08}>
                <h3 className="label-xs text-bone/40">{column.title}</h3>
                <ul className="mt-6 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="link-sweep text-[14px] text-bone/75 hover:text-bone"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE_SILK }}
          className="mt-24 border-t border-bone/12 pt-10"
        >
          <h2 className="font-display select-none text-[clamp(4.5rem,19vw,17rem)] leading-[0.78] tracking-[-0.04em] text-bone/95">
            BLISS<span className="text-clay">.</span>
          </h2>
        </motion.div>

        <div className="mt-10 flex flex-col gap-4 text-[11px] uppercase tracking-[0.18em] text-bone/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bliss Studio — Lisbon · Copenhagen</p>
          <div className="flex gap-6">
            <span>Instagram</span>
            <span>Pinterest</span>
            <span>B Corp certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
