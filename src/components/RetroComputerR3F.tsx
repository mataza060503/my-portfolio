"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  RoundedBox,
  Html,
  ContactShadows,
  Environment,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import type { CmdEntry, TerminalState } from "@/hooks/useTerminal";

/* ============================================
   Keyboard Layout + code→label mapping
   ============================================ */

const KEY_ROWS: { label: string; w: number }[][] = [
  [
    { label: "ESC", w: 1 }, { label: "F1", w: 1 }, { label: "F2", w: 1 },
    { label: "F3", w: 1 }, { label: "F4", w: 1 }, { label: "F5", w: 1 },
    { label: "F6", w: 1 }, { label: "F7", w: 1 }, { label: "F8", w: 1 },
    { label: "F9", w: 1 }, { label: "F10", w: 1 }, { label: "F11", w: 1 },
    { label: "F12", w: 1 },
  ],
  [
    { label: "`", w: 1 }, { label: "1", w: 1 }, { label: "2", w: 1 },
    { label: "3", w: 1 }, { label: "4", w: 1 }, { label: "5", w: 1 },
    { label: "6", w: 1 }, { label: "7", w: 1 }, { label: "8", w: 1 },
    { label: "9", w: 1 }, { label: "0", w: 1 }, { label: "-", w: 1 },
    { label: "=", w: 1 }, { label: "BKS", w: 2 },
  ],
  [
    { label: "TAB", w: 1.6 }, { label: "Q", w: 1 }, { label: "W", w: 1 },
    { label: "E", w: 1 }, { label: "R", w: 1 }, { label: "T", w: 1 },
    { label: "Y", w: 1 }, { label: "U", w: 1 }, { label: "I", w: 1 },
    { label: "O", w: 1 }, { label: "P", w: 1 }, { label: "[", w: 1 },
    { label: "]", w: 1 }, { label: "\\", w: 1.4 },
  ],
  [
    { label: "CAPS", w: 1.9 }, { label: "A", w: 1 }, { label: "S", w: 1 },
    { label: "D", w: 1 }, { label: "F", w: 1 }, { label: "G", w: 1 },
    { label: "H", w: 1 }, { label: "J", w: 1 }, { label: "K", w: 1 },
    { label: "L", w: 1 }, { label: ";", w: 1 }, { label: "'", w: 1 },
    { label: "ENTER", w: 2.1 },
  ],
  [
    { label: "SHIFT", w: 2.4 }, { label: "Z", w: 1 }, { label: "X", w: 1 },
    { label: "C", w: 1 }, { label: "V", w: 1 }, { label: "B", w: 1 },
    { label: "N", w: 1 }, { label: "M", w: 1 }, { label: ",", w: 1 },
    { label: ".", w: 1 }, { label: "/", w: 1 }, { label: "SHIFT", w: 2.4 },
  ],
  [
    { label: "CTRL", w: 1.5 }, { label: "ALT", w: 1.5 },
    { label: "SPACE", w: 5.5 },
    { label: "ALT", w: 1.5 }, { label: "CTRL", w: 1.5 },
  ],
];

/* Map physical event.code to keycap label */
const CODE_TO_LABEL: Record<string, string> = {
  Space: "SPACE",
  Backspace: "BKS",
  Enter: "ENTER",
  Tab: "TAB",
  CapsLock: "CAPS",
  ShiftLeft: "SHIFT",
  ShiftRight: "SHIFT",
  ControlLeft: "CTRL",
  ControlRight: "CTRL",
  AltLeft: "ALT",
  AltRight: "ALT",
  Escape: "ESC",
  ArrowUp: "ARROW",
  ArrowDown: "ARROW",
  ArrowLeft: "ARROW",
  ArrowRight: "ARROW",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4", Digit5: "5",
  Digit6: "6", Digit7: "7", Digit8: "8", Digit9: "9", Digit0: "0",
  KeyA: "A", KeyB: "B", KeyC: "C", KeyD: "D", KeyE: "E", KeyF: "F",
  KeyG: "G", KeyH: "H", KeyI: "I", KeyJ: "J", KeyK: "K", KeyL: "L",
  KeyM: "M", KeyN: "N", KeyO: "O", KeyP: "P", KeyQ: "Q", KeyR: "R",
  KeyS: "S", KeyT: "T", KeyU: "U", KeyV: "V", KeyW: "W", KeyX: "X",
  KeyY: "Y", KeyZ: "Z",
};

function codeToLabel(code: string): string {
  return CODE_TO_LABEL[code] ?? code.toUpperCase();
}

