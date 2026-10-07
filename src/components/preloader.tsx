"use client";

import { AnimatePresence, animate, motion } from "motion/react";
import { useEffect, useState } from "react";

const EASE = [0.76, 0, 0.24, 1] as const;

export function Preloader() {
  const [phase, setPhase] = useState<"init" | "playing" | "done">("init");
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer: number | undefined;
    try {
      if (window.sessionStorage.getItem("bliss_intro") === "1") {
        setPhase("done");
        return;
      }
      window.sessionStorage.setItem("bliss_intro", "1");
    } catch {
      /* storage blocked — still play once */
    }
    setPhase("playing");
    const controls = animate(0, 100, {
      duration: 1.5,
      ease: "easeInOut",
      onUpdate: (value) => setCount(Math.round(value)),
    });
    timer = window.setTimeout(() => setPhase("done"), 1900);
    return () => {
      controls.stop();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (phase === "playing") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [phase]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="preloader"
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: EASE }}
          className="fixed inset-0 z-[120] flex flex-col justify-between bg-ink px-6 py-8 text-bone md:px-10"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <span className="label-xs text-bone/50">Bliss — Spring / Summer 2026</span>
            <span className="label-xs text-bone/50">Lisbon</span>
          </motion.div>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
              className="font-display text-[clamp(3.4rem,15vw,13rem)] leading-[0.82]"
            >
              Made to be kept<span className="text-clay">.</span>
            </motion.h1>
          </div>

          <div>
            <div className="h-px w-full bg-bone/20">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full origin-left bg-clay"
              />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="label-xs text-bone/50">Loading the collection</span>
              <span className="font-display text-[clamp(2rem,6vw,4rem)] leading-none">
                {count}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
