"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  RoundedBox,
  ContactShadows,
  useProgress,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

/* ============================================
   CuratedWorkspace — photorealistic static 3D
   CRT monitor + retro console + desk lamp
   + books + posters + LED displays + handhelds
   Warm lighting, straight-on symmetrical view
   ============================================ */

/* ── Loading screen ── */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center fullscreen>
      <div className="flex flex-col items-center gap-3 bg-bg-primary/80 p-8 rounded-xl">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <span className="text-sm text-amber-200/80 font-mono">
          Rendering workspace... {Math.round(progress)}%
        </span>
      </div>
    </Html>
  );
}

/* ============================================
   Shared Materials (warm palette)
   ============================================ */
const matWall = new THREE.MeshStandardMaterial({
  color: "#3a3028", roughness: 0.85, metalness: 0,
});
const matFloor = new THREE.MeshStandardMaterial({
  color: "#2a2218", roughness: 0.75, metalness: 0.02,
});
const matDesk = new THREE.MeshStandardMaterial({
  color: "#4a3628", roughness: 0.55, metalness: 0.04,
});
const matDeskEdge = new THREE.MeshStandardMaterial({
  color: "#3a2818", roughness: 0.5, metalness: 0.06,
});
const matBeige = new THREE.MeshStandardMaterial({
  color: "#d4cbb8", roughness: 0.52, metalness: 0.04,
});
const matDarkBeige = new THREE.MeshStandardMaterial({
  color: "#c4b8a4", roughness: 0.58, metalness: 0.05,
});
const matBezel = new THREE.MeshStandardMaterial({
  color: "#3a3430", roughness: 0.42, metalness: 0.12,
});
const matDarkPlastic = new THREE.MeshStandardMaterial({
  color: "#2a2420", roughness: 0.48, metalness: 0.08,
});
const matStand = new THREE.MeshStandardMaterial({
  color: "#b0a490", roughness: 0.56, metalness: 0.06,
});
const matLampBase = new THREE.MeshStandardMaterial({
  color: "#3a3028", roughness: 0.35, metalness: 0.4,
});
const matLampShade = new THREE.MeshStandardMaterial({
  color: "#e8d8b0", roughness: 0.3, metalness: 0.08,
});
const matLampInner = new THREE.MeshStandardMaterial({
  color: "#fff8e8", roughness: 0.15, metalness: 0,
  emissive: "#ffe8c0", emissiveIntensity: 0.9,
});
const matLampBulb = new THREE.MeshStandardMaterial({
  color: "#fff8e0", roughness: 0.1, metalness: 0,
  emissive: "#ffe8c0", emissiveIntensity: 2.5,
});
const matConsole = new THREE.MeshStandardMaterial({
  color: "#8888a0", roughness: 0.4, metalness: 0.2,
});
const matConsoleDark = new THREE.MeshStandardMaterial({
  color: "#3a3a48", roughness: 0.35, metalness: 0.15,
});
const matController = new THREE.MeshStandardMaterial({
  color: "#777790", roughness: 0.45, metalness: 0.18,
});
const matControllerBtn = new THREE.MeshStandardMaterial({
  color: "#cc3344", roughness: 0.3, metalness: 0.05,
});
const matBookCover1 = new THREE.MeshStandardMaterial({
  color: "#8b2500", roughness: 0.6, metalness: 0.02,
});
const matBookCover2 = new THREE.MeshStandardMaterial({
  color: "#1a3a5c", roughness: 0.55, metalness: 0.03,
});
const matBookCover3 = new THREE.MeshStandardMaterial({
  color: "#2a5a2a", roughness: 0.6, metalness: 0.02,
});
const matBookPages = new THREE.MeshStandardMaterial({
  color: "#f0ead8", roughness: 0.7, metalness: 0,
});
const matPosterFrame = new THREE.MeshStandardMaterial({
  color: "#2a2218", roughness: 0.5, metalness: 0.08,
});
const matLEDHousing = new THREE.MeshStandardMaterial({
  color: "#1a1a24", roughness: 0.4, metalness: 0.3,
});
const matLEDScreen = new THREE.MeshStandardMaterial({
  color: "#0a0a0a", roughness: 0.2, metalness: 0.1,
  emissive: "#ff4422", emissiveIntensity: 0.8,
});
const matHandheldBody = new THREE.MeshStandardMaterial({
  color: "#ccd0d8", roughness: 0.4, metalness: 0.15,
});
const matHandheldScreen = new THREE.MeshStandardMaterial({
  color: "#8bac0f", roughness: 0.25, metalness: 0.05,
  emissive: "#8bac0f", emissiveIntensity: 0.3,
});
const matHandheldBtn = new THREE.MeshStandardMaterial({
  color: "#882244", roughness: 0.3, metalness: 0.05,
});
const matSideTable = new THREE.MeshStandardMaterial({
  color: "#3a2a1a", roughness: 0.5, metalness: 0.05,
});
const matSideTableLeg = new THREE.MeshStandardMaterial({
  color: "#2a1a0a", roughness: 0.55, metalness: 0.08,
});

