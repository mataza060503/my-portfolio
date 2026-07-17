"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";

/* ============================================
   Dynamic imports — R3F runs client-only
   ============================================ */
const CuratedWorkspace = dynamic(
  () => import("@/components/CuratedWorkspace"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-2xl bg-bg-secondary/50 flex items-center justify-center"
        style={{ aspectRatio: "16 / 10", maxHeight: 650 }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <span className="text-sm text-amber-200/80 font-mono">
            Rendering workspace...
          </span>
        </div>
      </div>
    ),
  },
);

/* ============================================
   WebGL fallback — flat terminal
   ============================================ */
function FlatTerminal() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-bg-surface/30"
      style={{ aspectRatio: "16 / 10", maxHeight: 650 }}
    >
      <div
        className="h-full w-full font-mono text-[11px] leading-relaxed p-5 flex flex-col"
        style={{
          fontFamily: "var(--font-mono), 'Courier New', monospace",
          background: "#1a1a2e",
          color: "#abb2bf",
        }}
      >
        {/* Title bar */}
        <div className="text-[#8899aa] font-bold mb-3 text-xs">
          C:\ hl_playground_terminal &gt;
        </div>
        {/* Code content */}
        <div className="flex-1 overflow-hidden space-y-0.5">
          <div><span style={{ color: "#555566" }}>  1</span>  <span style={{ color: "#c678dd" }}>import</span> <span style={{ color: "#e5c07b" }}>{'{ useTerminal }'}</span> <span style={{ color: "#c678dd" }}>from</span> <span style={{ color: "#98c379" }}>&apos;@/hooks/useTerminal&apos;</span></div>
          <div><span style={{ color: "#555566" }}>  2</span>  <span style={{ color: "#c678dd" }}>import</span> <span style={{ color: "#e5c07b" }}>RetroComputer</span> <span style={{ color: "#c678dd" }}>from</span> <span style={{ color: "#98c379" }}>&apos;./RetroComputerR3F&apos;</span></div>
          <div><span style={{ color: "#555566" }}>  3</span></div>
          <div><span style={{ color: "#555566" }}>  4</span>  <span style={{ color: "#c678dd" }}>export</span> <span style={{ color: "#c678dd" }}>default</span> <span style={{ color: "#c678dd" }}>function</span> <span style={{ color: "#61afef" }}>Playground</span>() {'{'}</div>
          <div><span style={{ color: "#555566" }}>  5</span>    <span style={{ color: "#c678dd" }}>const</span> <span style={{ color: "#e5c07b" }}>terminal</span> = useTerminal()</div>
          <div><span style={{ color: "#555566" }}>  6</span>    <span style={{ color: "#c678dd" }}>const</span> <span style={{ color: "#e5c07b" }}>[focused, setFocused]</span> = useState(<span style={{ color: "#d19a66" }}>false</span>)</div>
          <div><span style={{ color: "#555566" }}>  7</span></div>
          <div><span style={{ color: "#555566" }}>  8</span>    <span style={{ color: "#5c6370" }}>// Terminal commands: help, about,</span></div>
          <div><span style={{ color: "#555566" }}>  9</span>    <span style={{ color: "#5c6370" }}>// skills, projects, contact, clear</span></div>
          <div><span style={{ color: "#555566" }}> 10</span>    <span style={{ color: "#c678dd" }}>return</span> (</div>
          <div><span style={{ color: "#555566" }}> 11</span>      <span style={{ color: "#e06c75" }}>&lt;Canvas&gt;</span></div>
          <div><span style={{ color: "#555566" }}> 12</span>        <span style={{ color: "#e06c75" }}>&lt;RetroComputer /&gt;</span></div>
          <div><span style={{ color: "#555566" }}> 13</span>      <span style={{ color: "#e06c75" }}>&lt;/Canvas&gt;</span></div>
          <div><span style={{ color: "#555566" }}> 14</span>    );</div>
          <div><span style={{ color: "#555566" }}> 15</span>  {'}'}</div>
          <div><span style={{ color: "#555566" }}> 16</span></div>
          <div><span style={{ color: "#555566" }}> 17</span>  <span style={{ color: "#5c6370" }}>// C:\ hl_playground_terminal &gt; _</span></div>
        </div>
        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 95%)",
          }}
        />
      </div>
    </div>
  );
}

/* ============================================
   Playground — Curated Workspace Scene
   ============================================ */
export default function Playground() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [useFlatFallback, setUseFlatFallback] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) setUseFlatFallback(true);
    } catch {
      setUseFlatFallback(true);
    }
  }, []);

  return (
    <section
      id="playground"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-visible"
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />

      <div className="mx-auto max-w-[960px]">
        {/* ---- Section heading ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent-violet-light mb-3">
            Workspace
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
            Curated{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Setup
            </span>
          </h2>
          <p className="mt-3 text-sm text-text-muted max-w-md mx-auto">
            A photorealistic 3D render of a developer workspace — CRT monitor, retro console, desk lamp, books, and wall art.
          </p>
        </motion.div>

        {/* ====================================================
           Workspace Render — cinematic entry
           ==================================================== */}
        <div style={{ perspective: 1600 }} className="transform-gpu">
          <motion.div
            initial={
              reduce
                ? false
                : {
                    y: 60,
                    opacity: 0,
                    scale: 0.95,
                  }
            }
            whileInView={
              reduce
                ? {}
                : {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                  }
            }
            viewport={{ once: true, amount: 0.08 }}
            transition={{
              type: "spring",
              stiffness: 45,
              damping: 20,
              mass: 1.2,
            }}
            style={{
              willChange: "transform, opacity",
            }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/5">
              {useFlatFallback ? (
                <FlatTerminal />
              ) : (
                <CuratedWorkspace />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
