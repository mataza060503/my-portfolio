"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

/* ============================================
   Commands
   ============================================ */
interface CmdEntry {
  type: "input" | "output";
  lines: string[];
}

const COMMANDS: Record<string, string[]> = {
  help: [
    "AVAILABLE COMMANDS",
    "",
    "  help       Show this message",
    "  about      About me",
    "  skills     My tech stack",
    "  projects   Featured projects",
    "  contact    How to reach me",
    "  clear      Clear the terminal",
  ],
  about: [
    "ABOUT",
    "",
    "  Vo Hoang Lam",
    "  AI Software Engineer  |  Dong Nai, Vietnam",
    "",
    "  Building AI-powered enterprise apps,",
    "  modernizing manufacturing systems,",
    "  and shipping full-stack solutions.",
    "",
    "  Specialized in RAG pipelines, LLM integration,",
    "  and real-time industrial systems.",
  ],
  skills: [
    "TECH STACK",
    "",
    "  FRONTEND    React, Next.js, Angular, TypeScript",
    "  BACKEND     Django, Python, .NET, PostgreSQL",
    "  MOBILE      Flutter, Android, RFID integration",
    "  AI/ML       LangChain, RAG, GPT, Pinecone",
    "  TOOLS       Git, Docker, Nix, CI/CD pipelines",
    "",
    "  Currently exploring: Rust, WebAssembly, Edge AI",
  ],
  projects: [
    "FEATURED PROJECTS",
    "",
    "  UEL GenAI Retrieval System",
    "    RAG pipeline with LangChain + GPT + Pinecone",
    "    Semantic search across 50K+ academic documents",
    "",
    "  WMS Modernization",
    "    React + Flutter frontend with RFID scanning",
    "    Real-time inventory tracking for manufacturing",
    "",
    "  TPM Management System",
    "    React + Flutter + Python + Django backend",
    "    Predictive maintenance scheduling engine",
    "",
    "  VNC Helper",
    "    .NET desktop tool integrating TightVNC",
    "    Remote machine management for factory floor",
  ],
  contact: [
    "CONTACT",
    "",
    "  Email      liamvo0605.work@gmail.com",
    "  GitHub     github.com/mataza060503",
    "  LinkedIn   linkedin.com/in/lam-vo",
    "  Location   Dong Nai, Vietnam",
    "",
    "  Open to freelance and full-time opportunities.",
  ],
};

/* ============================================
   Boot sequence
   ============================================ */
const BOOT_SEQUENCE = [
  { text: "UEFI Firmware v3.2.1  -  Power-On Self Test", delay: 0 },
  { text: "CPU: AMD Ryzen AI 9 HX 370 @ 5.1GHz  ... OK", delay: 100 },
  { text: "Memory: 64GB DDR5-6000  ............... OK", delay: 120 },
  { text: "Storage: NVMe Gen5 2TB  ............... OK", delay: 140 },
  { text: "Initializing HL_CORE kernel  ...............", delay: 180 },
  { text: "Loading neural engine runtime  ............", delay: 160 },
  { text: "GPU Compute: CUDA 12.4 ready  ............", delay: 180 },
  { text: "Network: 10GbE link established  .........", delay: 200 },
  { text: "Encrypted volumes mounted  ...............", delay: 160 },
  { text: "HL_SHELL v4.0 initialized.", delay: 250 },
];

/* ============================================
   Ripple particle
   ============================================ */
interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
}