/* ============================================
   CRT Screen CanvasTexture (code editor)
   ============================================ */
function createCRTScreenTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 480;
  const ctx = c.getContext("2d")!;

  // Editor background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, 640, 480);

  // Title bar
  ctx.fillStyle = "#2a2a3e";
  ctx.fillRect(0, 0, 640, 28);
  ctx.fillStyle = "#8899aa";
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText("C:\\ hl_playground_terminal >", 10, 19);

  // Line numbers background
  ctx.fillStyle = "#1e1e32";
  ctx.fillRect(0, 28, 36, 452);

  // Code content — syntax highlighted
  const lines: { text: string; color: string }[][] = [
    [
      { text: "  1", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "import", color: "#c678dd" },
      { text: " ", color: "#ccc" },
      { text: "{", color: "#abb2bf" },
      { text: " useTerminal ", color: "#e5c07b" },
      { text: "}", color: "#abb2bf" },
      { text: " ", color: "#ccc" },
      { text: "from", color: "#c678dd" },
      { text: " ", color: "#ccc" },
      { text: "'@/hooks/useTerminal'", color: "#98c379" },
    ],
    [
      { text: "  2", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "import", color: "#c678dd" },
      { text: " ", color: "#ccc" },
      { text: "RetroComputer", color: "#e5c07b" },
      { text: " ", color: "#ccc" },
      { text: "from", color: "#c678dd" },
      { text: " ", color: "#ccc" },
      { text: "'./RetroComputerR3F'", color: "#98c379" },
    ],
    [
      { text: "  3", color: "#555566" },
    ],
    [
      { text: "  4", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "export", color: "#c678dd" },
      { text: " ", color: "#ccc" },
      { text: "default", color: "#c678dd" },
      { text: " ", color: "#ccc" },
      { text: "function", color: "#c678dd" },
      { text: " ", color: "#ccc" },
      { text: "Playground", color: "#61afef" },
      { text: "() {", color: "#abb2bf" },
    ],
    [
      { text: "  5", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "const", color: "#c678dd" },
      { text: " terminal ", color: "#e5c07b" },
      { text: "= useTerminal()", color: "#abb2bf" },
    ],
    [
      { text: "  6", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "const", color: "#c678dd" },
      { text: " [focused, setFocused] ", color: "#e5c07b" },
      { text: "= useState(false)", color: "#abb2bf" },
    ],
    [
      { text: "  7", color: "#555566" },
    ],
    [
      { text: "  8", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "// Terminal commands: help, about,", color: "#5c6370" },
    ],
    [
      { text: "  9", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "// skills, projects, contact, clear", color: "#5c6370" },
    ],
    [
      { text: " 10", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "return", color: "#c678dd" },
      { text: " (", color: "#abb2bf" },
    ],
    [
      { text: " 11", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "<Canvas>", color: "#e06c75" },
    ],
    [
      { text: " 12", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "<RetroComputer />", color: "#e06c75" },
    ],
    [
      { text: " 13", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: "</Canvas>", color: "#e06c75" },
    ],
    [
      { text: " 14", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "  ", color: "#ccc" },
      { text: ");", color: "#abb2bf" },
    ],
    [
      { text: " 15", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "}", color: "#abb2bf" },
    ],
    [
      { text: " 16", color: "#555566" },
    ],
    [
      { text: " 17", color: "#555566" },
      { text: "  ", color: "#ccc" },
      { text: "// C:\\ hl_playground_terminal > _", color: "#5c6370" },
    ],
  ];

  ctx.font = '12px "Courier New", monospace';
  lines.forEach((segments, i) => {
    const y = 46 + i * 18;
    let x = 4;
    segments.forEach(({ text, color }) => {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width;
    });
  });

  // Cursor blink
  ctx.fillStyle = "#528bff";
  ctx.fillRect(4 + ctx.measureText("  // C:\\ hl_playground_terminal > ").width, 46 + 16 * 18 - 12, 8, 14);

  // Subtle scanlines
  ctx.fillStyle = "rgba(0,0,0,0.03)";
  for (let y = 0; y < 480; y += 2) ctx.fillRect(0, y, 640, 1);

  // Screen edge vignette
  const vg = ctx.createRadialGradient(320, 240, 200, 320, 240, 380);
  vg.addColorStop(0, "transparent");
  vg.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, 640, 480);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function createPosterAnonTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 320;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#1a1a1a"; ctx.fillRect(0, 0, 256, 320);
  // Stylized Anonymous mask
  ctx.fillStyle = "#f0ead8";
  // Face shape
  ctx.beginPath(); ctx.ellipse(128, 140, 70, 95, 0, 0, Math.PI * 2); ctx.fill();
  // Eyes
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath(); ctx.ellipse(100, 120, 16, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(156, 120, 16, 22, 0, 0, Math.PI * 2); ctx.fill();
  // Mouth (subtle smirk)
  ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(128, 170, 22, 0.1, Math.PI - 0.1); ctx.stroke();
  // Cheek contours
  ctx.strokeStyle = "#d8ccc0"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(70, 140); ctx.quadraticCurveTo(85, 160, 100, 155); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(186, 140); ctx.quadraticCurveTo(171, 160, 156, 155); ctx.stroke();
  // Beard suggestion
  ctx.fillStyle = "#d8c8b0";
  ctx.beginPath(); ctx.ellipse(128, 200, 50, 30, 0, 0, Math.PI * 2); ctx.fill();
  // Text
  ctx.fillStyle = "#4a4"; ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillText("ANONYMOUS", 28, 270);
  ctx.fillStyle = "#aaa"; ctx.font = '12px "Courier New", monospace';
  ctx.fillText("WE ARE LEGION", 62, 295);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

function createPosterHackathonTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 320;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0a0a14"; ctx.fillRect(0, 0, 256, 320);
  // Neon grid
  ctx.strokeStyle = "rgba(0,255,200,0.12)"; ctx.lineWidth = 0.5;
  for (let x = 0; x < 256; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 320); ctx.stroke(); }
  for (let y = 0; y < 320; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke(); }
  // Glitch text
  ctx.fillStyle = "#00ffc8"; ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillText("HACK", 28, 100);
  ctx.fillStyle = "#ff4488"; ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillText("ATHON", 24, 160);
  // Offset glitch copy
  ctx.fillStyle = "rgba(0,255,200,0.25)"; ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillText("HACK", 34, 98);
  // Subtitle
  ctx.fillStyle = "#fff"; ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillText("BUILD  •  SHIP  •  REPEAT", 10, 220);
  ctx.fillStyle = "#00ffc8"; ctx.font = '11px "Courier New", monospace';
  ctx.fillText("36 HOURS  |  04.12.2025", 30, 255);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