/* Map pressed character to keycap label */
function charToLabel(ch: string): string {
  if (ch === " ") return "SPACE";
  return ch.toUpperCase();
}

/* ============================================
   Materials (shared, created once)
   ============================================ */
const matBeige = new THREE.MeshStandardMaterial({
  color: "#d4cbb8", roughness: 0.55, metalness: 0.05,
});
const matDarkBeige = new THREE.MeshStandardMaterial({
  color: "#c4b8a4", roughness: 0.6, metalness: 0.06,
});
const matBezel = new THREE.MeshStandardMaterial({
  color: "#3a3430", roughness: 0.45, metalness: 0.15,
});
const matDarkPlastic = new THREE.MeshStandardMaterial({
  color: "#2a2420", roughness: 0.5, metalness: 0.1,
});
const matStand = new THREE.MeshStandardMaterial({
  color: "#b8ab98", roughness: 0.58, metalness: 0.08,
});
const matKeyboardBase = new THREE.MeshStandardMaterial({
  color: "#c8bca8", roughness: 0.55, metalness: 0.06,
});
const matVent = new THREE.MeshStandardMaterial({
  color: "#2a2420", roughness: 0.9, metalness: 0.02,
});
const matLED = new THREE.MeshStandardMaterial({
  color: "#10b981", roughness: 0.2, metalness: 0.1,
  emissive: "#10b981", emissiveIntensity: 1.5,
});
const matKeycap = new THREE.MeshStandardMaterial({
  color: "#e8e0d4", roughness: 0.45, metalness: 0.04,
});
const matDesk = new THREE.MeshStandardMaterial({
  color: "#2a2220", roughness: 0.7, metalness: 0.02,
});
const matKeycapActive = new THREE.MeshStandardMaterial({
  color: "#8b5cf6", roughness: 0.3, metalness: 0.1,
  emissive: "#8b5cf6", emissiveIntensity: 1.4,
});

/* ============================================
   Loading screen
   ============================================ */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center fullscreen>
      <div className="flex flex-col items-center gap-3 bg-bg-primary/70 p-8 rounded-xl">
        <div className="w-10 h-10 rounded-full border-2 border-accent-violet border-t-transparent animate-spin" />
        <span className="text-sm text-text-muted font-mono">
          {progress < 100 ? `Loading 3D... ${Math.round(progress)}%` : "Ready"}
        </span>
      </div>
    </Html>
  );
}

/* ============================================
   Single Keycap mesh
   ============================================ */