/* ============================================
   Playground
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
  const [bootFlash, setBootFlash] = useState(false);
  const rippleIdRef = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bootTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = useReducedMotion();

  /* ---- Scroll terminal internally to bottom ---- */
  const scrollTerminal = useCallback(() => {
    const el = terminalRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollTerminal();
  }, [history, bootLines, scrollTerminal]);

  /* ---- Boot sequence ---- */
  const triggerBoot = useCallback(() => {
    if (isBooting || isPoweredOn) return;
    setIsBooting(true);
    setBootFlash(true);
    setTimeout(() => setBootFlash(false), 300);

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
        setHistory([{ type: "output", lines: ['Type "help" to get started.'] }]);
        requestAnimationFrame(() => {
          inputRef.current?.focus({ preventScroll: true });
        });
      }, 350);
    }, cumulativeDelay + 400);

    timers.push(doneTimer);
    bootTimerRef.current = timers;
  }, [isBooting, isPoweredOn]);

  useEffect(() => {
    return () => bootTimerRef.current.forEach(clearTimeout);
  }, []);

  /* ---- Terminal logic ---- */
  const processCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    setHistory((prev) => [...prev, { type: "input", lines: [cmd] }]);
    if (trimmed === "clear") { setHistory([]); return; }
    const output = COMMANDS[trimmed];
    if (output) {
      setHistory((prev) => [...prev, { type: "output", lines: output }]);
    } else {
      setHistory((prev) => [...prev, { type: "output", lines: [`Unknown command: "${trimmed}". Type "help".`] }]);
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
    const colors = ["#8b5cf6", "#10b981", "#a78bfa", "#34d399"];
    setRipples((prev) => [
      ...prev.slice(-6),
      {
        id,
        x: 20 + Math.random() * 60,
        y: 30 + Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
      },
    ]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 800);
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

  const handleScreenClick = () => {
    if (isPoweredOn) {
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  return (
    <section id="playground" ref={sectionRef} className="relative py-24 sm:py-32 px-6 overflow-visible">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.06) 0%, transparent 55%),
            radial-gradient(ellipse at 60% 40%, rgba(16,185,129,0.05) 0%, transparent 55%)
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
            MAIN LAYOUT
            ============================================ */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex flex-col lg:flex-row items-end gap-6 lg:gap-10">
            {/* =====================================
                MONITOR
                ===================================== */}
            <div className="flex-1 flex flex-col items-center w-full">
              <div className="w-full max-w-[640px] rounded-xl overflow-hidden"
                style={{
                  background: "#16161e",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.6), 0 0 80px rgba(139,92,246,0.04)",
                }}
              >
                {/* Top bezel */}
                <div className="h-[6px] bg-[#1a1a24]" />

                {/* Screen */}
                <div
                  className="relative cursor-text overflow-hidden"
                  style={{
                    background: isPoweredOn ? "#0a0a10" : "#06060c",
                    height: 420,
                  }}
                  onClick={handleScreenClick}
                >
                  {/* Boot flash overlay */}
                  <AnimatePresence>
                    {bootFlash && (
                      <motion.div
                        className="absolute inset-0 z-30 pointer-events-none"
                        initial={{ opacity: 1, background: "#ffffff" }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Screen curvature vignette */}
                  <div className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.4) 100%)",
                    }}
                  />

                  {/* Terminal content — fixed height, internal scroll */}
                  <div
                    ref={terminalRef}
                    className="relative z-10 h-full overflow-y-auto p-5 sm:p-6 font-mono text-[12px] sm:text-[13px] leading-relaxed"
                    style={{
                      fontFamily: "var(--font-mono), 'Courier New', monospace",
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(139,92,246,0.2) transparent",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {/* ====== OFF ====== */}
                      {!isPoweredOn && !isBooting && (
                        <motion.div
                          key="off"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center h-full"
                        >
                          <div className="relative mb-8" style={{ animation: "pulseModern 3s ease-in-out infinite" }}>
                            <div className="w-14 h-14 rounded-full flex items-center justify-center"
                              style={{
                                border: "2px solid rgba(139,92,246,0.25)",
                                boxShadow: "0 0 40px rgba(139,92,246,0.08)",
                              }}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.45)" strokeWidth="2" strokeLinecap="round">
                                <path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-[12px] tracking-[0.25em] uppercase text-text-muted/40">
                            System Offline
                          </p>
                          <p className="text-[10px] tracking-widest text-text-muted/20 mt-10">
                            Press power button to initialize
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
                          {/* RGB logo flash */}
                          <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex gap-[3px]"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.05 }}
                          >
                            {["#06b6d4", "#22d3ee", "#67e8f9", "#06b6d4", "#22d3ee"].map((c, i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 rounded-full"
                                initial={{ height: 8, opacity: 1 }}
                                animate={{ height: 48, opacity: [1, 0.8, 0] }}
                                transition={{ duration: 0.45, delay: i * 0.04 }}
                                style={{ background: c, boxShadow: `0 0 16px ${c}` }}
                              />
                            ))}
                          </motion.div>

                          <div className="space-y-[2px] mt-12">
                            {bootLines.map((line, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.05 }}
                                className="text-[11px]"
                                style={{
                                  color: i === bootLines.length - 1 ? "#22d3ee" : "#64748b",
                                  textShadow: i === bootLines.length - 1 ? "0 0 8px rgba(34,211,238,0.3)" : "none",
                                }}
                              >
                                {line}
                              </motion.div>
                            ))}
                            {bootLines.length === BOOT_SEQUENCE.length && !bootDone && (
                              <span className="inline-block w-[6px] h-[13px] ml-[1px] align-middle bg-accent-emerald"
                                style={{ boxShadow: "0 0 8px var(--color-accent-emerald)", animation: "blink 0.5s step-end infinite" }}
                              />
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* ====== ACTIVE TERMINAL ====== */}
                      {isPoweredOn && (
                        <motion.div key="on" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          {history.map((entry, i) => (
                            <div key={i} className="mb-3">
                              {entry.type === "input" ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-accent-violet-light font-semibold text-[12px] shrink-0">hl</span>
                                  <span className="text-accent-emerald text-[12px] shrink-0">~</span>
                                  <span className="text-text-primary">{entry.lines[0]}</span>
                                </div>
                              ) : (
                                <div className="relative pl-3 border-l-2 border-accent-emerald/20 ml-1">
                                  {entry.lines.map((line, li) => {
                                    const isHeader = li === 0 && line === line.toUpperCase() && line.length > 3 && !line.startsWith(" ");
                                    return isHeader ? (
                                      <div key={li} className="text-accent-violet-light font-semibold text-[11px] tracking-wider mb-1">
                                        {line}
                                      </div>
                                    ) : line === "" ? (
                                      <div key={li} className="h-2" />
                                    ) : (
                                      <div key={li} className="text-[12px] whitespace-pre-wrap"
                                        style={{ color: "#a3b8a8" }}>
                                        {line}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}

                          <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
                            <span className="text-accent-violet-light font-semibold text-[12px] shrink-0">hl</span>
                            <span className="text-accent-emerald text-[12px] shrink-0">~</span>
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Keydown ripples */}
                  {ripples.map((r) => (
                    <div
                      key={r.id}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${r.x}%`, top: `${r.y}%`,
                        width: 6, height: 6,
                        borderRadius: "50%",
                        background: r.color,
                        boxShadow: `0 0 12px ${r.color}, 0 0 24px ${r.color}44`,
                        animation: "rippleOut 0.8s ease-out forwards",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  ))}
                </div>

                {/* Bottom bezel */}
                <div className="h-[6px] bg-[#1a1a24] flex items-center justify-center">
                  <span className="w-[4px] h-[4px] rounded-full transition-all duration-700"
                    style={{
                      backgroundColor: isPoweredOn ? "#10b981" : "#334155",
                      boxShadow: isPoweredOn ? "0 0 6px rgba(16,185,129,0.6)" : "none",
                    }}
                  />
                </div>
              </div>

              {/* Stand */}
              <div className="flex flex-col items-center -mt-[1px]">
                <div className="w-10 h-8 rounded-b-sm"
                  style={{ background: "linear-gradient(180deg, #1a1a24, #222230)", borderLeft: "1px solid rgba(255,255,255,0.04)", borderRight: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                />
                <div className="w-40 h-2.5 rounded-b-lg"
                  style={{ background: "#1a1a24", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.04)" }}
                />
              </div>
            </div>

            {/* =====================================
                PC CASE — White Fish-Tank Panoramic
                ===================================== */}
            <div className="w-full lg:w-[260px] flex-shrink-0 flex lg:flex-col items-center gap-3 transform-gpu"
              style={{ perspective: 800, transformStyle: "preserve-3d" }}>

              {/* ── 4 Silver Cylindrical Feet ── */}
              <div className="flex gap-[108px] lg:gap-[140px] -mb-1">
                {[0, 1].map((i) => (
                  <div key={i} className="flex gap-[82px] lg:gap-[110px]">
                    <div className="w-[10px] h-[10px] rounded-full"
                      style={{ background: "#c0c4c8", boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)" }} />
                    <div className="w-[10px] h-[10px] rounded-full"
                      style={{ background: "#c0c4c8", boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)" }} />
                  </div>
                ))}
              </div>

              {/* ── 3D Fish-Tank Chassis ── */}
              <div className="relative w-full"
                style={{ transformStyle: "preserve-3d", transform: "rotateY(-8deg) rotateX(2deg)" }}>

                {/* Main chassis cube */}
                <div className="relative rounded-xl overflow-hidden"
                  style={{
                    background: "#e8eaed",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)",
                    minHeight: 280,
                  }}>

                  {/* ── Top Cap (matte white) ── */}
                  <div className="h-6 bg-white/90 flex items-center justify-end px-3"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    {/* Power Button on top panel */}
                    <button
                      onClick={triggerBoot}
                      disabled={isPoweredOn}
                      className="relative w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0"
                      style={{
                        background: "#d0d4d8",
                        border: `1.5px solid ${isPoweredOn ? "rgba(6,182,212,0.6)" : "#b0b4b8"}`,
                        boxShadow: isPoweredOn
                          ? "0 0 10px rgba(6,182,212,0.5), 0 0 20px rgba(6,182,212,0.2)"
                          : "0 1px 2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
                      }}
                      aria-label="Power on system"
                    >
                      {/* Cyan LED ring when on */}
                      <span className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-700"
                        style={{
                          opacity: isPoweredOn ? 1 : 0,
                          boxShadow: "0 0 8px rgba(6,182,212,0.7), 0 0 16px rgba(6,182,212,0.3)",
                          border: "1px solid rgba(6,182,212,0.5)",
                        }} />
                      {/* Pulse ring when off */}
                      {!isPoweredOn && (
                        <span className="absolute inset-0 rounded-full"
                          style={{ animation: "cyanPulse 2.5s ease-in-out infinite", border: "1px solid rgba(6,182,212,0.25)" }} />
                      )}
                    </button>
                  </div>

                  {/* ── Internal Chamber ── */}
                  <div className="relative overflow-hidden"
                    style={{
                      height: 220,
                      background: "#1a1d22",
                      transformStyle: "preserve-3d",
                    }}>

                    {/* Deepest layer: Motherboard PCB backplate */}
                    <div className="absolute inset-[8%] rounded"
                      style={{
                        background: "#0d1114",
                        border: "1px solid rgba(255,255,255,0.04)",
                        transform: "translateZ(-10px)",
                      }}>
                      {/* White/silver heatsinks */}
                      <div className="absolute top-[15%] left-[10%] right-[10%] h-[25%] rounded"
                        style={{ background: "linear-gradient(180deg, #e8ecf0, #c8cdd4)", border: "1px solid rgba(0,0,0,0.08)" }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="absolute top-1 bottom-1"
                            style={{
                              left: `${8 + i * 16}%`, width: 3,
                              background: "#b8bcc4", borderRadius: 1,
                            }} />
                        ))}
                      </div>
                      {/* Secondary heatsink */}
                      <div className="absolute top-[50%] left-[10%] w-[35%] h-[18%] rounded"
                        style={{ background: "linear-gradient(180deg, #dde1e6, #bcc0c8)", border: "1px solid rgba(0,0,0,0.06)" }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="absolute top-1 bottom-1"
                            style={{ left: `${12 + i * 28}%`, width: 2, background: "#a8acb4", borderRadius: 1 }} />
                        ))}
                      </div>
                    </div>

                    {/* Middle layer: AIO Liquid CPU Cooler */}
                    <div className="absolute top-[25%] left-[20%]" style={{ transform: "translateZ(0px)" }}>
                      {/* Pump block */}
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, #f0f2f5, #d8dce0)",
                          border: "1.5px solid rgba(255,255,255,0.3)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        }}>
                        {/* Cyan display widget */}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: "#0a1018",
                            border: "1px solid rgba(6,182,212,0.3)",
                          }}>
                          <span className="text-[7px] font-mono tracking-wider"
                            style={{
                              color: isPoweredOn ? "#22d3ee" : "#334155",
                              textShadow: isPoweredOn ? "0 0 6px rgba(34,211,238,0.5)" : "none",
                              transition: "all 0.7s",
                            }}>
                            {isPoweredOn ? "42C" : "--"}
                          </span>
                        </div>
                      </div>
                      {/* AIO tubes arching up */}
                      <div className="absolute -top-[60px] left-2 w-[5px] h-[65px] rounded-full"
                        style={{
                          background: "linear-gradient(180deg, #e8eaed, #c8ccd0)",
                          border: "1px solid rgba(0,0,0,0.06)",
                          borderRadius: "40% 40% 0 0",
                          transform: "rotate(-5deg)",
                        }} />
                      <div className="absolute -top-[55px] left-9 w-[4px] h-[58px] rounded-full"
                        style={{
                          background: "linear-gradient(180deg, #dde1e5, #c0c4c8)",
                          border: "1px solid rgba(0,0,0,0.05)",
                          borderRadius: "40% 40% 0 0",
                          transform: "rotate(3deg)",
                        }} />
                    </div>

                    {/* Foreground layer: White GPU */}
                    <div className="absolute bottom-[15%] left-[8%] right-[8%]" style={{ transform: "translateZ(8px)" }}>
                      <div className="h-8 rounded"
                        style={{
                          background: "linear-gradient(180deg, #f4f6f8, #e0e4e8)",
                          border: "1px solid rgba(0,0,0,0.08)",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        }}>
                        {/* GPU shroud details */}
                        <div className="absolute top-2 left-3 right-3 flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex-1 h-[2px] rounded-full"
                              style={{ background: "#c8ccd4" }} />
                          ))}
                        </div>
                        {/* GPU backplate edge */}
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b"
                          style={{ background: "#bcc0c6" }} />
                      </div>
                      {/* Sleeved power cable looping under GPU */}
                      <div className="absolute -bottom-[14px] left-[30%] flex gap-[2px]">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="w-[3px] h-[16px] rounded-full"
                            style={{
                              background: `linear-gradient(180deg, #e8eaed, #c8ccd0)`,
                              border: "1px solid rgba(0,0,0,0.04)",
                              transform: `rotate(${(i - 2.5) * 4}deg)`,
                              transformOrigin: "top center",
                            }} />
                        ))}
                      </div>
                    </div>

                    {/* Right side: Custom sleeved extension cables */}
                    <div className="absolute right-[10%] top-[10%] bottom-[20%] flex gap-[3px]"
                      style={{ transform: "translateZ(4px)" }}>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-[2.5px] h-full rounded-full"
                          style={{
                            background: i % 2 === 0 ? "#e8eaed" : "#d0d4d8",
                            border: "1px solid rgba(0,0,0,0.03)",
                          }} />
                      ))}
                    </div>

                    {/* ── Bottom Dual Fans with Cyan Glow ── */}
                    <div className="absolute bottom-2 left-[12%] right-[12%] flex justify-between"
                      style={{ transform: "translateZ(5px)" }}>
                      {[0, 1].map((i) => (
                        <div key={i} className="relative w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{
                            background: "#1a1d24",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}>
                          {/* Fan hub */}
                          <div className="w-4 h-4 rounded-full"
                            style={{
                              background: "#2a2d34",
                              border: "1px solid rgba(255,255,255,0.08)",
                              animation: "fanSpin 2s linear infinite",
                            }}>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[6px]"
                              style={{ background: "#3a3d44" }} />
                          </div>
                          {/* Cyan glow ring */}
                          <div className="absolute inset-0 rounded-lg transition-all duration-700"
                            style={{
                              boxShadow: isPoweredOn
                                ? "0 0 20px rgba(6,182,212,0.5), 0 0 40px rgba(6,182,212,0.15), inset 0 0 12px rgba(6,182,212,0.08)"
                                : "0 0 0px transparent",
                              background: isPoweredOn
                                ? "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)"
                                : "transparent",
                            }} />
                        </div>
                      ))}
                    </div>

                    {/* Cyan ambient glow overlay when powered */}
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-700"
                      style={{
                        opacity: isPoweredOn ? 1 : 0,
                        background: "radial-gradient(ellipse at 50% 80%, rgba(6,182,212,0.08) 0%, transparent 60%)",
                      }} />

                    {/* Desk mat light bleed */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[120%] h-6 pointer-events-none transition-opacity duration-700"
                      style={{
                        opacity: isPoweredOn ? 1 : 0,
                        background: "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.15) 0%, transparent 70%)",
                      }} />
                  </div>

                  {/* ── Bottom Cap (matte white) ── */}
                  <div className="h-4 bg-white/90"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} />

                  {/* Front glass panel overlay */}
                  <div className="absolute inset-x-0 top-6 bottom-4 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.03) 100%)",
                      borderLeft: "1px solid rgba(255,255,255,0.08)",
                      borderRight: "1px solid rgba(255,255,255,0.04)",
                    }}>
                    {/* Glass reflection gleam */}
                    <div className="absolute top-[10%] left-[5%] w-[30%] h-[40%]"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
                        clipPath: "polygon(0 0, 100% 0, 60% 100%, 0% 100%)",
                      }} />
                  </div>
                </div>
              </div>

              {/* Label */}
              <span className="text-[9px] tracking-[0.15em] uppercase text-text-muted/30 text-center mt-1">
                {isPoweredOn ? "hl-x1 online" : "hl-x1 standby"}
              </span>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-text-muted"
            style={{ fontFamily: "var(--font-mono), monospace" }}>
            Try: help · about · skills · projects · contact · clear
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes pulseModern {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.85; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes rippleOut {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(30);  opacity: 0; }
        }
        @keyframes fanSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes cyanPulse {
          0% { box-shadow: 0 0 0 0 rgba(6,182,212,0.3); }
          70% { box-shadow: 0 0 0 6px rgba(6,182,212,0); }
          100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(139,92,246,0.22); }
          70% { box-shadow: 0 0 0 12px rgba(139,92,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
      `}</style>
    </section>
  );
}
