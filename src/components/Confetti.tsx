"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ConfettiVariant } from "@/lib/occasions";

type Props = {
  count?: number;
  /** Change this number to fire a fresh burst from the bottom centre. */
  burstKey?: number;
  /** confetti = birthday, snow = Christmas, petals = Vesak, hearts = Valentine's. */
  variant?: ConfettiVariant;
  className?: string;
};

type Look = {
  colors: string[];
  geometry: "box" | "sphere" | "heart";
  fall: [number, number];
  sway: number;
  size: [number, number];
  /** Instance scale from the random size. */
  shape: (s: number) => [number, number, number];
  /** How fast each axis spins. */
  spin: [number, number, number];
};

const LOOKS: Record<ConfettiVariant, Look> = {
  confetti: {
    colors: ["#e2492f", "#f3b232", "#1d5a55", "#f1b9ae", "#221b17", "#fff8ec"],
    geometry: "box",
    fall: [0.25, 0.75],
    sway: 0.3,
    size: [0.09, 0.2],
    shape: (s) => [s, s * 1.9, s * 0.08],
    spin: [1.4, 1.4, 1.4],
  },
  snow: {
    colors: ["#ffffff", "#dcebf7", "#ffffff", "#f3b232", "#c9302c"],
    geometry: "sphere",
    fall: [0.2, 0.5],
    sway: 0.45,
    size: [0.07, 0.17],
    shape: (s) => [s, s, s],
    spin: [0.2, 0.2, 0.2],
  },
  petals: {
    colors: ["#f1b9ae", "#fff8ec", "#f3b232", "#e8a0b4", "#fff3c9"],
    geometry: "sphere",
    fall: [0.18, 0.45],
    sway: 0.5,
    size: [0.1, 0.2],
    shape: (s) => [s * 1.1, s * 1.9, s * 0.28],
    spin: [0.9, 0.7, 1.1],
  },
  hearts: {
    colors: ["#d93a5e", "#f1b9ae", "#e2492f", "#fff8ec", "#f6d6cf"],
    geometry: "heart",
    fall: [0.22, 0.55],
    sway: 0.4,
    size: [0.1, 0.22],
    shape: (s) => [s * 1.2, s * 1.2, s * 1.2],
    spin: [0.15, 1.1, 0.25],
  },
};

function makeGeometry(kind: Look["geometry"]): THREE.BufferGeometry {
  if (kind === "box") return new THREE.BoxGeometry(1, 1, 1);
  if (kind === "sphere") return new THREE.SphereGeometry(0.5, 12, 10);
  const s = new THREE.Shape();
  s.moveTo(0.25, 0.25);
  s.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0);
  s.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35);
  s.bezierCurveTo(-0.3, 0.55, -0.15, 0.77, 0.25, 0.95);
  s.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35);
  s.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0);
  s.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: false });
  g.rotateZ(Math.PI); // the classic shape is drawn point-up
  g.center();
  return g;
}

function Pieces({ count, burstKey, variant }: { count: number; burstKey: number; variant: ConfettiVariant }) {
  const look = LOOKS[variant];
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pointer = useRef({ x: 0, y: 0 });
  const geometry = useMemo(() => makeGeometry(look.geometry), [look.geometry]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Lazy initialiser: runs once per mount, so the random layout stays stable across re-renders.
  const [data] = useState(() => {
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    return Array.from({ length: count }, () => ({
      p: new THREE.Vector3(rand(-7, 7), rand(-4.5, 4.5), rand(-2.5, 1.5)),
      v: new THREE.Vector3(0, 0, 0),
      r: new THREE.Vector3(rand(0, 6), rand(0, 6), rand(0, 6)),
      spin: new THREE.Vector3(
        rand(-1, 1) * look.spin[0],
        rand(-1, 1) * look.spin[1],
        rand(-1, 1) * look.spin[2],
      ),
      fall: rand(look.fall[0], look.fall[1]),
      sway: rand(0.2, 0.7),
      phase: rand(0, Math.PI * 2),
      s: rand(look.size[0], look.size[1]),
    }));
  });

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const color = new THREE.Color();
    data.forEach((_, i) => {
      color.set(look.colors[i % look.colors.length]);
      m.setColorAt(i, color);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [data, look]);

  // Fire a burst: everything is flung upward from the bottom centre, then settles
  // back into the slow fall because velocity relaxes toward each piece's own fall speed.
  useEffect(() => {
    if (!burstKey) return;
    data.forEach((d) => {
      d.p.set((Math.random() - 0.5) * 2.2, -4.4, (Math.random() - 0.5) * 2);
      d.v.set((Math.random() - 0.5) * 9, 6 + Math.random() * 7, (Math.random() - 0.5) * 3);
    });
  }, [burstKey, data]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    data.forEach((d, i) => {
      d.v.y += (-d.fall - d.v.y) * Math.min(dt * 1.6, 1);
      d.v.x += (Math.sin(t * d.sway + d.phase) * look.sway - d.v.x) * Math.min(dt * 1.2, 1);
      d.v.z *= 1 - Math.min(dt * 1.5, 1);
      d.p.addScaledVector(d.v, dt);
      if (d.p.y < -5.2) {
        d.p.set((Math.random() - 0.5) * 14, 5.2, (Math.random() - 0.5) * 4 - 0.5);
        d.v.set(0, -d.fall, 0);
      }
      d.r.addScaledVector(d.spin, dt);

      const [sx, sy, sz] = look.shape(d.s);
      dummy.position.copy(d.p);
      dummy.rotation.set(d.r.x, d.r.y, d.r.z);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;

    // Soft parallax toward the pointer.
    state.camera.position.x += (pointer.current.x * 0.6 - state.camera.position.x) * 0.04;
    state.camera.position.y += (-pointer.current.y * 0.4 - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial roughness={0.55} metalness={0.05} />
    </instancedMesh>
  );
}

export default function Confetti({ count = 110, burstKey = 0, variant = "confetti", className }: Props) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />
        {/* The key rebuilds the pieces whenever the theme or the piece count changes. Without it the
            instanced mesh is recreated at the new size but the old, smaller set of positions and
            colours is reused, which left grey, un-positioned pieces piled in the middle. */}
        <Pieces key={`${variant}-${count}`} count={count} burstKey={burstKey} variant={variant} />
      </Canvas>
    </div>
  );
}
