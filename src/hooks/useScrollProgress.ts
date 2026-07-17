"use client";

import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

/**
 * Returns a normalised scroll progress value (0 to 1)
 * for the entire page, driven by Motion's useScroll
 * (which avoids raw window.addEventListener("scroll")).
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setProgress(latest);
  });

  return progress;
}
