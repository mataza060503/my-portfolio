"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";

/* ============================================
   Dynamic import — Three.js runs client-only
   ============================================ */
const RetroComputer3D = dynamic(
  () => import("@/components/RetroComputer3D"),
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
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

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
    const entry: CommandEntry = { type: "input", text: `C:\\> ${cmd}` };
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
        { type: "output", text: `Unknown command: "${trimmed}". Type "help".` },
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
            A fully interactive 3D retro computer — drag to rotate, scroll to zoom, click to type commands.
          </p>
        </motion.div>

        {/* ====================================================
           3D VIEWPORT — cinematic entry animation
           ==================================================== */}
        <div style={{ perspective: 2000 }} className="transform-gpu">
          <motion.div
            initial={
              reduce
                ? false
                : { rotateY: -35, rotateX: 8, y: 100, z: 60, opacity: 0, scale: 0.92 }
            }
            whileInView={
              reduce
                ? {}
                : { rotateY: 0, rotateX: 0, y: 0, z: 0, opacity: 1, scale: 1 }
            }
            viewport={{ once: false, amount: 0.1 }}
            transition={{ type: "spring", stiffness: 38, damping: 17, mass: 1.4 }}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
              willChange: "transform, opacity",
            }}
          >
            {/* ---- 3D Computer Canvas ---- */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <RetroComputer3D
                history={history}
                input={input}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                activeKey={activeKey}
                isInView={true}
              />
            </div>

            {/* ---- Hint text ---- */}
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
