"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ============================================
   Commands
   ============================================ */
interface CmdEntry {
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
   Playground — Simple Terminal
   ============================================ */
export default function Playground() {
  const [history, setHistory] = useState<CmdEntry[]>([
    { type: "output", text: 'Welcome! Type "help" to get started.' },
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const processCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    setHistory((prev) => [...prev, { type: "input", text: `C:\\> ${cmd}` }]);
    if (trimmed === "clear") { setHistory([]); return; }
    const output = COMMANDS[trimmed];
    if (output) {
      const lines = Array.isArray(output) ? output : [output];
      setHistory((prev) => [...prev, ...lines.map((text) => ({ type: "output" as const, text }))]);
    } else {
      setHistory((prev) => [...prev, { type: "output", text: `Unknown command: "${trimmed}". Type "help".` }]);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input.trim());
    setCommandHistory((prev) => [input.trim(), ...prev]);
    setInput("");
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
        setHistoryIndex(historyIndex - 1);
        setInput(commandHistory[historyIndex - 1]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  return (
    <section id="playground" ref={sectionRef} className="relative py-24 sm:py-32 px-6">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />

      <div className="mx-auto max-w-[680px]">
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
        </motion.div>

        {/* Terminal window */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative rounded-xl overflow-hidden border border-bg-surface/40 shadow-xl shadow-black/30"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-tertiary/80 border-b border-bg-surface/30">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-[11px] text-text-muted font-mono tracking-wide">
              terminal — visitor@portfolio
            </span>
          </div>

          {/* Screen */}
          <div
            className="h-[420px] overflow-y-auto p-4 font-mono text-[12px] sm:text-[13px] leading-relaxed"
            style={{
              background: "radial-gradient(ellipse at 55% 30%, #0d1a0d, #050f05 80%)",
              fontFamily: "var(--font-mono), 'Courier New', monospace",
            }}
          >
            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)",
              }}
            />

            {history.map((entry, i) => (
              <div key={i} className="mb-0.5 relative z-10">
                {entry.type === "input" ? (
                  <div className="flex gap-1">
                    <span className="text-accent-violet-glow shrink-0">C:\&gt;</span>
                    <span className="text-text-primary">
                      {entry.text.replace("C:\\> ", "")}
                    </span>
                  </div>
                ) : (
                  <div
                    className="whitespace-pre-wrap"
                    style={{
                      color: "#8bff8b",
                      textShadow:
                        "0 0 4px rgba(139,255,139,0.4), 0 0 8px rgba(139,255,139,0.15)",
                    }}
                  >
                    {entry.text}
                  </div>
                )}
              </div>
            ))}

            {/* Input line */}
            <form onSubmit={handleSubmit} className="flex gap-1 mt-0.5 relative z-10">
              <span className="text-accent-violet-glow shrink-0">C:\&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none font-mono text-[12px] sm:text-[13px] placeholder:text-white/10"
                style={{ color: "#e2e8f0", caretColor: "var(--color-accent-emerald)" }}
                placeholder="Type a command..."
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </form>
            <div ref={bottomRef} />
          </div>
        </motion.div>

        <p
          className="mt-5 text-center text-xs text-text-muted"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          Try: help · about · skills · projects · contact · clear
        </p>
      </div>
    </section>
  );
}
