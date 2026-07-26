"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Targeting reticle / HUD crosshair with lock-on animation,
 * range indicator, and threat assessment display.
 * Projects into 3D space at a target distance.
 */

interface TargetingReticleProps {
  /** World position to track */
  targetPosition?: [number, number, number];
  /** Distance to target (for range display) */
  range?: number;
  /** Lock state: "search" | "tracking" | "locked" | "lost" */
  lockState?: "search" | "tracking" | "locked" | "lost";
  /** Reticle size */
  size?: number;
  /** Color theme */
  color?: string;
  /** Whether reticle is active */
  active?: boolean;
}

const STATE_COLORS = {
  search: "#ffaa00",
  tracking: "#4cc9f0",
  locked: "#00ff88",
  lost: "#ff3333",
} as const;

export default function TargetingReticle({
  targetPosition = [0, 1, -10],
  range = 150,
  lockState = "search",
  size = 1.5,
  color,
  active = true,
}: TargetingReticleProps) {
  const { scene, camera } = useThree();
  const reticleRef = useRef<THREE.Group | null>(null);
  const bracketRefs = useRef<THREE.Mesh[]>([]);
  const rangeTextRef = useRef<THREE.Sprite | null>(null);
  const stateTextRef = useRef<THREE.Sprite | null>(null);
  const timeRef = useRef(0);
  const lockProgressRef = useRef(0);

  const stateColor = color || STATE_COLORS[lockState];

  const bracketGeo = useMemo(() => new THREE.BufferGeometry(), []);
  const bracketMat = useMemo(() =>
    new THREE.LineBasicMaterial({
      color: stateColor,
      transparent: true,
      opacity: 0.9,
      toneMapped: false,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }), [stateColor]);

  const createBracket = (rotation: number) => {
    const positions = new Float32Array(8 * 3);
    const s = size;
    const t = 0.3;
    const gap = 0.15;
    // Corner bracket: two perpendicular lines
    // Top-left corner
    positions[0] = -s * (1 + gap); positions[1] = s * (1 + gap); positions[2] = 0;
    positions[3] = -s * gap; positions[4] = s * (1 + gap); positions[5] = 0;
    positions[6] = -s * (1 + gap); positions[7] = s * (1 + gap); positions[8] = 0;
    positions[9] = -s * (1 + gap); positions[10] = s * gap; positions[11] = 0;
    // Top-right
    positions[12] = s * (1 + gap); positions[13] = s * (1 + gap); positions[14] = 0;
    positions[15] = s * gap; positions[16] = s * (1 + gap); positions[17] = 0;
    positions[18] = s * (1 + gap); positions[19] = s * (1 + gap); positions[20] = 0;
    positions[21] = s * (1 + gap); positions[22] = s * gap; positions[23] = 0;
    // Bottom-right
    positions[24] = s * (1 + gap); positions[25] = -s * (1 + gap); positions[26] = 0;
    positions[27] = s * gap; positions[28] = -s * (1 + gap); positions[29] = 0;
    positions[30] = s * (1 + gap); positions[31] = -s * (1 + gap); positions[32] = 0;
    positions[33] = s * (1 + gap); positions[34] = -s * gap; positions[35] = 0;
    // Bottom-left
    positions[36] = -s * (1 + gap); positions[37] = -s * (1 + gap); positions[38] = 0;
    positions[39] = -s * gap; positions[40] = -s * (1 + gap); positions[41] = 0;
    positions[42] = -s * (1 + gap); positions[43] = -s * (1 + gap); positions[44] = 0;
    positions[44] = -s * (1 + gap); positions[45] = -s * gap; positions[46] = 0;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Line(geo, bracketMat.clone());
  };

  useFrame((state, delta) => {
    if (!active || !reticleRef.current) return;
    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;

    const group = reticleRef.current;

    // Smoothly track target position
    const target = new THREE.Vector3(...targetPosition);
    const currentPos = new THREE.Vector3();
    group.getWorldPosition(currentPos);
    currentPos.lerp(target, 1 - Math.exp(-8 * dt));
    group.position.copy(currentPos);

    // Always face camera (billboard)
    group.quaternion.copy(camera.quaternion);

    // Lock progress animation
    const targetProgress = lockState === "locked" ? 1 : lockState === "tracking" ? 0.5 : 0;
    lockProgressRef.current = THREE.MathUtils.damp(lockProgressRef.current, targetProgress, 4, dt);

    // Bracket animation
    bracketRefs.current.forEach((bracket, i) => {
      if (!bracket) return;
      const baseScale = 1 + 0.15 * Math.sin(timeRef.current * 3 + i * Math.PI / 2);
      const lockScale = 1 + lockProgressRef.current * 0.3;
      bracket.scale.setScalar(baseScale * lockScale);

      // Color pulse when locked
      const mat = bracket.material as THREE.LineBasicMaterial;
      if (lockState === "locked") {
        const pulse = 0.7 + 0.3 * Math.sin(timeRef.current * 8);
        mat.opacity = pulse;
        mat.color.setHSL(0.45, 1, 0.5 + 0.1 * Math.sin(timeRef.current * 6));
      } else if (lockState === "tracking") {
        mat.opacity = 0.6 + 0.3 * Math.sin(timeRef.current * 4);
      } else {
        mat.opacity = 0.5 + 0.2 * Math.sin(timeRef.current * 2);
      }
    });

    // Range indicator
    if (rangeTextRef.current) {
      const tex = createTextTexture(`${range.toFixed(0)}m`, stateColor);
      if (rangeTextRef.current.material.map) rangeTextRef.current.material.map.dispose();
      rangeTextRef.current.material.map = tex;
      rangeTextRef.current.material.needsUpdate = true;
    }

    // State indicator
    if (stateTextRef.current) {
      const tex = createTextTexture(lockState.toUpperCase(), stateColor);
      if (stateTextRef.current.material.map) stateTextRef.current.material.map.dispose();
      stateTextRef.current.material.map = tex;
      stateTextRef.current.material.needsUpdate = true;
    }
  });

  function createTextTexture(text: string, tint: string) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 256, 64);
    ctx.font = "700 36px 'JetBrains Mono', monospace";
    ctx.fillStyle = tint;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = tint;
    ctx.shadowBlur = 16;
    ctx.fillText(text, 128, 32);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  if (!active) return null;

  return (
    <group ref={reticleRef} position={targetPosition}>
      {/* Four corner brackets */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          ref={(el) => { bracketRefs.current[i] = el; }}
          geometry={bracketGeo}
          material={bracketMat}
          rotation={[0, 0, i * Math.PI / 2]}
          renderOrder={20}
        />
      ))}

      {/* Center crosshair */}
      <line
        geometry={(() => {
          const geo = new THREE.BufferGeometry();
          const s = size * 0.4;
          const positions = new Float32Array(4 * 3);
          positions[0] = -s; positions[1] = 0; positions[2] = 0;
          positions[3] = -s * 0.3; positions[4] = 0; positions[5] = 0;
          positions[6] = s * 0.3; positions[7] = 0; positions[8] = 0;
          positions[9] = s; positions[10] = 0; positions[11] = 0;
          geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          return geo;
        })()}
        material={bracketMat}
        renderOrder={20}
      />
      <line
        geometry={(() => {
          const geo = new THREE.BufferGeometry();
          const s = size * 0.4;
          const positions = new Float32Array(4 * 3);
          positions[0] = 0; positions[1] = -s; positions[2] = 0;
          positions[3] = 0; positions[4] = -s * 0.3; positions[5] = 0;
          positions[6] = 0; positions[7] = s * 0.3; positions[8] = 0;
          positions[9] = 0; positions[10] = s; positions[11] = 0;
          geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          return geo;
        })()}
        material={bracketMat}
        renderOrder={20}
      />

      {/* Range display */}
      <sprite
        ref={rangeTextRef}
        position={[0, -size * 1.8, 0]}
        scale={[3, 0.75, 1]}
        material={new THREE.SpriteMaterial({
          map: createTextTexture(`${range.toFixed(0)}m`, stateColor),
          transparent: true,
          toneMapped: false,
          depthTest: false,
          depthWrite: false,
        })}
        renderOrder={21}
      />

      {/* Lock state */}
      <sprite
        ref={stateTextRef}
        position={[0, size * 1.8, 0]}
        scale={[3, 0.75, 1]}
        material={new THREE.SpriteMaterial({
          map: createTextTexture(lockState.toUpperCase(), stateColor),
          transparent: true,
          toneMapped: false,
          depthTest: false,
          depthWrite: false,
        })}
        renderOrder={21}
      />

      {/* Distance rings */}
      {[0.5, 1].map((frac) => (
        <mesh
          key={frac}
          geometry={new THREE.RingGeometry(size * frac * 0.9, size * frac * 1.1, 64)}
          material={new THREE.MeshBasicMaterial({
            color: stateColor,
            transparent: true,
            opacity: 0.15 * (lockProgressRef.current + 0.3),
            toneMapped: false,
            depthTest: false,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
          })}
          renderOrder={19}
        />
      ))}
    </group>
  );
}