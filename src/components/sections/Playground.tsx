"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { Terminal as TerminalIcon, RefreshCw } from "lucide-react";

/* ============================================
   Terminal commands
   ============================================ */

interface CommandEntry {
  type: "input" | "output";
  text: string;
}

const COMMANDS: Record<string, string | string[]> = {
  help: [
    "Available commands:",
    "  help      — Show this message",
    "  about     — About me",
    "  skills    — My tech stack",
    "  projects  — Featured projects",
    "  contact   — How to reach me",
    "  clear     — Clear the terminal",
  ],
  about: [
    "╭────────────────────────────────────────╮",
    "│  Vo Hoang Lam — AI Software Engineer   │",
    "│  Dong Nai, Vietnam                     │",
    "│                                        │",
    "│  I build AI-powered enterprise apps,   │",
    "│  modernize manufacturing systems, and  │",
    "│  ship full-stack solutions.            │",
    "╰────────────────────────────────────────╯",
  ],
  skills: [
    "┌─ Tech Stack ──────────────────────────┐",
    "│ Frontend:  React, Next.js, Angular,   │",
    "│            TypeScript, Tailwind CSS    │",
    "│ Backend:   Django, Python, .NET, SQL   │",
    "│ Mobile:    Flutter, Android, RFID      │",
    "│ AI:        LangChain, RAG, GPT,        │",
    "│            Pinecone, Prompt Engineering│",
    "│ Tools:     Git, Nix, TightVNC          │",
    "└────────────────────────────────────────┘",
  ],
  projects: [
    "┌─ Featured Projects ───────────────────┐",
    "│ * UEL GenAI Retrieval System          │",
    "│   RAG + LangChain + GPT + Pinecone    │",
    "│ * WMS Modernization                   │",
    "│   React + Flutter + RFID Scanning     │",
    "│ * TPM System                          │",
    "│   React + Flutter + Python + Django   │",
    "│ * VNC Helper (.NET + TightVNC)        │",
    "└────────────────────────────────────────┘",
  ],
  contact: [
    "┌─ Contact ─────────────────────────────┐",
    "│ Email:   vohoanglam060503@gmail.com   │",
    "│ GitHub:  github.com/mataza060503      │",
    "│ LinkedIn: linkedin.com/in/lamvo       │",
    "│ Location: Dong Nai, Vietnam           │",
    "└────────────────────────────────────────┘",
  ],
};

/* ============================================
   Terminal Component
   ============================================ */

export default function Playground() {
  const [history, setHistory] = useState<CommandEntry[]>([
    {
      type: "output",
      text: 'Welcome! Type "help" to get started.',
    },
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const processCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();

    if (!trimmed) return;

    const newEntry: CommandEntry = { type: "input", text: `visitor@portfolio:~$ ${cmd}` };
    setHistory((prev) => [...prev, newEntry]);

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
          text: `Unknown command: "${trimmed}". Type "help" for available commands.`,
        },
      ]);
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
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const handleReset = () => {
    setHistory([
      { type: "output", text: 'Welcome! Type "help" to get started.' },
    ]);
    setInput("");
  };

  return (
    <section
      id="playground"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-6"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />

      <div className="mx-auto max-w-3xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
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
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-hidden rounded-2xl border border-bg-tertiary bg-bg-secondary/80 backdrop-blur shadow-2xl shadow-black/30"
        >
          {/* Title bar */}
          <div className="flex items-center gap-3 px-5 py-3 bg-bg-tertiary/60 border-b border-bg-tertiary">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs font-medium text-text-muted flex-1 text-center">
              visitor@portfolio — bash
            </span>
            <button
              onClick={handleReset}
              className="text-text-muted hover:text-accent-violet-light transition-colors"
              aria-label="Reset terminal"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Terminal body */}
          <div
            className="h-[380px] sm:h-[420px] overflow-y-auto p-5 font-mono text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            {history.map((entry, i) => (
              <div key={i} className="mb-1">
                {entry.type === "input" ? (
                  <div className="flex items-center gap-2 text-accent-emerald-light">
                    <span className="text-accent-violet-light shrink-0">
                      visitor@portfolio:~$
                    </span>
                    <span className="text-text-primary">
                      {entry.text.replace("visitor@portfolio:~$ ", "")}
                    </span>
                  </div>
                ) : (
                  <div className="text-text-secondary whitespace-pre-wrap">
                    {entry.text}
                  </div>
                )}
              </div>
            ))}

            {/* Input line */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
              <span className="text-accent-violet-light shrink-0">
                visitor@portfolio:~$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-text-primary font-mono caret-accent-emerald placeholder:text-text-muted"
                placeholder="Type a command..."
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </form>
            <div ref={bottomRef} />
          </div>
        </motion.div>

        {/* Hint */}
        <p className="mt-4 text-center text-xs text-text-muted">
          Try: help · about · skills · projects · contact · clear
        </p>
      </div>
    </section>
  );
}
