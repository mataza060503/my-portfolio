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
    "  Available commands:",
    "    help       Show this message",
    "    about      About me",
    "    skills     My tech stack",
    "    projects   Featured projects",
    "    contact    How to reach me",
    "    clear      Clear the terminal",
  ],
  about: [
    "  +------------------------------------------+",
    "  |  Vo Hoang Lam - AI Software Engineer     |",
    "  |  Dong Nai, Vietnam                       |",
    "  |                                          |",
    "  |  1+ Year building AI-powered enterprise  |",
    "  |  apps, modernizing manufacturing, and    |",
    "  |  shipping full-stack solutions.          |",
    "  +------------------------------------------+",
  ],
  skills: [
    "  +- Tech Stack ----------------------------+",
    "  | Frontend:  React, Next.js, Angular,      |",
    "  |            TypeScript, Tailwind CSS       |",
    "  | Backend:   Django, Python, .NET, SQL     |",
    "  | Mobile:    Flutter, Android, RFID         |",
    "  | AI:        LangChain, RAG, GPT, Pinecone |",
    "  | Tools:     Git, Nix, TightVNC            |",
    "  +-------------------------------------------+",
  ],
  projects: [
    "  +- Featured Projects ---------------------+",
    "  | * UEL GenAI Retrieval System             |",
    "  |   RAG + LangChain + GPT + Pinecone       |",
    "  | * WMS Modernization                      |",
    "  |   React + Flutter + RFID Scanning        |",
    "  | * TPM System                             |",
    "  |   React + Flutter + Python + Django      |",
    "  | * VNC Helper (.NET + TightVNC)           |",
    "  +-------------------------------------------+",
  ],
  contact: [
    "  +- Contact -------------------------------+",
    "  | Email:   liamvo0605.work@gmail.com       |",
    "  | GitHub:  github.com/mataza060503         |",
    "  | LinkedIn: linkedin.com/in/lam-vo         |",
    "  | Location: Dong Nai, Vietnam              |",
    "  +-------------------------------------------+",
  ],
};

/* ============================================
   Modern boot sequence
   ============================================ */
const BOOT_SEQUENCE = [
  { text: "UEFI Firmware v3.2.1  -  POST complete", delay: 0 },
  { text: "CPU: AMD Ryzen AI 9 HX 370 @ 5.1GHz", delay: 100 },
  { text: "Memory: 64GB DDR5-6000  ......... OK", delay: 120 },
  { text: "Storage: NVMe Gen5 2TB  ......... OK", delay: 140 },
  { text: "Initializing HL_CORE kernel ..........", delay: 180 },
  { text: "1+ YEAR AI & FULL-STACK PROFILE LOADED", delay: 200 },
  { text: "Mounting encrypted volumes  ..........", delay: 160 },
  { text: "Network: 10GbE link established", delay: 180 },
  { text: "GPU Compute: CUDA runtime ready", delay: 200 },
  { text: "SYSTEM ONLINE.", delay: 250 },
];

/* ============================================
   Keydown ripple particle
   ============================================ */
interface Ripple {
  id: number;
  x: number;
  y: number;
}

/* ============================================
   Playground — Modern Futuristic PC Setup
   ============================================ */
