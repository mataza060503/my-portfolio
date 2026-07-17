"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ============================================
   Terminal commands
   ============================================ */

interface CommandEntry {
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
   KEY MAP: map physical keyboard keys to
   keycap labels on the rendered keyboard
   ============================================ */

function normalizeKey(key: string): string {
  if (key === " ") return "SPACE";
  if (key === "Backspace" || key === "Delete") return "BKS";
  if (key === "Enter") return "ENTER";
  if (key === "Tab") return "TAB";
  if (key === "CapsLock") return "CAPS";
  if (key === "Shift" || key === "ShiftLeft" || key === "ShiftRight")
    return "SHIFT";
  if (key === "Control" || key === "ControlLeft" || key === "ControlRight")
    return "CTRL";
  if (key === "Alt" || key === "AltLeft" || key === "AltRight") return "ALT";
  if (key === "ArrowUp") return "ARROW";
  if (key === "ArrowDown") return "ARROW";
  if (key === "ArrowLeft") return "ARROW";
  if (key === "ArrowRight") return "ARROW";
  if (key === "Escape") return "ESC";
  return key.toUpperCase();
}

/* ============================================
   3D Keycap — individual raised key with
   extrusion, side walls, and switch glow
   ============================================ */

function Key3D({
  label,
  active,
  wide,
  fn,
  isSpace,
}: {
  label: string;
  active: boolean;
  wide?: boolean;
  fn?: boolean;
  isSpace?: boolean;
}) {
  return (
    <div
      className="relative"
      style={{
        width: isSpace ? 120 : fn ? 22 : wide ? 28 : 20,
        height: isSpace || !fn ? 18 : 12,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Key body (extruded top face) */}
      <motion.div
        animate={
          active
            ? { translateZ: 0, y: 3 }
            : { translateZ: 9, y: 0 }
        }
        transition={{ type: "spring", stiffness: 600, damping: 22 }}
        className="absolute inset-0 rounded-[3px] flex items-center justify-center cursor-default select-none"
        style={{
          background: active
            ? "linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%)"
            : "linear-gradient(180deg, #e8e0d4 0%, #d4c8b8 100%)",
          color: active ? "#fff" : "#3a3028",
          fontSize: "6.5px",
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "0.01em",
          fontFamily: "var(--font-mono), monospace",
          boxShadow: active
            ? "0 0 18px var(--color-accent-violet), 0 0 6px var(--color-accent-emerald), 0 2px 0 #4c1d95"
            : "0 3px 0 #b8a898, 0 1px 2px rgba(0,0,0,0.15)",
          transform: `translateZ(${active ? 0 : 9}px)`,
          willChange: "transform",
        }}
      >
        {isSpace ? "" : label}
      </motion.div>

      {/* Key side walls (extrusion depth) — visible when popped up */}
      <div
        className="absolute rounded-[3px]"
        style={{
          inset: "0 0 -6px 0",
          background: "linear-gradient(180deg, #c8bca8, #a89880)",
          transform: "translateZ(-6px)",
          opacity: active ? 0.15 : 1,
          transition: "opacity 0.15s ease",
        }}
      />

      {/* Switch housing glow beneath keycap */}
      <div
        className="absolute rounded-[4px] transition-all duration-150"
        style={{
          inset: "-2px",
          background: "transparent",
          boxShadow: active
            ? "0 0 20px var(--color-accent-violet), 0 0 8px var(--color-accent-emerald), 0 4px 8px rgba(139,92,246,0.4)"
            : "0 1px 2px rgba(0,0,0,0.1)",
          transform: "translateZ(-3px)",
          opacity: active ? 1 : 0,
        }}
      />

      {/* Side wall highlight — subtle bevel on top edge */}
      <div
        className="absolute rounded-[3px] pointer-events-none"
        style={{
          inset: 0,
          borderTop: "1px solid rgba(255,255,255,0.25)",
          borderLeft: "1px solid rgba(255,255,255,0.12)",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          transform: `translateZ(${active ? 0 : 9}px)`,
        }}
      />
    </div>
  );
}

/* ============================================
   Keyboard Row Data
   ============================================ */

const KEY_ROWS = [
  ["ESC", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"],
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "BKS"],
  ["TAB", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["CAPS", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "ENTER"],
  ["SHIFT", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "SHIFT"],
  ["CTRL", "ALT", "SPACE", "ALT", "CTRL"],
];

/* ============================================
   3D Mechanical Keyboard
   ============================================ */

function Keyboard3D({ activeKey }: { activeKey: string | null }) {
  return (
    <div
      className="relative rounded-lg p-3"
      style={{
        background: "linear-gradient(180deg, #d8cec0 0%, #c4b8a8 100%)",
        borderBottom: "4px solid #a89880",
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
        transformStyle: "preserve-3d",
        transform: "rotateX(60deg)",
        transformOrigin: "top center",
      }}
    >
      {/* Keyboard thickness edge (bottom face) */}
      <div
        className="absolute left-0 right-0 rounded-b-lg"
        style={{
          height: "14px",
          bottom: "-14px",
          background: "linear-gradient(180deg, #b0a090, #88786a)",
          transform: "rotateX(-90deg)",
          transformOrigin: "top center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      />

      {/* Keyboard front lip */}
      <div
        className="absolute left-0 right-0"
        style={{
          height: "6px",
          bottom: 0,
          background: "linear-gradient(180deg, #a89880, #988878)",
          transform: "translateZ(6px)",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      />

      <div className="flex flex-col gap-[2px] relative z-10">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-[2px]">
            {row.map((key, ki) => {
              const isActive =
                activeKey !== null &&
                normalizeKey(activeKey) === key.toUpperCase();
              const isSpace = key === "SPACE";
              const isWide = ["ENTER", "SHIFT", "CAPS", "TAB", "BKS", "CTRL", "ALT"].includes(
                key,
              );
              const isFn = key.startsWith("F") && key.length <= 3;
              return (
                <Key3D
                  key={`${ri}-${ki}`}
                  label={key}
                  active={!!isActive}
                  wide={isWide && !isFn}
                  fn={isFn}
                  isSpace={isSpace}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================
   Retro CRT All-in-One PC (CSS 3D)
   ============================================ */

export default function Playground() {
  const [history, setHistory] = useState<CommandEntry[]>([
    { type: "output", text: 'Welcome! Type "help" to get started.' },
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  /* ---- Terminal auto-scroll ---- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  /* ---- Keyboard glow on input change ---- */
  useEffect(() => {
    if (!input) return;
    const lastChar = input[input.length - 1];
    setActiveKey(lastChar === " " ? "SPACE" : lastChar);
    const t = setTimeout(() => setActiveKey(null), 200);
    return () => clearTimeout(t);
  }, [input]);

  const processCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    const entry: CommandEntry = {
      type: "input",
      text: `C:\\> ${cmd}`,
    };
    setHistory((prev) => [...prev, entry]);
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
          text: `Unknown command: "${trimmed}". Type "help".`,
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
    setActiveKey("ENTER");
    setTimeout(() => setActiveKey(null), 350);
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
        const ni = historyIndex - 1;
        setHistoryIndex(ni);
        setInput(commandHistory[ni]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Backspace") {
      setActiveKey("BKS");
      setTimeout(() => setActiveKey(null), 180);
    }
  };

  return (
    <section
      id="playground"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-6 overflow-visible"
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />

      <div className="mx-auto max-w-[720px]">
        {/* ---- Section heading ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
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

        {/* ====================================================
            3D VIEWPORT — perspective[1800px]
            Permanent isometric view: rotateX(12) rotateY(-18)
            ==================================================== */}
        <div style={{ perspective: 1800 }} className="transform-gpu">
          <motion.div
            initial={
              reduce
                ? false
                : {
                    rotateY: -55,
                    rotateX: 0,
                    y: 140,
                    z: 100,
                    opacity: 0,
                  }
            }
            whileInView={
              reduce
                ? {}
                : {
                    rotateY: -18,
                    rotateX: 12,
                    y: 0,
                    z: 0,
                    opacity: 1,
                  }
            }
            viewport={{ once: false, amount: 0.12 }}
            transition={{
              type: "spring",
              stiffness: 40,
              damping: 18,
              mass: 1.6,
            }}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
              willChange: "transform, opacity",
            }}
          >
            {/* ================================================
                MONITOR CHASSIS
                ================================================ */}
            <div
              className="relative mx-auto"
              style={{
                width: 520,
                transformStyle: "preserve-3d",
              }}
            >
              {/* ---- FRONT BEZEL ---- */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  width: 520,
                  height: 390,
                  background:
                    "linear-gradient(170deg, #dcd4c8 0%, #c8bfae 40%, #b8ae9c 100%)",
                  border: "3px solid #a89880",
                  transform: "translateZ(32px)",
                  boxShadow:
                    "inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.15), 0 16px 48px rgba(0,0,0,0.5)",
                }}
              >
                {/* ---- Ventilation slots top ---- */}
                <div className="flex gap-[3px] px-6 pt-3 pb-2">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full"
                      style={{
                        height: 4,
                        background:
                          "linear-gradient(180deg, #9a8a78, #7a6a58)",
                      }}
                    />
                  ))}
                </div>

                {/* ---- Screen bezel inner frame ---- */}
                <div
                  className="mx-5 rounded-2xl p-[5px]"
                  style={{
                    background:
                      "linear-gradient(180deg, #4a4440, #2a2420)",
                    boxShadow: "inset 0 0 24px rgba(0,0,0,0.55)",
                  }}
                >
                  {/* ---- CURVED CRT SCREEN ---- */}
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{
                      height: 300,
                      // Deep phosphor-green tube: spherical curvature via radial-gradient
                      background:
                        "radial-gradient(ellipse at 55% 40%, #0d220d 0%, #081408 40%, #020a02 70%, #010501 100%)",
                      // Inner shadow for CRT glass tube depth + vignette
                      boxShadow:
                        "inset 0 0 80px rgba(0,0,0,0.85), inset 0 0 16px rgba(16,185,129,0.06), 0 0 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {/* ---- Glass curvature overlay ::before ---- */}
                    <div
                      className="absolute inset-0 pointer-events-none z-10 rounded-xl"
                      style={{
                        background: `
                          radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.6) 95%),
                          radial-gradient(ellipse at 65% 25%, rgba(180,255,180,0.04) 0%, transparent 50%)
                        `,
                      }}
                    />

                    {/* ---- Scanline overlay ---- */}
                    <div
                      className="absolute inset-0 pointer-events-none z-20 opacity-[0.045]"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0.35) 3px)",
                      }}
                    />

                    {/* ---- Phosphor micro-flicker animation ---- */}
                    <style>{`
                      @keyframes phosphorFlicker {
                        0%, 99.5%, 100% { opacity: 1; }
                        99.6% { opacity: 0.96; }
                        99.7% { opacity: 1; }
                        99.8% { opacity: 0.94; }
                        99.9% { opacity: 1; }
                      }
                      @keyframes scanlineDrift {
                        0% { backgroundPosition: 0 0; }
                        100% { backgroundPosition: 0 6px; }
                      }
                    `}</style>

                    {/* ---- Screen content ---- */}
                    <div
                      className="h-full overflow-y-auto p-4 font-mono text-[10.5px] leading-relaxed relative z-0"
                      style={{
                        fontFamily:
                          "var(--font-mono), 'Courier New', monospace",
                        color: "#8bff8b",
                        textShadow:
                          "0 0 5px rgba(139,255,139,0.65), 0 0 12px rgba(139,255,139,0.25), 0 0 25px rgba(139,255,139,0.1)",
                        animation: "phosphorFlicker 6s infinite",
                      }}
                    >
                      {history.map((entry, i) => (
                        <div key={i} className="mb-0.5">
                          {entry.type === "input" ? (
                            <div className="flex gap-1">
                              <span style={{ color: "#c4b5fd" }}>
                                C:\&gt;
                              </span>
                              <span style={{ color: "#e2e8f0" }}>
                                {entry.text.replace("C:\\> ", "")}
                              </span>
                            </div>
                          ) : (
                            <div
                              className="whitespace-pre-wrap"
                              style={{ color: "#8bff8b" }}
                            >
                              {entry.text}
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Input line */}
                      <form
                        onSubmit={handleSubmit}
                        className="flex gap-1 mt-0.5"
                      >
                        <span
                          style={{
                            color: "#c4b5fd",
                            flexShrink: 0,
                          }}
                        >
                          C:\&gt;
                        </span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="flex-1 bg-transparent border-none outline-none font-mono text-[10.5px] placeholder:text-white/10"
                          style={{
                            color: "#e2e8f0",
                            caretColor: "var(--color-accent-emerald)",
                            textShadow:
                              "0 0 3px rgba(226,232,240,0.3)",
                          }}
                          placeholder="Type a command..."
                          autoFocus
                          spellCheck={false}
                          autoComplete="off"
                        />
                      </form>
                      <div ref={bottomRef} />
                    </div>

                    {/* ---- Screen reflection gleam (top-right) ---- */}
                    <div
                      className="absolute top-0 right-0 pointer-events-none z-20"
                      style={{
                        width: "40%",
                        height: "35%",
                        background:
                          "radial-gradient(ellipse at 100% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)",
                        borderRadius: "0 12px 0 0",
                      }}
                    />
                  </div>
                </div>

                {/* ---- Bottom badge area ---- */}
                <div
                  className="flex items-center justify-between px-5 py-2 mt-1"
                  style={{ borderTop: "1px solid #b8a898" }}
                >
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.15em]"
                    style={{
                      color: "#6a5a48",
                      fontFamily: "var(--font-mono), monospace",
                    }}
                  >
                    CRT-2024
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-accent-violet/20 bg-accent-violet/10 px-2 py-0.5 text-[9px] font-semibold text-accent-violet-light">
                    1+ Year AI &amp; Full-Stack
                  </span>
                </div>
              </div>

              {/* ---- RIGHT SIDE PANEL (depth) ---- */}
              <div
                className="absolute top-0 rounded-r-2xl"
                style={{
                  width: 64,
                  height: 390,
                  right: -1,
                  background:
                    "linear-gradient(180deg, #c8bfae 0%, #b0a898 50%, #a09888 100%)",
                  borderRight: "3px solid #908070",
                  borderTop: "3px solid #b8ae9c",
                  borderBottom: "3px solid #908070",
                  transform:
                    "rotateY(90deg) translateZ(-32px)",
                  transformOrigin: "right center",
                  boxShadow:
                    "inset -4px 0 8px rgba(0,0,0,0.15)",
                }}
              >
                {/* Experience badge on side panel */}
                <div
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      color: "#5a4a38",
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      fontFamily: "var(--font-mono), monospace",
                    }}
                  >
                    1+ YEAR EXP
                  </span>
                  <span className="h-8 w-[1px] bg-accent-violet/30" />
                  <span
                    className="text-[7px] font-semibold text-accent-violet-light"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                    }}
                  >
                    AI &amp; FS DEV
                  </span>
                </div>
              </div>

              {/* ---- TOP PANEL (depth) ---- */}
              <div
                className="absolute left-0 right-0 rounded-t-2xl"
                style={{
                  height: 64,
                  top: -1,
                  background:
                    "linear-gradient(180deg, #ddd5c9 0%, #c8bfae 100%)",
                  borderTop: "3px solid #c8bfae",
                  borderLeft: "3px solid #b8ae9c",
                  borderRight: "3px solid #b8ae9c",
                  transform:
                    "rotateX(-90deg) translateZ(-32px)",
                  transformOrigin: "top center",
                  boxShadow:
                    "inset 0 -6px 12px rgba(0,0,0,0.1)",
                }}
              />

              {/* ---- LEFT SIDE PANEL (subtle depth) ---- */}
              <div
                className="absolute top-0 rounded-l-2xl"
                style={{
                  width: 64,
                  height: 390,
                  left: -1,
                  background:
                    "linear-gradient(180deg, #c0b8a8 0%, #a89888 50%, #988878 100%)",
                  borderLeft: "3px solid #908070",
                  borderTop: "3px solid #b8ae9c",
                  borderBottom: "3px solid #908070",
                  transform:
                    "rotateY(-90deg) translateZ(-488px)",
                  transformOrigin: "left center",
                  boxShadow:
                    "inset 4px 0 8px rgba(0,0,0,0.1)",
                }}
              />

              {/* ---- NECK / STAND ---- */}
              <div
                className="mx-auto"
                style={{
                  width: 80,
                  height: 30,
                  background:
                    "linear-gradient(180deg, #c8bfae, #b0a898)",
                  borderLeft: "3px solid #a89880",
                  borderRight: "3px solid #a89880",
                  borderBottom: "3px solid #908070",
                  transform: "translateZ(0px)",
                  borderRadius: "0 0 6px 6px",
                  boxShadow:
                    "inset 0 4px 6px rgba(0,0,0,0.1)",
                }}
              />

              {/* ---- BASE PLATFORM ---- */}
              <div
                className="mx-auto rounded-b-xl"
                style={{
                  width: 200,
                  height: 14,
                  background:
                    "linear-gradient(180deg, #bfb6a4, #a89880)",
                  border: "3px solid #908070",
                  transform: "translateZ(-2px)",
                  boxShadow:
                    "0 6px 20px rgba(0,0,0,0.45)",
                }}
              />
            </div>

            {/* ================================================
                3D MECHANICAL KEYBOARD (in front of monitor)
                ================================================ */}
            <div
              className="mx-auto mt-4"
              style={{
                width: 500,
                transformStyle: "preserve-3d",
                transform: "translateZ(-10px)",
              }}
            >
              <Keyboard3D activeKey={activeKey} />
            </div>

            {/* ---- Hint text ---- */}
            <p
              className="mt-6 text-center text-xs text-text-muted"
              style={{
                transform: "translateZ(20px)",
                fontFamily: "var(--font-mono), monospace",
              }}
            >
              Try: help · about · skills · projects · contact · clear
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
