"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COLORS = ["#e2492f", "#f3b232", "#1d5a55", "#f1b9ae", "#221b17", "#fff8ec"];

type Props = {
  count?: number;
  /** Change this number to fire a fresh burst from the bottom centre. */
  burstKey?: number;
  className?: string;
};

function Pieces({ count, burstKey }: { count: number; burstKey: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pointer = useRef({ x: 0, y: 0 });

  // Lazy initialiser: runs once, so the random layout stays stable across re-renders.
  const [data] = useState(() => {
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    return Array.from({ length: count }, () => ({
      p: new THREE.Vector3(rand(-7, 7), rand(-4.5, 4.5), rand(-2.5, 1.5)),
      v: new THREE.Vector3(0, 0, 0),
      r: new THREE.Vector3(rand(0, 6), rand(0, 6), rand(0, 6)),
      spin: new THREE.Vector3(rand(-1.4, 1.4), rand(-1.4, 1.4), rand(-1.4, 1.4)),
      fall: rand(0.25, 0.75),
      sway: rand(0.2, 0.7),
      phase: rand(0, Math.PI * 2),
      s: rand(0.09, 0.2),
    }));
  });

  useEffect(() => {
    const mesh_ = mesh.current;
    if (!mesh_) return;
    const color = new THREE.Color();
    data.forEach((_, i) => {
      color.set(COLORS[i % COLORS.length]);
      mesh_.setColorAt(i, color);
    });
    if (mesh_.instanceColor) mesh_.instanceColor.needsUpdate = true;
  }, [data]);

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
      d.v.x += (Math.sin(t * d.sway + d.phase) * 0.3 - d.v.x) * Math.min(dt * 1.2, 1);
      d.v.z *= 1 - Math.min(dt * 1.5, 1);
      d.p.addScaledVector(d.v, dt);
      if (d.p.y < -5.2) {
        d.p.set((Math.random() - 0.5) * 14, 5.2, (Math.random() - 0.5) * 4 - 0.5);
        d.v.set(0, -d.fall, 0);
      }
      d.r.addScaledVector(d.spin, dt);

      dummy.position.copy(d.p);
      dummy.rotation.set(d.r.x, d.r.y, d.r.z);
      dummy.scale.set(d.s, d.s * 1.9, d.s * 0.08);
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
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.55} metalness={0.05} />
    </instancedMesh>
  );
}

export default function Confetti({ count = 110, burstKey = 0, className }: Props) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />
        <Pieces count={count} burstKey={burstKey} />
      </Canvas>
    </div>
  );
}
