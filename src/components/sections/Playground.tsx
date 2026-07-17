"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useTerminal } from "@/hooks/useTerminal";

/* ============================================
   Dynamic import — R3F runs client-only
   ============================================ */
const RetroComputerR3F = dynamic(
  () => import("@/components/RetroComputerR3F"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-2xl bg-bg-secondary/50 flex items-center justify-center"
        style={{ aspectRatio: "1 / 0.8", maxHeight: 600 }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-accent-violet border-t-transparent animate-spin" />
          <span className="text-sm text-text-muted font-mono">
            Initializing 3D Engine...
          </span>
        </div>
      </div>
    ),
  },
);

/* ============================================
   Flat terminal fallback (no WebGL)
   ============================================ */
function FlatTerminal({
  history,
  input,
  focused,
  setInput,
  submit,
  handleKeyDown,
  focus,
  blur,
  bottomRef,
}: ReturnType<typeof useTerminal>) {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-bg-surface/30"
      style={{
        aspectRatio: "1 / 0.8",
        maxHeight: 600,
        background:
          "radial-gradient(ellipse at 55% 40%, #0d220d, #020a02 80%)",
      }}
    >
      <div className="h-full w-full font-mono text-[10px] sm:text-[11px] leading-relaxed p-4 flex flex-col relative">
        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 95%)",
          }}
        />

        <div
          className="flex-1 overflow-y-auto relative z-10"
          style={{
            fontFamily: "var(--font-mono), 'Courier New', monospace",
            color: "#8bff8b",
            textShadow:
              "0 0 4px rgba(139,255,139,0.55), 0 0 10px rgba(139,255,139,0.18)",
          }}
        >
          {history.map((entry, i) => (
            <div key={i} className="mb-0.5">
              {entry.type === "input" ? (
                <div className="flex gap-1">
                  <span style={{ color: "#c4b5fd" }}>C:\&gt;</span>
                  <span style={{ color: "#e2e8f0" }}>
                    {entry.text.replace("C:\\> ", "")}
                  </span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap" style={{ color: "#8bff8b" }}>
                  {entry.text}
                </div>
              )}
            </div>
          ))}
          {/* Input line */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex gap-1 mt-0.5"
          >
            <span style={{ color: "#c4b5fd", flexShrink: 0 }}>C:\&gt;</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  (e.target as HTMLInputElement).blur();
                  return;
                }
                handleKeyDown(e);
              }}
              onFocus={focus}
              onBlur={blur}
              className="flex-1 bg-transparent border-none outline-none font-mono text-[10px] sm:text-[11px] placeholder:text-white/10"
              style={{
                color: "#e2e8f0",
                caretColor: "var(--color-accent-emerald)",
              }}
              placeholder="Type a command..."
              spellCheck={false}
              autoComplete="off"
            />
          </form>
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Playground — Terminal section with 3D model
   ============================================ */
export default function Playground() {
  const terminal = useTerminal();
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [useFlatFallback, setUseFlatFallback] = useState(false);

  // Check WebGL support
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
      className="relative py-24 sm:py-32 px-6 overflow-visible"
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />

      <div className="mx-auto max-w-[820px]">
        {/* ---- Section heading ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent-violet-light mb-3">
            Interactive
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
            Terminal{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-violet-light to-accent-emerald-light">
              Playground
            </span>
          </h2>
          <p className="mt-3 text-sm text-text-muted max-w-md mx-auto">
            Drag to orbit · scroll to zoom · click the screen to type commands.
          </p>
        </motion.div>

        {/* ====================================================
           3D VIEWPORT — cinematic entry
           ==================================================== */}
        <div style={{ perspective: 2000 }} className="transform-gpu">
          <motion.div
            initial={
              reduce
                ? false
                : {
                    rotateY: -25,
                    rotateX: 6,
                    y: 80,
                    z: 40,
                    opacity: 0,
                    scale: 0.94,
                  }
            }
            whileInView={
              reduce
                ? {}
                : {
                    rotateY: 0,
                    rotateX: 0,
                    y: 0,
                    z: 0,
                    opacity: 1,
                    scale: 1,
                  }
            }
            viewport={{ once: false, amount: 0.1 }}
            transition={{
              type: "spring",
              stiffness: 38,
              damping: 17,
              mass: 1.4,
            }}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
              willChange: "transform, opacity",
            }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/5">
              {useFlatFallback ? (
                <FlatTerminal {...terminal} />
              ) : (
                <RetroComputerR3F {...terminal} />
              )}
            </div>

            {/* Hint */}
            <p
              className="mt-6 text-center text-xs text-text-muted"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              Try: help · about · skills · projects · contact · clear
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
