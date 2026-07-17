"use client";

import { useEffect, useRef, useMemo } from "react";
import { useReducedMotion } from "framer-motion";

/* ============================================
   Cinematic falling entities — "digital rain"
   Code characters + geometric shards falling
   at randomized speeds, sizes, and opacities.
   ============================================ */

interface FallingItem {
  id: number;
  x: number;          // % from left
  char: string;       // single character
  size: number;       // rem
  duration: number;   // seconds for full fall
  delay: number;      // seconds before first appearance
  opacity: number;    // 0.03 - 0.12
  color: "violet" | "emerald" | "muted";
  drift: number;      // px horizontal wobble
}

const CHARS = "01{}[]();<>/\\|*#@$%&!?^~+-=";

function generateItems(count: number): FallingItem[] {
  const items: FallingItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: i,
      x: Math.random() * 100,
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      size: 0.5 + Math.random() * 1.2,
      duration: 6 + Math.random() * 18,
      delay: Math.random() * 15,
      opacity: 0.03 + Math.random() * 0.09,
      color: (["violet", "emerald", "muted"] as const)[
        Math.floor(Math.random() * 3)
      ],
      drift: (Math.random() - 0.5) * 40,
    });
  }
  return items;
}

// Color map for the entities
const colorMap: Record<string, string> = {
  violet: "var(--color-accent-violet)",
  emerald: "var(--color-accent-emerald)",
  muted: "var(--color-text-muted)",
};

export default function FallingEntities() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => generateItems(80), []);

  useEffect(() => {
    if (reduce || !containerRef.current) return;

    const container = containerRef.current;
    const style = document.createElement("style");
    style.textContent = items
      .map(
        (item, i) => `
          @keyframes fall-${i} {
            0%   { transform: translateY(-10vh) translateX(0px); opacity: 0; }
            5%   { opacity: ${item.opacity}; }
            90%  { opacity: ${item.opacity}; }
            100% { transform: translateY(110vh) translateX(${item.drift}px); opacity: 0; }
          }
        `,
      )
      .join("\n");
    container.appendChild(style);

    return () => {
      style.remove();
    };
  }, [items, reduce]);

  if (reduce) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {items.map((item) => (
        <span
          key={item.id}
          className="absolute top-0 font-mono select-none"
          style={{
            left: `${item.x}%`,
            fontSize: `${item.size}rem`,
            color: colorMap[item.color],
            opacity: 0,
            animation: `fall-${item.id} ${item.duration}s linear ${item.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        >
          {item.char}
        </span>
      ))}
    </div>
  );
}
