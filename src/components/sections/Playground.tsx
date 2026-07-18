"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence, useAnimate } from "framer-motion";
import MechanicalKeyboardIsometric from "./MechanicalKeyboardIsometric";

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

interface CmdEntry { type: "input" | "output"; lines: string[]; }

const COMMANDS: Record<string, string[]> = {
  help: ["AVAILABLE COMMANDS","","  help       Show this message","  about      About me","  skills     My tech stack","  projects   Featured projects","  contact    How to reach me","  clear      Clear the terminal"],
  about: ["ABOUT","","  Vo Hoang Lam","  AI Software Engineer  |  Dong Nai, Vietnam","","  Building AI-powered enterprise apps,","  modernizing manufacturing systems,","  and shipping full-stack solutions.","","  Specialized in RAG pipelines, LLM integration,","  and real-time industrial systems."],
  skills: ["TECH STACK","","  FRONTEND    React, Next.js, Angular, TypeScript","  BACKEND     Django, Python, .NET, PostgreSQL","  MOBILE      Flutter, Android, RFID integration","  AI/ML       LangChain, RAG, GPT, Pinecone","  TOOLS       Git, Docker, Nix, CI/CD pipelines","","  Currently exploring: Rust, WebAssembly, Edge AI"],
  projects: ["FEATURED PROJECTS","","  UEL GenAI Retrieval System","    RAG pipeline with LangChain + GPT + Pinecone","    Semantic search across 50K+ academic documents","","  WMS Modernization","    React + Flutter frontend with RFID scanning","    Real-time inventory tracking for manufacturing","","  TPM Management System","    React + Flutter + Python + Django backend","    Predictive maintenance scheduling engine","","  VNC Helper","    .NET desktop tool integrating TightVNC","    Remote machine management for factory floor"],
  contact: ["CONTACT","","  Email      liamvo0605.work@gmail.com","  GitHub     github.com/mataza060503","  LinkedIn   linkedin.com/in/lam-vo","  Location   Dong Nai, Vietnam","","  Open to freelance and full-time opportunities."],
};

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

/* ------------------------------------------------------------------ */
/*  Floating background terminal data                                  */
/* ------------------------------------------------------------------ */

const FLOATING_TERMINALS = [
  { title: "SYS.LOG", lines: ["[OK] neutrino-bridge v2.4.1","[OK] quantum-entanglement-router","[OK] dark-fiber-switch-07","[INFO] Handshake complete with NODE-ALPHA","[INFO] Handshake complete with NODE-BETA","[WARN] Thermal envelope: 62.4C (nominal)","[INFO] Packet buffer: 14.2M / 128M","[DATA] Throughput: 8.7 Tbps avg","[OK] TLS 1.4 tunnel established","[INFO] Compression ratio: 3.2:1"], pos: "top-8 left-[4%]", drift: { x: [0,15,0,-10,0], y: [0,-8,0,12,0] } },
  { title: "IDLE.term", lines: ["> scanning subnet 10.4.0.0/16","> 247 hosts discovered","> indexing node fingerprints","> fingerprint ID: 8a:3f:...","> establishing mesh topology","> route optimization: active","> latency matrix updated","> 14.2ms avg round-trip","> topology stable (delta < 2%)","> mesh health: GREEN"], pos: "top-[12%] right-[4%]", drift: { x: [0,-12,0,8,0], y: [0,6,0,-10,0] } },
  { title: "BUILD.pipe", lines: ["$ cargo build -r --target wasm","$ [1/47] compiling core v0.4.2","$ [12/47] compiling parser v2.1","$ [28/47] compiling optimizer","$ [40/47] compiling codegen","$ [45/47] compiling linker v5.0","$ [47/47] compiling runtime","$ Build complete in 2.8s","$ wasm-opt -O4 -o out.wasm","$ output: 84KB gzipped"], pos: "bottom-[16%] left-[3%]", drift: { x: [0,-8,0,14,0], y: [0,-5,0,8,0] } },
  { title: "MONITOR.dash", lines: ["CPU:  ████████░░ 82%","GPU:  █████████░ 94%","MEM:  ████░░░░░░ 38%","NET:  ██░░░░░░░░ 11%","I/O:  █████░░░░░ 47%","TEMP: ███████░░░ 68C","PWR:  ███░░░░░░░ 32W","FAN:  █████████░ 88%","UPTIME: 47d 3h 12m","HEALTH: ALL SYSTEMS NOMINAL"], pos: "bottom-[8%] right-[3%]", drift: { x: [0,10,0,-6,0], y: [0,4,0,-7,0] } },
];

