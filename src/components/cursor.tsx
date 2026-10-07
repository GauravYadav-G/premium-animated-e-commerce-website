"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 420, damping: 36, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 420, damping: 36, mass: 0.35 });
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);

    const move = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target as HTMLElement | null;
      setActive(Boolean(target?.closest("a, button, input, textarea, select, [data-cursor]")));
    };

    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden lg:block"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        animate={{
          width: active ? 54 : 16,
          height: active ? 54 : 16,
          opacity: active ? 0.28 : 0.85,
        }}
        transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
        className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-ink mix-blend-multiply"
      />
    </motion.div>
  );
}