function Keycap({
  label,
  width,
  x,
  z,
  active,
  onTap,
}: {
  label: string;
  width: number;
  x: number;
  z: number;
  active: boolean;
  onTap: (label: string) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const baseY = 0.085; // sits on keyboard plate

  useFrame(() => {
    if (!ref.current) return;
    const targetY = active ? baseY - 0.04 : baseY;
    ref.current.position.y += (targetY - ref.current.position.y) * 0.35;
  });

  return (
    <RoundedBox
      ref={ref}
      args={[width - 0.015, 0.07, 0.135]}
      radius={0.015}
      position={[x + width / 2, baseY, z]}
      material={active ? matKeycapActive : matKeycap}
      castShadow
      onClick={(e) => {
        e.stopPropagation();
        onTap(label);
      }}
    />
  );
}

/* ============================================
   Full Keyboard with individual keys
   ============================================ */
function Keyboard3D({
  pressedKey,
  onTap,
}: {
  pressedKey: string | null;
  onTap: (label: string) => void;
}) {
  const zRows = useMemo(() => [-0.48, -0.30, -0.12, 0.08, 0.28, 0.46], []);
  const staggerOffsets = useMemo(
    () => [1.5, 1.55, 1.2, 1.05, 0.85, 0.75],
    [],
  );

  return (
    <group rotation-x={THREE.MathUtils.degToRad(18)} position={[0, -1.6, 1.8]}>
      {/* Base plate */}
      <RoundedBox
        args={[3.2, 0.1, 1.3]}
        radius={0.04}
        material={matKeyboardBase}
        castShadow
        receiveShadow
      />
      {/* Bottom front edge */}
      <mesh
        position={[0, -0.09, 0.62]}
        material={matDarkBeige}
        castShadow
      >
        <boxGeometry args={[3.2, 0.22, 0.14]} />
      </mesh>
      {/* Keycaps */}
      {KEY_ROWS.map((row, ri) => {
        let xCursor = -staggerOffsets[ri];
        const zRow = zRows[ri];
        return row.map(({ label, w: keyW }) => {
          const kw = keyW * 0.155;
          const keyX = xCursor;
          xCursor += kw + 0.01;
          const active = pressedKey === label;
          return (
            <Keycap
              key={`${ri}-${label}-${keyX}`}
              label={label}
              width={kw}
              x={keyX}
              z={zRow}
              active={active}
              onTap={onTap}
            />
          );
        });
      })}
    </group>
  );
}

/* ============================================
   CRT Monitor
   ============================================ */
function CRTMonitor({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  const ledRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ledRef.current) return;
    const intensity = 1.2 + Math.sin(clock.elapsedTime * 2.5) * 0.4;
    (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      intensity;
  });

  return (
    <group position={[0, 1.5, 0.2]}>
      {/* ── Main chassis ── */}
      <RoundedBox
        args={[3.6, 2.7, 2.2]}
        radius={0.15}
        material={matBeige}
        castShadow
        receiveShadow
      />

      {/* ── Panel seam lines ── */}
      <mesh position={[0, 0.48, 1.14]}>
        <boxGeometry args={[2.6, 0.015, 0.04]} />
        <meshStandardMaterial color="#b0a090" roughness={0.9} />
      </mesh>

      {/* ── Outer bezel ── */}
      <RoundedBox
        args={[2.7, 2.1, 0.12]}
        radius={0.06}
        position={[0, 0, 1.1]}
        material={matBezel}
        castShadow
      />

      {/* ── Inner bezel ── */}
      <mesh position={[0, 0, 1.17]}>
        <boxGeometry args={[2.5, 1.9, 0.06]} />
        <primitive object={matDarkPlastic} attach="material" />
      </mesh>

      {/* ── Screen plane (the anchor for Html) ── */}
      <mesh position={[0, 0, 1.21]}>
        <planeGeometry args={[2.35, 1.75]} />
        <meshStandardMaterial
          color="#0d220d"
          roughness={0.55}
          metalness={0.02}
          emissive="#8bff8b"
          emissiveIntensity={0.12}
        />
        {/* Terminal DOM rendered onto the screen */}
        <Html
          transform
          occlude={false}
          position={[0, 0, 0.01]}
          scale={[2.35, 1.75, 1]}
          style={{
            width: "512px",
            height: "384px",
            background: "transparent",
            pointerEvents: focused ? "auto" : "none",
          }}
        >
          {children}
        </Html>
      </mesh>

      {/* ── Top ventilation slots ── */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh
          key={`vent-${i}`}
          position={[-1.4 + i * 0.165, 1.35, 0]}
          material={matVent}
          castShadow
        >
          <boxGeometry args={[0.08, 0.02, 0.6]} />
        </mesh>
      ))}

      {/* ── Floppy drive slot ── */}
      <mesh position={[0, -0.42, 1.19]}>
        <boxGeometry args={[0.7, 0.04, 0.03]} />
        <primitive object={matDarkPlastic} attach="material" />
      </mesh>
      <mesh position={[0, -0.42, 1.205]}>
        <boxGeometry args={[0.64, 0.015, 0.01]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} />
      </mesh>

      {/* ── Floppy activity LED ── */}
      <mesh
        position={[0.42, -0.42, 1.19]}
        rotation-x={Math.PI / 2}
      >
        <cylinderGeometry args={[0.025, 0.025, 0.015, 8]} />
        <meshStandardMaterial
          color="#ff8c00"
          roughness={0.2}
          emissive="#ff8c00"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* ── Power LED ── */}
      <mesh
        ref={ledRef}
        position={[1.45, -1.15, 1.17]}
        rotation-x={Math.PI / 2}
      >
        <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
        <primitive object={matLED} attach="material" />
      </mesh>

      {/* ── Brand badge ── */}
      <mesh position={[0, -1.1, 1.2]}>
        <boxGeometry args={[0.5, 0.12, 0.03]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ── Focus glow (visible when focused) ── */}
      {focused && (
        <mesh position={[0, 0, 1.23]}>
          <planeGeometry args={[2.5, 1.9]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

/* ============================================
   Monitor Stand
   ============================================ */
function MonitorStand() {
  return (
    <group position={[0, 0, 0.2]}>
      <mesh position={[0, 0.3, 0]} material={matStand} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.6, 12]} />
      </mesh>
      <mesh position={[0, 0.05, 0]} material={matStand} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.15, 24]} />
      </mesh>
    </group>
  );
}