/* ------------------------------------------------------------------ */
/*  Animated log line                                                  */
/* ------------------------------------------------------------------ */

function LogLine({ text, i, total }: { text: string; i: number; total: number }) {
  const hasProgress = text.includes("%") || text.includes("█");
  const percent = hasProgress ? parseInt(text.match(/(\d+)%?/)?.[1] || "0") : 0;
  return (
    <motion.div className="text-[9px] sm:text-[10px] leading-relaxed whitespace-nowrap font-mono"
      style={{ color: hasProgress ? (percent > 80 ? "#34d399" : percent > 50 ? "#f59e0b" : "#6ee7b7") : i % 3 === 0 ? "#a78bfa" : "#64748b", textShadow: hasProgress ? "0 0 6px rgba(16,185,129,0.3)" : "none", opacity: 0.7 + (i / total) * 0.3 }}>
      {hasProgress ? (
        <span className="inline-flex items-center gap-1">
          <span>{text.split(":")[0]}:</span>
          <span className="relative inline-block w-16 h-[6px] rounded-full bg-white/5 overflow-hidden">
            <motion.span className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: percent > 80 ? "linear-gradient(90deg, #10b981, #34d399)" : percent > 50 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #06b6d4, #22d3ee)", boxShadow: "0 0 6px rgba(16,185,129,0.3), 0 0 12px rgba(16,185,129,0.1)" }}
              animate={{ width: [`${Math.max(0, percent - 10)}%`, `${percent}%`, `${Math.max(0, percent - 5)}%`] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }} />
          </span>
        </span>
      ) : text}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating Terminal Window                                           */
/* ------------------------------------------------------------------ */

function FloatingTerminal({ data, delay }: { data: typeof FLOATING_TERMINALS[0]; delay: number }) {
  return (
    <motion.div className={`absolute ${data.pos} w-[200px] sm:w-[240px] pointer-events-none z-0 transform-gpu`}
      style={{ willChange: "transform, opacity" }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: [0, 1, 1, 1], scale: [0.8, 1, 1, 1], x: data.drift.x, y: data.drift.y }}
      transition={{ opacity: { duration: 0.8, delay }, scale: { duration: 0.8, delay }, x: { duration: 12 + Math.random() * 6, repeat: Infinity, ease: "easeInOut", delay }, y: { duration: 14 + Math.random() * 4, repeat: Infinity, ease: "easeInOut", delay: delay + 1 } }}>
      <div className="rounded-lg overflow-hidden" style={{ background: "rgba(5,5,18,0.85)", border: "1px solid rgba(6,182,212,0.12)", boxShadow: "0 0 24px rgba(6,182,212,0.06), 0 8px 32px rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
        <div className="h-[22px] flex items-center gap-1.5 px-2" style={{ background: "rgba(6,182,212,0.06)" }}>
          <span className="w-[6px] h-[6px] rounded-full bg-red-500/40" /><span className="w-[6px] h-[6px] rounded-full bg-yellow-500/30" /><span className="w-[6px] h-[6px] rounded-full bg-green-500/25" />
          <span className="ml-2 text-[8px] tracking-[0.1em] uppercase font-mono" style={{ color: "rgba(6,182,212,0.5)" }}>{data.title}</span>
        </div>
        <div className="p-2 space-y-[1px] overflow-hidden">
          {data.lines.map((line, i) => <LogLine key={i} text={line} i={i} total={data.lines.length} />)}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cyber Grid Background                                              */
/* ------------------------------------------------------------------ */

function CyberGrid() {
  return (
    <motion.div className="absolute inset-0 pointer-events-none overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse at 50% 50%, black 30%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 30%, transparent 70%)" }} />
      <div className="absolute bottom-[30%] left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.15), rgba(139,92,246,0.15), rgba(6,182,212,0.15), transparent)", boxShadow: "0 0 20px rgba(6,182,212,0.1), 0 0 60px rgba(139,92,246,0.05)" }} />
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div key={i} className="absolute w-[2px] h-[2px] rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${20 + Math.random() * 60}%`, background: i % 3 === 0 ? "#06b6d4" : i % 3 === 1 ? "#8b5cf6" : "#10b981", boxShadow: `0 0 4px ${i % 3 === 0 ? "rgba(6,182,212,0.6)" : i % 3 === 1 ? "rgba(139,92,246,0.5)" : "rgba(16,185,129,0.4)"}` }}
          animate={{ y: [-8, 8, -8], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3, ease: "easeInOut" }} />
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Orbital Swap Position Constants                                    */
/* ------------------------------------------------------------------ */

const SPREAD_DURATION = 0.38;
const SWAP_DURATION  = 0.82;
const SWAP_EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const MONITOR_INITIAL    = { x: -10, z: -90, scale: 0.88, opacity: 0.55, rotateY: 8 };
const MONITOR_SPREAD     = { x: -80, z: -90, scale: 0.88, opacity: 0.55, rotateY: 8 };
const MONITOR_FOREGROUND = { x: 0,   z: 30,  scale: 1.08, opacity: 1,    rotateY: 0 };

const CASE_INITIAL    = { x: 20,  z: 90,  scale: 1.05, opacity: 1,    rotateY: -16 };
const CASE_SPREAD     = { x: 100, z: 90,  scale: 1.05, opacity: 1,    rotateY: -16 };
const CASE_BACKGROUND = { x: 130, z: -70, scale: 0.6,  opacity: 0.25, rotateY: -22 };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Playground() {
  const [isBootPhase, setIsBootPhase] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);
  const [showCyberspace, setShowCyberspace] = useState(false);
  const [dissolveScene, setDissolveScene] = useState(false);
  const [history, setHistory] = useState<CmdEntry[]>([]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [bootFlash, setBootFlash] = useState(false);
  const [isCaseHovered, setIsCaseHovered] = useState(false);
  const [caseOnTop, setCaseOnTop] = useState(true);
  const [fansSpinning, setFansSpinning] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const check = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    check(mq);
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  /* on mobile, skip 3D scene and show terminal immediately */
  useEffect(() => {
    if (isMobile && !showCyberspace) {
      setIsBootPhase(true);
      setShowCyberspace(true);
      setHistory([{ type: "output", lines: ['Type "help" to get started.'] }]);
    }
  }, [isMobile, showCyberspace]);
  const activeKeyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputRef    = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const cyberTerminalRef = useRef<HTMLDivElement>(null);
  const sectionRef  = useRef<HTMLElement>(null);
  const bootTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate();

  const scrollTerminal = useCallback(() => {
    requestAnimationFrame(() => {
      const el = showCyberspace ? cyberTerminalRef.current : terminalRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [showCyberspace]);
  useEffect(() => { scrollTerminal(); }, [history, input, scrollTerminal]);

  /* ---- orbital swap + boot -> dissolve -> cyberspace ---- */
  const triggerBoot = useCallback(async () => {
    if (isBootPhase) return;
    setIsBootPhase(true); setIsBooting(true); setFansSpinning(true); setBootFlash(true);
    setTimeout(() => setBootFlash(false), 300);

    if (!reduce) {
      await Promise.all([
        animate(".monitor-3d", MONITOR_SPREAD, { duration: SPREAD_DURATION, ease: "easeInOut" }),
        animate(".case-3d", CASE_SPREAD, { duration: SPREAD_DURATION, ease: "easeInOut" }),
      ]);
      setCaseOnTop(false);
      await Promise.all([
        animate(".monitor-3d", MONITOR_FOREGROUND, { duration: SWAP_DURATION, ease: SWAP_EASE }),
        animate(".case-3d", CASE_BACKGROUND, { duration: SWAP_DURATION, ease: SWAP_EASE }),
      ]);
    } else {
      setCaseOnTop(false);
      animate(".monitor-3d", MONITOR_FOREGROUND, { duration: 0 });
      animate(".case-3d", CASE_BACKGROUND, { duration: 0 });
    }

    let cd = 0; const ts: ReturnType<typeof setTimeout>[] = [];
    BOOT_SEQUENCE.forEach(({ text, delay }) => { cd += delay; ts.push(setTimeout(() => setBootLines((p) => [...p, text]), cd)); });
    ts.push(setTimeout(() => {
      setBootDone(true); setIsBooting(false);
      setTimeout(() => {
        setDissolveScene(true);
        setTimeout(() => {
          setShowCyberspace(true);
          setHistory([{ type: "output", lines: ['Type "help" to get started.'] }]);
          requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
        }, 900);
      }, 2000);
    }, cd + 400));
    bootTimerRef.current = ts;
  }, [isBootPhase, reduce, animate]);

  useEffect(() => { return () => { bootTimerRef.current.forEach(clearTimeout); if (activeKeyTimer.current) clearTimeout(activeKeyTimer.current); }; }, []);

  /* auto-focus terminal when cyberspace appears */
  useEffect(() => {
    if (showCyberspace) {
      const t = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
        if (cyberTerminalRef.current) cyberTerminalRef.current.scrollTop = cyberTerminalRef.current.scrollHeight;
      }, 600);
      return () => clearTimeout(t);
    }
  }, [showCyberspace]);

  const processCommand = useCallback((cmd: string) => {
    const t = cmd.trim().toLowerCase(); if (!t) return;
    setHistory((p) => [...p, { type: "input", lines: [cmd] }]);
    if (t === "clear") { setHistory([]); return; }
    const o = COMMANDS[t]; setHistory((p) => [...p, { type: "output", lines: o ?? [`Unknown: "${t}". Type "help".`] }]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!input.trim()) return; processCommand(input.trim()); setCommandHistory((p) => [input.trim(), ...p]); setInput(""); setHistoryIndex(-1); setActiveKey("Enter"); if (activeKeyTimer.current) clearTimeout(activeKeyTimer.current); activeKeyTimer.current = setTimeout(() => setActiveKey(null), 250); };
  const handleKeyDown = (e: React.KeyboardEvent) => { setActiveKey(e.key); if (activeKeyTimer.current) clearTimeout(activeKeyTimer.current); activeKeyTimer.current = setTimeout(() => setActiveKey(null), 220); if (e.key === "ArrowUp") { e.preventDefault(); if (commandHistory.length > 0) { const ni = Math.min(historyIndex + 1, commandHistory.length - 1); setHistoryIndex(ni); setInput(commandHistory[ni]); } } else if (e.key === "ArrowDown") { e.preventDefault(); if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setInput(commandHistory[historyIndex - 1]); } else { setHistoryIndex(-1); setInput(""); } } else if (e.key === "Escape") { inputRef.current?.blur(); } };
  const handleScreenClick = () => { if (showCyberspace) inputRef.current?.focus({ preventScroll: true }); };

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <section id="playground" ref={sectionRef} className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-visible">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 35% 55%, rgba(6,182,212,0.07) 0%, transparent 50%), radial-gradient(ellipse at 65% 40%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 70%, rgba(236,72,153,0.04) 0%, transparent 45%)" }} />

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }} className="mb-16 text-center">
        <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase text-accent-violet-light mb-3">Interactive</span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">Terminal <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-accent-violet-light">Playground</span></h2>
      </motion.div>

      {/* ============================================================
          PHASE 0+1: 3D SCENE (monitor + case side by side)
          ============================================================ */}
      <AnimatePresence>
        {!dissolveScene && !isMobile && (
          <motion.div key="scene-3d" ref={scope}
            initial={reduce ? false : { opacity: 0, y: 40, rotateY: -8, rotateX: 4 }}
            whileInView={reduce ? {} : { opacity: 1, y: 0, rotateY: 0, rotateX: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ type: "spring", stiffness: 40, damping: 18, mass: 1.5 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            className="relative mx-auto flex items-center justify-center" style={{ perspective: 1400 }}>
            <div className="relative flex items-center justify-center" style={{ transformStyle: "preserve-3d", minHeight: 600 }}>
              {/* MONITOR */}
              <motion.div className="monitor-3d flex-shrink-0 transform-gpu" initial={MONITOR_INITIAL}
                style={{ width: "clamp(500px, 94%, 1140px)", zIndex: caseOnTop ? 10 : 30, willChange: "transform, opacity" }}>
                <div className="relative w-full rounded-xl overflow-hidden transform-gpu" style={{ background: "linear-gradient(165deg, #1e1e2e 0%, #181825 30%, #111119 100%)", boxShadow: "0 0 0 1px rgba(6,182,212,0.12), 0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(6,182,212,0.04)" }}>
                  <div className="h-[6px] bg-[#12121c] flex items-center gap-[3px] px-3">{Array.from({ length: 28 }).map((_, i) => <div key={i} className="flex-1 h-[2px] rounded-full bg-[#1a1a2a]" />)}</div>
                  <div className="relative cursor-text overflow-hidden aspect-video" style={{ background: isBootPhase ? "#070710" : "#060610" }} onClick={handleScreenClick}>
                    <AnimatePresence>{bootFlash && <motion.div className="absolute inset-0 z-30 pointer-events-none" initial={{ opacity: 1, background: "#ffffff" }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />}</AnimatePresence>
                    <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)" }} />
                    <div ref={terminalRef} className="relative z-10 h-full overflow-y-auto p-5 sm:p-6 font-mono text-[12px] sm:text-[13px] leading-relaxed" style={{ fontFamily: "var(--font-mono), 'Courier New', monospace", scrollbarWidth: "thin", scrollbarColor: "rgba(6,182,212,0.2) transparent" }}>
                      <AnimatePresence mode="wait">
                        {!isBootPhase && (
                          <motion.div key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full">
                            <div className="relative mb-4" style={{ animation: "pulseModern 3s ease-in-out infinite" }}><div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: "2px solid rgba(6,182,212,0.15)", boxShadow: "0 0 30px rgba(6,182,212,0.04)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(6,182,212,0.35)" strokeWidth="2" strokeLinecap="round"><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></svg></div></div>
                            <p className="text-[11px] tracking-[0.2em] uppercase text-text-muted/30">monitor awaiting signal</p>
                          </motion.div>
                        )}
                        {isBooting && (
                          <motion.div key="booting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
                            <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex gap-[3px]" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
                              {["#06b6d4","#22d3ee","#67e8f9","#06b6d4","#22d3ee"].map((c,i)=><motion.div key={i} className="w-1.5 rounded-full" initial={{ height:8,opacity:1 }} animate={{ height:48,opacity:[1,0.8,0] }} transition={{ duration:0.45,delay:i*0.04 }} style={{ background:c, boxShadow:`0 0 16px ${c}` }} />)}
                            </motion.div>
                            <div className="space-y-[2px] mt-12">{bootLines.map((l,i)=><motion.div key={i} initial={{ opacity:0,x:-8 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.05 }} className="text-[11px]" style={{ color:i===bootLines.length-1?"#22d3ee":"#64748b", textShadow:i===bootLines.length-1?"0 0 8px rgba(34,211,238,0.3)":"none" }}>{l}</motion.div>)}
                              {bootLines.length===BOOT_SEQUENCE.length&&!bootDone&&<span className="inline-block w-[6px] h-[13px] ml-[1px] align-middle bg-accent-emerald" style={{ boxShadow:"0 0 8px var(--color-accent-emerald)", animation:"blink 0.5s step-end infinite" }} />}
                            </div>
                          </motion.div>
                        )}
                        {bootDone && !dissolveScene && (
                          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full">
                            <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}>
                              <span className="text-[28px] font-bold tracking-wider" style={{ fontFamily:"var(--font-mono), monospace", background:"linear-gradient(135deg,#22d3ee,#8b5cf6,#10b981)", backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>&lt;HL /&gt;</span>
                            </motion.div>
                            <motion.p className="text-[10px] tracking-[0.2em] uppercase text-text-muted/40 mt-3" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>SYSTEM READY</motion.p>
                            <motion.p className="text-[9px] text-text-muted/30 mt-6" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>initializing cyberspace</motion.p>
                            <motion.div className="mt-3 w-40 h-[2px] rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background:"linear-gradient(90deg, #06b6d4, #8b5cf6)" }} initial={{ width:"0%" }} animate={{ width:"100%" }} transition={{ duration:1.6, ease:"easeInOut" }} /></motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="h-[6px] bg-[#12121c] flex items-center justify-center"><span className="w-[4px] h-[4px] rounded-full transition-all duration-700" style={{ backgroundColor: isBootPhase?"#10b981":"#334155", boxShadow: isBootPhase?"0 0 6px rgba(16,185,129,0.6)":"none" }} /></div>
                </div>
                <div className="flex flex-col items-center -mt-[1px]"><div className="w-8 h-6 rounded-b-sm" style={{ background:"linear-gradient(180deg,#1a1a24,#222230)", borderLeft:"1px solid rgba(255,255,255,0.04)", borderRight:"1px solid rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.04)" }} /><div className="w-28 h-2 rounded-b-lg" style={{ background:"#1a1a24", boxShadow:"0 8px 24px rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.04)" }} /></div>
              </motion.div>

              {/* PC CASE */}
              <motion.div className="case-3d flex-shrink-0 transform-gpu" initial={CASE_INITIAL}
                style={{ width: "clamp(140px, 22%, 220px)", zIndex: caseOnTop ? 30 : 10, willChange: "transform, opacity" }}
                onMouseEnter={() => { if (!isBootPhase) setIsCaseHovered(true); }} onMouseLeave={() => setIsCaseHovered(false)}>
                <motion.div className="relative w-full rounded-2xl transform-gpu" whileHover={!isBootPhase ? { y: -3, scale: 1.03 } : {}} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ background: "linear-gradient(175deg, #1a1a28 0%, #12121c 50%, #0d0d16 100%)", boxShadow: isCaseHovered && !isBootPhase ? "0 16px 40px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(6,182,212,0.25), 0 0 35px rgba(6,182,212,0.12)" : "0 10px 28px rgba(0,0,0,0.45), 0 0 0 1px rgba(6,182,212,0.08), 0 0 20px rgba(6,182,212,0.04)", minHeight: 260 }}>
                  <div className="h-2.5 bg-[#0a0a14] border-b border-white/[0.03] flex items-center justify-between px-2"><div className="flex gap-1.5"><div className="w-1 h-1 rounded-full bg-[#1a1a28]" /><div className="w-1 h-1 rounded-full bg-[#1a1a28]" /></div><div className="flex gap-1.5"><div className="w-1 h-1 rounded-full bg-[#1a1a28]" /><div className="w-1 h-1 rounded-full bg-[#1a1a28]" /></div></div>
                  <div className="relative mx-1.5 my-1.5 rounded-xl overflow-hidden flex-1" style={{ background: "rgba(8,8,18,0.92)", border: "1.5px solid rgba(6,182,212,0.35)", boxShadow: "inset 0 0 30px rgba(6,182,212,0.04), 0 0 12px rgba(6,182,212,0.08)", minHeight: 200 }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.04) 0%, transparent 40%, transparent 60%, rgba(139,92,246,0.03) 100%)" }} />
                    <div className="absolute pointer-events-none" style={{ top:"-30%", left:"5%", width:"30%", height:"160%", background:"linear-gradient(180deg, rgba(255,255,255,0.015) 0%, transparent 80%)", transform:"rotate(15deg)" }} />
                    <div className="absolute inset-1.5 rounded-lg" style={{ background: "#050510" }} />
                    <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-20 h-20">
                      <svg className="w-full h-full" viewBox="0 0 112 112"><defs><radialGradient id="hubGrad"><stop offset="0%" stopColor="#2a2a3a" /><stop offset="100%" stopColor="#0d0d18" /></radialGradient></defs><rect x="2" y="2" width="108" height="108" rx="14" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="3" />{[[10,10],[102,10],[10,102],[102,102]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="4" fill="#080812" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />)}<g style={{ transformOrigin:"56px 56px", animation: fansSpinning?"fanSpinHigh 0.25s linear infinite":"none", willChange:"transform" }}>{Array.from({length:9}).map((_,i)=><g key={i} transform={`rotate(${i*(360/9)} 56 56)`}><path d="M 56,28 C 62,28 70,34 72,50 C 69,52 62,46 56,42 Z" fill="#1a1a2c" stroke="rgba(6,182,212,0.25)" strokeWidth="0.5" /></g>)}</g><circle cx="56" cy="56" r="12" fill="url(#hubGrad)" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" /><motion.circle cx="56" cy="56" r="3" animate={{ fill: fansSpinning?"#22d3ee":"#333" }} transition={{ duration:0.6 }} /></svg>
                      <motion.div className="absolute inset-0 rounded-full pointer-events-none" animate={{ boxShadow: fansSpinning?"0 0 20px rgba(6,182,212,0.3), 0 0 40px rgba(6,182,212,0.1)":"0 0 0px transparent" }} transition={{ duration:0.5 }} />
                    </div>
                    {[0,1].map(i=><div key={`ram-${i}`} className="absolute w-[6px] h-12 rounded-sm" style={{ right:`${18+i*10}%`, top:"20%", background:"linear-gradient(180deg, #1a1a2e 0%, #0d0d18 100%)", border:"1px solid rgba(139,92,246,0.2)", boxShadow:"0 0 8px rgba(139,92,246,0.06)" }}><motion.div className="absolute top-0 left-0 right-0 h-[2px] rounded-sm" animate={{ background: fansSpinning?"#a78bfa":"rgba(139,92,246,0.3)", boxShadow: fansSpinning?"0 0 8px rgba(139,92,246,0.6), 0 0 16px rgba(139,92,246,0.3)":"none" }} transition={{ duration:0.7 }} /><motion.div className="absolute bottom-0 left-0 right-0 h-[1px] rounded-sm" animate={{ background: fansSpinning?"rgba(139,92,246,0.5)":"rgba(139,92,246,0.1)" }} transition={{ duration:0.7 }} /></div>)}
                    <div className="absolute bottom-[28%] left-[8%] right-[8%] h-[18px] rounded-md" style={{ background:"linear-gradient(180deg, #121222 0%, #0a0a18 100%)", border:"1px solid rgba(16,185,129,0.15)" }}><motion.div className="absolute top-0 left-0 right-0 h-[1.5px] rounded-sm" animate={{ background: fansSpinning?"#34d399":"rgba(16,185,129,0.25)", boxShadow: fansSpinning?"0 0 10px rgba(16,185,129,0.5), 0 0 20px rgba(16,185,129,0.2)":"none" }} transition={{ duration:0.7 }} /><div className="absolute top-[5px] left-3 right-3 flex gap-1">{Array.from({length:6}).map((_,i)=><div key={i} className="flex-1 h-[2px] rounded-full bg-[#1a1a2e]" />)}</div></div>
                    <div className="absolute bottom-2 left-2 right-2 h-6 rounded" style={{ background:"linear-gradient(180deg, #141422, #0a0a16)", border:"1px solid #151528" }}><div className="absolute top-2 left-2 right-2 flex gap-0.5">{Array.from({length:4}).map((_,i)=><div key={i} className="flex-1 h-[1.5px] rounded-full bg-[#1c1c30]" />)}</div></div>
                  </div>
                  <div className="h-11 bg-[#0a0a14] border-t border-white/[0.03] flex items-center justify-center gap-4">
                    <div className="flex gap-1.5 absolute left-3">{Array.from({length:4}).map((_,i)=><div key={i} className="w-[3px] h-[3px] rounded-full bg-[#1a1a28]" />)}</div>
                    <button onClick={triggerBoot} disabled={isBootPhase} className="relative group cursor-pointer z-10" aria-label="Power on">
                      {!isBootPhase && <div className="absolute rounded-full pointer-events-none" style={{ inset:"-10px", border:"2px solid rgba(236,72,153,0.55)", boxShadow:"0 0 16px rgba(236,72,153,0.45), 0 0 32px rgba(236,72,153,0.2), 0 0 48px rgba(236,72,153,0.08)", animation:"breathingPulse 2s ease-in-out infinite" }} />}
                      <motion.div className="w-8 h-8 rounded-full flex items-center justify-center relative" animate={{ borderColor: isBootPhase?"rgba(6,182,212,0.5)":"rgba(236,72,153,0.6)", background: isBootPhase?"rgba(6,182,212,0.08)":"rgba(236,72,153,0.06)", boxShadow: isBootPhase?"0 0 8px rgba(6,182,212,0.2)":"0 0 16px rgba(236,72,153,0.2), 0 0 32px rgba(236,72,153,0.08)" }} style={{ border:"1.5px solid rgba(236,72,153,0.5)" }}><motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none" animate={{ stroke: isBootPhase?"rgba(34,211,238,0.8)":isCaseHovered?"rgba(236,72,153,1)":"rgba(236,72,153,0.7)" }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: isBootPhase?"drop-shadow(0 0 3px rgba(34,211,238,0.5))":"drop-shadow(0 0 4px rgba(236,72,153,0.5))" }}><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></motion.svg></motion.div>
                    </button>
                    <div className="flex gap-1.5 absolute right-3">{Array.from({length:4}).map((_,i)=><div key={i} className="w-[3px] h-[3px] rounded-full bg-[#1a1a28]" />)}</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
          PHASE 2: CYBERSPACE ENVIRONMENT
          ============================================================ */}
      <AnimatePresence>
        {showCyberspace && (
          <motion.div key="cyberspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mx-auto px-0 sm:px-4" style={{ minHeight: isMobile ? 440 : 600, maxWidth: isMobile ? "100%" : 1024 }}>
            <CyberGrid />
            {!isMobile && FLOATING_TERMINALS.map((ft, i) => <FloatingTerminal key={ft.title} data={ft} delay={0.6 + i * 0.25} />)}

            <motion.div className="relative z-10 mx-auto transform-gpu" style={{ maxWidth: isMobile ? "100%" : 700, willChange: "transform, opacity" }}
              initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 50, damping: 18, mass: 1, delay: 0.4 }}>
              <div className="absolute -inset-8 rounded-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.05) 40%, transparent 70%)" }} />
              <div className="relative rounded-2xl overflow-hidden" style={{ background: "rgba(5,5,20,0.75)", border: "1px solid rgba(6,182,212,0.2)", boxShadow: "0 0 0 1px rgba(139,92,246,0.08), 0 0 40px rgba(6,182,212,0.08), 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }} onClick={handleScreenClick}>
                <div className="h-[32px] flex items-center gap-2 px-3" style={{ background: "rgba(6,182,212,0.04)", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <span className="w-[8px] h-[8px] rounded-full bg-red-500/50" /><span className="w-[8px] h-[8px] rounded-full bg-yellow-500/40" /><span className="w-[8px] h-[8px] rounded-full bg-green-500/35" />
                  <span className="ml-3 text-[10px] tracking-[0.15em] uppercase font-mono" style={{ color: "rgba(6,182,212,0.5)" }}>HL_SHELL v4.0</span>
                  <div className="ml-auto flex items-center gap-1.5"><motion.div className="w-[4px] h-[4px] rounded-full" animate={{ background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.6)" }} transition={{ duration:0.5 }} /><span className="text-[8px] tracking-[0.1em] uppercase font-mono text-text-muted/40">connected</span></div>
                </div>
                <div ref={cyberTerminalRef} className="overflow-y-auto p-4 sm:p-6 font-mono text-[12px] sm:text-[13px] leading-relaxed" style={{ fontFamily: "var(--font-mono), 'Courier New', monospace", scrollbarWidth: "thin", scrollbarColor: "rgba(6,182,212,0.2) transparent", height: isMobile ? 380 : 420 }}>
                  {history.map((entry, i) => (
                    <div key={i} className="mb-3">
                      {entry.type === "input" ? (
                        <div className="flex items-center gap-2"><span className="text-cyan-400 font-semibold text-[12px] shrink-0">hl</span><span className="text-accent-emerald text-[12px] shrink-0">~</span><span className="text-text-primary">{entry.lines[0]}</span></div>
                      ) : (
                        <div className="relative pl-3 border-l-2 border-cyan-400/20 ml-1">{entry.lines.map((line, li) => { const isH = li === 0 && line === line.toUpperCase() && line.length > 3 && !line.startsWith(" "); return isH ? <div key={li} className="text-accent-violet-light font-semibold text-[11px] tracking-wider mb-1">{line}</div> : line === "" ? <div key={li} className="h-2" /> : <div key={li} className="text-[12px] whitespace-pre-wrap" style={{ color:"#a3b8a8" }}>{line}</div>; })}</div>
                      )}
                    </div>
                  ))}
                  <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
                    <span className="text-cyan-400 font-semibold text-[12px] shrink-0">hl</span><span className="text-accent-emerald text-[12px] shrink-0">~</span>
                    <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent border-none outline-none font-mono text-[12px] sm:text-[13px] placeholder:text-white/5" style={{ color:"#e2e8f0", caretColor:"var(--color-accent-emerald)" }} placeholder="Type a command..." spellCheck={false} autoComplete="off" />
                  </form>
                </div>
              </div>
              {!isMobile && (
              <motion.div className="mt-2 flex justify-center transform-gpu" style={{ willChange: "transform, opacity" }} initial={{ y:60,opacity:0,rotateX:90 }} animate={{ y:0,opacity:1,rotateX:0 }} transition={{ type:"spring", stiffness:45, damping:16, mass:1.3, delay:0.8 }}>
                <MechanicalKeyboardIsometric activeKey={activeKey} show={showCyberspace} />
              </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCyberspace && <motion.p className="mt-8 text-center text-xs text-text-muted" style={{ fontFamily:"var(--font-mono), monospace" }} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}>Try: help · about · skills · projects · contact · clear</motion.p>}

      <style>{`
        @keyframes pulseModern { 0%,100%{opacity:0.35} 50%{opacity:0.85} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fanSpinHigh { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes breathingPulse { 0%,100%{box-shadow:0 0 12px rgba(236,72,153,0.35),0 0 24px rgba(236,72,153,0.15),0 0 40px rgba(236,72,153,0.04);border-color:rgba(236,72,153,0.45);transform:scale(0.95)} 50%{box-shadow:0 0 22px rgba(236,72,153,0.65),0 0 44px rgba(236,72,153,0.3),0 0 64px rgba(236,72,153,0.12);border-color:rgba(236,72,153,0.9);transform:scale(1.08)} }
      `}</style>
    </section>
  );
}