/* ============================================
   CRT Monitor model
   ============================================ */
function CRTMonitor() {
  const screenTex = useMemo(() => createCRTScreenTexture(), []);

  return (
    <group position={[0, 0.85, -0.3]}>
      {/* Chassis */}
      <RoundedBox args={[2.2, 1.8, 1.6]} radius={0.1} material={matBeige} castShadow receiveShadow />
      {/* Bezel */}
      <RoundedBox args={[1.7, 1.4, 0.08]} radius={0.04} position={[0, 0.05, 0.8]} material={matBezel} castShadow />
      {/* Inner bezel */}
      <mesh position={[0, 0.05, 0.85]}>
        <boxGeometry args={[1.55, 1.25, 0.04]} />
        <primitive object={matDarkPlastic} attach="material" />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.05, 0.88]}>
        <planeGeometry args={[1.45, 1.15]} />
        <meshStandardMaterial map={screenTex} roughness={0.5} metalness={0.02} emissive="#88aaff" emissiveIntensity={0.08} emissiveMap={screenTex} />
      </mesh>
      {/* Top vents */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[-0.85 + i * 0.155, 0.9, 0]} castShadow>
          <boxGeometry args={[0.07, 0.015, 0.35]} />
          <meshStandardMaterial color="#2a2420" roughness={0.9} />
        </mesh>
      ))}
      {/* Power LED */}
      <mesh position={[0.85, -0.78, 0.84]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.02, 0.02, 0.015, 8]} />
        <meshStandardMaterial color="#10b981" roughness={0.2} emissive="#10b981" emissiveIntensity={1.2} />
      </mesh>
      {/* Floppy slot */}
      <mesh position={[0, -0.25, 0.86]}>
        <boxGeometry args={[0.5, 0.03, 0.02]} />
        <primitive object={matDarkPlastic} attach="material" />
      </mesh>
    </group>
  );
}

