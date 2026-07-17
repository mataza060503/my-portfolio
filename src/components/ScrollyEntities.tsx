"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import { Bot, Cpu, Layers, Zap, Code2, Braces, Box, Network } from "lucide-react";

/* ============================================
   Scroll-driven side entities
   Left gutter: entities drift downward, rotate CW
   Right gutter: entities drift upward, rotate CCW
   Hidden on mobile (< 1024px)
   ============================================ */

interface SideEntity {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
  glowClass: string;
  // scroll-progress range where this entity is active
  start: number;
  end: number;
}

const LEFT_ENTITIES: SideEntity[] = [
  {
    icon: Bot,
    colorClass: "text-accent-violet-light",
    glowClass: "drop-shadow-[0_0_6px_var(--color-accent-violet)]",
    start: 0,
    end: 0.35,
  },
  {
    icon: Braces,
    colorClass: "text-accent-emerald-light",
    glowClass: "drop-shadow-[0_0_6px_var(--color-accent-emerald)]",
    start: 0.15,
    end: 0.5,
  },
  {
    icon: Layers,
    colorClass: "text-accent-violet-light",
    glowClass: "drop-shadow-[0_0_6px_var(--color-accent-violet)]",
    start: 0.3,
    end: 0.65,
  },
  {
    icon: Cpu,
    colorClass: "text-accent-emerald-light",
    glowClass: "drop-shadow-[0_0_6px_var(--color-accent-emerald)]",
    start: 0.5,
    end: 0.85,
  },
];

const RIGHT_ENTITIES: SideEntity[] = [
  {
    icon: Code2,
    colorClass: "text-accent-emerald-light",
    glowClass: "drop-shadow-[0_0_6px_var(--color-accent-emerald)]",
    start: 0.05,
    end: 0.4,
  },
  {
    icon: Zap,
    colorClass: "text-accent-violet-light",
    glowClass: "drop-shadow-[0_0_6px_var(--color-accent-violet)]",
    start: 0.2,
    end: 0.55,
  },
  {
    icon: Network,
    colorClass: "text-accent-emerald-light",
    glowClass: "drop-shadow-[0_0_6px_var(--color-accent-emerald)]",
    start: 0.35,
    end: 0.7,
  },
  {
    icon: Box,
    colorClass: "text-accent-violet-light",
    glowClass: "drop-shadow-[0_0_6px_var(--color-accent-violet)]",
    start: 0.55,
    end: 0.9,
  },
];

function SideEntityItem({
  entity,
  yTransform,
  rotateTransform,
  opacityTransform,
}: {
  entity: SideEntity;
  yTransform: MotionValue<number>;
  rotateTransform: MotionValue<number>;
  opacityTransform: MotionValue<number>;
}) {
  const Icon = entity.icon;
  return (
    <motion.div
      style={{
        y: yTransform,
        rotate: rotateTransform,
        opacity: opacityTransform,
        willChange: "transform, opacity",
      }}
      className={`${entity.colorClass} ${entity.glowClass}`}
    >
      <Icon size={28} />
    </motion.div>
  );
}

export default function ScrollyEntities() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // If reduced motion is preferred, render nothing
  if (reduce) return null;

  return (
    <div
      ref={containerRef}
      className="hidden lg:block fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Left gutter */}
      <div className="absolute left-6 top-0 bottom-0 w-16 flex flex-col items-center justify-around py-32">
        {LEFT_ENTITIES.map((entity, i) => {
          const y = useTransform(
            scrollYProgress,
            [entity.start, entity.end],
            [0, 180],
          );
          const rotate = useTransform(
            scrollYProgress,
            [entity.start, entity.end],
            [0, 45],
          );
          const opacity = useTransform(
            scrollYProgress,
            [
              entity.start,
              entity.start + 0.08,
              entity.end - 0.08,
              entity.end,
            ],
            [0, 0.5, 0.5, 0],
          );
          return (
            <SideEntityItem
              key={`left-${i}`}
              entity={entity}
              yTransform={y}
              rotateTransform={rotate}
              opacityTransform={opacity}
            />
          );
        })}
      </div>

      {/* Right gutter */}
      <div className="absolute right-6 top-0 bottom-0 w-16 flex flex-col items-center justify-around py-32">
        {RIGHT_ENTITIES.map((entity, i) => {
          const y = useTransform(
            scrollYProgress,
            [entity.start, entity.end],
            [0, -140],
          );
          const rotate = useTransform(
            scrollYProgress,
            [entity.start, entity.end],
            [0, -90],
          );
          const opacity = useTransform(
            scrollYProgress,
            [
              entity.start,
              entity.start + 0.08,
              entity.end - 0.08,
              entity.end,
            ],
            [0, 0.5, 0.5, 0],
          );
          return (
            <SideEntityItem
              key={`right-${i}`}
              entity={entity}
              yTransform={y}
              rotateTransform={rotate}
              opacityTransform={opacity}
            />
          );
        })}
      </div>
    </div>
  );
}
