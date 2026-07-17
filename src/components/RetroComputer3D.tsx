"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* ============================================
   RetroComputer3D — fully detailed 3D model
   CRT monitor + mechanical keyboard + desk
   + floppy disks + coiled cable + desk mat
   + OrbitControls for all-angle viewing
   Terminal text rendered live on the CRT screen
   via CanvasTexture
   ============================================ */

interface CmdEntry {
  type: "input" | "output";
  text: string;
}

interface RetroComputer3DProps {
  history: CmdEntry[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  activeKey: string | null;
  isInView: boolean;
}

/* ── Key normalization ── */
const KEY_MAP_3D: Record<string, string> = {
  " ": "SPACE", Backspace: "BKS", Enter: "ENTER", Tab: "TAB",
  CapsLock: "CAPS", Shift: "SHIFT", Control: "CTRL", Alt: "ALT", Escape: "ESC",
};
function normalizeKey(raw: string): string {
  return KEY_MAP_3D[raw] || raw.toUpperCase();
}

/* ── Keyboard layout ── */
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

/* ── CRT screen texture drawer ── */
function drawCRTScreen(
  ctx: CanvasRenderingContext2D,
  history: CmdEntry[],
  input: string,
) {
  const w = 512, h = 384;
  ctx.clearRect(0, 0, w, h);

  // Tube background
  const bg = ctx.createRadialGradient(w * 0.55, h * 0.35, 0, w * 0.5, h * 0.5, w * 0.8);
  bg.addColorStop(0, "#0d220d"); bg.addColorStop(0.5, "#061406"); bg.addColorStop(1, "#010501");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // Scanlines
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);

  // Text
  ctx.font = '11px "Courier New", monospace';
  let cy = 16; const lh = 15;
  const visible = history.slice(-Math.floor((h - 20) / lh));
  for (const e of visible) {
    if (e.type === "input") {
      ctx.fillStyle = "#c4b5fd"; ctx.fillText("C:\\> ", 12, cy);
      ctx.fillStyle = "#e2e8f0"; ctx.fillText(e.text.replace("C:\\> ", ""), 58, cy);
    } else {
      ctx.fillStyle = "#8bff8b"; ctx.fillText(e.text, 12, cy);
    }
    cy += lh;
  }
  ctx.fillStyle = "#c4b5fd"; ctx.fillText("C:\\> ", 12, cy);
  ctx.fillStyle = "#e2e8f0"; ctx.fillText(input + "▊", 58, cy);

  // Bloom
  ctx.fillStyle = "rgba(139,255,139,0.02)"; ctx.fillRect(0, 0, w, h);

  // Vignette
  const vg = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.75);
  vg.addColorStop(0, "transparent"); vg.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
}

/* ── Desk mat grid texture generator ── */
function createDeskMatTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#141210"; ctx.fillRect(0, 0, 512, 512);

  // Neon grid
  ctx.strokeStyle = "rgba(139,92,246,0.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= 512; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
  for (let y = 0; y <= 512; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }

  // Major grid lines slightly brighter
  ctx.strokeStyle = "rgba(139,92,246,0.13)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x <= 512; x += 128) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
  for (let y = 0; y <= 512; y += 128) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }

  // Stitched border
  ctx.strokeStyle = "rgba(16,185,129,0.12)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 12]);
  ctx.strokeRect(6, 6, 500, 500);
  ctx.setLineDash([]);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1.5);
  return tex;
}

