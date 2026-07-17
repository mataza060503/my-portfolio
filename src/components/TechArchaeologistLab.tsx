"use client";

import { Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  RoundedBox,
  ContactShadows,
  useProgress,
  Html,
  Text,
} from "@react-three/drei";
import * as THREE from "three";

/* ============================================
   TechArchaeologistLab — cinematic terminal
   playground. Expansive research station with
   multiple CRTs, cable conduits, data walls,
   posters gallery, dissected hardware.
   ============================================ */

/* ── Loading ── */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center fullscreen>
      <div className="flex flex-col items-center gap-3 bg-black/70 p-8 rounded-xl">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <span className="text-sm text-amber-200/80 font-mono">
          INITIALIZING DATA DIG... {Math.round(progress)}%
        </span>
      </div>
    </Html>
  );
}

/* ============================================
   Materials — moody, warm/cool contrast
   ============================================ */
const matWall = new THREE.MeshStandardMaterial({ color: "#2a2520", roughness: 0.9, metalness: 0 });
const matFloor = new THREE.MeshStandardMaterial({ color: "#1a1410", roughness: 0.8, metalness: 0.02 });
const matConcrete = new THREE.MeshStandardMaterial({ color: "#3a3530", roughness: 0.85, metalness: 0 });
const matBeige = new THREE.MeshStandardMaterial({ color: "#d4cbb8", roughness: 0.52, metalness: 0.04 });
const matDarkBeige = new THREE.MeshStandardMaterial({ color: "#c4b8a4", roughness: 0.58, metalness: 0.05 });
const matBezel = new THREE.MeshStandardMaterial({ color: "#3a3430", roughness: 0.42, metalness: 0.12 });
const matDarkPlastic = new THREE.MeshStandardMaterial({ color: "#2a2420", roughness: 0.48, metalness: 0.08 });
const matDesk = new THREE.MeshStandardMaterial({ color: "#4a3628", roughness: 0.55, metalness: 0.04 });
const matDeskEdge = new THREE.MeshStandardMaterial({ color: "#3a2818", roughness: 0.5, metalness: 0.06 });
const matMetal = new THREE.MeshStandardMaterial({ color: "#555560", roughness: 0.35, metalness: 0.55 });
const matMetalDark = new THREE.MeshStandardMaterial({ color: "#3a3a44", roughness: 0.4, metalness: 0.5 });
const matConduit = new THREE.MeshStandardMaterial({ color: "#3a3830", roughness: 0.5, metalness: 0.45 });
const matConduitDark = new THREE.MeshStandardMaterial({ color: "#2a2820", roughness: 0.55, metalness: 0.4 });
const matLamp = new THREE.MeshStandardMaterial({ color: "#3a3028", roughness: 0.35, metalness: 0.4 });
const matLampShade = new THREE.MeshStandardMaterial({ color: "#e8d8b0", roughness: 0.3, metalness: 0.08 });
const matLampBulb = new THREE.MeshStandardMaterial({ color: "#fff8e0", roughness: 0.1, emissive: "#ffe8c0", emissiveIntensity: 2.5 });
const matBook1 = new THREE.MeshStandardMaterial({ color: "#8b2500", roughness: 0.6 });
const matBook2 = new THREE.MeshStandardMaterial({ color: "#1a3a5c", roughness: 0.55 });
const matBook3 = new THREE.MeshStandardMaterial({ color: "#2a5a2a", roughness: 0.6 });
const matBookPages = new THREE.MeshStandardMaterial({ color: "#f0ead8", roughness: 0.7 });
const matMug = new THREE.MeshStandardMaterial({ color: "#e8e0d0", roughness: 0.35, metalness: 0.1 });
const matCoffee = new THREE.MeshStandardMaterial({ color: "#1a0a00", roughness: 0.2 });
const matPCB = new THREE.MeshStandardMaterial({ color: "#1a3a1a", roughness: 0.5, metalness: 0.05 });
const matPCBTrace = new THREE.MeshStandardMaterial({ color: "#c8b878", roughness: 0.2, metalness: 0.6 });
const matChip = new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.3, metalness: 0.1 });
const matPosterFrame = new THREE.MeshStandardMaterial({ color: "#2a2218", roughness: 0.5, metalness: 0.08 });

/* ============================================
   Screen textures
   ============================================ */

function createMainCRTTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 640; c.height = 480;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, 640, 480);

  // Title bar
  ctx.fillStyle = "#161b22"; ctx.fillRect(0, 0, 640, 26);
  ctx.fillStyle = "#58a6ff"; ctx.font = 'bold 10px "Courier New", monospace';
  ctx.fillText("hl> INITIALIZING DATA DIG... [SECTOR 7-A] [NODES: 2048] [LAT: 3.2ms]", 10, 18);

  // Line numbers bg
  ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 26, 34, 454);
  ctx.fillStyle = "#161b22"; ctx.fillRect(34, 26, 1, 454);

  const code = [
    [{ t: "  1", c: "#484f58" }, { t: "  ", c: "#c9d1d9" }, { t: "const", c: "#ff7b72" }, { t: " archaeologist ", c: "#d2a8ff" }, { t: "= new ", c: "#c9d1d9" }, { t: "DataDig", c: "#79c0ff" }, { t: "();", c: "#c9d1d9" }],
    [{ t: "  2", c: "#484f58" }, { t: "  ", c: "#c9d1d9" }, { t: "const", c: "#ff7b72" }, { t: " artifacts ", c: "#d2a8ff" }, { t: "= await ", c: "#c9d1d9" }, { t: "lab", c: "#79c0ff" }, { t: ".", c: "#c9d1d9" }, { t: "scanSector", c: "#d2a8ff" }, { t: "(", c: "#c9d1d9" }, { t: "'7A-FF02'", c: "#a5d6ff" }, { t: ");", c: "#c9d1d9" }],
    [{ t: "  3", c: "#484f58" }],
    [{ t: "  4", c: "#484f58" }, { t: "  ", c: "#c9d1d9" }, { t: "// Deep-scan retro hardware layer", c: "#8b949e" }],
    [{ t: "  5", c: "#484f58" }, { t: "  ", c: "#c9d1d9" }, { t: "for", c: "#ff7b72" }, { t: " (", c: "#c9d1d9" }, { t: "const", c: "#ff7b72" }, { t: " device ", c: "#d2a8ff" }, { t: "of ", c: "#c9d1d9" }, { t: "artifacts", c: "#d2a8ff" }, { t: ") {", c: "#c9d1d9" }],
    [{ t: "  6", c: "#484f58" }, { t: "    ", c: "#c9d1d9" }, { t: "if", c: "#ff7b72" }, { t: " (device.", c: "#c9d1d9" }, { t: "vintage", c: "#79c0ff" }, { t: " > ", c: "#c9d1d9" }, { t: "1995", c: "#a5d6ff" }, { t: ") {", c: "#c9d1d9" }],
    [{ t: "  7", c: "#484f58" }, { t: "      ", c: "#c9d1d9" }, { t: "await ", c: "#c9d1d9" }, { t: "catalog", c: "#d2a8ff" }, { t: "(device.", c: "#c9d1d9" }, { t: "romDump", c: "#79c0ff" }, { t: "());", c: "#c9d1d9" }],
    [{ t: "  8", c: "#484f58" }, { t: "    ", c: "#c9d1d9" }, { t: "}", c: "#c9d1d9" }],
    [{ t: "  9", c: "#484f58" }, { t: "  ", c: "#c9d1d9" }, { t: "}", c: "#c9d1d9" }],
    [{ t: " 10", c: "#484f58" }],
    [{ t: " 11", c: "#484f58" }, { t: "  ", c: "#c9d1d9" }, { t: "console", c: "#79c0ff" }, { t: ".", c: "#c9d1d9" }, { t: "log", c: "#d2a8ff" }, { t: "(", c: "#c9d1d9" }, { t: "'Found '", c: "#a5d6ff" }, { t: " + artifacts.", c: "#c9d1d9" }, { t: "length", c: "#79c0ff" }],
    [{ t: " 12", c: "#484f58" }, { t: "    ", c: "#c9d1d9" }, { t: "+ ' retro devices in sector'", c: "#a5d6ff" }, { t: ");", c: "#c9d1d9" }],
    [{ t: " 13", c: "#484f58" }],
    [{ t: " 14", c: "#484f58" }, { t: "  ", c: "#c9d1d9" }, { t: "return", c: "#ff7b72" }, { t: " {", c: "#c9d1d9" }],
    [{ t: " 15", c: "#484f58" }, { t: "    ", c: "#c9d1d9" }, { t: "status:", c: "#79c0ff" }, { t: " ", c: "#c9d1d9" }, { t: "'DIG_COMPLETE'", c: "#a5d6ff" }, { t: ",", c: "#c9d1d9" }],
    [{ t: " 16", c: "#484f58" }, { t: "    ", c: "#c9d1d9" }, { t: "sector:", c: "#79c0ff" }, { t: " ", c: "#c9d1d9" }, { t: "'7A-FF02'", c: "#a5d6ff" }, { t: ",", c: "#c9d1d9" }],
    [{ t: " 17", c: "#484f58" }, { t: "    ", c: "#c9d1d9" }, { t: "artifacts", c: "#79c0ff" }, { t: ",", c: "#c9d1d9" }],
    [{ t: " 18", c: "#484f58" }, { t: "    ", c: "#c9d1d9" }, { t: "timestamp:", c: "#79c0ff" }, { t: " ", c: "#c9d1d9" }, { t: "Date", c: "#d2a8ff" }, { t: ".", c: "#c9d1d9" }, { t: "now", c: "#d2a8ff" }, { t: "(),", c: "#c9d1d9" }],
    [{ t: " 19", c: "#484f58" }, { t: "  ", c: "#c9d1d9" }, { t: "};", c: "#c9d1d9" }],
    [{ t: " 20", c: "#484f58" }],
    [{ t: " 21", c: "#484f58" }, { t: "  ", c: "#c9d1d9" }, { t: "// hl> _", c: "#8b949e" }],
  ];

  ctx.font = '11px "Courier New", monospace';
  code.forEach((segments, i) => {
    const y = 44 + i * 16;
    let x = 4;
    segments.forEach(({ t, c: color }) => {
      ctx.fillStyle = color;
      ctx.fillText(t, x, y);
      x += ctx.measureText(t).width;
    });
  });

  // Cursor
  ctx.fillStyle = "#58a6ff";
  ctx.fillRect(4 + ctx.measureText("  // hl> ").width, 44 + 20 * 16 - 12, 7, 13);

  // Scanlines + vignette
  ctx.fillStyle = "rgba(0,0,0,0.025)";
  for (let y = 0; y < 480; y += 2) ctx.fillRect(0, y, 640, 1);
  const vg = ctx.createRadialGradient(320, 240, 200, 320, 240, 380);
  vg.addColorStop(0, "transparent"); vg.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, 640, 480);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

function createLogCRTTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 400; c.height = 300;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, 400, 300);
  ctx.font = '8px "Courier New", monospace';
  const logs = [
    "[12:04:32] NODE-7A  | PING 192.168.7.42   | 3.2ms",
    "[12:04:33] NODE-7B  | ACK from sector 7A  | OK",
    "[12:04:35] SWITCH-2 | Port 7 up           | 1000Mbps",
    "[12:04:38] ROUTER-0 | Route table update  | 2048 entries",
    "[12:04:41] MONITOR  | CPU: 42% MEM: 3.8GB | TEMP: 58C",
    "[12:04:44] DIG-ENGN | Scanning block 0x7A | 38% complete",
    "[12:04:47] DIG-ENGN | Found: ROM v2.4     | SEGA MD",
    "[12:04:50] DIG-ENGN | Found: PCB rev 3.1  | NES-001",
    "[12:04:53] DIG-ENGN | Found: CHIP 68k     | Motorola",
    "[12:04:56] ARCHIVE  | Cataloging item #42 | SUCCESS",
    "[12:05:00] RENDER   | Frame buffer ready  | 640x480",
    "[12:05:03] NETWORK  | Topology update     | +3 nodes",
    "[12:05:07] SECURITY | Audit log rotation  | OK",
    "[12:05:10] SYSTEM   | Health check passed | ALL GREEN",
    "[12:05:14] hl>      | Waiting for input   | READY",
  ];
  logs.forEach((line, i) => {
    const y = 18 + i * 16;
    ctx.fillStyle = i % 3 === 0 ? "#00ff88" : i % 3 === 1 ? "#88ccff" : "#aaaaaa";
    ctx.fillText(line, 8, y);
  });
  // Scanlines
  ctx.fillStyle = "rgba(0,0,0,0.04)";
  for (let y = 0; y < 300; y += 2) ctx.fillRect(0, y, 400, 1);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

function createTopoCRTTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 400; c.height = 300;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#050510"; ctx.fillRect(0, 0, 400, 300);

  // Grid
  ctx.strokeStyle = "rgba(0,255,136,0.06)"; ctx.lineWidth = 0.5;
  for (let x = 0; x < 400; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 300); ctx.stroke(); }
  for (let y = 0; y < 300; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(400, y); ctx.stroke(); }

  // Nodes
  const nodes = [
    [80, 60], [200, 50], [320, 80], [60, 150], [180, 140],
    [300, 160], [120, 220], [240, 210], [350, 230], [200, 260],
  ];
  nodes.forEach(([nx, ny]) => {
    ctx.fillStyle = "#00ff88";
    ctx.beginPath(); ctx.arc(nx, ny, 5, 0, Math.PI * 2); ctx.fill();
  });
  // Edges
  const edges = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 6], [4, 7], [5, 8], [6, 7], [7, 8], [7, 9]];
  edges.forEach(([a, b]) => {
    ctx.strokeStyle = "rgba(0,255,136,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(nodes[a][0], nodes[a][1]); ctx.lineTo(nodes[b][0], nodes[b][1]); ctx.stroke();
  });
  // Labels
  ctx.fillStyle = "#88ffcc"; ctx.font = '7px "Courier New", monospace';
  nodes.forEach(([nx, ny], i) => {
    ctx.fillText(`N${i}`, nx + 8, ny + 4);
  });
  ctx.fillStyle = "#00ff88"; ctx.font = 'bold 9px "Courier New", monospace';
  ctx.fillText("NETWORK TOPOLOGY — SECTOR 7A", 80, 285);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

function createDataWallTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0a0a10"; ctx.fillRect(0, 0, 512, 512);
  // Grid
  ctx.strokeStyle = "rgba(0,255,136,0.04)"; ctx.lineWidth = 0.5;
  for (let x = 0; x < 512; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
  for (let y = 0; y < 512; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }
  // Abstract arcs
  ctx.strokeStyle = "rgba(139,92,246,0.08)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(256, 256, 180, 0, Math.PI * 1.3); ctx.stroke();
  ctx.beginPath(); ctx.arc(256, 256, 140, Math.PI * 0.5, Math.PI * 1.8); ctx.stroke();
  // Scattered hex
  ctx.strokeStyle = "rgba(0,200,200,0.06)"; ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    const hx = 60 + Math.random() * 400, hy = 60 + Math.random() * 400;
    ctx.beginPath();
    for (let j = 0; j < 6; j++) {
      const a = (Math.PI / 3) * j;
      const px = hx + 20 * Math.cos(a), py = hy + 20 * Math.sin(a);
      j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createPosterTexture(type: "anon" | "hack" | "mario" | "excite"): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 200; c.height = 260;
  const ctx = c.getContext("2d")!;

  if (type === "anon") {
    ctx.fillStyle = "#1a1a1a"; ctx.fillRect(0, 0, 200, 260);
    ctx.fillStyle = "#f0ead8"; ctx.beginPath(); ctx.ellipse(100, 100, 50, 70, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1a1a1a"; ctx.beginPath(); ctx.ellipse(78, 85, 12, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(122, 85, 12, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(100, 125, 18, 0.08, Math.PI - 0.08); ctx.stroke();
    ctx.fillStyle = "#d8c8b0"; ctx.beginPath(); ctx.ellipse(100, 155, 38, 24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#33aa33"; ctx.font = 'bold 22px "Courier New", monospace'; ctx.fillText("ANONYMOUS", 8, 215);
    ctx.fillStyle = "#aaa"; ctx.font = '10px "Courier New", monospace'; ctx.fillText("WE ARE LEGION", 38, 238);
  } else if (type === "hack") {
    ctx.fillStyle = "#0a0a14"; ctx.fillRect(0, 0, 200, 260);
    ctx.strokeStyle = "rgba(0,255,200,0.1)"; ctx.lineWidth = 0.5;
    for (let x = 0; x < 200; x += 12) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 260); ctx.stroke(); }
    for (let y = 0; y < 260; y += 12) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(200, y); ctx.stroke(); }
    ctx.fillStyle = "#00ffc8"; ctx.font = 'bold 38px "Courier New", monospace'; ctx.fillText("HACK", 18, 85);
    ctx.fillStyle = "#ff4488"; ctx.fillText("ATHON", 14, 135);
    ctx.fillStyle = "rgba(0,255,200,0.2)"; ctx.fillText("HACK", 24, 83);
    ctx.fillStyle = "#fff"; ctx.font = 'bold 13px "Courier New", monospace'; ctx.fillText("BUILD \u2022 SHIP \u2022 REPEAT", 5, 185);
    ctx.fillStyle = "#00ffc8"; ctx.font = '9px "Courier New", monospace'; ctx.fillText("36 HOURS | 04.12.2025", 22, 212);
  } else if (type === "mario") {
    ctx.fillStyle = "#1a1a3a"; ctx.fillRect(0, 0, 200, 260);
    // Brick pattern
    ctx.fillStyle = "#c84c30"; ctx.fillRect(20, 140, 32, 16); ctx.fillRect(52, 140, 32, 16); ctx.fillRect(84, 140, 32, 16);
    ctx.fillRect(36, 156, 32, 16); ctx.fillRect(68, 156, 32, 16); ctx.fillRect(20, 172, 32, 16);
    // Question block
    ctx.fillStyle = "#f0a030"; ctx.fillRect(76, 100, 40, 36);
    ctx.fillStyle = "#fff"; ctx.font = 'bold 24px "Courier New", monospace'; ctx.fillText("?", 90, 127);
    // Mario silhouette
    ctx.fillStyle = "#e84040"; ctx.beginPath(); ctx.arc(100, 70, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(90, 88, 20, 30);
    ctx.fillStyle = "#4040e8"; ctx.fillRect(90, 105, 8, 16); ctx.fillRect(102, 105, 8, 16);
    ctx.fillStyle = "#ffd800"; ctx.font = 'bold 28px "Courier New", monospace'; ctx.fillText("SUPER", 34, 38);
    ctx.fillStyle = "#e84040"; ctx.font = 'bold 32px "Courier New", monospace'; ctx.fillText("MARIO", 28, 72);
  } else {
    ctx.fillStyle = "#ffe8c0"; ctx.fillRect(0, 0, 200, 260);
    ctx.fillStyle = "#ff4444"; ctx.font = 'bold italic 40px "Courier New", monospace'; ctx.fillText("EXCIT", 10, 60);
    ctx.fillText("ING!", 20, 105);
    ctx.fillStyle = "#1a1a2e"; ctx.font = 'bold 16px "Courier New", monospace'; ctx.fillText("RETRO TECH", 20, 145);
    ctx.fillText("DIG 2025", 20, 170);
    // Decorative stars
    ctx.fillStyle = "#ff8844";
    for (let i = 0; i < 15; i++) {
      const sx = 20 + Math.random() * 160, sy = 185 + Math.random() * 60;
      ctx.font = `${8 + Math.random() * 12}px "Courier New", monospace`;
      ctx.fillText("*", sx, sy);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

/* ============================================
   CRT Monitor component (reusable)
   ============================================ */
function CRTUnit({
  width, height, depth, tex, pos, title,
}: {
  width: number; height: number; depth: number;
  tex: THREE.CanvasTexture;
  pos: [number, number, number];
  title?: string;
}) {
  return (
    <group position={pos}>
      <RoundedBox args={[width, height, depth]} radius={0.06} material={matBeige} castShadow receiveShadow />
      <RoundedBox args={[width * 0.78, height * 0.8, 0.04]} radius={0.02} position={[0, 0.02, depth / 2 + 0.01]} material={matBezel} />
      <mesh position={[0, 0.02, depth / 2 + 0.04]}>
        <planeGeometry args={[width * 0.7, height * 0.7]} />
        <meshStandardMaterial map={tex} roughness={0.5} metalness={0.02} emissive="#88aaff" emissiveIntensity={0.06} emissiveMap={tex} />
      </mesh>
      {title && (
        <mesh position={[0, height / 2 + 0.08, 0]}>
          <planeGeometry args={[width * 0.5, 0.06]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

/* ============================================
   Cable Conduit
   ============================================ */
function CableConduit({
  start, end, segments = 3,
}: {
  start: [number, number, number];
  end: [number, number, number];
  segments?: number;
}) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      pts.push(new THREE.Vector3(
        THREE.MathUtils.lerp(start[0], end[0], t),
        THREE.MathUtils.lerp(start[1], end[1], t) + Math.sin(t * Math.PI) * 0.15,
        THREE.MathUtils.lerp(start[2], end[2], t),
      ));
    }
    return pts;
  }, [start, end, segments]);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 24, 0.04, 6, false), [curve]);

  return (
    <mesh geometry={tubeGeo} material={matConduit} castShadow />
  );
}

/* ============================================
   Dissected Motherboard
   ============================================ */
function Motherboard({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.3, 0]}>
      {/* PCB */}
      <mesh material={matPCB} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.02, 0.6]} />
      </mesh>
      {/* Traces */}
      {[
        [0, 0.012, 0.0, 0.3], [0.1, 0.012, 0.05, 0.25], [-0.05, 0.012, -0.05, 0.2],
        [0.15, 0.012, -0.1, 0.15], [-0.2, 0.012, 0.1, 0.18],
      ].map(([x, y, z, l], i) => (
        <mesh key={i} position={[x, y, z]} material={matPCBTrace}>
          <boxGeometry args={[l, 0.003, 0.015]} />
        </mesh>
      ))}
      {/* Chips */}
      {[
        [-0.15, 0.016, -0.1, 0.12], [0.2, 0.016, 0.1, 0.1], [0.0, 0.016, -0.15, 0.08],
      ].map(([x, y, z, s], i) => (
        <mesh key={`chip-${i}`} position={[x, y, z]} material={matChip} castShadow>
          <boxGeometry args={[s, 0.015, s]} />
        </mesh>
      ))}
      {/* Exposed capacitor */}
      <mesh position={[-0.25, 0.025, 0.15]} material={matMetal}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 8]} />
      </mesh>
    </group>
  );
}

