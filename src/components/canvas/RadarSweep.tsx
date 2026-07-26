"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Radar sweep effect — rotating line with fading trail,
 * like a PPI (Plan Position Indicator) radar display.
 * Used as a ground-projected effect or HUD element.
 */

interface RadarSweepProps {
  /** Radius of the radar sweep */
  radius?: number;
  /** Height above ground */
  y?: number;
  /** Rotation speed (rad/s) */
  speed?: number;
  /** Color of the sweep */
  color?: string;
  /** Number of trail segments */
  trailLength?: number;
  /** Whether the radar is active */
  active?: boolean;
  /** Elevation angle for 3D conical sweep (0 = flat) */
  elevation?: number;
}

export default function RadarSweep({
  radius = 25,
  y = 0.05,
  speed = 1.2,
  color = "#4cc9f0",
  trailLength = 40,
  active = true,
  elevation = 0,
}: RadarSweepProps) {
  const { scene } = useThree();
  const sweepRef = useRef<THREE.Line | null>(null);
  const trailRefs = useRef<THREE.Line[]>([]);
  const angleRef = useRef(0);
  const timeRef = useRef(0);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(2 * 3);
    positions[0] = 0;
    positions[1] = 0;
    positions[2] = 0;
    positions[3] = radius;
    positions[4] = 0;
    positions[5] = 0;
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [radius]);

  const trailGeometries = useMemo(() => {
    return Array.from({ length: trailLength }, (_, i) => {
      const geom = new THREE.BufferGeometry();
      const positions = new Float32Array(2 * 3);
      const alpha = 1 - i / trailLength;
      const r = radius * alpha;
      positions[0] = 0;
      positions[1] = 0;
      positions[2] = 0;
      positions[3] = r;
      positions[4] = 0;
      positions[5] = 0;
      geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      return geom;
    });
  }, [radius, trailLength]);

  const material = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.85,
      toneMapped: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return mat;
  }, [color]);

  const trailMaterials = useMemo(() => {
    return Array.from({ length: trailLength }, (_, i) => {
      const alpha = (1 - i / trailLength) * 0.6;
      return new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: alpha,
        toneMapped: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    });
  }, [color, trailLength]);

  useFrame((state, delta) => {
    if (!active) return;
    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;
    angleRef.current += speed * dt;
    if (angleRef.current > Math.PI * 2) angleRef.current -= Math.PI * 2;

    const angle = angleRef.current;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const elevSin = Math.sin(elevation);
    const elevCos = Math.cos(elevation);

    // Main sweep line
    if (sweepRef.current) {
      const pos = sweepRef.current.geometry.attributes.position.array as Float32Array;
      pos[3] = radius * cos * elevCos;
      pos[4] = radius * sin * elevCos;
      pos[5] = radius * elevSin;
      sweepRef.current.geometry.attributes.position.needsUpdate = true;
      sweepRef.current.rotation.y = 0; // handled by vertex positions
    }

    // Trail segments — each lags behind
    trailRefs.current.forEach((line, i) => {
      if (!line) return;
      const lag = (i + 1) * 0.025;
      const trailAngle = angleRef.current - lag * speed;
      const tcos = Math.cos(trailAngle);
      const tsin = Math.sin(trailAngle);
      const pos = line.geometry.attributes.position.array as Float32Array;
      const alpha = 1 - i / trailLength;
      const r = radius * alpha;
      pos[3] = r * tcos * elevCos;
      pos[4] = r * tsin * elevCos;
      pos[5] = r * elevSin;
      line.geometry.attributes.position.needsUpdate = true;
    });
  });

  if (!active) return null;

  return (
    <group position={[0, y, 0]}>
      <line
        ref={sweepRef}
        geometry={geometry}
        material={material}
        renderOrder={5}
      />
      {trailGeometries.map((geom, i) => (
        <line
          key={i}
          ref={(el) => { trailRefs.current[i] = el; }}
          geometry={geom}
          material={trailMaterials[i]}
          renderOrder={5 - i * 0.01}
        />
      ))}
      {/* Center blip */}
      <mesh
        geometry={new THREE.CircleGeometry(0.15, 16)}
        material={new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.4,
          toneMapped: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        })}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={4}
      />
      {/* Range rings */}
      {[0.25, 0.5, 0.75].map((frac) => (
        <mesh
          key={frac}
          geometry={new THREE.RingGeometry(radius * frac - 0.05, radius * frac + 0.05, 64)}
          material={new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.08,
            toneMapped: false,
            depthWrite: false,
            side: THREE.DoubleSide,
          })}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={3}
        />
      ))}
    </group>
  );
}