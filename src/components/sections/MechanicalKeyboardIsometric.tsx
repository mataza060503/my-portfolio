"use client";

import { useCallback, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Key definitions                                                    */
/* ------------------------------------------------------------------ */

interface KeyDef {
  label: string;
  w: number;
  code: string;
}

const KEYBOARD_ROWS: KeyDef[][] = [
  /* Row 1 - Function row (15U): ESC F1-F4 F5-F8 F9-F12 DEL */
  [
    { label: "ESC", w: 1, code: "Escape" }, { label: "", w: 0.5, code: "" },
    { label: "F1", w: 1, code: "F1" }, { label: "F2", w: 1, code: "F2" }, { label: "F3", w: 1, code: "F3" }, { label: "F4", w: 1, code: "F4" },
    { label: "", w: 0.5, code: "" },
    { label: "F5", w: 1, code: "F5" }, { label: "F6", w: 1, code: "F6" }, { label: "F7", w: 1, code: "F7" }, { label: "F8", w: 1, code: "F8" },
    { label: "", w: 0.5, code: "" },
    { label: "F9", w: 1, code: "F9" }, { label: "F10", w: 1, code: "F10" }, { label: "F11", w: 1, code: "F11" }, { label: "F12", w: 1, code: "F12" },
    { label: "", w: 0.5, code: "" },
    { label: "DEL", w: 1, code: "Delete" },
  ],
  /* Row 2 - Number row (15U): ` 1..0 - = BKS(2U) */
  [
    { label: "`", w: 1, code: "Backquote" }, { label: "1", w: 1, code: "Digit1" },
    { label: "2", w: 1, code: "Digit2" }, { label: "3", w: 1, code: "Digit3" },
    { label: "4", w: 1, code: "Digit4" }, { label: "5", w: 1, code: "Digit5" },
    { label: "6", w: 1, code: "Digit6" }, { label: "7", w: 1, code: "Digit7" },
    { label: "8", w: 1, code: "Digit8" }, { label: "9", w: 1, code: "Digit9" },
    { label: "0", w: 1, code: "Digit0" }, { label: "-", w: 1, code: "Minus" },
    { label: "=", w: 1, code: "Equal" }, { label: "BKS", w: 2, code: "Backspace" },
  ],
  /* Row 3 - QWERTY (15.5U): TAB(1.5U) Q..P [ ] \ HOME(1U) */
  [
    { label: "TAB", w: 1.5, code: "Tab" }, { label: "Q", w: 1, code: "KeyQ" },
    { label: "W", w: 1, code: "KeyW" }, { label: "E", w: 1, code: "KeyE" },
    { label: "R", w: 1, code: "KeyR" }, { label: "T", w: 1, code: "KeyT" },
    { label: "Y", w: 1, code: "KeyY" }, { label: "U", w: 1, code: "KeyU" },
    { label: "I", w: 1, code: "KeyI" }, { label: "O", w: 1, code: "KeyO" },
    { label: "P", w: 1, code: "KeyP" }, { label: "[", w: 1, code: "BracketLeft" },
    { label: "]", w: 1, code: "BracketRight" }, { label: "\\", w: 1, code: "Backslash" },
    { label: "HOME", w: 1, code: "Home" },
  ],
  /* Row 4 - ASDF (16U): CAPS(1.75U) A..L ; ' ENTER(2.25U) PGUP(1U) */
  [
    { label: "CAPS", w: 1.75, code: "CapsLock" }, { label: "A", w: 1, code: "KeyA" },
    { label: "S", w: 1, code: "KeyS" }, { label: "D", w: 1, code: "KeyD" },
    { label: "F", w: 1, code: "KeyF" }, { label: "G", w: 1, code: "KeyG" },
    { label: "H", w: 1, code: "KeyH" }, { label: "J", w: 1, code: "KeyJ" },
    { label: "K", w: 1, code: "KeyK" }, { label: "L", w: 1, code: "KeyL" },
    { label: ";", w: 1, code: "Semicolon" }, { label: "'", w: 1, code: "Quote" },
    { label: "ENTER", w: 2.25, code: "Enter" }, { label: "PGUP", w: 1, code: "PageUp" },
  ],
  /* Row 5 - ZXCV (16U): LSHIFT(2.25U) Z..M , . / RSHIFT(1.75U) ↑(1U) PGDN(1U) */
  [
    { label: "SHIFT", w: 2.25, code: "ShiftLeft" }, { label: "Z", w: 1, code: "KeyZ" },
    { label: "X", w: 1, code: "KeyX" }, { label: "C", w: 1, code: "KeyC" },
    { label: "V", w: 1, code: "KeyV" }, { label: "B", w: 1, code: "KeyB" },
    { label: "N", w: 1, code: "KeyN" }, { label: "M", w: 1, code: "KeyM" },
    { label: ",", w: 1, code: "Comma" }, { label: ".", w: 1, code: "Period" },
    { label: "/", w: 1, code: "Slash" }, { label: "SHIFT", w: 1.75, code: "ShiftRight" },
    { label: "↑", w: 1, code: "ArrowUp" }, { label: "PGDN", w: 1, code: "PageDown" },
  ],
  /* Row 6 - Bottom (16U): CTRL(1.25) WIN(1.25) ALT(1.25) SPACE(6.25) ALT(1) FN(1) CTRL(1) ←↓→ */
  [
    { label: "CTRL", w: 1.25, code: "ControlLeft" }, { label: "WIN", w: 1.25, code: "MetaLeft" },
    { label: "ALT", w: 1.25, code: "AltLeft" },
    { label: "SPACE", w: 6.25, code: "Space" },
    { label: "ALT", w: 1, code: "AltRight" }, { label: "FN", w: 1, code: "Fn" },
    { label: "CTRL", w: 1, code: "ControlRight" },
    { label: "←", w: 1, code: "ArrowLeft" }, { label: "↓", w: 1, code: "ArrowDown" }, { label: "→", w: 1, code: "ArrowRight" },
  ],
];

const KEY_UNIT = 26;
const KEY_GAP = 2;
const KEY_H = 30;

/* ================================================================ */
/*  Isometric Keycap                                                  */
/* ================================================================ */

const IsoKeycap = memo(function IsoKeycap({ def, unitSize, isActive, flyDelay, show }: {
  def: KeyDef;
  unitSize: number;
  isActive: boolean;
  flyDelay: number;
  show: boolean;
}) {
  if (!def.label) {
    return <div style={{ width: def.w * unitSize + (def.w - 1) * KEY_GAP, height: KEY_H }} />;
  }

  const w = def.w * unitSize + (def.w - 1) * KEY_GAP;
  const h = KEY_H;
  const fontSize = def.label.length > 3 ? 5.5 : def.label.length > 1 ? 7 : 9;

  /* random fly origin */
  const fx = (Math.random() - 0.5) * 400;
  const fy = (Math.random() - 0.5) * 300 - 150;
  const frx = (Math.random() - 0.5) * 300;
  const fry = (Math.random() - 0.5) * 300;
  const frz = (Math.random() - 0.5) * 180;

  return (
    <motion.div
      className="flex-shrink-0"
      style={{
        width: w,
        height: h,
        transformStyle: "preserve-3d",
        marginRight: KEY_GAP,
        marginBottom: KEY_GAP,
        willChange: "transform, opacity",
      }}
      initial={show ? { opacity: 0, x: fx, y: fy, rotateX: frx, rotateY: fry, rotateZ: frz, scale: 0.2 } : false}
      animate={show ? { opacity: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 } : {}}
      transition={show ? { type: "spring", stiffness: 180, damping: 16, mass: 0.7, delay: 1.8 + flyDelay } : {}}
    >
      {/* key top face */}
      <motion.div
        className="relative w-full h-full rounded-[4px] flex items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          background: isActive
            ? "linear-gradient(180deg, #8b5cf6 0%, #5b21b6 100%)"
            : "linear-gradient(180deg, #232336 0%, #16162a 100%)",
          boxShadow: isActive
            ? "0 0 16px rgba(139,92,246,0.7), 0 0 6px rgba(6,182,212,0.5), 0 1px 0 rgba(0,0,0,0.6)"
            : "0 1px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
          z: isActive ? -2 : 1,
          y: isActive ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 22 }}
      >
        {/* key face highlight */}
        <div
          className="absolute inset-[1px] rounded-[3px] pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
          }}
        />
        <span
          className="font-mono font-semibold select-none pointer-events-none leading-none relative z-10"
          style={{
            fontSize,
            color: isActive ? "#fff" : "rgba(180,190,210,0.65)",
            textShadow: isActive ? "0 0 8px rgba(255,255,255,0.5)" : "none",
            letterSpacing: def.label.length === 1 ? "0" : "0.02em",
          }}
        >
          {def.label}
        </span>
      </motion.div>
    </motion.div>
  );
});