export default function Playground() {
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);
  const [history, setHistory] = useState<CmdEntry[]>([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleIdRef = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bootTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = useReducedMotion();

  /* ---- Auto-scroll terminal ---- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, bootLines]);

  /* ---- Boot sequence ---- */
  const triggerBoot = useCallback(() => {
    if (isBooting || isPoweredOn) return;
    setIsBooting(true);

    let cumulativeDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_SEQUENCE.forEach(({ text, delay }) => {
      cumulativeDelay += delay;
      const t = setTimeout(() => {
        setBootLines((prev) => [...prev, text]);
      }, cumulativeDelay);
      timers.push(t);
    });

    const doneTimer = setTimeout(() => {
      setBootDone(true);
      setIsBooting(false);
      setTimeout(() => {
        setIsPoweredOn(true);
        setHistory([{ type: "output", text: 'Welcome! Type "help" to get started.' }]);
        // Focus with preventScroll to avoid viewport jump
        requestAnimationFrame(() => {
          inputRef.current?.focus({ preventScroll: true });
          // Then smoothly center the section
          containerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      }, 350);
    }, cumulativeDelay + 400);

    timers.push(doneTimer);
    bootTimerRef.current = timers;
  }, [isBooting, isPoweredOn]);

  /* ---- Cleanup timers ---- */
  useEffect(() => {
    return () => {
      bootTimerRef.current.forEach(clearTimeout);
    };
  }, []);

  /* ---- Terminal logic ---- */
  const processCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    setHistory((prev) => [...prev, { type: "input", text: `hl> ${cmd}` }]);
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

  /* ---- Emit ripple on keydown ---- */
  const emitRipple = useCallback(() => {
    if (reduce) return;
    const id = rippleIdRef.current++;
    const x = 40 + Math.random() * 60; // random horizontal position (%)
    const y = 60 + Math.random() * 30;
    setRipples((prev) => [...prev.slice(-8), { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 700);
  }, [reduce]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    emitRipple();

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

  /* ---- Click screen to focus (when on) ---- */
  const handleScreenClick = () => {
    if (isPoweredOn) {
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  return (
    <section id="playground" ref={sectionRef} className="relative py-24 sm:py-32 px-6 overflow-visible">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.05) 0%, transparent 55%),
            radial-gradient(ellipse at 60% 40%, rgba(16,185,129,0.04) 0%, transparent 55%)
          `,
        }}
      />

      <div ref={containerRef} className="mx-auto max-w-[960px]">
        {/* ---- Section heading ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase text-accent-violet-light mb-3">
            Interactive
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
            Terminal{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-violet-light to-accent-emerald-light">
              Playground
            </span>
          </h2>
        </motion.div>

        {/* ============================================
            MAIN LAYOUT — Monitor + PC Case side by side
            ============================================ */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex flex-col lg:flex-row items-end gap-6 lg:gap-10">
            {/* =====================================
                MODERN MONITOR
                ===================================== */}
            <div className="flex-1 flex flex-col items-center">
              {/* Monitor casing — ultra-thin bezel */}
              <div className="w-full max-w-[640px] rounded-xl overflow-hidden"
                style={{
                  background: "#16161e",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.6), 0 0 80px rgba(139,92,246,0.04)",
                }}
              >
                {/* Top micro-bezel */}
                <div className="h-[6px] bg-[#1a1a24]" />

                {/* Screen area */}
                <div
                  ref={screenRef}
                  className="relative cursor-text"
                  style={{
                    background: isPoweredOn
                      ? "#0a0a10"
                      : "#06060c",
                    minHeight: 420,
                  }}
                  onClick={handleScreenClick}
                >
                  {/* Subtle screen curvature illusion */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.35) 100%)",
                    }}
                  />

                  {/* Screen content */}
                  <div
                    className="relative z-10 h-full min-h-[420px] overflow-y-auto p-5 sm:p-6 font-mono text-[12px] sm:text-[13px] leading-relaxed"
                    style={{ fontFamily: "var(--font-mono), 'Courier New', monospace" }}
                  >
                    <AnimatePresence mode="wait">
                      {/* ====== POWERED OFF ====== */}
                      {!isPoweredOn && !isBooting && (
                        <motion.div
                          key="off"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center h-full min-h-[380px]"
                        >
                          {/* Power symbol */}
                          <div className="relative mb-6"
                            style={{ animation: "pulseModern 3s ease-in-out infinite" }}
                          >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{
                                border: "2px solid rgba(139,92,246,0.3)",
                                boxShadow: "0 0 30px rgba(139,92,246,0.1)",
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="2" strokeLinecap="round">
                                <path d="M12 2v10" />
                                <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-[11px] tracking-[0.2em] uppercase text-text-muted/50">
                            System Offline
                          </p>
                          <p className="text-[10px] tracking-widest text-text-muted/25 mt-8">
                            Press power button on PC case to boot
                          </p>
                        </motion.div>
                      )}

                      {/* ====== BOOTING ====== */}
                      {isBooting && !isPoweredOn && (
                        <motion.div
                          key="booting"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col"
                        >
                          {/* Boot flash */}
                          <motion.div
                            className="absolute inset-0 z-20 pointer-events-none"
                            initial={{ opacity: 1, background: "#0a0a10" }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                          />
                          {/* RGB logo flash */}
                          <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex gap-[2px]"
                            initial={{ opacity: 1, scale: 1.5 }}
                            animate={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.4, delay: 0.05 }}
                          >
                            {["#8b5cf6", "#10b981", "#8b5cf6", "#10b981", "#8b5cf6"].map((c, i) => (
                              <div key={i} className="w-1 h-8 rounded-full" style={{ background: c }} />
                            ))}
                          </motion.div>

                          <div className="space-y-[2px] mt-10">
                            {bootLines.map((line, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.06 }}
                                className="text-[11px]"
                                style={{
                                  color: i === bootLines.length - 1 ? "#10b981" : "#64748b",
                                }}
                              >
                                {line}
                              </motion.div>
                            ))}
                            {bootLines.length === BOOT_SEQUENCE.length && !bootDone && (
                              <span className="inline-block w-[6px] h-[13px] ml-[1px] align-middle bg-accent-emerald"
                                style={{
                                  boxShadow: "0 0 6px var(--color-accent-emerald)",
                                  animation: "blink 0.5s step-end infinite",
                                }}
                              />
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* ====== POWERED ON — ACTIVE TERMINAL ====== */}
                      {isPoweredOn && (
                        <motion.div
                          key="on"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {history.map((entry, i) => (
                            <div key={i} className="mb-0.5">
                              {entry.type === "input" ? (
                                <div className="flex gap-1.5">
                                  <span className="text-accent-violet-light shrink-0 font-semibold">hl&gt;</span>
                                  <span className="text-text-primary">
                                    {entry.text.replace("hl> ", "")}
                                  </span>
                                </div>
                              ) : (
                                <div
                                  className="whitespace-pre-wrap"
                                  style={{
                                    color: "#a3e0b8",
                                  }}
                                >
                                  {entry.text}
                                </div>
                              )}
                            </div>
                          ))}

                          <form onSubmit={handleSubmit} className="flex gap-1.5 mt-0.5">
                            <span className="text-accent-violet-light shrink-0 font-semibold">hl&gt;</span>
                            <input
                              ref={inputRef}
                              type="text"
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="flex-1 bg-transparent border-none outline-none font-mono text-[12px] sm:text-[13px] placeholder:text-white/5"
                              style={{ color: "#e2e8f0", caretColor: "var(--color-accent-emerald)" }}
                              placeholder="Type a command..."
                              spellCheck={false}
                              autoComplete="off"
                            />
                          </form>
                          <div ref={bottomRef} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Keydown ripple effects */}
                  {ripples.map((r) => (
                    <div
                      key={r.id}
                      className="absolute pointer-events-none z-20"
                      style={{
                        left: `${r.x}%`,
                        top: `${r.y}%`,
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "var(--color-accent-emerald)",
                        boxShadow: "0 0 8px var(--color-accent-emerald), 0 0 16px var(--color-accent-violet)",
                        animation: "rippleOut 0.7s ease-out forwards",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  ))}

                  {/* Hover border glow when off */}
                  {!isPoweredOn && (
                    <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-700"
                      style={{
                        boxShadow: "inset 0 0 60px rgba(139,92,246,0.04)",
                      }}
                    />
                  )}
                </div>

                {/* Bottom micro-bezel with status dot */}
                <div className="h-[6px] bg-[#1a1a24] flex items-center justify-center">
                  <span
                    className="w-[4px] h-[4px] rounded-full transition-colors duration-700"
                    style={{
                      backgroundColor: isPoweredOn ? "#10b981" : "#334155",
                      boxShadow: isPoweredOn ? "0 0 4px rgba(16,185,129,0.6)" : "none",
                    }}
                  />
                </div>
              </div>

              {/* Monitor stand */}
              <div className="flex flex-col items-center -mt-[1px]">
                <div className="w-10 h-8 rounded-b-sm"
                  style={{
                    background: "linear-gradient(180deg, #1a1a24, #222230)",
                    borderLeft: "1px solid rgba(255,255,255,0.04)",
                    borderRight: "1px solid rgba(255,255,255,0.04)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                />
                <div className="w-40 h-2.5 rounded-b-lg"
                  style={{
                    background: "#1a1a24",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                />
              </div>
            </div>

            {/* =====================================
                MODERN PC CASE
                ===================================== */}
            <div className="w-full lg:w-[200px] flex-shrink-0 flex lg:flex-col items-center gap-4">
              <div className="relative w-36 lg:w-full rounded-xl overflow-hidden"
                style={{
                  background: "#111118",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.03)",
                }}
              >
                {/* Top I/O panel */}
                <div className="h-1.5 bg-[#0d0d14] border-b border-white/[0.03]" />

                {/* Tempered glass side panel with RGB liquid cooling animation */}
                <div className="relative h-48 overflow-hidden"
                  style={{ background: "#0a0a12" }}
                >
                  {/* RGB liquid cooling loop */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Pipe 1 */}
                    <div className="absolute"
                      style={{
                        left: "15%", top: "10%", width: 6, height: "80%",
                        borderRadius: 3,
                        background: "linear-gradient(180deg, #8b5cf6, #10b981, #8b5cf6)",
                        backgroundSize: "100% 200%",
                        animation: "rgbFlow 3s linear infinite",
                        opacity: 0.6,
                        boxShadow: "0 0 12px rgba(139,92,246,0.3)",
                      }}
                    />
                    {/* Pipe 2 */}
                    <div className="absolute"
                      style={{
                        left: "55%", top: "5%", width: 5, height: "90%",
                        borderRadius: 3,
                        background: "linear-gradient(180deg, #10b981, #8b5cf6, #10b981)",
                        backgroundSize: "100% 200%",
                        animation: "rgbFlow 3.5s linear infinite reverse",
                        opacity: 0.5,
                        boxShadow: "0 0 10px rgba(16,185,129,0.25)",
                      }}
                    />
                    {/* CPU block glow */}
                    <div className="absolute top-[35%] left-[25%] w-10 h-10 rounded-lg"
                      style={{
                        background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
                        animation: "cpuPulse 2s ease-in-out infinite",
                      }}
                    />
                    {/* RAM sticks */}
                    {[0, 1].map((i) => (
                      <div key={i} className="absolute w-1.5 h-8 rounded-sm"
                        style={{
                          right: `${22 + i * 10}%`,
                          top: "40%",
                          background: `linear-gradient(180deg, rgba(16,185,129,0.4), rgba(139,92,246,0.2))`,
                          boxShadow: "0 0 6px rgba(16,185,129,0.2)",
                          opacity: 0.4,
                        }}
                      />
                    ))}
                    {/* GPU block glow */}
                    <div className="absolute bottom-[15%] left-[50%] w-14 h-5 rounded"
                      style={{
                        background: "linear-gradient(90deg, rgba(139,92,246,0.15), rgba(16,185,129,0.1))",
                        boxShadow: "0 0 10px rgba(139,92,246,0.1)",
                      }}
                    />
                  </div>

                  {/* Laser-etched badge */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald"
                        style={{ boxShadow: "0 0 4px var(--color-accent-emerald)" }}
                      />
                      <span className="text-[8px] font-semibold tracking-widest uppercase text-text-muted/70">
                        1+ Year AI & Full-Stack
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom panel */}
                <div className="h-1.5 bg-[#0d0d14] border-t border-white/[0.03]" />
              </div>

              {/* Power Button */}
              <button
                onClick={triggerBoot}
                disabled={isPoweredOn}
                className="relative flex-shrink-0 group"
                aria-label="Power on system"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isPoweredOn
                      ? "rgba(16,185,129,0.08)"
                      : "rgba(139,92,246,0.06)",
                    border: `1.5px solid ${isPoweredOn ? "rgba(16,185,129,0.25)" : "rgba(139,92,246,0.2)"}`,
                  }}
                >
                  {/* Power icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={isPoweredOn ? "rgba(16,185,129,0.6)" : "rgba(139,92,246,0.5)"}
                    strokeWidth="2.5" strokeLinecap="round"
                  >
                    <path d="M12 2v10" />
                    <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
                  </svg>
                </div>

                {/* Glow ring on hover */}
                <div className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: isPoweredOn
                      ? "0 0 20px rgba(16,185,129,0.2)"
                      : "0 0 24px rgba(139,92,246,0.25)",
                  }}
                />

                {/* Pulse ring when off */}
                {!isPoweredOn && (
                  <div className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      animation: "pulseRing 2.5s ease-in-out infinite",
                      boxShadow: "0 0 0 0 rgba(139,92,246,0.15)",
                    }}
                  />
                )}
              </button>

              {/* Label */}
              <span className="text-[9px] tracking-[0.15em] uppercase text-text-muted/40 text-center">
                {isPoweredOn ? "Online" : "Power"}
              </span>
            </div>
          </div>

          {/* Hint */}
          <p className="mt-8 text-center text-xs text-text-muted"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            Try: help · about · skills · projects · contact · clear
          </p>
        </motion.div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes pulseModern {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.85; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes rippleOut {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(25); opacity: 0; }
        }
        @keyframes rgbFlow {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 200%; }
        }
        @keyframes cpuPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(139,92,246,0.2); }
          70% { box-shadow: 0 0 0 10px rgba(139,92,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
      `}</style>
    </section>
  );
}