/* ============================================
   Desk Lamp
   ============================================ */
function DeskLamp() {
  return (
    <group position={[1.8, -0.1, -0.5]}>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} material={matLampBase} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.06, 24]} />
      </mesh>
      {/* Arm lower */}
      <mesh position={[0, 0.4, 0]} material={matLampBase} castShadow>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
      </mesh>
      {/* Arm upper (angled) */}
      <group position={[0, 0.75, 0]} rotation-z={0.4}>
        <mesh position={[0.2, 0.15, 0]} material={matLampBase} castShadow>
          <boxGeometry args={[0.05, 0.5, 0.05]} />
        </mesh>
        {/* Shade joint */}
        <mesh position={[0.4, 0.4, 0]} material={matLampBase}>
          <sphereGeometry args={[0.06, 8, 8]} />
        </mesh>
        {/* Shade */}
        <group position={[0.4, 0.4, 0]} rotation-z={0.5}>
          <mesh material={matLampShade} castShadow>
            <coneGeometry args={[0.28, 0.35, 16, 1, true]} />
          </mesh>
          {/* Inner glow */}
          <mesh position={[0, 0.05, 0]} material={matLampInner}>
            <circleGeometry args={[0.25, 16]} />
          </mesh>
          {/* Bulb */}
          <mesh position={[0, 0.08, 0]} material={matLampBulb}>
            <sphereGeometry args={[0.08, 8, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ============================================
   Retro Console (NES-style) + Controller
   ============================================ */
function RetroConsole() {
  return (
    <group position={[1.3, 0.02, -0.6]}>
      {/* Console body */}
      <RoundedBox args={[0.9, 0.12, 0.6]} radius={0.03} material={matConsole} castShadow receiveShadow />
      {/* Cartridge slot */}
      <mesh position={[0, 0.09, -0.1]}>
        <boxGeometry args={[0.5, 0.03, 0.3]} />
        <primitive object={matConsoleDark} attach="material" />
      </mesh>
      {/* Power + Reset buttons */}
      <mesh position={[-0.25, 0.07, 0.2]} material={matControllerBtn} castShadow>
        <boxGeometry args={[0.12, 0.025, 0.08]} />
      </mesh>
      <mesh position={[0.25, 0.07, 0.2]}>
        <boxGeometry args={[0.12, 0.025, 0.08]} />
        <meshStandardMaterial color="#444" roughness={0.3} />
      </mesh>
      {/* Controller */}
      <group position={[0.55, 0.05, 0]}>
        {/* Body */}
        <RoundedBox args={[0.3, 0.05, 0.22]} radius={0.04} material={matController} castShadow />
        {/* D-pad */}
        <mesh position={[-0.08, 0.03, 0]} material={matConsoleDark} castShadow>
          <boxGeometry args={[0.06, 0.015, 0.06]} />
        </mesh>
        {/* A/B buttons */}
        <mesh position={[0.08, 0.035, -0.04]} material={matControllerBtn}>
          <cylinderGeometry args={[0.022, 0.022, 0.015, 12]} />
        </mesh>
        <mesh position={[0.08, 0.035, 0.04]}>
          <cylinderGeometry args={[0.022, 0.022, 0.015, 12]} />
          <meshStandardMaterial color="#cc3344" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/* ============================================
   Books stack
   ============================================ */
function Books() {
  const covers = [matBookCover1, matBookCover2, matBookCover3];
  return (
    <group position={[-1.6, 0.0, -0.5]}>
      {covers.map((mat, i) => (
        <group key={i} position={[0, 0.04 + i * 0.08, i * 0.02]}>
          {/* Cover */}
          <RoundedBox args={[0.45, 0.07, 0.3]} radius={0.015} material={mat} castShadow receiveShadow />
          {/* Pages (slight offset) */}
          <mesh position={[0, 0.002, 0.02]}>
            <boxGeometry args={[0.43, 0.05, 0.02]} />
            <primitive object={matBookPages} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ============================================
   Wall Posters
   ============================================ */
function Posters() {
  const texAnon = useMemo(() => createPosterAnonTexture(), []);
  const texHack = useMemo(() => createPosterHackathonTexture(), []);

  return (
    <group>
      {/* Anonymous poster (left) */}
      <group position={[-1.6, 2.6, -3.0]}>
        <mesh material={matPosterFrame} castShadow>
          <boxGeometry args={[0.55, 0.7, 0.03]} />
        </mesh>
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[0.48, 0.62]} />
          <meshStandardMaterial map={texAnon} roughness={0.7} />
        </mesh>
      </group>
      {/* Hackathon poster (right) */}
      <group position={[1.6, 2.6, -3.0]}>
        <mesh material={matPosterFrame} castShadow>
          <boxGeometry args={[0.55, 0.7, 0.03]} />
        </mesh>
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[0.48, 0.62]} />
          <meshStandardMaterial map={texHack} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

/* ============================================
   Side Tables + LED Display + Handheld Console
   ============================================ */
function SideTableLeft() {
  return (
    <group position={[-2.2, -0.5, 0.4]}>
      {/* Table top */}
      <RoundedBox args={[0.7, 0.06, 0.5]} radius={0.03} material={matSideTable} castShadow receiveShadow />
      {/* Legs */}
      {[[-0.28, -0.35, -0.18], [0.28, -0.35, -0.18], [-0.28, -0.35, 0.18], [0.28, -0.35, 0.18]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} material={matSideTableLeg} castShadow>
          <boxGeometry args={[0.05, 0.6, 0.05]} />
        </mesh>
      ))}
      {/* LED Digit Display */}
      <group position={[0, 0.06, 0.05]}>
        <RoundedBox args={[0.35, 0.08, 0.18]} radius={0.02} material={matLEDHousing} castShadow />
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[0.28, 0.04, 0.02]} />
          <primitive object={matLEDScreen} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

function SideTableRight() {
  return (
    <group position={[2.2, -0.5, 0.4]}>
      {/* Table top */}
      <RoundedBox args={[0.7, 0.06, 0.5]} radius={0.03} material={matSideTable} castShadow receiveShadow />
      {/* Legs */}
      {[[-0.28, -0.35, -0.18], [0.28, -0.35, -0.18], [-0.28, -0.35, 0.18], [0.28, -0.35, 0.18]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} material={matSideTableLeg} castShadow>
          <boxGeometry args={[0.05, 0.6, 0.05]} />
        </mesh>
      ))}
      {/* Handheld Console (Game Boy style) */}
      <group position={[0, 0.06, 0.02]} rotation-y={0.2}>
        <RoundedBox args={[0.26, 0.04, 0.34]} radius={0.04} material={matHandheldBody} castShadow />
        {/* Screen */}
        <mesh position={[0, 0.025, -0.04]}>
          <boxGeometry args={[0.18, 0.02, 0.16]} />
          <primitive object={matHandheldScreen} attach="material" />
        </mesh>
        {/* D-pad */}
        <mesh position={[-0.06, 0.03, 0.08]}>
          <boxGeometry args={[0.04, 0.012, 0.04]} />
          <meshStandardMaterial color="#333" roughness={0.3} />
        </mesh>
        {/* A/B buttons */}
        <mesh position={[0.06, 0.035, 0.07]} material={matHandheldBtn}>
          <cylinderGeometry args={[0.015, 0.015, 0.01, 10]} />
        </mesh>
        <mesh position={[0.08, 0.035, 0.1]}>
          <cylinderGeometry args={[0.015, 0.015, 0.01, 10]} />
          <meshStandardMaterial color="#882244" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/* ============================================
   Desk surface
   ============================================ */
function Desk() {
  return (
    <group position={[0, -0.2, -0.3]}>
      {/* Main desktop */}
      <RoundedBox args={[4.2, 0.1, 2.0]} radius={0.05} material={matDesk} castShadow receiveShadow />
      {/* Front edge bevel */}
      <mesh position={[0, -0.06, 1.0]} material={matDeskEdge} castShadow>
        <boxGeometry args={[4.2, 0.04, 0.06]} />
      </mesh>
      {/* Desk legs */}
      {[[-1.9, -0.65, -0.85], [1.9, -0.65, -0.85], [-1.9, -0.65, 0.85], [1.9, -0.65, 0.85]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} material={matSideTableLeg} castShadow>
          <boxGeometry args={[0.08, 1.1, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================
   Monitor Stand
   ============================================ */
function MonitorStand() {
  return (
    <group position={[0, -0.15, -0.3]}>
      <mesh position={[0, 0.15, 0]} material={matStand} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.35, 12]} />
      </mesh>
      <mesh position={[0, 0.02, 0]} material={matStand} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.5, 0.08, 20]} />
      </mesh>
    </group>
  );
}

/* ============================================
   Wall + Floor
   ============================================ */
function Room() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 1.8, -3.5]} material={matWall} receiveShadow>
        <planeGeometry args={[8, 5.5]} />
      </mesh>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.0, 0]} material={matFloor} receiveShadow>
        <planeGeometry args={[8, 6]} />
      </mesh>
    </group>
  );
}

/* ============================================
   Scene content (inside Canvas)
   ============================================ */
function SceneContent() {
  return (
    <group>
      {/* ── Warm lighting ── */}
      <ambientLight intensity={0.8} color="#332a20" />
      {/* Key light (warm tungsten, from lamp side) */}
      <directionalLight
        position={[4, 5, 2]}
        intensity={4.5}
        color="#ffe8d0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0002}
      />
      {/* Fill light (cooler, opposite side) */}
      <directionalLight position={[-3, 2, -2]} intensity={1.2} color="#8899bb" />
      {/* Lamp point light */}
      <pointLight position={[2.2, 0.65, -0.5]} intensity={6} color="#ffe0b0" distance={3.5} decay={2} />
      {/* Subtle rim light */}
      <directionalLight position={[0, 0.5, -3]} intensity={1.0} color="#bbaa88" />
      {/* Screen glow light (blue-ish from CRT) */}
      <pointLight position={[0, 1.0, -0.1]} intensity={1.5} color="#8899cc" distance={2.5} decay={2} />

      {/* ── Environment ── */}
      <ContactShadows position={[0, -0.98, 0]} opacity={0.3} scale={10} blur={3} far={6} />

      {/* ── Room ── */}
      <Room />

      {/* ── Posters ── */}
      <Posters />

      {/* ── Desk + Monitor ── */}
      <Desk />
      <MonitorStand />
      <CRTMonitor />

      {/* ── Desk accessories ── */}
      <DeskLamp />
      <RetroConsole />
      <Books />

      {/* ── Side tables ── */}
      <SideTableLeft />
      <SideTableRight />
    </group>
  );
}

/* ============================================
   Main exported component
   ============================================ */
export default function CuratedWorkspace() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{ aspectRatio: "16 / 10", maxHeight: 650 }}
    >
      <Canvas
        shadows="soft"
        camera={{
          position: [0, 1.2, 4.5],
          fov: 42,
          near: 0.1,
          far: 30,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        style={{ background: "#1a1410" }}
      >
        <Suspense fallback={<Loader />}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
