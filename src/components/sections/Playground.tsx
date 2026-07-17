"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

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

interface Ripple { id: number; x: number; y: number; color: string; }

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
  const [surpriseActive, setSurpriseActive] = useState(false);
  const rippleIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bootTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = useReducedMotion();

  const scrollTerminal = useCallback(() => {
    const el = terminalRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);
  useEffect(() => { scrollTerminal(); }, [history, bootLines, scrollTerminal]);

  const triggerBoot = useCallback(() => {
    if (isBooting || isPoweredOn) return;
    setIsBooting(true); setBootFlash(true);
    setTimeout(() => setBootFlash(false), 300);
    let cd = 0; const ts: ReturnType<typeof setTimeout>[] = [];
    BOOT_SEQUENCE.forEach(({ text, delay }) => { cd += delay; ts.push(setTimeout(() => setBootLines((p) => [...p, text]), cd)); });
    ts.push(setTimeout(() => {
      setBootDone(true); setIsBooting(false);
      setTimeout(() => {
        setIsPoweredOn(true); setSurpriseActive(true);
        setTimeout(() => setSurpriseActive(false), 3000);
        setHistory([{ type: "output", lines: ['Type "help" to get started.'] }]);
        requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
      }, 350);
    }, cd + 400));
    bootTimerRef.current = ts;
  }, [isBooting, isPoweredOn]);
  useEffect(() => { return () => bootTimerRef.current.forEach(clearTimeout); }, []);

  const processCommand = useCallback((cmd: string) => {
    const t = cmd.trim().toLowerCase(); if (!t) return;
    setHistory((p) => [...p, { type: "input", lines: [cmd] }]);
    if (t === "clear") { setHistory([]); return; }
    const o = COMMANDS[t]; setHistory((p) => [...p, { type: "output", lines: o ?? [`Unknown: "${t}". Type "help".`] }]);
  }, []);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!input.trim()) return; processCommand(input.trim()); setCommandHistory((p) => [input.trim(), ...p]); setInput(""); setHistoryIndex(-1); };
  const emitRipple = useCallback(() => {
    if (reduce) return; const id = rippleIdRef.current++; const cs = ["#8b5cf6","#10b981","#a78bfa","#34d399"];
    setRipples((p) => [...p.slice(-6), { id, x: 20+Math.random()*60, y: 30+Math.random()*40, color: cs[Math.floor(Math.random()*4)] }]);
    setTimeout(() => setRipples((p) => p.filter(r => r.id !== id)), 800);
  }, [reduce]);
  const handleKeyDown = (e: React.KeyboardEvent) => { emitRipple();
    if (e.key === "ArrowUp") { e.preventDefault(); if (commandHistory.length > 0) { const ni = Math.min(historyIndex+1, commandHistory.length-1); setHistoryIndex(ni); setInput(commandHistory[ni]); } }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (historyIndex > 0) { setHistoryIndex(historyIndex-1); setInput(commandHistory[historyIndex-1]); } else { setHistoryIndex(-1); setInput(""); } }
    else if (e.key === "Escape") inputRef.current?.blur();
  };
  const handleScreenClick = () => { if (isPoweredOn) inputRef.current?.focus({ preventScroll: true }); };

  return (
    <section id="playground" ref={sectionRef} className="relative py-24 sm:py-32 px-6 overflow-visible">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.06) 0%, transparent 55%), radial-gradient(ellipse at 60% 40%, rgba(16,185,129,0.05) 0%, transparent 55%)" }} />

      <div ref={containerRef} className="mx-auto max-w-[960px]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase text-accent-violet-light mb-3">Interactive</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">Terminal <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-violet-light to-accent-emerald-light">Playground</span></h2>
        </motion.div>

        <motion.div initial={reduce ? false : { opacity: 0, y: 30 }} whileInView={reduce ? {} : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}>
          <div className="flex flex-col lg:flex-row items-end gap-6 lg:gap-10 relative">

            {/* ===================================== MONITOR ===================================== */}
            <div className="flex-1 flex flex-col items-center w-full">
              <div className="w-full max-w-[640px] rounded-xl overflow-hidden"
                style={{ background: "#16161e", boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.6), 0 0 80px rgba(139,92,246,0.04)" }}>
                <div className="h-[6px] bg-[#1a1a24]" />
                <div className="relative cursor-text overflow-hidden" style={{ background: isPoweredOn ? "#0a0a10" : "#06060c", height: 420 }} onClick={handleScreenClick}>
                  <AnimatePresence>{bootFlash && <motion.div className="absolute inset-0 z-30 pointer-events-none" initial={{ opacity: 1, background: "#ffffff" }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />}</AnimatePresence>
                  <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.4) 100%)" }} />
                  <AnimatePresence>
                    {surpriseActive && (
                      <div className="absolute inset-0 z-25 pointer-events-none">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <motion.div key={i} className="absolute w-[3px] h-[3px] rounded-full"
                            style={{ left: "50%", top: "50%", background: ["#22d3ee","#8b5cf6","#10b981","#f59e0b","#ec4899","#a78bfa"][i%6], boxShadow: `0 0 6px ${["#22d3ee","#8b5cf6","#10b981","#f59e0b","#ec4899","#a78bfa"][i%6]}` }}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: (Math.random()-0.5)*350, y: (Math.random()-0.5)*220, opacity: 0, scale: 0 }} transition={{ duration: 1+Math.random()*1.5, ease: "easeOut" }} />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                  <div ref={terminalRef} className="relative z-10 h-full overflow-y-auto p-5 sm:p-6 font-mono text-[12px] sm:text-[13px] leading-relaxed"
                    style={{ fontFamily: "var(--font-mono), 'Courier New', monospace", scrollbarWidth: "thin", scrollbarColor: "rgba(139,92,246,0.2) transparent" }}>
                    <AnimatePresence mode="wait">
                      {!isPoweredOn && !isBooting && (
                        <motion.div key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full">
                          <div className="relative mb-8" style={{ animation: "pulseModern 3s ease-in-out infinite" }}>
                            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ border: "2px solid rgba(139,92,246,0.25)", boxShadow: "0 0 40px rgba(139,92,246,0.08)" }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.45)" strokeWidth="2" strokeLinecap="round"><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></svg>
                            </div>
                          </div>
                          <p className="text-[12px] tracking-[0.25em] uppercase text-text-muted/40">System Offline</p>
                          <p className="text-[10px] tracking-widest text-text-muted/20 mt-10">Press the power button on the tower</p>
                        </motion.div>
                      )}
                      {isBooting && !isPoweredOn && (
                        <motion.div key="booting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
                          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex gap-[3px]" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
                            {["#06b6d4","#22d3ee","#67e8f9","#06b6d4","#22d3ee"].map((c,i) => <motion.div key={i} className="w-1.5 rounded-full" initial={{ height: 8, opacity: 1 }} animate={{ height: 48, opacity: [1,0.8,0] }} transition={{ duration: 0.45, delay: i*0.04 }} style={{ background: c, boxShadow: `0 0 16px ${c}` }} />)}
                          </motion.div>
                          <div className="space-y-[2px] mt-12">
                            {bootLines.map((l,i) => <motion.div key={i} initial={{ opacity:0,x:-8 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.05 }} className="text-[11px]" style={{ color: i===bootLines.length-1?"#22d3ee":"#64748b", textShadow: i===bootLines.length-1?"0 0 8px rgba(34,211,238,0.3)":"none" }}>{l}</motion.div>)}
                            {bootLines.length===BOOT_SEQUENCE.length&&!bootDone&&<span className="inline-block w-[6px] h-[13px] ml-[1px] align-middle bg-accent-emerald" style={{ boxShadow:"0 0 8px var(--color-accent-emerald)", animation:"blink 0.5s step-end infinite" }} />}
                          </div>
                        </motion.div>
                      )}
                      {isPoweredOn && (
                        <motion.div key="on" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          {history.map((entry,i) => (
                            <div key={i} className="mb-3">
                              {entry.type==="input" ? (
                                <div className="flex items-center gap-2"><span className="text-accent-violet-light font-semibold text-[12px] shrink-0">hl</span><span className="text-accent-emerald text-[12px] shrink-0">~</span><span className="text-text-primary">{entry.lines[0]}</span></div>
                              ) : (
                                <div className="relative pl-3 border-l-2 border-accent-emerald/20 ml-1">
                                  {entry.lines.map((line,li) => { const isH = li===0&&line===line.toUpperCase()&&line.length>3&&!line.startsWith(" "); return isH ? <div key={li} className="text-accent-violet-light font-semibold text-[11px] tracking-wider mb-1">{line}</div> : line==="" ? <div key={li} className="h-2" /> : <div key={li} className="text-[12px] whitespace-pre-wrap" style={{ color:"#a3b8a8" }}>{line}</div>; })}
                                </div>
                              )}
                            </div>
                          ))}
                          <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
                            <span className="text-accent-violet-light font-semibold text-[12px] shrink-0">hl</span><span className="text-accent-emerald text-[12px] shrink-0">~</span>
                            <input ref={inputRef} type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent border-none outline-none font-mono text-[12px] sm:text-[13px] placeholder:text-white/5" style={{ color:"#e2e8f0", caretColor:"var(--color-accent-emerald)" }} placeholder="Type a command..." spellCheck={false} autoComplete="off" />
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {ripples.map(r=><div key={r.id} className="absolute pointer-events-none" style={{ left:`${r.x}%`,top:`${r.y}%`,width:6,height:6,borderRadius:"50%",background:r.color,boxShadow:`0 0 12px ${r.color},0 0 24px ${r.color}44`,animation:"rippleOut 0.8s ease-out forwards",transform:"translate(-50%,-50%)" }} />)}
                </div>
                <div className="h-[6px] bg-[#1a1a24] flex items-center justify-center">
                  <span className="w-[4px] h-[4px] rounded-full transition-all duration-700" style={{ backgroundColor: isPoweredOn?"#10b981":"#334155", boxShadow: isPoweredOn?"0 0 6px rgba(16,185,129,0.6)":"none" }} />
                </div>
              </div>
              <div className="flex flex-col items-center -mt-[1px]">
                <div className="w-10 h-8 rounded-b-sm" style={{ background:"linear-gradient(180deg,#1a1a24,#222230)",borderLeft:"1px solid rgba(255,255,255,0.04)",borderRight:"1px solid rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.04)" }} />
                <div className="w-40 h-2.5 rounded-b-lg" style={{ background:"#1a1a24",boxShadow:"0 8px 24px rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.04)" }} />
              </div>
            </div>

            {/* ===================================== PREMIUM ATX TOWER ===================================== */}
            <div className="w-full lg:w-[260px] flex-shrink-0 flex lg:flex-col items-center gap-4 relative"
              onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>

              {/* Power Cable SVG with stroke-dashoffset surge animation */}
              <svg className="hidden lg:block absolute -left-10 top-[20%] w-12 h-[3px] pointer-events-none z-10" style={{ overflow:"visible" }}>
                <line x1="0" y1="0" x2="44" y2="0" stroke={isPoweredOn?"#22d3ee":"#334155"} strokeWidth="3" strokeLinecap="round"
                  style={{ filter: isPoweredOn?"drop-shadow(0 0 8px rgba(34,211,238,0.7))":"none", transition:"stroke 0.7s" }} />
                {/* Surge line */}
                <line x1="0" y1="0" x2="44" y2="0" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" opacity="0"
                  strokeDasharray="44" strokeDashoffset="44"
                  style={{ filter: "drop-shadow(0 0 12px rgba(34,211,238,0.9))", animation: isBooting?"cableSurge 1.5s ease-in-out forwards":"none" }} />
                <circle cx="0" cy="0" r="4" fill={isPoweredOn?"#22d3ee":"#64748b"} style={{ transition:"fill 0.7s" }} />
                <circle cx="44" cy="0" r="4" fill={isPoweredOn?"#22d3ee":"#64748b"} style={{ transition:"fill 0.7s" }} />
              </svg>

              {/* Tower Case */}
              <motion.div className="relative w-full rounded-2xl overflow-hidden transform-gpu"
                whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  background: "linear-gradient(180deg, #1a1a24 0%, #14141c 100%)",
                  boxShadow: isPoweredOn ? "0 16px 48px rgba(0,0,0,0.5),0 0 0 1px rgba(6,182,212,0.15),0 0 40px rgba(6,182,212,0.08)" : isHovered ? "0 16px 40px rgba(0,0,0,0.45),0 0 0 1px rgba(255,255,255,0.08)" : "0 12px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.04)",
                  minHeight: 340,
                }}>
                {/* Top I/O */}
                <div className="h-3 bg-[#0d0d14] border-b border-white/[0.03] flex items-center justify-end gap-1 px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a28]" /><div className="w-1.5 h-1.5 rounded-full bg-[#1a1a28]" />
                </div>

                {/* Glass side panel */}
                <div className="relative mx-2 my-2 rounded-xl overflow-hidden flex-1"
                  style={{ background: "rgba(10,10,18,0.9)", border: "1px solid rgba(255,255,255,0.06)", minHeight: 260 }}>

                  {/* Internal chamber background */}
                  <div className="absolute inset-2 rounded-lg" style={{ background: "#0a0a12" }} />

                  {/* Motherboard tray */}
                  <div className="absolute inset-3 rounded" style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.03)" }}>
                    <div className="absolute top-3 left-3 right-3 h-[2px] bg-[#1a1a28]" />
                    <div className="absolute top-6 left-3 w-16 h-1 bg-[#1a1a28] rounded-full" />
                    <div className="absolute top-6 right-6 w-8 h-1 bg-[#1a1a28] rounded-full" />
                  </div>

                  {/* ── CPU COOLING FAN (programmatic blades) ── */}
                  <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-24 h-24 flex items-center justify-center">
                    {/* Fan frame */}
                    <div className="absolute inset-0 rounded-full" style={{ border: "2px solid #1a1a28", background: "#0d0d16" }} />
                    {/* RGB ring */}
                    <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                      animate={{ opacity: isPoweredOn ? 1 : 0 }} transition={{ duration: 0.8 }}
                      style={{ background: "conic-gradient(from 0deg, transparent, rgba(6,182,212,0.15) 40deg, rgba(6,182,212,0.3) 80deg, rgba(34,211,238,0.15) 160deg, transparent 200deg, rgba(139,92,246,0.1) 280deg, transparent 320deg)", boxShadow: isPoweredOn ? "0 0 20px rgba(6,182,212,0.3), 0 0 40px rgba(6,182,212,0.1)" : "none" }} />
                    {/* Fan hub */}
                    <motion.div className="absolute w-6 h-6 rounded-full z-10 flex items-center justify-center"
                      style={{ background: "radial-gradient(circle, #1a1a28, #0d0d18)", border: "1px solid #222" }}
                      animate={{ boxShadow: isPoweredOn ? "0 0 12px rgba(6,182,212,0.5)" : "none" }} transition={{ duration: 0.6 }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: isPoweredOn ? "#22d3ee" : "#333", transition: "background 0.6s" }} />
                    </motion.div>
                    {/* 7 Fan Blades */}
                    <motion.div className="absolute inset-0"
                      animate={{ rotate: isPoweredOn ? 360 : 0 }}
                      transition={isPoweredOn ? { rotate: { duration: 0.3, repeat: Infinity, ease: "linear" } } : { duration: 0 }}>
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-[8px] origin-bottom"
                          style={{
                            height: "55%",
                            transform: `rotate(${i * (360/7)}deg)`,
                            transformOrigin: "50% 100%",
                          }}>
                          <motion.div className="absolute bottom-0 left-0 right-0 rounded-full"
                            style={{ top: "-40%", background: "linear-gradient(180deg, #2a2a38, #1a1a28)" }}
                            animate={{ filter: isPoweredOn ? "blur(1.5px)" : "blur(0px)" }} transition={{ duration: 0.8 }} />
                        </div>
                      ))}
                    </motion.div>
                    {/* Glass reflection */}
                    <div className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ background: "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.03) 0%, transparent 60%)" }} />
                  </div>

                  {/* RAM sticks */}
                  {[0,1].map(i => <div key={i} className="absolute w-1.5 h-10 rounded-sm" style={{ right: `${16+i*9}%`, top: "26%", background: `linear-gradient(180deg, #222, #111)`, border: "1px solid #1a1a28" }}>
                    <motion.div className="absolute top-0 left-0 right-0 h-[3px] rounded-sm"
                      animate={{ background: isPoweredOn ? "#22d3ee" : "#1a1a28", boxShadow: isPoweredOn ? "0 0 6px rgba(34,211,238,0.5)" : "none" }} transition={{ duration: 0.7 }} />
                  </div>)}

                  {/* GPU */}
                  <div className="absolute bottom-4 left-3 right-3 h-7 rounded" style={{ background: "linear-gradient(180deg, #1a1a28, #111118)", border: "1px solid #1a1a28" }}>
                    <div className="absolute top-2 left-3 right-3 flex gap-1">{Array.from({length:4}).map((_,i)=><div key={i} className="flex-1 h-[2px] rounded-full bg-[#222230]" />)}</div>
                  </div>
                </div>

                {/* Bottom panel with Power Button */}
                <div className="h-10 bg-[#0d0d14] border-t border-white/[0.03] flex items-center justify-center gap-3">
                  <button onClick={triggerBoot} disabled={isPoweredOn} className="relative group" aria-label="Power on">
                    <motion.div className="w-8 h-8 rounded-full flex items-center justify-center"
                      animate={{ borderColor: isPoweredOn ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.12)", background: isPoweredOn ? "rgba(6,182,212,0.1)" : "rgba(255,255,255,0.02)" }}
                      style={{ border: "1.5px solid rgba(255,255,255,0.1)" }}>
                      <motion.div className="w-2 h-2 rounded-full"
                        animate={{ background: isPoweredOn ? "#22d3ee" : "rgba(255,255,255,0.25)", boxShadow: isPoweredOn ? "0 0 10px rgba(34,211,238,0.8)" : "none" }} />
                    </motion.div>
                    {!isPoweredOn && <div className="absolute inset-0 rounded-full pointer-events-none" style={{ animation: "pulseRing 2.5s ease-in-out infinite", boxShadow: "0 0 0 0 rgba(6,182,212,0.25)" }} />}
                  </button>
                  {/* Front USB ports */}
                  <div className="w-6 h-2 rounded-sm bg-[#1a1a28] border border-[#222]" />
                  <div className="w-6 h-2 rounded-sm bg-[#1a1a28] border border-[#222]" />
                </div>
              </motion.div>

              <span className="text-[9px] tracking-[0.15em] uppercase text-text-muted/30 text-center">
                {isPoweredOn ? "HL-ATX online" : isHovered ? "click to boot" : "atx tower"}
              </span>
            </div>
          </div>

          {/* ── Grand Surprise: Holographic Grid + Glassmorphism Badge ── */}
          <AnimatePresence>
            {surpriseActive && (
              <motion.div className="relative mt-6 flex justify-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                {/* Holographic grid splash */}
                <motion.div className="absolute inset-x-0 -top-4 h-20 pointer-events-none overflow-hidden"
                  initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: [0, 1, 0.6, 0], scaleY: [0, 1, 1, 0] }}
                  transition={{ duration: 2.5, ease: "easeOut" }}>
                  <div className="w-full h-full"
                    style={{
                      backgroundImage: "repeating-linear-gradient(0deg, rgba(6,182,212,0.08) 0px, rgba(6,182,212,0.08) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, rgba(139,92,246,0.06) 0px, rgba(139,92,246,0.06) 1px, transparent 1px, transparent 8px)",
                      maskImage: "radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)",
                    }} />
                </motion.div>
                {/* Glassmorphism badge */}
                <motion.div className="relative px-6 py-3 rounded-2xl"
                  initial={{ y: 40, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.15 }}
                  style={{
                    background: "rgba(10,10,20,0.7)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.1)",
                  }}>
                  <span className="text-[16px] font-bold tracking-wider"
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      background: "linear-gradient(135deg, #22d3ee, #8b5cf6, #10b981)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>&lt;HL /&gt;</span>
                  <span className="block text-[9px] tracking-[0.2em] uppercase text-text-muted/50 mt-1">SYSTEM READY</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-xs text-text-muted" style={{ fontFamily:"var(--font-mono), monospace" }}>Try: help · about · skills · projects · contact · clear</p>
        </motion.div>
      </div>

      <style>{`
        @keyframes pulseModern { 0%,100%{opacity:0.35} 50%{opacity:0.85} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes rippleOut { 0%{transform:translate(-50%,-50%) scale(1);opacity:0.9} 100%{transform:translate(-50%,-50%) scale(30);opacity:0} }
        @keyframes pulseRing { 0%{box-shadow:0 0 0 0 rgba(6,182,212,0.25)} 70%{box-shadow:0 0 0 10px rgba(6,182,212,0)} 100%{box-shadow:0 0 0 0 rgba(6,182,212,0)} }
        @keyframes cableSurge { 0%{stroke-dashoffset:44;opacity:0} 20%{opacity:1} 100%{stroke-dashoffset:0;opacity:0} }
    `}</style>
    </section>
  );
}