/* ============================================
   Scene content (inside Canvas)
   ============================================ */
interface SceneContentProps extends TerminalState {
  setInput: (v: string) => void;
  submit: () => void;
  handleKeyDown: (e: KeyboardEvent) => string | null;
  focus: () => void;
  blur: () => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

function SceneContent({
  history,
  input,
  focused,
  setInput,
  submit,
  handleKeyDown,
  focus,
  blur,
  bottomRef,
}: SceneContentProps) {
  const controlsRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const pointerDown = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  /* ── OrbitControls config ── */
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(7, 4.2, 9.5);
    camera.lookAt(0, 0.35, 0);
  }, [camera]);

  /* ── Global keyboard capture (only when focused) ── */
  useEffect(() => {
    if (!focused) return;

    function onKeyDown(e: KeyboardEvent) {
      // Don't trap browser navigation keys
      if (
        e.code === "Tab" ||
        (e.code.startsWith("Arrow") && !e.ctrlKey && !e.metaKey && !e.altKey)
      ) {
        blur();
        return;
      }

      // Escape unfocuses
      if (e.code === "Escape") {
        blur();
        return;
      }

      // Animate the 3D key
      const label = codeToLabel(e.code);
      setPressedKey(label);
      setTimeout(() => setPressedKey(null), 160);

      // For printable chars, append to input
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setInput((inputRef.current?.value ?? "") + e.key);
        return;
      }

      // For Enter, Backspace, arrows — delegate to terminal logic
      if (e.key === "Enter" || e.key === "Backspace" || e.key.startsWith("Arrow")) {
        e.preventDefault();
        const result = handleKeyDown(e);
        if (result) {
          setPressedKey(result);
          setTimeout(() => setPressedKey(null), 160);
        }
        // Handle backspace in input
        if (e.key === "Backspace") {
          const inp = inputRef.current;
          if (inp) {
            const val = inp.value.slice(0, -1);
            inp.value = val;
            setInput(val);
          }
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focused, blur, setInput, handleKeyDown]);

  /* ── Focus the hidden input when focused ── */
  useEffect(() => {
    if (focused) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [focused]);

  /* ── Click-to-focus with drag detection ── */
  const handlePointerDown = useCallback(
    (e: any) => {
      pointerDown.current = { x: e.clientX, y: e.clientY };
      isDragging.current = false;
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: any) => {
      if (!pointerDown.current) return;
      const dx = e.clientX - pointerDown.current.x;
      const dy = e.clientY - pointerDown.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 3 && !isDragging.current) {
        // It's a click, not a drag
        focus();
      }
      pointerDown.current = null;
    },
    [focus],
  );

  /* ── Track orbit dragging ── */
  const handlePointerMove = useCallback(() => {
    if (pointerDown.current) {
      isDragging.current = true;
    }
  }, []);

  /* ── Tap on a 3D key (mobile / click-to-type) ── */
  const handleKeyTap = useCallback(
    (label: string) => {
      if (!focused) focus();

      setPressedKey(label);
      setTimeout(() => setPressedKey(null), 160);

      // Inject the character
      if (label === "SPACE") {
        setInput((inputRef.current?.value ?? "") + " ");
      } else if (label === "BKS") {
        const val = (inputRef.current?.value ?? "").slice(0, -1);
        if (inputRef.current) inputRef.current.value = val;
        setInput(val);
      } else if (label === "ENTER") {
        submit();
      } else if (label.length === 1) {
        setInput((inputRef.current?.value ?? "") + label);
      }
    },
    [focused, focus, setInput, submit],
  );

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* ── Lighting ── */}
      <ambientLight intensity={1.4} color="#445566" />
      <directionalLight
        position={[8, 14, 6]}
        intensity={5}
        color="#ffeedd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-5, 3, -2]} intensity={1.6} color="#8899cc" />
      <directionalLight position={[0, 1.5, -6]} intensity={2.2} color="#ffccaa" />
      <pointLight position={[1, 1.8, 3.5]} intensity={4} color="#8b5cf6" distance={8} />
      <pointLight position={[0, -0.2, 2]} intensity={3} color="#10b981" distance={6} />
      <pointLight position={[0, 0.8, 1.8]} intensity={2.5} color="#7aff7a" distance={4} />

      {/* ── Environment / shadows ── */}
      <ContactShadows
        position={[0, -2.34, 0]}
        opacity={0.35}
        scale={14}
        blur={2.5}
        far={5}
      />

      {/* ── Desk ── */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -2.35, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <primitive object={matDesk} attach="material" />
      </mesh>

      {/* ── Models ── */}
      <MonitorStand />
      <CRTMonitor focused={focused}>
        <TerminalUI
          history={history}
          input={input}
          focused={focused}
          setInput={setInput}
          submit={submit}
          inputRef={inputRef}
          bottomRef={bottomRef}
        />
      </CRTMonitor>
      <Keyboard3D pressedKey={pressedKey} onTap={handleKeyTap} />

      {/* ── Orbit Controls ── */}
      <OrbitControls
        ref={controlsRef}
        target={[0, 0.35, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={18}
        maxPolarAngle={Math.PI * 0.7}
        minPolarAngle={0.2}
        autoRotate
        autoRotateSpeed={0.4}
        makeDefault
      />
    </group>
  );
}

/* ============================================
   Terminal UI (DOM, rendered via Html)
   ============================================ */
function TerminalUI({
  history,
  input,
  focused,
  setInput,
  submit,
  inputRef,
  bottomRef,
}: {
  history: CmdEntry[];
  input: string;
  focused: boolean;
  setInput: (v: string) => void;
  submit: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className="h-full w-full font-mono text-[10px] leading-relaxed p-3 overflow-hidden flex flex-col select-none"
      style={{
        fontFamily: "var(--font-mono), 'Courier New', monospace",
        color: "#8bff8b",
        textShadow:
          "0 0 4px rgba(139,255,139,0.55), 0 0 10px rgba(139,255,139,0.18)",
        background: "radial-gradient(ellipse at 55% 40%, #0d220d, #020a02 80%)",
        pointerEvents: focused ? "auto" : "none",
      }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)",
        }}
      />

      {/* CRT vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 95%)",
        }}
      />

      {/* Terminal content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {history.map((entry, i) => (
          <div key={i} className="mb-0.5">
            {entry.type === "input" ? (
              <div className="flex gap-1">
                <span style={{ color: "#c4b5fd" }}>C:\&gt;</span>
                <span style={{ color: "#e2e8f0" }}>
                  {entry.text.replace("C:\\> ", "")}
                </span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap" style={{ color: "#8bff8b" }}>
                {entry.text}
              </div>
            )}
          </div>
        ))}
        {/* Input line */}
        <div className="flex gap-1 mt-0.5">
          <span style={{ color: "#c4b5fd", flexShrink: 0 }}>C:\&gt;</span>
          <span style={{ color: "#e2e8f0" }}>
            {input}
            {focused && (
              <span
                className="inline-block w-[6px] h-[13px] align-middle ml-[1px]"
                style={{
                  backgroundColor: "var(--color-accent-emerald)",
                  boxShadow: "0 0 6px var(--color-accent-emerald)",
                  animation: "blink 1s step-end infinite",
                }}
              />
            )}
          </span>
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Focus hint overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        {!focused && (
          <span
            className="text-[11px] px-3 py-1 rounded-full animate-pulse"
            style={{
              color: "#8bff8b",
              background: "rgba(0,0,0,0.55)",
              textShadow: "0 0 6px rgba(139,255,139,0.5)",
            }}
          >
            Click to type
          </span>
        )}
        {focused && (
          <span
            className="absolute bottom-2 right-3 text-[9px] opacity-50"
            style={{ color: "#94a3b8" }}
          >
            Esc to exit
          </span>
        )}
      </div>

      {/* Hidden input — only rendered when focused, captures keystrokes */}
      {focused && (
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal input"
        />
      )}
    </div>
  );
}

/* ============================================
   Main exported component
   ============================================ */
interface RetroComputerR3FProps extends TerminalState {
  setInput: (v: string) => void;
  submit: () => void;
  handleKeyDown: (e: KeyboardEvent) => string | null;
  focus: () => void;
  blur: () => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export default function RetroComputerR3F(props: RetroComputerR3FProps) {
  const [webGLAvailable, setWebGLAvailable] = useState(true);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) throw new Error("No WebGL");
    } catch {
      setWebGLAvailable(false);
    }
  }, []);

  if (!webGLAvailable) {
    return null; // caller falls back to flat terminal
  }

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{ aspectRatio: "1 / 0.8", maxHeight: 600 }}
    >
      <Canvas
        shadows="soft"
        camera={{ position: [7, 4.2, 9.5], fov: 40, near: 0.1, far: 80 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ background: "#0b1121" }}
        eventPrefix="client"
      >
        <Suspense fallback={<Loader />}>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
