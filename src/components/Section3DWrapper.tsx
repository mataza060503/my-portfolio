"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface Section3DWrapperProps {
  children: ReactNode;
  className?: string;
  /** Which side the card flips in from */
  direction?: "left" | "right" | "bottom";
}

/**
 * Immersive 3D tunnel wrapper.
 * Sections rotate into place from depth like cards
 * in a 3D deck, with perspective, rotateY, and z offset.
 * Re-triggers on scroll-up AND scroll-down.
 */
export default function Section3DWrapper({
  children,
  className = "",
  direction = "bottom",
}: Section3DWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const variants = {
    bottom: {
      hidden: { rotateX: 25, z: -120, y: 100, opacity: 0 },
      visible: { rotateX: 0, z: 0, y: 0, opacity: 1 },
    },
    left: {
      hidden: { rotateY: -30, z: -150, x: -80, opacity: 0 },
      visible: { rotateY: 0, z: 0, x: 0, opacity: 1 },
    },
    right: {
      hidden: { rotateY: 30, z: -150, x: 80, opacity: 0 },
      visible: { rotateY: 0, z: 0, x: 0, opacity: 1 },
    },
  };

  const v = variants[direction];

  return (
    <div ref={ref} style={{ perspective: 1400 }} className={className}>
      <motion.div
        initial={reduce ? false : v.hidden}
        whileInView={reduce ? {} : v.visible}
        viewport={{ once: false, amount: 0.1 }}
        transition={{
          type: "spring",
          stiffness: 40,
          damping: 24,
          mass: 1,
        }}
        style={{
          transformOrigin: "center center",
          willChange: "transform, opacity",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
