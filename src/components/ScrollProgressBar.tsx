"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useScrollProgress } from "@/hooks/useScrollProgress";

/**
 * Thin neon scroll-progress indicator pinned to the top
 * of the viewport. Glows with the violet accent.
 */
export default function ScrollProgressBar() {
  const progress = useScrollProgress();
  const reduce = useReducedMotion();

  return (
    <motion.div
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 inset-x-0 z-[100] h-[2.5px] origin-left pointer-events-none"
      style={{
        scaleX: reduce ? 0 : progress,
        background:
          "linear-gradient(90deg, var(--color-accent-violet), var(--color-accent-emerald-light))",
        boxShadow: "0 0 12px var(--color-accent-violet), 0 0 4px var(--color-accent-emerald)",
      }}
    />
  );
}
