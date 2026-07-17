"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

/* ============================================
   RetroComputer3D — Three.js canvas loading
   the FBX retro computer model with procedural
   3D keyboard, CRT screen plane, and lighting.
   ============================================ */

interface RetroComputer3DProps {
  /** The terminal output lines to display on the CRT screen */
  history: { type: "input" | "output"; text: string }[];
  /** Current input text */
  input: string;
  /** Callback for input changes */
  onInputChange: (value: string) => void;
  /** Callback for submit */
  onSubmit: () => void;
  /** Callback for key down (arrow keys, backspace) */
  onKeyDown: (e: React.KeyboardEvent) => void;
  /** Which key is currently "pressed" for keyboard glow */
  activeKey: string | null;
  /** Is the component in view (for animation) */
  isInView: boolean;
}

export default function RetroComputer3D({
  history,
  input,
  onInputChange,
  onSubmit,
  onKeyDown,
  activeKey,
  isInView,
}: RetroComputer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const keyMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const keyboardBuiltRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ================================================
     Initialize Three.js scene
     ================================================ */
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.min(container.clientWidth * 0.85, 600);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1121);
    scene.fog = new THREE.Fog(0x0b1121, 8, 40);
    sceneRef.current = scene;

    // Camera — isometric-style perspective
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 80);
    camera.position.set(6, 4.5, 9);
    camera.lookAt(0, 0.3, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Lighting
    const ambient = new THREE.AmbientLight(0x404060, 1.4);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 4.5);
    keyLight.position.set(8, 12, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8899cc, 1.6);
    fillLight.position.set(-4, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffccaa, 2.2);
    rimLight.position.set(0, 1, -5);
    scene.add(rimLight);

    // Subtle violet accent light
    const accentLight = new THREE.PointLight(0x8b5cf6, 3, 6, 1.5);
    accentLight.position.set(1, 1.5, 3);
    scene.add(accentLight);

    // Emerald accent light (keyboard glow source)
    const emeraldLight = new THREE.PointLight(0x10b981, 2, 4, 2);
    emeraldLight.position.set(0, -0.5, 1.5);
    scene.add(emeraldLight);

    // Ground plane for shadows
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ================================================
       Load FBX model
       ================================================ */
    const loader = new FBXLoader();
    loader.load(
      "/retro-computer.fbx",
      (fbx) => {
        // Center and scale the model
        fbx.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Apply retro beige material to any untextured meshes
            const mat = child.material as THREE.MeshStandardMaterial;
            if (mat && mat.color && mat.color.getHex() === 0xcccccc) {
              mat.color.set("#d4cbb8");
              mat.roughness = 0.6;
              mat.metalness = 0.05;
            }
          }
        });

        // Compute bounding box and normalize
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 5 / maxDim;
        fbx.scale.setScalar(targetScale);

        // Reposition so model sits on ground plane
        box.setFromObject(fbx);
        const newCenter = box.getCenter(new THREE.Vector3());
        fbx.position.set(
          -newCenter.x,
          -box.min.y + 0.1,
          -newCenter.z,
        );

        scene.add(fbx);
        modelRef.current = fbx;

        // Build procedural 3D keyboard beneath the computer
        if (!keyboardBuiltRef.current) {
          buildKeyboard3D(scene, keyMeshesRef.current);
          keyboardBuiltRef.current = true;
        }

        setLoaded(true);
      },
      (progress) => {
        // Progress: silently track
        if (progress.total > 0) {
          const pct = Math.round((progress.loaded / progress.total) * 100);
          if (pct === 100) setLoaded(true);
        }
      },
      (err) => {
        console.error("FBX load error:", err);
        setLoadError("Failed to load 3D model. Showing fallback.");
        // Build keyboard even on error
        if (!keyboardBuiltRef.current) {
          buildKeyboard3D(scene, keyMeshesRef.current);
          keyboardBuiltRef.current = true;
        }
        setLoaded(true);
      },
    );

    /* ================================================
       Animation loop
       ================================================ */
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate);

      const t = clockRef.current.getElapsedTime();

      // Subtle floating animation on the model
      if (modelRef.current) {
        modelRef.current.position.y += Math.sin(t * 0.6) * 0.001;
        modelRef.current.rotation.y += Math.sin(t * 0.35) * 0.001;
      }

      // Pulsing accent lights
      accentLight.intensity = 3 + Math.sin(t * 1.8) * 0.8;
      emeraldLight.intensity = 2 + Math.sin(t * 2.2 + 1) * 0.6;

      renderer.render(scene, camera);
    }
    animate();

    /* ================================================
       Resize handler
       ================================================ */
    function onResize() {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = Math.min(container.clientWidth * 0.85, 600);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
    };
  }, []);

  /* ================================================
     Animate keycaps when activeKey changes
     ================================================ */
  useEffect(() => {
    if (!activeKey) return;

    // Reset all keys to default appearance
    keyMeshesRef.current.forEach((mesh) => {
      mesh.position.y = 0;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.set("#e8e0d4");
      mat.emissive.set("#000000");
      mat.emissiveIntensity = 0;
    });

    // Find matching key and animate it down with glow
    const normalizedKey = normalizeKeyLabel(activeKey);
    const targetMesh = keyMeshesRef.current.get(normalizedKey);
    if (targetMesh) {
      targetMesh.position.y = -0.07;
      const mat = targetMesh.material as THREE.MeshStandardMaterial;
      mat.color.set("#8b5cf6");
      mat.emissive.set("#8b5cf6");
      mat.emissiveIntensity = 1.4;
    }

    const timeout = setTimeout(() => {
      keyMeshesRef.current.forEach((mesh) => {
        mesh.position.y = 0;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.set("#e8e0d4");
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0;
      });
    }, 220);
    return () => clearTimeout(timeout);
  }, [activeKey]);

  /* ================================================
     Focus input when canvas clicked
     ================================================ */
  const handleCanvasClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-text"
      style={{ minHeight: 400 }}
      onClick={handleCanvasClick}
    >
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        className="block w-full rounded-2xl"
        style={{ display: "block" }}
      />

      {/* Loading indicator */}
      {!loaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/70 rounded-2xl z-10">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 border-accent-violet border-t-transparent animate-spin"
            />
            <span className="text-sm text-text-muted font-mono">
              Loading 3D model...
            </span>
          </div>
        </div>
      )}

      {/* Error fallback */}
      {loadError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="text-xs text-amber-400 bg-bg-primary/80 px-3 py-1 rounded-full">
            {loadError}
          </span>
        </div>
      )}

      {/* Hidden input for terminal interaction */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="absolute opacity-0 pointer-events-none"
        autoFocus
        spellCheck={false}
        autoComplete="off"
        aria-hidden="true"
      />
    </div>
  );
}

