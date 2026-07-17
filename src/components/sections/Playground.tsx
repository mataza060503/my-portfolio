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
  const [isHovered, setIsHovered] = useState(false);
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
                PC COMPONENTS — Floating 3D Assembly
                ===================================== */}
            <div
              className="w-full lg:w-[260px] flex-shrink-0 flex lg:flex-col items-center gap-3"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{ perspective: 900 }}
            >
              <div className="relative w-full" style={{ minHeight: 320, transformStyle: "preserve-3d" }}>
                {/* Case Shell */}
                <motion.div className="absolute inset-0 rounded-2xl"
                  animate={{
                    borderColor: isHovered || isPoweredOn ? "rgba(6,182,212,0.35)" : "rgba(255,255,255,0.05)",
                    boxShadow: isPoweredOn ? "0 0 40px rgba(6,182,212,0.2), inset 0 0 30px rgba(6,182,212,0.04)" : isHovered ? "0 0 30px rgba(6,182,212,0.12)" : "0 0 0 transparent",
                    background: isPoweredOn ? "rgba(6,182,212,0.03)" : "rgba(255,255,255,0.015)",
                  }}
                  transition={{ duration: 0.6 }}
                  style={{ border: "1px solid rgba(255,255,255,0.06)", transform: "translateZ(-20px)" }}>
                  <div className="absolute inset-x-4 bottom-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.15), transparent)" }} />
                </motion.div>
                {/* Motherboard PCB */}
                <motion.div className="absolute inset-[12%] rounded-lg"
                  animate={{ x: isHovered || isPoweredOn ? 0 : -40, y: isHovered || isPoweredOn ? 0 : -25, rotateZ: isHovered || isPoweredOn ? 0 : -8, opacity: isHovered || isPoweredOn ? 1 : 0.5 }}
                  transition={{ type: "spring", stiffness: 80, damping: 14 }}
                  style={{ background: "#0d1114", border: "1px solid rgba(255,255,255,0.04)", transform: "translateZ(-8px)" }}>
                  <div className="absolute top-[12%] left-[8%] right-[8%] h-[30%] rounded" style={{ background: "linear-gradient(180deg, #e8ecf0, #c0c4cc)" }}>
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="absolute top-1 bottom-1 w-[3px]" style={{ left: `${8 + i * 16}%`, background: "#a8acb4", borderRadius: 1 }} />)}
                  </div>
                </motion.div>
                {/* CPU Cooler */}
                <motion.div className="absolute top-[30%] left-[22%] w-14 h-14 rounded-xl flex items-center justify-center"
                  animate={{ x: isHovered || isPoweredOn ? 0 : 50, y: isHovered || isPoweredOn ? 0 : 20, rotateZ: isHovered || isPoweredOn ? 0 : 12, opacity: isHovered || isPoweredOn ? 1 : 0.45 }}
                  transition={{ type: "spring", stiffness: 70, damping: 13, delay: 0.05 }}
                  style={{ background: "linear-gradient(135deg, #f0f2f5, #d0d4d8)", border: "1.5px solid rgba(255,255,255,0.4)", transform: "translateZ(2px)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#0a1018", border: "1px solid rgba(6,182,212,0.2)" }}>
                    <span className="text-[7px] font-mono tracking-wider" style={{ color: isPoweredOn ? "#22d3ee" : "#334155", textShadow: isPoweredOn ? "0 0 6px rgba(34,211,238,0.5)" : "none" }}>{isPoweredOn ? "42C" : "--"}</span>
                  </div>
                </motion.div>
                {/* GPU Card */}
                <motion.div className="absolute bottom-[18%] left-[6%] right-[6%] h-8 rounded"
                  animate={{ x: isHovered || isPoweredOn ? 0 : -55, y: isHovered || isPoweredOn ? 0 : 30, opacity: isHovered || isPoweredOn ? 1 : 0.4 }}
                  transition={{ type: "spring", stiffness: 75, damping: 14, delay: 0.08 }}
                  style={{ background: "linear-gradient(180deg, #f4f6f8, #dce0e4)", border: "1px solid rgba(0,0,0,0.08)", transform: "translateZ(6px)" }}>
                  <div className="absolute top-2 left-3 right-3 flex gap-[3px]">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex-1 h-[2px] rounded-full" style={{ background: "#c0c4cc" }} />)}</div>
                </motion.div>
                {/* RAM Sticks */}
                {[0, 1].map((i) => (
                  <motion.div key={i} className="absolute w-[4px] h-10 rounded-sm"
                    style={{ right: `${20 + i * 12}%`, top: "32%", background: "linear-gradient(180deg, #dce0e4, #b0b4bc)", border: "1px solid rgba(0,0,0,0.06)", transform: "translateZ(1px)" }}
                    animate={{ x: isHovered || isPoweredOn ? 0 : 30 + i * 15, y: isHovered || isPoweredOn ? 0 : -15 - i * 10, opacity: isHovered || isPoweredOn ? 1 : 0.35 }}
                    transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.1 + i * 0.04 }}>
                    <div className="absolute top-1 left-0 right-0 h-[3px] rounded-sm" style={{ background: isPoweredOn ? "#22d3ee" : "#334155", boxShadow: isPoweredOn ? "0 0 6px rgba(34,211,238,0.6)" : "none", transition: "all 0.7s" }} />
                  </motion.div>
                ))}
                {/* Bottom Fans */}
                {[0, 1].map((i) => (
                  <motion.div key={`fan-${i}`} className="absolute w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ bottom: "6%", left: `${18 + i * 35}%`, background: "#161a20", border: "1px solid rgba(255,255,255,0.06)", transform: "translateZ(4px)" }}
                    animate={{ x: isHovered || isPoweredOn ? 0 : (i === 0 ? -35 : 35), y: isHovered || isPoweredOn ? 0 : 25, opacity: isHovered || isPoweredOn ? 1 : 0.3 }}
                    transition={{ type: "spring", stiffness: 85, damping: 14, delay: 0.12 + i * 0.03 }}>
                    <motion.div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#242830" }}
                      animate={{ rotate: isPoweredOn ? 360 : 0 }} transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[6px]" style={{ background: "#3a3d44" }} />
                    </motion.div>
                    <motion.div className="absolute inset-0 rounded-lg"
                      animate={{ boxShadow: isPoweredOn ? "0 0 18px rgba(6,182,212,0.5), 0 0 36px rgba(6,182,212,0.12)" : isHovered ? "0 0 8px rgba(6,182,212,0.15)" : "0 0 0 transparent" }}
                      transition={{ duration: 0.6 }} />
                  </motion.div>
                ))}
                {/* Ambient glow */}
                <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{ opacity: isPoweredOn ? 1 : 0 }} transition={{ duration: 0.7 }}
                  style={{ background: "radial-gradient(ellipse at 50% 70%, rgba(6,182,212,0.1) 0%, transparent 60%)", transform: "translateZ(-15px)" }} />
              </div>
              {/* Power Button */}
              <button onClick={triggerBoot} disabled={isPoweredOn || !isHovered} className="relative flex-shrink-0 group" aria-label="Power on system">
                <motion.div className="w-12 h-12 rounded-full flex items-center justify-center"
                  animate={{
                    borderColor: isPoweredOn ? "rgba(6,182,212,0.5)" : isHovered ? "rgba(6,182,212,0.45)" : "rgba(255,255,255,0.1)",
                    background: isPoweredOn ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.03)",
                    boxShadow: isHovered && !isPoweredOn ? "0 0 20px rgba(6,182,212,0.3)" : isPoweredOn ? "0 0 16px rgba(6,182,212,0.4)" : "0 0 0 transparent",
                    scale: isHovered && !isPoweredOn ? 1.08 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ border: "1.5px solid rgba(255,255,255,0.1)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={isPoweredOn ? "rgba(34,211,238,0.8)" : isHovered ? "rgba(6,182,212,0.7)" : "rgba(255,255,255,0.2)"}
                    strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></svg>
                </motion.div>
              </button>
              <span className="text-[9px] tracking-[0.15em] uppercase text-text-muted/30 text-center">
                {isPoweredOn ? "system live" : isHovered ? "ready" : "approach"}
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
