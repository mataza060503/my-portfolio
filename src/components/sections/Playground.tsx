"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";

/* ============================================
   Dynamic import — R3F runs client-only
   ============================================ */
const TechArchaeologistLab = dynamic(
  () => import("@/components/TechArchaeologistLab"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full flex items-center justify-center bg-[#100e0c]"
        style={{ minHeight: "70vh" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400/50 border-t-amber-400 animate-spin" />
          <span className="text-sm text-amber-300/80 font-mono tracking-wide">
            INITIALIZING DATA DIG...
          </span>
        </div>
      </div>
    ),
  },
);

/* ============================================
   WebGL fallback — flat terminal
   ============================================ */
function FlatFallback() {
  return (
    <div className="w-full bg-[#0d1117] flex flex-col" style={{ minHeight: "70vh" }}>
      <div className="flex-1 font-mono p-8 max-w-4xl mx-auto w-full">
        <div className="text-[#58a6ff] font-bold text-sm mb-6 border-b border-[#21262d] pb-3">
          hl&gt; INITIALIZING DATA DIG... [SECTOR 7-A] [NODES: 2048]
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main code panel */}
          <div className="md:col-span-2 space-y-0.5 text-[11px] leading-relaxed">
            <div><span style={{ color: "#484f58" }}>  1</span>  <span style={{ color: "#ff7b72" }}>const</span> <span style={{ color: "#d2a8ff" }}>archaeologist</span> = <span style={{ color: "#ff7b72" }}>new</span> <span style={{ color: "#79c0ff" }}>DataDig</span>();</div>
            <div><span style={{ color: "#484f58" }}>  2</span>  <span style={{ color: "#ff7b72" }}>const</span> <span style={{ color: "#d2a8ff" }}>artifacts</span> = <span style={{ color: "#ff7b72" }}>await</span> <span style={{ color: "#79c0ff" }}>lab</span>.<span style={{ color: "#d2a8ff" }}>scanSector</span>(<span style={{ color: "#a5d6ff" }}>&apos;7A-FF02&apos;</span>);</div>
            <div><span style={{ color: "#484f58" }}>  3</span></div>
            <div><span style={{ color: "#484f58" }}>  4</span>  <span style={{ color: "#8b949e" }}>// Deep-scan retro hardware layer</span></div>
            <div><span style={{ color: "#484f58" }}>  5</span>  <span style={{ color: "#ff7b72" }}>for</span> (<span style={{ color: "#ff7b72" }}>const</span> <span style={{ color: "#d2a8ff" }}>device</span> <span style={{ color: "#ff7b72" }}>of</span> <span style={{ color: "#d2a8ff" }}>artifacts</span>) {'{'}</div>
            <div className="opacity-60">  6      if (device.vintage {'>'} 1995) {'{'}</div>
            <div className="opacity-60">  7        await catalog(device.romDump());</div>
            <div className="opacity-60">  8      {'}'}</div>
            <div className="opacity-60">  9    {'}'}</div>
            <div className="opacity-40"> 10</div>
            <div className="opacity-40"> 11    console.log(&apos;Found &apos; + artifacts.length</div>
            <div className="opacity-40"> 12      + &apos; retro devices in sector&apos;);</div>
            <div><span style={{ color: "#484f58" }}> 21</span>  <span style={{ color: "#8b949e" }}>// hl&gt; _</span></div>
          </div>
          {/* Log panel */}
          <div className="bg-[#0a0a0a] rounded p-3 text-[9px] space-y-0.5">
            <div style={{ color: "#00ff88" }}>[12:04:32] NODE-7A  | PING 192.168.7.42   | 3.2ms</div>
            <div style={{ color: "#88ccff" }}>[12:04:33] NODE-7B  | ACK from sector 7A  | OK</div>
            <div style={{ color: "#aaaaaa" }}>[12:04:35] SWITCH-2 | Port 7 up           | 1000Mbps</div>
            <div style={{ color: "#00ff88" }}>[12:04:38] ROUTER-0 | Route table update  | 2048 entries</div>
            <div style={{ color: "#88ccff" }}>[12:04:41] MONITOR  | CPU: 42% MEM: 3.8GB | TEMP: 58C</div>
            <div style={{ color: "#aaaaaa" }}>[12:04:44] DIG-ENGN | Scanning block 0x7A | 38% complete</div>
            <div style={{ color: "#00ff88" }}>[12:04:47] DIG-ENGN | Found: ROM v2.4     | SEGA MD</div>
            <div style={{ color: "#88ccff" }}>[12:04:50] DIG-ENGN | Found: PCB rev 3.1  | NES-001</div>
          </div>
          {/* Topology panel */}
          <div className="bg-[#050510] rounded p-3 text-[9px]" style={{ color: "#88ffcc" }}>
            <div className="font-bold mb-2" style={{ color: "#00ff88" }}>NETWORK TOPOLOGY — SECTOR 7A</div>
            <pre className="font-mono leading-tight">
              N0 ── N1 ── N2{'\n'}
              │     │     │{'\n'}
              N3 ── N4 ── N5{'\n'}
              │     │     │{'\n'}
              N6 ── N7 ── N8{'\n'}
              │{'\n'}
              N9
            </pre>
            <div className="mt-2 opacity-60">10 nodes · 11 edges · 3 components</div>
          </div>
        </div>
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)" }}
        />
      </div>
    </div>
  );
}

/* ============================================
   Playground
   ============================================ */
export default function Playground() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [useFlatFallback, setUseFlatFallback] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) {
        setUseFlatFallback(true);
      }
    } catch { setUseFlatFallback(true); }
  }, []);

  return (
    <section
      id="playground"
      ref={sectionRef}
      className="relative overflow-hidden"
    >
      {/* Top accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent z-10" />

      {/* ============================================
          FULL-WIDTH — no border, no container limit
          ============================================ */}
      <motion.div
        initial={reduce ? false : { opacity: 0, filter: "brightness(0.3)" }}
        whileInView={reduce ? {} : { opacity: 1, filter: "brightness(1)" }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-full"
      >
        {useFlatFallback ? <FlatFallback /> : <TechArchaeologistLab />}
      </motion.div>

      {/* Bottom label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <span className="text-[10px] text-amber-400/40 font-mono tracking-[0.25em] uppercase">
          Tech-Archaeologist Research Station · Sector 7A
        </span>
      </div>
    </section>
  );
}