/* ============================================
   Procedural 3D Keyboard Builder
   ============================================ */

const KEY_ROWS_3D = [
  ["ESC", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"],
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "BKS"],
  ["TAB", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["CAPS", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "ENTER"],
  ["SHIFT", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "SHIFT"],
  ["CTRL", "ALT", "SPACE", "ALT", "CTRL"],
];

function normalizeKeyLabel(raw: string): string {
  const map: Record<string, string> = {
    " ": "SPACE",
    Backspace: "BKS",
    Enter: "ENTER",
    Tab: "TAB",
    CapsLock: "CAPS",
    Shift: "SHIFT",
    Control: "CTRL",
    Alt: "ALT",
    Escape: "ESC",
    ArrowUp: "ARROW",
    ArrowDown: "ARROW",
    ArrowLeft: "ARROW",
    ArrowRight: "ARROW",
  };
  return map[raw] || raw.toUpperCase();
}

function buildKeyboard3D(
  scene: THREE.Scene,
  keyMeshesRef: Map<string, THREE.Mesh>,
) {
  const keyboardGroup = new THREE.Group();

  // Keyboard base plate
  const baseGeo = new THREE.BoxGeometry(4.6, 0.12, 1.8);
  const baseMat = new THREE.MeshStandardMaterial({
    color: "#c4b8a8",
    roughness: 0.55,
    metalness: 0.08,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(0, -2.2, 0.6);
  base.rotation.x = THREE.MathUtils.degToRad(55);
  base.castShadow = true;
  base.receiveShadow = true;
  keyboardGroup.add(base);

  // Keyboard thickness edge
  const edgeGeo = new THREE.BoxGeometry(4.6, 0.25, 0.15);
  const edgeMat = new THREE.MeshStandardMaterial({
    color: "#a89880",
    roughness: 0.6,
    metalness: 0.05,
  });
  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.position.set(0, -2.08, 1.45);
  edge.rotation.x = THREE.MathUtils.degToRad(-35);
  edge.castShadow = true;
  edge.receiveShadow = true;
  keyboardGroup.add(edge);

  // Build keycaps
  const keyGeo = new THREE.BoxGeometry(0.16, 0.08, 0.16, 2, 2, 2);
  // Bevel the keycap a bit by modifying it... or use RoundedBoxGeometry approach
  // For simplicity, we use regular box geometry with slight rounding via segments

  const keyMat = new THREE.MeshStandardMaterial({
    color: "#e8e0d4",
    roughness: 0.5,
    metalness: 0.05,
  });

  const keyGap = 0.18;
  const rowGap = 0.19;

  KEY_ROWS_3D.forEach((row, ri) => {
    // Calculate row X offset for staggered layout
    const rowOffset =
      ri === 0
        ? -0.6
        : ri === 1
          ? -1.05
          : ri === 2
            ? -0.9
            : ri === 3
              ? -0.8
              : ri === 4
                ? -0.7
                : -0.55;

    let xCursor = rowOffset;
    const yBase = -1.85 - ri * rowGap;
    // z is the "height above keyboard plate" direction
    // Since the keyboard is tilted, we work in parent space

    row.forEach((label) => {
      let keyWidth = keyGap;
      if (label === "SPACE") keyWidth = keyGap * 5.5;
      else if (["ENTER", "SHIFT", "CAPS", "TAB", "BKS", "CTRL", "ALT"].includes(label))
        keyWidth = keyGap * 2.2;
      else if (label.startsWith("F")) keyWidth = keyGap * 0.9;

      const keyGeoIndividual = new THREE.BoxGeometry(
        keyWidth * 0.85,
        0.07,
        0.15,
        2,
        2,
        2,
      );
      const keyMesh = new THREE.Mesh(keyGeoIndividual, keyMat.clone());
      keyMesh.position.set(
        xCursor + keyWidth / 2,
        yBase,
        0.86 + ri * 0.02,
      );
      keyMesh.castShadow = true;
      keyMesh.receiveShadow = true;

      keyboardGroup.add(keyMesh);
      keyMeshesRef.set(label, keyMesh);

      xCursor += keyWidth + 0.02;
    });
  });

  scene.add(keyboardGroup);
}
