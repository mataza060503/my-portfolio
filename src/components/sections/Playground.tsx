"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

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
   Boot sequence log lines
   ============================================ */
const BOOT_SEQUENCE = [
  { text: "HL_BIOS v2.4.1  -  System Integrity Check", delay: 0 },
  { text: "RAM Test ............ 64KB OK", delay: 120 },
  { text: "LOADING HL_CORE.SYS ...............", delay: 200 },
  { text: "INITIALIZING RETRO SUBSYSTEM ......", delay: 180 },
  { text: "1+ YEAR AI & FULL-STACK DETECTED ..", delay: 220 },
  { text: "MOUNTING VOLUME: /PROJECTS ........", delay: 160 },
  { text: "NETWORK STACK ONLINE ..............", delay: 200 },
  { text: "CRT DISPLAY CALIBRATED ............", delay: 180 },
  { text: "SYSTEM READY.", delay: 300 },
];

/* ============================================
   Playground — Terminal with Boot Sequence
   ============================================ */
export default function Playground() {
  const [isBooted, setIsBooted] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);
  const [history, setHistory] = useState<CmdEntry[]>([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [powerLED, setPowerLED] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const bootTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = useReducedMotion();

  /* ---- Auto-scroll ---- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, bootLines]);

  /* ---- Power LED pulse when in standby ---- */
  useEffect(() => {
    if (isBooted) return;
    const interval = setInterval(() => {
      setPowerLED((p) => !p);
    }, 1800);
    return () => clearInterval(interval);
  }, [isBooted]);

  /* ---- Boot sequence ---- */
  const triggerBoot = useCallback(() => {
    if (isBooting || isBooted) return;
    setIsBooting(true);
    setPowerLED(true);

    let cumulativeDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_SEQUENCE.forEach(({ text, delay }) => {
      cumulativeDelay += delay;
      const t = setTimeout(() => {
        setBootLines((prev) => [...prev, text]);
      }, cumulativeDelay);
      timers.push(t);
    });

    // Boot complete
    const doneTimer = setTimeout(() => {
      setBootDone(true);
      setIsBooting(false);
      // Brief pause then switch to terminal
      setTimeout(() => {
        setIsBooted(true);
        setHistory([{ type: "output", text: 'Welcome! Type "help" to get started.' }]);
        // Focus input AFTER boot completes
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }, 400);
    }, cumulativeDelay + 400);

    timers.push(doneTimer);
    bootTimerRef.current = timers;
  }, [isBooting, isBooted]);

  /* ---- Cleanup boot timers ---- */
  useEffect(() => {
    return () => {
      bootTimerRef.current.forEach(clearTimeout);
    };
  }, []);

  /* ---- Terminal command processing ---- */
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
    } else if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  /* ---- Click handler — boot or focus ---- */
  const handleScreenClick = () => {
    if (!isBooted) {
      triggerBoot();
    } else {
      inputRef.current?.focus();
    }
  };

  return (
    <section id="playground" ref={sectionRef} className="relative py-24 sm:py-32 px-6">
      {/* Top accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />

      {/* Ambient desk lamp glow behind terminal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 70% 30%, rgba(255,210,140,0.06) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(139,92,246,0.04) 0%, transparent 50%)",
        }}
      />

      <div className="mx-auto max-w-[680px]">
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
        </motion.div>

        {/* ---- Terminal chassis ---- */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative"
        >
          {/* CRT Monitor outer casing */}
          <div className="relative rounded-2xl p-4 sm:p-5"
            style={{
              background: "linear-gradient(170deg, #d4cbb8 0%, #c4b8a4 45%, #b0a490 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            {/* Ventilation slots (top) */}
            <div className="flex gap-[2px] mb-3 px-2">
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} className="flex-1 h-[3px] rounded-full"
                  style={{ background: "linear-gradient(180deg, #8a7a68, #6a5a48)" }}
                />
              ))}
            </div>

            {/* Screen bezel */}
            <div className="rounded-xl p-[6px]"
              style={{
                background: "linear-gradient(180deg, #3a3430, #2a2420)",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
              }}
            >
              {/* CRT Screen */}
              <div
                className="relative rounded-lg overflow-hidden cursor-pointer group"
                style={{ height: 420 }}
                onClick={handleScreenClick}
              >
                {/* Glass reflection overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none rounded-lg"
                  style={{
                    background: `
                      radial-gradient(ellipse at 65% 15%, rgba(255,255,255,0.06) 0%, transparent 35%),
                      radial-gradient(ellipse at 40% 80%, rgba(139,255,139,0.03) 0%, transparent 40%)
                    `,
                  }}
                />

                {/* Scanlines (always on) */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.045]"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)",
                  }}
                />

                {/* CRT vignette */}
                <div className="absolute inset-0 z-10 pointer-events-none rounded-lg"
                  style={{
                    background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 95%)",
                  }}
                />

                {/* Screen background */}
                <div className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at 55% 30%, #0d1a0d, #040a04 80%)",
                  }}
                />

                {/* Content area */}
                <div
                  className="relative z-10 h-full overflow-y-auto p-4 sm:p-5 font-mono text-[12px] sm:text-[13px] leading-relaxed"
                  style={{ fontFamily: "var(--font-mono), 'Courier New', monospace" }}
                >
                  {/* ============================================
                      STANDBY STATE
                      ============================================ */}
                  <AnimatePresence mode="wait">
                    {!isBooted && !isBooting && (
                      <motion.div
                        key="standby"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: "blur(4px)" }}
                        className="flex flex-col items-center justify-center h-full"
                      >
                        {/* CRT glow center */}
                        <div className="w-1 h-1 rounded-full bg-amber-500/60 mb-8"
                          style={{
                            boxShadow: "0 0 20px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.15)",
                            animation: "pulseStandby 2.5s ease-in-out infinite",
                          }}
                        />
                        <p className="text-[11px] tracking-[0.25em] uppercase text-amber-400/70 mb-1"
                          style={{ animation: "pulseStandby 2.5s ease-in-out infinite" }}
                        >
                          SYSTEM STANDBY
                        </p>
                        <p className="text-[10px] tracking-widest text-amber-400/30 mt-6"
                          style={{ animation: "pulseStandby 2.5s ease-in-out infinite 0.8s" }}
                        >
                          CLICK SCREEN TO POWER ON
                        </p>
                      </motion.div>
                    )}

                    {/* ============================================
                        BOOTING STATE
                        ============================================ */}
                    {isBooting && !isBooted && (
                      <motion.div
                        key="booting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col"
                      >
                        {/* Boot flash effect */}
                        <motion.div
                          className="absolute inset-0 z-20 pointer-events-none"
                          initial={{ opacity: 1, background: "#fff" }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        />
                        {/* Horizontal collapse line */}
                        <motion.div
                          className="absolute left-0 right-0 z-20 pointer-events-none"
                          style={{ top: "50%", height: 2, background: "#fff" }}
                          initial={{ scaleY: 40, opacity: 1 }}
                          animate={{ scaleY: 0, opacity: 0 }}
                          transition={{ duration: 0.2, delay: 0.05 }}
                        />

                        <div className="space-y-[2px]">
                          {bootLines.map((line, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.08 }}
                              className="text-[11px]"
                              style={{
                                color: i === bootLines.length - 1 ? "#8bff8b" : "#8899aa",
                                textShadow:
                                  i === bootLines.length - 1
                                    ? "0 0 6px rgba(139,255,139,0.4)"
                                    : "none",
                              }}
                            >
                              {line}
                            </motion.div>
                          ))}
                          {/* Blinking cursor at boot end */}
                          {bootLines.length === BOOT_SEQUENCE.length && !bootDone && (
                            <span
                              className="inline-block w-[7px] h-[14px] ml-[1px] align-middle"
                              style={{
                                backgroundColor: "#8bff8b",
                                boxShadow: "0 0 6px rgba(139,255,139,0.5)",
                                animation: "blink 0.6s step-end infinite",
                              }}
                            />
                          )}
                        </div>

                        {/* Glitch flicker during boot */}
                        {bootLines.length > 2 && bootLines.length < BOOT_SEQUENCE.length && (
                          <motion.div
                            className="absolute inset-0 z-20 pointer-events-none bg-accent-violet/5"
                            animate={{ opacity: [0, 0.3, 0, 0.15, 0] }}
                            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.5 }}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ============================================
                      ACTIVE TERMINAL STATE
                      ============================================ */}
                  {isBooted && (
                    <>
                      {history.map((entry, i) => (
                        <div key={i} className="mb-0.5">
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
                                textShadow: "0 0 4px rgba(139,255,139,0.4), 0 0 8px rgba(139,255,139,0.15)",
                              }}
                            >
                              {entry.text}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Input line */}
                      <form onSubmit={handleSubmit} className="flex gap-1 mt-0.5">
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
                          spellCheck={false}
                          autoComplete="off"
                        />
                      </form>
                      <div ref={bottomRef} />
                    </>
                  )}
                </div>

                {/* Hover glow ring */}
                <div className="absolute inset-0 z-20 pointer-events-none rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: "inset 0 0 40px rgba(139,92,246,0.08), inset 0 0 80px rgba(16,185,129,0.04)",
                  }}
                />
              </div>
            </div>

            {/* Bottom bar — badge + LED */}
            <div className="flex items-center justify-between px-2 pt-3 mt-1"
              style={{ borderTop: "1px solid #b0a490" }}
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#6a5a48]"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                HL-CRT v2.4
              </span>

              {/* Power LED indicator */}
              <div className="flex items-center gap-2">
                <span
                  className="w-[5px] h-[5px] rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: isBooted ? "#10b981" : powerLED ? "#f59e0b" : "#f59e0b",
                    opacity: isBooted ? 1 : powerLED ? 0.9 : 0.3,
                    boxShadow: isBooted
                      ? "0 0 6px rgba(16,185,129,0.6)"
                      : powerLED
                        ? "0 0 6px rgba(245,158,11,0.5)"
                        : "none",
                  }}
                />
                <span className="text-[9px] font-semibold text-accent-violet-light">
                  1+ Year AI & Full-Stack
                </span>
              </div>
            </div>
          </div>

          {/* Monitor stand */}
          <div className="mx-auto w-20 h-5 rounded-b-md"
            style={{
              background: "linear-gradient(180deg, #c4b8a4, #b0a490)",
              border: "1px solid #a09888",
              borderTop: "none",
            }}
          />
          <div className="mx-auto w-36 h-2 rounded-b-lg"
            style={{
              background: "#b0a490",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          />
        </motion.div>

        {/* Hint */}
        <p className="mt-6 text-center text-xs text-text-muted"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          Try: help · about · skills · projects · contact · clear
        </p>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes pulseStandby {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.85; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