/* ============================================
   Coffee Mug
   ============================================ */
function CoffeeMug({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh material={matMug} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.1, 12]} />
      </mesh>
      <mesh position={[0.07, 0.02, 0]} rotation-z={Math.PI / 2} material={matMug} castShadow>
        <torusGeometry args={[0.03, 0.012, 6, 8, Math.PI]} />
      </mesh>
      <mesh position={[0, 0.048, 0]} material={matCoffee}>
        <cylinderGeometry args={[0.048, 0.048, 0.005, 12]} />
      </mesh>
    </group>
  );
}

/* ============================================
   Scene Content
   ============================================ */
function SceneContent() {
  const mainTex = useMemo(() => createMainCRTTexture(), []);
  const logTex = useMemo(() => createLogCRTTexture(), []);
  const topoTex = useMemo(() => createTopoCRTTexture(), []);
  const dataWallTex = useMemo(() => createDataWallTexture(), []);
  const posterAnon = useMemo(() => createPosterTexture("anon"), []);
  const posterHack = useMemo(() => createPosterTexture("hack"), []);
  const posterMario = useMemo(() => createPosterTexture("mario"), []);
  const posterExcite = useMemo(() => createPosterTexture("excite"), []);

  return (
    <group>
      {/* ==========================================
          LIGHTING — moody, warm + cool contrast
          ========================================== */}
      <ambientLight intensity={0.5} color="#2a2520" />
      {/* Key — warm desk lamp */}
      <directionalLight
        position={[6, 6, 2]} intensity={3.5} color="#ffe8d0"
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12} shadow-camera-right={12}
        shadow-camera-top={12} shadow-camera-bottom={-12}
        shadow-bias={-0.0002}
      />
      {/* Fill — cool blue from opposite */}
      <directionalLight position={[-4, 3, -3]} intensity={1.0} color="#5566aa" />
      {/* Desk lamp point */}
      <pointLight position={[3.5, 1.2, -1.5]} intensity={4.5} color="#ffe0b0" distance={5} decay={2} />
      {/* Second lamp */}
      <pointLight position={[-3.0, 1.0, -1.5]} intensity={3.0} color="#ffe0b0" distance={5} decay={2} />
      {/* CRT screen glows */}
      <pointLight position={[0, 1.2, -0.6]} intensity={1.8} color="#8899cc" distance={3} decay={2} />
      <pointLight position={[-2.5, 0.8, -0.6]} intensity={1.0} color="#88ffaa" distance={2.5} decay={2} />
      <pointLight position={[2.5, 0.8, -0.6]} intensity={1.0} color="#88aaff" distance={2.5} decay={2} />
      {/* Data wall ambient glow */}
      <pointLight position={[0, 2.5, -5.0]} intensity={1.2} color="#44ff88" distance={6} decay={2} />

      <ContactShadows position={[0, -1.45, 0]} opacity={0.3} scale={18} blur={3} far={8} />

      {/* ==========================================
          ROOM — walls, floor
          ========================================== */}
      {/* Back wall */}
      <mesh position={[0, 1.8, -5.5]} material={matConcrete} receiveShadow>
        <planeGeometry args={[12, 6]} />
      </mesh>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.5, 0]} material={matFloor} receiveShadow>
        <planeGeometry args={[14, 10]} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-6, 1.8, -0.5]} rotation-y={Math.PI / 2} material={matWall} receiveShadow>
        <planeGeometry args={[10, 6]} />
      </mesh>
      {/* Right wall */}
      <mesh position={[6, 1.8, -0.5]} rotation-y={-Math.PI / 2} material={matWall} receiveShadow>
        <planeGeometry args={[10, 6]} />
      </mesh>

      {/* ==========================================
          DATA PROJECTION WALLS
          ========================================== */}
      <mesh position={[0, 1.8, -5.45]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial map={dataWallTex} roughness={0.6} emissive="#00ff88" emissiveIntensity={0.05} transparent opacity={0.7} />
      </mesh>
      {/* Side data panels */}
      <mesh position={[-5.97, 1.8, -0.5]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[7, 4]} />
        <meshStandardMaterial map={dataWallTex} roughness={0.6} emissive="#8844ff" emissiveIntensity={0.04} transparent opacity={0.5} />
      </mesh>

      {/* ==========================================
          CABLE CONDUITS — along walls
          ========================================== */}
      <CableConduit start={[-5.5, 0.5, -5.0]} end={[-5.5, 2.5, -2.0]} />
      <CableConduit start={[-5.5, 2.5, -2.0]} end={[-3.0, 1.0, -1.5]} />
      <CableConduit start={[5.5, 0.5, -5.0]} end={[5.5, 2.5, -2.0]} />
      <CableConduit start={[5.5, 2.5, -2.0]} end={[3.0, 1.0, -1.5]} />
      <CableConduit start={[0, 4.0, -5.0]} end={[-2.0, 2.5, -2.0]} />
      <CableConduit start={[0, 4.0, -5.0]} end={[2.0, 2.5, -2.0]} />
      {/* Horizontal conduit */}
      <CableConduit start={[-5.0, 3.0, -5.0]} end={[5.0, 3.0, -5.0]} segments={5} />

      {/* ==========================================
          POSTERS GALLERY — expanded wall art
          ========================================== */}
      {/* Anonymous (left wall) */}
      <group position={[-5.5, 2.0, -2.5]} rotation-y={Math.PI / 2}>
        <mesh material={matPosterFrame}><boxGeometry args={[0.45, 0.6, 0.02]} /></mesh>
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.4, 0.54]} />
          <meshStandardMaterial map={posterAnon} roughness={0.7} />
        </mesh>
      </group>
      {/* Hackathon (right wall) */}
      <group position={[5.5, 2.0, -2.5]} rotation-y={-Math.PI / 2}>
        <mesh material={matPosterFrame}><boxGeometry args={[0.45, 0.6, 0.02]} /></mesh>
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.4, 0.54]} />
          <meshStandardMaterial map={posterHack} roughness={0.7} />
        </mesh>
      </group>
      {/* Super Mario (back wall left) */}
      <group position={[-2.0, 2.5, -5.4]}>
        <mesh material={matPosterFrame}><boxGeometry args={[0.45, 0.6, 0.02]} /></mesh>
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.4, 0.54]} />
          <meshStandardMaterial map={posterMario} roughness={0.7} />
        </mesh>
      </group>
      {/* EXCITING (back wall right) */}
      <group position={[2.0, 2.5, -5.4]}>
        <mesh material={matPosterFrame}><boxGeometry args={[0.45, 0.6, 0.02]} /></mesh>
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.4, 0.54]} />
          <meshStandardMaterial map={posterExcite} roughness={0.7} />
        </mesh>
      </group>

      {/* ==========================================
          MAIN CONSOLE DESK — large, wrap-around
          ========================================== */}
      <group position={[0, -0.55, -1.0]}>
        {/* Main desk surface */}
        <RoundedBox args={[5.5, 0.1, 2.2]} radius={0.05} material={matDesk} castShadow receiveShadow />
        {/* Bevel */}
        <mesh position={[0, -0.06, 1.1]} material={matDeskEdge} castShadow>
          <boxGeometry args={[5.5, 0.04, 0.06]} />
        </mesh>
        {/* Legs */}
        {[[-2.5, -0.55, -0.95], [2.5, -0.55, -0.95], [-2.5, -0.55, 0.95], [2.5, -0.55, 0.95]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} material={matMetalDark} castShadow>
            <boxGeometry args={[0.08, 0.9, 0.08]} />
          </mesh>
        ))}
      </group>

      {/* ==========================================
          MAIN CRT MONITOR — central, large
          ========================================== */}
      <group position={[0, 0.15, -1.0]}>
        {/* Stand */}
        <mesh position={[0, -0.42, 0]} material={matMetal} castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.24, 0.45, 12]} />
        </mesh>
        <mesh position={[0, -0.65, 0]} material={matMetal} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.6, 0.08, 20]} />
        </mesh>
      </group>
      <CRTUnit width={2.4} height={1.9} depth={1.7} tex={mainTex} pos={[0, 0.8, -1.0]} title="hl> DATA DIG MAINFRAME" />

      {/* ==========================================
          FLANKING CRTs — network logs (left)
          ========================================== */}
      <group position={[-2.8, -0.1, -1.0]}>
        <mesh position={[0, -0.3, 0]} material={matMetal} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 0.25, 10]} />
        </mesh>
      </group>
      <CRTUnit width={1.1} height={0.9} depth={0.85} tex={logTex} pos={[-2.8, 0.35, -1.0]} />

      {/* ==========================================
          FLANKING CRTs — topology (right)
          ========================================== */}
      <group position={[2.8, -0.1, -1.0]}>
        <mesh position={[0, -0.3, 0]} material={matMetal} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 0.25, 10]} />
        </mesh>
      </group>
      <CRTUnit width={1.1} height={0.9} depth={0.85} tex={topoTex} pos={[2.8, 0.35, -1.0]} />

      {/* ==========================================
          SMALL MONITORING CRTs (above, on shelves)
          ========================================== */}
      <CRTUnit width={0.6} height={0.5} depth={0.5} tex={logTex} pos={[-1.5, 2.2, -1.0]} />
      <CRTUnit width={0.6} height={0.5} depth={0.5} tex={topoTex} pos={[1.5, 2.2, -1.0]} />

      {/* ==========================================
          DESK LAMPS (2x, warm)
          ========================================== */}
      {[[-3.3, 0.55, -1.8], [3.3, 0.55, -1.8]].map(([lx, ly, lz], i) => (
        <group key={`lamp-${i}`} position={[lx, ly, lz]}>
          <mesh material={matLamp} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 0.04, 16]} />
          </mesh>
          <mesh position={[0, 0.3, 0]} material={matLamp} castShadow>
            <boxGeometry args={[0.04, 0.5, 0.04]} />
          </mesh>
          <group position={[0, 0.55, 0]} rotation-z={i === 0 ? -0.4 : 0.4}>
            <mesh position={[0.15, 0.1, 0]} material={matLamp} castShadow>
              <boxGeometry args={[0.03, 0.35, 0.03]} />
            </mesh>
            <group position={[0.25, 0.28, 0]} rotation-z={0.5}>
              <mesh material={matLampShade} castShadow>
                <coneGeometry args={[0.2, 0.25, 12, 1, true]} />
              </mesh>
              <mesh position={[0, 0.04, 0]} material={matLampBulb}>
                <sphereGeometry args={[0.06, 8, 8]} />
              </mesh>
            </group>
          </group>
        </group>
      ))}

      {/* ==========================================
          BOOKS — stacked on desk
          ========================================== */}
      {[[-1.8, 0.05, -1.6], [1.6, 0.05, -1.7], [-2.0, 0.05, -0.3]].map(([bx, by, bz], i) => (
        <group key={`books-${i}`} position={[bx, by, bz]} rotation-y={i * 0.2}>
          {[matBook1, matBook2, matBook3].map((mat, j) => (
            <group key={j} position={[0, 0.03 + j * 0.06, j * 0.015]}>
              <RoundedBox args={[0.35, 0.05, 0.24]} radius={0.01} material={mat} castShadow receiveShadow />
              <mesh position={[0, 0.001, 0.015]}>
                <boxGeometry args={[0.33, 0.035, 0.015]} />
                <primitive object={matBookPages} attach="material" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* ==========================================
          COFFEE MUGS
          ========================================== */}
      <CoffeeMug position={[-0.8, 0.05, -1.7]} />
      <CoffeeMug position={[0.9, 0.05, -1.65]} />

      {/* ==========================================
          DISSECTED MOTHERBOARD
          ========================================== */}
      <Motherboard position={[0, 0.05, -1.9]} />
      <Motherboard position={[-2.5, 0.05, -0.2]} />

      {/* ==========================================
          RETRO CONSOLE SHELL (on desk)
          ========================================== */}
      <group position={[1.2, 0.05, -1.5]} rotation-y={-0.2}>
        <RoundedBox args={[0.6, 0.08, 0.4]} radius={0.02} material={matDarkBeige} castShadow />
        <mesh position={[0, 0.045, -0.05]}>
          <boxGeometry args={[0.35, 0.02, 0.22]} />
          <meshStandardMaterial color="#333" roughness={0.3} />
        </mesh>
        {/* Controller chip */}
        <mesh position={[0, 0.05, 0.1]} material={matChip} castShadow>
          <boxGeometry args={[0.08, 0.015, 0.06]} />
        </mesh>
      </group>
    </group>
  );
}

/* ============================================
   Main export
   ============================================ */
export default function TechArchaeologistLab() {
  return (
    <div className="w-full" style={{ minHeight: "70vh" }}>
      <Canvas
        shadows="soft"
        camera={{ position: [0, 1.6, 5.5], fov: 50, near: 0.1, far: 40 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true, alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95,
        }}
        style={{ background: "#100e0c", minHeight: "70vh" }}
      >
        <Suspense fallback={<Loader />}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
