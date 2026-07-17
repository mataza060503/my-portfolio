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

      <div ref={containerRef} className="mx-auto max-w-[900px]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="inline-block text-[10px] font-semibold tracking-[0.2em] uppercase text-accent-violet-light mb-3">Interactive</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">Terminal <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-violet-light to-accent-emerald-light">Playground</span></h2>
        </motion.div>

        <motion.div initial={reduce ? false : { opacity: 0, y: 30 }} whileInView={reduce ? {} : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}>
          
          {/* ============================================
              SIDE-BY-SIDE — swap prominence on boot
              ============================================ */}
          <div className="flex items-end justify-center gap-0" style={{ perspective: 1400 }}>

            {/* ── MONITOR (left, becomes prominent when on) ── */}
            <motion.div className="relative flex-shrink-0"
              style={{ width: "72%", maxWidth: 640, zIndex: isPoweredOn ? 20 : 5 }}
              animate={{
                x: isPoweredOn ? 0 : -30,
                scale: isPoweredOn ? 1 : 0.84,
                opacity: isPoweredOn ? 1 : 0.4,
                filter: isPoweredOn ? "blur(0px)" : "blur(1.5px)",
                rotateY: isPoweredOn ? 0 : 6,
              }}
              transition={{ type: "spring", stiffness: 38, damping: 19, mass: 1.15 }}>
              <div className="w-full rounded-xl overflow-hidden"
                style={{ background: "#16161e", boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.6)" }}>
                <div className="h-[6px] bg-[#1a1a24]" />
                <div className="relative cursor-text overflow-hidden" style={{ background: isPoweredOn ? "#0a0a10" : "#06060c", height: 420 }} onClick={handleScreenClick}>
                  <AnimatePresence>{bootFlash && <motion.div className="absolute inset-0 z-30 pointer-events-none" initial={{ opacity: 1, background: "#ffffff" }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />}</AnimatePresence>
                  <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.4) 100%)" }} />
                  <AnimatePresence>
                    {surpriseActive && (
                      <div className="absolute inset-0 z-25 pointer-events-none">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <motion.div key={i} className="absolute w-[3px] h-[3px] rounded-full"
                            style={{ left: "50%", top: "50%", background: ["#22d3ee","#8b5cf6","#10b981","#f59e0b","#ec4899"][i%5], boxShadow: `0 0 6px ${["#22d3ee","#8b5cf6","#10b981","#f59e0b","#ec4899"][i%5]}` }}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: (Math.random()-0.5)*300, y: (Math.random()-0.5)*200, opacity: 0, scale: 0 }} transition={{ duration: 1+Math.random()*1.5, ease: "easeOut" }} />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                  <div ref={terminalRef} className="relative z-10 h-full overflow-y-auto p-5 sm:p-6 font-mono text-[12px] sm:text-[13px] leading-relaxed"
                    style={{ fontFamily: "var(--font-mono), 'Courier New', monospace", scrollbarWidth: "thin", scrollbarColor: "rgba(139,92,246,0.2) transparent" }}>
                    <AnimatePresence mode="wait">
                      {!isPoweredOn && !isBooting && (
                        <motion.div key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full">
                          <div className="relative mb-4" style={{ animation: "pulseModern 3s ease-in-out infinite" }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: "2px solid rgba(139,92,246,0.2)", boxShadow: "0 0 30px rgba(139,92,246,0.05)" }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></svg>
                            </div>
                          </div>
                          <p className="text-[11px] tracking-[0.2em] uppercase text-text-muted/25">Click the tower to boot</p>
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
                <div className="w-8 h-6 rounded-b-sm" style={{ background:"linear-gradient(180deg,#1a1a24,#222230)",borderLeft:"1px solid rgba(255,255,255,0.04)",borderRight:"1px solid rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.04)" }} />
                <div className="w-28 h-2 rounded-b-lg" style={{ background:"#1a1a24",boxShadow:"0 8px 24px rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.04)" }} />
              </div>
            </motion.div>

            {/* ── PC CASE (right, prominent when off, retreats when on) ── */}
            <motion.div className="flex-shrink-0"
              style={{ width: "24%", minWidth: 170, maxWidth: 240, zIndex: isPoweredOn ? 3 : 20 }}
              onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
              animate={{
                x: isPoweredOn ? 50 : 0,
                scale: isPoweredOn ? 0.65 : 1,
                opacity: isPoweredOn ? 0.12 : 1,
                rotateY: isPoweredOn ? -18 : 0,
              }}
              transition={{ type: "spring", stiffness: 38, damping: 19, mass: 1.1 }}>
              <motion.div className="relative w-full rounded-2xl overflow-hidden transform-gpu"
                whileHover={!isPoweredOn ? { y: -3, scale: 1.03 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  background: "linear-gradient(180deg, #1a1a24 0%, #14141c 100%)",
                  boxShadow: isHovered && !isPoweredOn ? "0 16px 40px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.08),0 0 25px rgba(6,182,212,0.1)" : "0 10px 28px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.04)",
                  minHeight: 250,
                }}>
                <div className="h-2.5 bg-[#0d0d14] border-b border-white/[0.03] flex items-center justify-end gap-1 px-2">
                  <div className="w-1 h-1 rounded-full bg-[#1a1a28]" /><div className="w-1 h-1 rounded-full bg-[#1a1a28]" />
                </div>
                <div className="relative mx-1.5 my-1.5 rounded-xl overflow-hidden flex-1"
                  style={{ background: "rgba(10,10,18,0.9)", border: "1px solid rgba(255,255,255,0.06)", minHeight: 190 }}>
                  <div className="absolute inset-1.5 rounded-lg" style={{ background: "#0a0a12" }} />
                  <div className="absolute inset-2 rounded" style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.03)" }} />
                  <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-20 h-20">
                    <svg className="w-full h-full" viewBox="0 0 112 112">
                      <defs><radialGradient id="hG"><stop offset="0%" stopColor="#2a2a38" /><stop offset="100%" stopColor="#111" /></radialGradient></defs>
                      <rect x="2" y="2" width="108" height="108" rx="14" fill="none" stroke="#1a1a28" strokeWidth="3" />
                      {[[10,10],[102,10],[10,102],[102,102]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="4" fill="#0d0d16" stroke="#1a1a28" strokeWidth="1" />)}
                      <motion.circle cx="56" cy="56" r="38" fill="none" strokeWidth="2" animate={{ opacity:isPoweredOn?1:0, stroke:isPoweredOn?"rgba(6,182,212,0.4)":"transparent" }} transition={{ duration:0.8 }} />
                      <g style={{ transformOrigin:"56px 56px", animation:isPoweredOn?"fanSpin 0.3s linear infinite":"none" }}>
                        {Array.from({length:9}).map((_,i)=><g key={i} transform={`rotate(${i*(360/9)} 56 56)`}><path d="M 56,28 C 62,28 70,34 72,50 C 69,52 62,46 56,42 Z" fill="#1e1e2c" stroke="#252534" strokeWidth="0.5" /></g>)}
                      </g>
                      <circle cx="56" cy="56" r="10" fill="url(#hG)" stroke="#1a1a28" strokeWidth="1.5" />
                      <motion.circle cx="56" cy="56" r="3" animate={{ fill:isPoweredOn?"#22d3ee":"#333" }} transition={{ duration:0.6 }} />
                    </svg>
                  </div>
                  {[0,1].map(i=><div key={i} className="absolute w-1 h-7 rounded-sm" style={{ right:`${16+i*8}%`,top:"22%",background:"linear-gradient(180deg,#222,#111)",border:"1px solid #1a1a28" }}>
                    <motion.div className="absolute top-0 left-0 right-0 h-[2px] rounded-sm" animate={{ background:isPoweredOn?"#22d3ee":"#1a1a28",boxShadow:isPoweredOn?"0 0 5px rgba(34,211,238,0.5)":"none" }} transition={{ duration:0.7 }} />
                  </div>)}
                  <div className="absolute bottom-3 left-2 right-2 h-5 rounded" style={{ background:"linear-gradient(180deg,#1a1a28,#111118)",border:"1px solid #1a1a28" }}>
                    <div className="absolute top-1.5 left-2 right-2 flex gap-0.5">{Array.from({length:3}).map((_,i)=><div key={i} className="flex-1 h-[1.5px] rounded-full bg-[#222230]" />)}</div>
                  </div>
                </div>
                <div className="h-8 bg-[#0d0d14] border-t border-white/[0.03] flex items-center justify-center">
                  <button onClick={triggerBoot} disabled={isPoweredOn} className="relative group" aria-label="Power on">
                    <motion.div className="w-6 h-6 rounded-full flex items-center justify-center"
                      animate={{ borderColor:isPoweredOn?"rgba(6,182,212,0.5)":"rgba(255,255,255,0.12)", background:isPoweredOn?"rgba(6,182,212,0.1)":"rgba(255,255,255,0.02)" }}
                      style={{ border:"1.5px solid rgba(255,255,255,0.1)" }}>
                      <motion.div className="w-1.5 h-1.5 rounded-full" animate={{ background:isPoweredOn?"#22d3ee":"rgba(255,255,255,0.2)", boxShadow:isPoweredOn?"0 0 8px rgba(34,211,238,0.8)":"none" }} />
                    </motion.div>
                    {!isPoweredOn && <div className="absolute inset-0 rounded-full pointer-events-none" style={{ animation:"pulseRing 2.5s ease-in-out infinite",boxShadow:"0 0 0 0 rgba(6,182,212,0.25)" }} />}
                  </button>
                </div>
              </motion.div>
              <p className="text-center text-[8px] tracking-[0.12em] uppercase text-text-muted/25 mt-1.5">
                {isPoweredOn ? "online" : isHovered ? "boot" : "atx"}
              </p>
            </motion.div>
          </div>

          {/* Grand Surprise */}
          <AnimatePresence>
            {surpriseActive && (
              <motion.div className="mt-4 flex justify-center" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <motion.div className="px-5 py-2.5 rounded-2xl" initial={{ y:30,opacity:0,scale:0.8 }} animate={{ y:0,opacity:1,scale:1 }} transition={{ type:"spring",stiffness:120,damping:14,delay:0.15 }}
                  style={{ background:"rgba(10,10,20,0.7)",border:"1px solid rgba(255,255,255,0.08)",backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(139,92,246,0.1)" }}>
                  <span className="text-[16px] font-bold tracking-wider" style={{ fontFamily:"var(--font-mono), monospace",background:"linear-gradient(135deg,#22d3ee,#8b5cf6,#10b981)",backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>&lt;HL /&gt;</span>
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
        @keyframes fanSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}</style>
    </section>
  );
}
