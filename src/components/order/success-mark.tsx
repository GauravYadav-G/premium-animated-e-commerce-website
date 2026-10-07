"use client";

import { motion } from "motion/react";

export function SuccessMark() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
        className="absolute inset-0 rounded-full border border-ink/15"
      />
      <motion.span
        animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0, 0.45] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full border border-clay"
      />
      <svg viewBox="0 0 48 48" className="h-12 w-12">
        <motion.path
          d="M12 25.5 L20.5 34 L36 15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
        />
      </svg>
    </div>
  );
}