/* ================================================================ */
/*  Isometric Mechanical Keyboard                                     */
/* ================================================================ */

interface Props {
  activeKey: string | null;
  show: boolean;
}

export default function MechanicalKeyboardIsometric({ activeKey, show }: Props) {
  const reduce = useReducedMotion();
  const unitSize = KEY_UNIT;

  const getActiveCode = useCallback((code: string): boolean => {
    if (!activeKey) return false;
    const keyMap: Record<string, string> = {
      Backspace: "Backspace", Enter: "Enter", Escape: "Escape",
      Tab: "Tab", " ": "Space", CapsLock: "CapsLock",
      Shift: "ShiftLeft", Control: "ControlLeft", Alt: "AltLeft",
      Meta: "MetaLeft", Fn: "Fn",
      ArrowUp: "ArrowUp", ArrowDown: "ArrowDown",
      ArrowLeft: "ArrowLeft", ArrowRight: "ArrowRight",
      Home: "Home", End: "End", PageUp: "PageUp", PageDown: "PageDown",
      Delete: "Delete",
    };
    const mapped = keyMap[activeKey] || activeKey;
    if (activeKey.length === 1) {
      return code === `Key${activeKey.toUpperCase()}` || code === `Digit${activeKey}` || code === activeKey;
    }
    return code === mapped;
  }, [activeKey]);

  const allKeys = KEYBOARD_ROWS.flat();
  const totalVisible = allKeys.filter((k) => k.label).length;

  return (
    <motion.div
      className="relative flex-shrink-0 transform-gpu"
      style={{
        perspective: 600,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity",
      }}
      initial={reduce ? false : { opacity: 0, y: 120, rotateX: -55 }}
      animate={show ? (reduce ? { opacity: 1, y: 0, rotateX: -45 } : { opacity: 1, y: 0, rotateX: [-45, -405, -765, -765, -45] }) : {}}
      transition={show ? {
        y: { type: "spring", stiffness: 40, damping: 14, mass: 1.1, delay: 0.1 },
        rotateX: { duration: 1.3, ease: "easeOut", times: [0, 0.22, 0.48, 0.72, 1] },
        opacity: { duration: 0.5 },
      } : {}}
    >
      {/* keyboard chassis - isometric perspective */}
      <div
        className="relative rounded-lg p-2"
        style={{
          background: "linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%)",
          border: "1px solid rgba(6,182,212,0.15)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.05), 0 0 24px rgba(6,182,212,0.04)",
          transformStyle: "preserve-3d",
          transform: "rotateX(45deg)",
        }}
      >
        {/* key rows */}
        <div className="flex flex-col gap-[2px]">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex">
              {row.map((key, ki) => {
                const idx = KEYBOARD_ROWS.slice(0, ri).flat().length + ki;
                const flyDelay = show ? ((idx / totalVisible) * 0.7) : 0;
                return (
                  <IsoKeycap
                    key={`${ri}-${ki}`}
                    def={key}
                    unitSize={unitSize}
                    isActive={getActiveCode(key.code)}
                    flyDelay={flyDelay}
                    show={show}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* under-glow reflection */}
      <motion.div
        className="absolute -bottom-2 inset-x-4 h-[2px] rounded-full"
        animate={{
          background: show
            ? "linear-gradient(90deg, transparent, rgba(6,182,212,0.5), rgba(139,92,246,0.5), rgba(6,182,212,0.5), transparent)"
            : "linear-gradient(90deg, transparent, transparent, transparent, transparent, transparent)",
          boxShadow: show ? "0 0 20px rgba(6,182,212,0.3), 0 0 40px rgba(139,92,246,0.15)" : "none",
        }}
        transition={{ duration: 1, delay: 2.5 }}
      />
    </motion.div>
  );
}
