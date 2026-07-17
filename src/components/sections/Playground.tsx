"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";

/* ============================================
   Dynamic import — Three.js runs client-side only
   ============================================ */
const RetroComputer3D = dynamic(
  () => import("@/components/RetroComputer3D"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full rounded-2xl bg-bg-secondary/50 flex items-center justify-center" style={{ aspectRatio: "1 / 0.85", maxHeight: 600 }}>
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
   Terminal commands
   ============================================ */

interface CommandEntry {
  type: "input" | "output";
  text: string;
}

const COMMANDS: Record<string, string | string[]> = {
  help: [
    " Available commands:",
    "   help       Show this message",
    "   about      About me",
    "   skills     My tech stack",
    "   projects   Featured projects",
    "   contact    How to reach me",
    "   clear      Clear the terminal",
  ],
  about: [
    " +------------------------------------------+",
    " |  Vo Hoang Lam - AI Software Engineer     |",
    " |  Dong Nai, Vietnam                       |",
    " |                                          |",
    " |  1+ Year building AI-powered enterprise  |",
    " |  apps, modernizing manufacturing, and    |",
    " |  shipping full-stack solutions.          |",
    " +------------------------------------------+",
  ],
  skills: [
    " +- Tech Stack ----------------------------+",
    " | Frontend:  React, Next.js, Angular,      |",
    " |            TypeScript, Tailwind CSS       |",
    " | Backend:   Django, Python, .NET, SQL     |",
    " | Mobile:    Flutter, Android, RFID         |",
    " | AI:        LangChain, RAG, GPT, Pinecone |",
    " | Tools:     Git, Nix, TightVNC            |",
    " +-------------------------------------------+",
  ],
  projects: [
    " +- Featured Projects ---------------------+",
    " | * UEL GenAI Retrieval System             |",
    " |   RAG + LangChain + GPT + Pinecone       |",
    " | * WMS Modernization                      |",
    " |   React + Flutter + RFID Scanning        |",
    " | * TPM System                             |",
    " |   React + Flutter + Python + Django      |",
    " | * VNC Helper (.NET + TightVNC)           |",
    " +-------------------------------------------+",
  ],
  contact: [
    " +- Contact -------------------------------+",
    " | Email:   liamvo0605.work@gmail.com       |",
    " | GitHub:  github.com/mataza060503         |",
    " | LinkedIn: linkedin.com/in/lam-vo         |",
    " | Location: Dong Nai, Vietnam              |",
    " +-------------------------------------------+",
  ],
};

/* ============================================
   Playground — Terminal section with 3D model
   ============================================ */

export default function Playground() {
  const [history, setHistory] = useState<CommandEntry[]>([
    { type: "output", text: 'Welcome! Type "help" to get started.' },
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.12 });
  const reduce = useReducedMotion();

  /* ---- Terminal auto-scroll ---- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  /* ---- Keyboard glow on input change ---- */
  useEffect(() => {
    if (!input) return;
    const lastChar = input[input.length - 1];
    setActiveKey(lastChar === " " ? "SPACE" : lastChar);
    const t = setTimeout(() => setActiveKey(null), 200);
    return () => clearTimeout(t);
  }, [input]);

  const processCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    const entry: CommandEntry = {
      type: "input",
      text: `C:\\> ${cmd}`,
    };
    setHistory((prev) => [...prev, entry]);
    if (trimmed === "clear") {
      setHistory([]);
      return;
    }
    const output = COMMANDS[trimmed];
    if (output) {
      const lines = Array.isArray(output) ? output : [output];
      setHistory((prev) => [
        ...prev,
        ...lines.map((line) => ({ type: "output" as const, text: line })),
      ]);
    } else {
      setHistory((prev) => [
        ...prev,
        {
          type: "output",
          text: `Unknown command: "${trimmed}". Type "help".`,
        },
      ]);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    processCommand(input.trim());
    setCommandHistory((prev) => [input.trim(), ...prev]);
    setInput("");
    setHistoryIndex(-1);
    setActiveKey("ENTER");
    setTimeout(() => setActiveKey(null), 350);
  }, [input, processCommand]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const ni = Math.min(historyIndex + 1, commandHistory.length - 1);
          setHistoryIndex(ni);
          setInput(commandHistory[ni]);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex > 0) {
          const ni = historyIndex - 1;
          setHistoryIndex(ni);
          setInput(commandHistory[ni]);
        } else {
          setHistoryIndex(-1);
          setInput("");
        }
      } else if (e.key === "Backspace") {
        setActiveKey("BKS");
        setTimeout(() => setActiveKey(null), 180);
      }
    },
    [commandHistory, historyIndex, handleSubmit],
  );

  return (
    <section
      id="playground"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-6 overflow-visible"
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />

      <div className="mx-auto max-w-[780px]">
        {/* ---- Section heading ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
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
        </motion.div>

        {/* ====================================================
           3D VIEWPORT — scroll-triggered cinematic entry
           ==================================================== */}
        <div style={{ perspective: 1800 }} className="transform-gpu">
          <motion.div
            initial={
              reduce
                ? false
                : {
                    rotateY: -55,
                    rotateX: 2,
                    y: 120,
                    z: 80,
                    opacity: 0,
                  }
            }
            whileInView={
              reduce
                ? {}
                : {
                    rotateY: 0,
                    rotateX: 4,
                    y: 0,
                    z: 0,
                    opacity: 1,
                  }
            }
            viewport={{ once: false, amount: 0.1 }}
            transition={{
              type: "spring",
              stiffness: 40,
              damping: 18,
              mass: 1.5,
            }}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
              willChange: "transform, opacity",
            }}
          >
            {/* ---- 3D Computer Canvas ---- */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
              <RetroComputer3D
                history={history}
                input={input}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                activeKey={activeKey}
                isInView={isInView}
              />

              {/* ============================================
                  CRT Screen Terminal Overlay
                  ============================================ */}
              <div
                className="absolute pointer-events-none"
                style={{
                  // Positioned to overlay the CRT screen area of the 3D model
                  // Centered in top half of the canvas
                  top: "8%",
                  left: "18%",
                  right: "18%",
                  bottom: "48%",
                }}
              >
                {/* Curved CRT glass overlay */}
                <div
                  className="absolute inset-0 rounded-xl overflow-hidden"
                  style={{
                    background: `
                      radial-gradient(ellipse at 55% 40%, rgba(11,34,11,0.15) 0%, rgba(5,20,5,0.5) 60%, rgba(2,10,2,0.85) 100%)
                    `,
                    boxShadow:
                      "inset 0 0 60px rgba(0,0,0,0.9), inset 0 0 10px rgba(16,185,129,0.04)",
                  }}
                />

                {/* Scanline overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0.35) 3px)",
                  }}
                />

                {/* Glass curvature (corner darkening) */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  style={{
                    background: `
                      radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.6) 95%),
                      radial-gradient(ellipse at 65% 25%, rgba(180,255,180,0.03) 0%, transparent 50%)
                    `,
                  }}
                />

                {/* Terminal text content */}
                <div
                  className="absolute inset-0 overflow-y-auto p-3 font-mono text-[9px] sm:text-[10.5px] leading-relaxed pointer-events-auto"
                  style={{
                    fontFamily:
                      "var(--font-mono), 'Courier New', monospace",
                    color: "#8bff8b",
                    textShadow:
                      "0 0 4px rgba(139,255,139,0.6), 0 0 10px rgba(139,255,139,0.2), 0 0 20px rgba(139,255,139,0.08)",
                  }}
                >
                  {/* Micro-flicker animation */}
                  <style>{`
                    @keyframes phosphorFlicker {
                      0%, 99.5%, 100% { opacity: 1; }
                      99.6% { opacity: 0.96; }
                      99.7% { opacity: 1; }
                      99.8% { opacity: 0.94; }
                      99.9% { opacity: 1; }
                    }
                  `}</style>

                  <div
                    style={{
                      animation: "phosphorFlicker 6s infinite",
                    }}
                  >
                    {history.map((entry, i) => (
                      <div key={i} className="mb-0.5">
                        {entry.type === "input" ? (
                          <div className="flex gap-1">
                            <span style={{ color: "#c4b5fd" }}>
                              C:\&gt;
                            </span>
                            <span style={{ color: "#e2e8f0" }}>
                              {entry.text.replace("C:\\> ", "")}
                            </span>
                          </div>
                        ) : (
                          <div
                            className="whitespace-pre-wrap"
                            style={{ color: "#8bff8b" }}
                          >
                            {entry.text}
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Input line */}
                    <div className="flex gap-1 mt-0.5">
                      <span
                        style={{
                          color: "#c4b5fd",
                          flexShrink: 0,
                        }}
                      >
                        C:\&gt;
                      </span>
                      <span
                        style={{
                          color: "#e2e8f0",
                          textShadow:
                            "0 0 3px rgba(226,232,240,0.3)",
                        }}
                      >
                        {input}
                        <span
                          className="inline-block w-[6px] h-[14px] align-middle ml-[1px]"
                          style={{
                            backgroundColor:
                              "var(--color-accent-emerald)",
                            boxShadow:
                              "0 0 6px var(--color-accent-emerald)",
                            animation: "blink 1s step-end infinite",
                          }}
                        />
                      </span>
                    </div>
                    <div ref={bottomRef} />
                  </div>
                </div>

                {/* Screen reflection gleam */}
                <div
                  className="absolute top-0 right-0 pointer-events-none rounded-xl"
                  style={{
                    width: "40%",
                    height: "35%",
                    background:
                      "radial-gradient(ellipse at 100% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)",
                    borderRadius: "0 12px 0 0",
                  }}
                />
              </div>

              {/* ---- Click prompt (bottom center) ---- */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
                <span className="text-[10px] text-text-muted/60 font-mono">
                  Click to type · Enter to submit
                </span>
              </div>
            </div>

            {/* ---- Hint text ---- */}
            <p
              className="mt-6 text-center text-xs text-text-muted"
              style={{
                fontFamily: "var(--font-mono), monospace",
              }}
            >
              Try: help · about · skills · projects · contact · clear
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