/* ============================================ */
export default function RetroComputer3D({
  history, input, onInputChange, onKeyDown, activeKey,
}: RetroComputer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const keyMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const animFrameRef = useRef(0);
  const clockRef = useRef(new THREE.Clock());
  const screenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const screenTexRef = useRef<THREE.CanvasTexture | null>(null);
  const floppyLEDRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refs for screen draw
  const historyRef = useRef(history);
  const inputRef2 = useRef(input);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { inputRef2.current = input; }, [input]);

  /* ================================================
     Initialize Three.js scene (runs once)
     ================================================ */
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const w = container.clientWidth;
    const h = Math.min(container.clientWidth * 0.8, 600);

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1121);
    scene.fog = new THREE.Fog(0x0b1121, 12, 55);
    sceneRef.current = scene;

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 80);
    camera.position.set(7, 4.2, 9.5);
    camera.lookAt(0, 0.35, 0);
    cameraRef.current = camera;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current, antialias: true, alpha: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // ── OrbitControls ──
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.35, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI * 0.7;
    controls.minPolarAngle = 0.2;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.update();
    controlsRef.current = controls;

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0x445566, 1.4));

    const keyLight = new THREE.DirectionalLight(0xffeedd, 5);
    keyLight.position.set(8, 14, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.3; keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -12; keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 12; keyLight.shadow.camera.bottom = -12;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);

    const fill = new THREE.DirectionalLight(0x8899cc, 1.6);
    fill.position.set(-5, 3, -2); scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffccaa, 2.2);
    rim.position.set(0, 1.5, -6); scene.add(rim);

    const violetAccent = new THREE.PointLight(0x8b5cf6, 4, 8, 1.5);
    violetAccent.position.set(1, 1.8, 3.5); scene.add(violetAccent);

    const emeraldAccent = new THREE.PointLight(0x10b981, 3, 6, 2);
    emeraldAccent.position.set(0, -0.2, 2); scene.add(emeraldAccent);

    // ── Screen Light Bleed (warm amber/green glow cast onto desk) ──
    const screenBleed = new THREE.PointLight(0x7aff7a, 2.5, 4, 2.5);
    screenBleed.position.set(0, 0.8, 1.8); scene.add(screenBleed);

    // ── Materials ──
    const matBeige = new THREE.MeshStandardMaterial({ color: "#d4cbb8", roughness: 0.55, metalness: 0.05 });
    const matDarkBeige = new THREE.MeshStandardMaterial({ color: "#c4b8a4", roughness: 0.6, metalness: 0.06 });
    const matBezel = new THREE.MeshStandardMaterial({ color: "#3a3430", roughness: 0.45, metalness: 0.15 });
    const matDarkPlastic = new THREE.MeshStandardMaterial({ color: "#2a2420", roughness: 0.5, metalness: 0.1 });
    const matStand = new THREE.MeshStandardMaterial({ color: "#b8ab98", roughness: 0.58, metalness: 0.08 });
    const matKeyboardBase = new THREE.MeshStandardMaterial({ color: "#c8bca8", roughness: 0.55, metalness: 0.06 });
    const matDesk = new THREE.MeshStandardMaterial({ color: "#2a2220", roughness: 0.7, metalness: 0.02 });
    const matVent = new THREE.MeshStandardMaterial({ color: "#2a2420", roughness: 0.9, metalness: 0.02 });
    const matPowerLED = new THREE.MeshStandardMaterial({ color: "#10b981", roughness: 0.2, metalness: 0.1, emissive: "#10b981", emissiveIntensity: 1.5 });
    const matFloppyLED = new THREE.MeshStandardMaterial({ color: "#ff8c00", roughness: 0.2, metalness: 0.1, emissive: "#ff8c00", emissiveIntensity: 1.0 });
    floppyLEDRef.current = matFloppyLED;
    const matKeycap = new THREE.MeshStandardMaterial({ color: "#e8e0d4", roughness: 0.45, metalness: 0.04 });

    /* ==========================================
       BUILD: CRT MONITOR
       ========================================== */
    const monitorGroup = new THREE.Group();

    // Main chassis — softened edges
    const chassisGeo = new THREE.BoxGeometry(3.6, 2.7, 2.2, 4, 4, 4);
    const cpos = chassisGeo.attributes.position;
    for (let i = 0; i < cpos.count; i++) {
      const x = cpos.getX(i), y = cpos.getY(i), z = cpos.getZ(i);
      const f = 0.06 * Math.max(Math.abs(x) / 1.8, Math.abs(y) / 1.35, Math.abs(z) / 1.1);
      cpos.setX(i, x * (1 - f * 0.3));
      cpos.setY(i, y * (1 - f * 0.25));
    }
    chassisGeo.computeVertexNormals();
    const chassis = new THREE.Mesh(chassisGeo, matBeige);
    chassis.castShadow = true; chassis.receiveShadow = true;
    monitorGroup.add(chassis);

    // ── Panel seam lines (thin recessed gaps) ──
    function addSeam(x: number, y: number, z: number, w: number, h: number, d: number) {
      const g = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.MeshStandardMaterial({ color: "#b0a090", roughness: 0.9, metalness: 0 });
      const seam = new THREE.Mesh(g, m);
      seam.position.set(x, y, z);
      monitorGroup.add(seam);
    }
    // Horizontal seam below screen bezel
    addSeam(0, 0.48, 1.14, 2.6, 0.015, 0.04);
    // Vertical seams on sides
    addSeam(-1.78, 0.3, 0, 0.015, 2.2, 1.8);
    addSeam(1.78, 0.3, 0, 0.015, 2.2, 1.8);

    // ── Screen bezel (outer) ──
    const bezelGeo = new THREE.BoxGeometry(2.7, 2.1, 0.12);
    const bezel = new THREE.Mesh(bezelGeo, matBezel);
    bezel.position.z = 1.1; bezel.castShadow = true;
    monitorGroup.add(bezel);

    // ── Screen inner bezel ──
    const innerBezelGeo = new THREE.BoxGeometry(2.5, 1.9, 0.06);
    const innerBezel = new THREE.Mesh(innerBezelGeo, matDarkPlastic);
    innerBezel.position.z = 1.17;
    monitorGroup.add(innerBezel);

    // ── CRT Screen (CanvasTexture) ──
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 512; screenCanvas.height = 384;
    const screenCtx = screenCanvas.getContext("2d")!;
    screenCtxRef.current = screenCtx;

    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.minFilter = THREE.LinearFilter; screenTex.magFilter = THREE.LinearFilter;
    screenTexRef.current = screenTex;
    drawCRTScreen(screenCtx, historyRef.current, inputRef2.current);
    screenTex.needsUpdate = true;

    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTex, roughness: 0.55, metalness: 0.02,
      emissive: "#8bff8b", emissiveIntensity: 0.15, emissiveMap: screenTex,
    });
    const screenGeo = new THREE.PlaneGeometry(2.35, 1.75);
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = 1.21;
    monitorGroup.add(screenMesh);

    // ── Top ventilation slots ──
    for (let i = 0; i < 18; i++) {
      const vGeo = new THREE.BoxGeometry(0.08, 0.02, 0.6);
      const vent = new THREE.Mesh(vGeo, matVent);
      vent.position.set(-1.4 + i * 0.165, 1.35, 0);
      vent.castShadow = true;
      monitorGroup.add(vent);
    }

    // ── Side ventilation slots (right side) ──
    for (let i = 0; i < 8; i++) {
      const svGeo = new THREE.BoxGeometry(0.03, 0.02, 0.5);
      const svent = new THREE.Mesh(svGeo, matVent);
      svent.position.set(1.79, 0.9 - i * 0.24, 0);
      monitorGroup.add(svent);
    }

    // ── Floppy Disk Drive (front bezel, below screen) ──
    const floppySlotGeo = new THREE.BoxGeometry(0.7, 0.04, 0.03);
    const floppySlot = new THREE.Mesh(floppySlotGeo, matDarkPlastic);
    floppySlot.position.set(0, -0.42, 1.19);
    monitorGroup.add(floppySlot);

    // Floppy slot inner dark opening
    const floppyInnerGeo = new THREE.BoxGeometry(0.64, 0.015, 0.01);
    const floppyInner = new THREE.Mesh(floppyInnerGeo, new THREE.MeshStandardMaterial({ color: "#0a0a0a", roughness: 1 }));
    floppyInner.position.set(0, -0.42, 1.205);
    monitorGroup.add(floppyInner);

    // Floppy drive activity LED
    const floppyLEDGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.015, 8);
    const floppyLEDMesh = new THREE.Mesh(floppyLEDGeo, matFloppyLED);
    floppyLEDMesh.position.set(0.42, -0.42, 1.19);
    floppyLEDMesh.rotation.x = Math.PI / 2;
    monitorGroup.add(floppyLEDMesh);

    // ── Power LED ──
    const ledGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8);
    const led = new THREE.Mesh(ledGeo, matPowerLED);
    led.position.set(1.45, -1.15, 1.17);
    led.rotation.x = Math.PI / 2;
    monitorGroup.add(led);

    // ── Power Rocker Switch (right side panel) ──
    const rockerHousingGeo = new THREE.BoxGeometry(0.25, 0.12, 0.06);
    const rockerHousing = new THREE.Mesh(rockerHousingGeo, matDarkPlastic);
    rockerHousing.position.set(1.81, -0.6, 0.3);
    monitorGroup.add(rockerHousing);

    const rockerGeo = new THREE.BoxGeometry(0.2, 0.06, 0.04);
    const rocker = new THREE.Mesh(rockerGeo, matDarkBeige);
    rocker.position.set(1.83, -0.6, 0.3);
    rocker.rotation.z = 0.2; // slightly tilted as if rocked on
    monitorGroup.add(rocker);

    // ── Brand badge ──
    const badgeGeo = new THREE.BoxGeometry(0.5, 0.12, 0.03);
    const badgeMat = new THREE.MeshStandardMaterial({ color: "#6a5a48", roughness: 0.4, metalness: 0.3 });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0, -1.1, 1.2);
    monitorGroup.add(badge);

    monitorGroup.position.set(0, 1.5, 0.2);
    scene.add(monitorGroup);

    /* ==========================================
       BUILD: MONITOR STAND
       ========================================== */
    const standGroup = new THREE.Group();
    const neckGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.6, 12);
    const neck = new THREE.Mesh(neckGeo, matStand);
    neck.position.y = 0.3; neck.castShadow = true; neck.receiveShadow = true;
    standGroup.add(neck);
    const baseGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.15, 24);
    const base = new THREE.Mesh(baseGeo, matStand);
    base.position.y = 0.05; base.castShadow = true; base.receiveShadow = true;
    standGroup.add(base);
    standGroup.position.set(0, 0, 0.2);
    scene.add(standGroup);

    /* ==========================================
       BUILD: MECHANICAL KEYBOARD (FIXED)
       Keycaps now properly anchored to base plate
       ========================================== */
    const keyboardGroup = new THREE.Group();

    // Base plate: 3.2 × 0.1 × 1.3, centered at origin
    // Top surface at y = 0.05
    const kbBaseGeo = new THREE.BoxGeometry(3.2, 0.1, 1.3);
    const kbBase = new THREE.Mesh(kbBaseGeo, matKeyboardBase);
    kbBase.castShadow = true; kbBase.receiveShadow = true;
    keyboardGroup.add(kbBase);

    // Bottom front edge (visible wedge thickness)
    const kbEdgeGeo = new THREE.BoxGeometry(3.2, 0.22, 0.14);
    const kbEdge = new THREE.Mesh(kbEdgeGeo, matDarkBeige);
    kbEdge.position.set(0, -0.09, 0.62);
    kbEdge.castShadow = true;
    keyboardGroup.add(kbEdge);

    // ── KEYCAPS anchored ON the base plate surface ──
    // Base plate top: y = 0.05. Keycap height: 0.07.
    // Keycap center Y = 0.05 + 0.035 = 0.085
    // Rows spread across Z range [-0.50, 0.48]
    const KEYCAP_H = 0.07;
    const Y_ON_PLATE = 0.05 + KEYCAP_H / 2; // 0.085
    const rowZPositions = [-0.48, -0.30, -0.12, 0.08, 0.28, 0.46];

    keyMapRef.current.clear();

    KEY_ROWS.forEach((row, ri) => {
      const staggerOffsets = [1.5, 1.55, 1.2, 1.05, 0.85, 0.75];
      let xCursor = -staggerOffsets[ri];
      const zRow = rowZPositions[ri];

      row.forEach(({ label, w: keyW }) => {
        const kw = keyW * 0.155;
        const keyGeo = new THREE.BoxGeometry(kw - 0.015, KEYCAP_H, 0.135, 3, 2, 3);
        const keyMesh = new THREE.Mesh(keyGeo, matKeycap.clone());
        keyMesh.position.set(xCursor + kw / 2, Y_ON_PLATE, zRow);
        keyMesh.userData = { baseY: Y_ON_PLATE };
        keyMesh.castShadow = true; keyMesh.receiveShadow = true;
        keyboardGroup.add(keyMesh);
        keyMapRef.current.set(label, keyMesh);
        xCursor += kw + 0.01;
      });
    });

    // Tilt the entire keyboard forward 18°
    keyboardGroup.rotation.x = THREE.MathUtils.degToRad(18);
    keyboardGroup.position.set(0, -1.6, 1.8);
    scene.add(keyboardGroup);

    /* ==========================================
       BUILD: CYBER-NEON DESK MAT
       ========================================== */
    const deskMatTex = createDeskMatTexture();
    const matDeskMat = new THREE.MeshStandardMaterial({
      map: deskMatTex, roughness: 0.65, metalness: 0.03,
      color: "#161412",
    });
    const deskMatGeo = new THREE.PlaneGeometry(8, 5);
    const deskMat = new THREE.Mesh(deskMatGeo, matDeskMat);
    deskMat.rotation.x = -Math.PI / 2;
    deskMat.position.set(0, -2.33, 0.6);
    deskMat.receiveShadow = true;
    scene.add(deskMat);

    // Subtle raised edge on desk mat
    const matEdgeGeo = new THREE.BoxGeometry(8.05, 0.03, 5.05);
    const matEdge = new THREE.Mesh(matEdgeGeo, new THREE.MeshStandardMaterial({
      color: "#1a1815", roughness: 0.5, metalness: 0.1,
    }));
    matEdge.position.set(0, -2.345, 0.6);
    matEdge.receiveShadow = true;
    scene.add(matEdge);

    /* ==========================================
       BUILD: DESK SURFACE
       ========================================== */
    const deskGeo = new THREE.PlaneGeometry(14, 8);
    const desk = new THREE.Mesh(deskGeo, matDesk);
    desk.rotation.x = -Math.PI / 2;
    desk.position.y = -2.35;
    desk.receiveShadow = true;
    scene.add(desk);

    // Shadow catcher
    const shadowGeo = new THREE.PlaneGeometry(20, 12);
    const shadowPlane = new THREE.Mesh(shadowGeo, new THREE.ShadowMaterial({ opacity: 0.2 }));
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.34;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    /* ==========================================
       BUILD: COILED DATA CABLE
       ========================================== */
    const cableGroup = new THREE.Group();
    const cablePts: THREE.Vector3[] = [];
    // After 18° X rotation on keyboard, the back edge is roughly:
    // local z=-0.65 → world: y ≈ -1.6 + (-0.65)*sin(18°) ≈ -1.6 - 0.20 = -1.80, z ≈ 1.8 + (-0.65)*cos(18°) ≈ 1.8 - 0.62 = 1.18
    const kbBackZ = 1.8 + (-0.65) * Math.cos(THREE.MathUtils.degToRad(18));
    const kbBackY = -1.6 + (-0.65) * Math.sin(THREE.MathUtils.degToRad(18));

    const startPt = new THREE.Vector3(0.3, kbBackY, kbBackZ);
    const endPt = new THREE.Vector3(0.3, -0.3, 0.8);

    // Create a coiled path
    const segments = 80;
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const x = THREE.MathUtils.lerp(startPt.x, endPt.x, t);
      const y = THREE.MathUtils.lerp(startPt.y, endPt.y, t);
      const z = THREE.MathUtils.lerp(startPt.z, endPt.z, t);
      // Add coil oscillation
      const coilAmp = 0.12;
      const coilFreq = 10;
      const perpX = Math.cos(t * Math.PI * coilFreq) * coilAmp * (1 - Math.abs(t - 0.5) * 2);
      const perpY = Math.sin(t * Math.PI * coilFreq) * coilAmp * (1 - Math.abs(t - 0.5) * 2);
      cablePts.push(new THREE.Vector3(x + perpX * 0.7, y + perpY, z + perpX * 0.7));
    }

    const cableCurve = new THREE.CatmullRomCurve3(cablePts);
    const cableGeo = new THREE.TubeGeometry(cableCurve, 60, 0.04, 8, false);
    const cableMat = new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.7, metalness: 0.1 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.castShadow = true; cable.receiveShadow = true;
    cableGroup.add(cable);

    // Cable connectors
    const connGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.2, 8);
    const conn1 = new THREE.Mesh(connGeo, matDarkPlastic);
    conn1.position.copy(startPt);
    conn1.rotation.z = Math.PI / 2;
    cableGroup.add(conn1);

    const conn2 = new THREE.Mesh(connGeo, matDarkPlastic);
    conn2.position.copy(endPt);
    conn2.rotation.z = Math.PI / 2;
    cableGroup.add(conn2);

    scene.add(cableGroup);

    /* ==========================================
       BUILD: FLOPPY DISKS (scattered on desk)
       ========================================== */
    function createFloppyDisk(x: number, z: number, rotY: number, label: string) {
      const diskGroup = new THREE.Group();

      // Disk body
      const bodyGeo = new THREE.BoxGeometry(0.55, 0.06, 0.55);
      const bodyMat = new THREE.MeshStandardMaterial({ color: "#2a2a38", roughness: 0.4, metalness: 0.15 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true; body.receiveShadow = true;
      diskGroup.add(body);

      // Metal slider
      const sliderGeo = new THREE.BoxGeometry(0.45, 0.005, 0.15);
      const sliderMat = new THREE.MeshStandardMaterial({ color: "#888899", roughness: 0.2, metalness: 0.6 });
      const slider = new THREE.Mesh(sliderGeo, sliderMat);
      slider.position.y = 0.033;
      diskGroup.add(slider);

      // Paper label
      const labelGeo = new THREE.PlaneGeometry(0.35, 0.28);
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 128; labelCanvas.height = 100;
      const lctx = labelCanvas.getContext("2d")!;
      lctx.fillStyle = "#faf5e8"; lctx.fillRect(0, 0, 128, 100);
      lctx.fillStyle = "#2a2a38"; lctx.fillRect(3, 3, 122, 94);
      lctx.fillStyle = "#faf5e8"; lctx.font = "10px monospace"; lctx.fillText(label, 8, 50);
      lctx.fillStyle = "#8b5cf6"; lctx.font = "bold 8px monospace"; lctx.fillText("READ ONLY", 8, 70);
      const labelTex = new THREE.CanvasTexture(labelCanvas);
      labelTex.minFilter = THREE.LinearFilter;
      const labelMat = new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.55, metalness: 0.05 });
      const labelPlane = new THREE.Mesh(labelGeo, labelMat);
      labelPlane.rotation.x = -Math.PI / 2;
      labelPlane.position.y = 0.034;
      diskGroup.add(labelPlane);

      // Slight prop-up and position
      diskGroup.position.set(x, -2.28, z);
      diskGroup.rotation.set(-0.08, rotY, 0.05);
      return diskGroup;
    }

    scene.add(createFloppyDisk(-1.6, 2.2, 0.3, "WMS Core\n  v1.0"));
    scene.add(createFloppyDisk(-1.2, 2.5, -0.5, "AI Agent\n  Hook"));

    setReady(true);

    /* ==========================================
       ANIMATION LOOP
       ========================================== */
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate);
      const t = clockRef.current.getElapsedTime();

      controls.update();

      // Pulse LEDs
      matPowerLED.emissiveIntensity = 1.2 + Math.sin(t * 2.5) * 0.4;
      if (floppyLEDRef.current) {
        floppyLEDRef.current.emissiveIntensity = 0.6 + Math.sin(t * 3.5) * 0.5 + Math.sin(t * 7.3) * 0.3;
      }
      violetAccent.intensity = 3.5 + Math.sin(t * 1.6) * 1.0;
      emeraldAccent.intensity = 2.5 + Math.sin(t * 2.0 + 1) * 0.8;

      // Screen light bleed pulsing sync with terminal "alive" feel
      screenBleed.intensity = 2.3 + Math.sin(t * 1.4) * 0.5;

      // Redraw CRT screen
      const ctx = screenCtxRef.current;
      const tex = screenTexRef.current;
      if (ctx && tex) {
        drawCRTScreen(ctx, historyRef.current, inputRef2.current);
        tex.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }
    animate();

    /* ── RESIZE ── */
    function onResize() {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth;
      const nh = Math.min(container.clientWidth * 0.8, 600);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================================
     Animate keycaps: depress TOWARD base plate (Y-)
     ================================================ */
  useEffect(() => {
    if (!activeKey) return;
    const nk = normalizeKey(activeKey);

    // Reset all keys to default state
    keyMapRef.current.forEach((mesh) => {
      if (mesh.userData.baseY !== undefined) {
        mesh.position.y = mesh.userData.baseY as number;
      }
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.set("#e8e0d4");
      mat.emissive.set("#000000");
      mat.emissiveIntensity = 0;
    });

    // Press the matched key DOWN toward the base plate
    const target = keyMapRef.current.get(nk);
    if (target && target.userData.baseY !== undefined) {
      const baseY = target.userData.baseY as number;
      target.position.y = baseY - 0.04; // depress 0.04 units toward plate
      const mat = target.material as THREE.MeshStandardMaterial;
      mat.color.set("#8b5cf6");
      mat.emissive.set("#8b5cf6");
      mat.emissiveIntensity = 1.4;
    }

    const timeout = setTimeout(() => {
      keyMapRef.current.forEach((mesh) => {
        if (mesh.userData.baseY !== undefined) {
          mesh.position.y = mesh.userData.baseY as number;
        }
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.set("#e8e0d4");
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0;
      });
    }, 220);
    return () => clearTimeout(timeout);
  }, [activeKey]);

  /* ── Focus hidden input on canvas click ── */
  const handleCanvasClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-grab active:cursor-grabbing"
      onClick={handleCanvasClick}
      style={{ minHeight: 360 }}
    >
      <canvas ref={canvasRef} className="block w-full rounded-2xl" />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/60 rounded-2xl z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-accent-violet border-t-transparent animate-spin" />
            <span className="text-sm text-text-muted font-mono">Building 3D scene...</span>
          </div>
        </div>
      )}

      {/* UI hints */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex gap-4 text-[10px] text-text-muted/50 font-mono">
        <span>🖱 Drag to rotate</span>
        <span>🔍 Scroll to zoom</span>
        <span>Click to type</span>
      </div>

      {/* Hidden input for keyboard capture */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="absolute opacity-0 pointer-events-none"
        autoFocus spellCheck={false} autoComplete="off"
        aria-label="Terminal input"
      />
    </div>
  );
}
