"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Atmospheric particle field — dust, debris, sensor noise.
 * Adds depth and "lived-in" feel to the aerial robotics environment.
 */

interface ParticleFieldProps {
  /** Number of particles */
  count?: number;
  /** Bounding box size */
  bounds?: [number, number, number];
  /** Particle color */
  color?: string;
  /** Base opacity */
  opacity?: number;
  /** Drift velocity */
  drift?: [number, number, number];
  /** Turbulence strength */
  turbulence?: number;
  /** Particle size */
  size?: number;
  /** Render order */
  renderOrder?: number;
}

const DEFAULT_COUNT = 3000;

export default function ParticleField({
  count = DEFAULT_COUNT,
  bounds = [80, 40, 80],
  color = "#4cc9f0",
  opacity = 0.3,
  drift = [0.3, 0.05, 0.2],
  turbulence = 0.15,
  size = 0.05,
  renderOrder = 5,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points | null>(null);
  const positionsRef = useRef<Float32Array>(new Float32Array(0));
  const velocitiesRef = useRef<Float32Array>(new Float32Array(0));
  const sizesRef = useRef<Float32Array>(new Float32Array(0));
  const alphasRef = useRef<Float32Array>(new Float32Array(0));
  const timeRef = useRef(0);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);

    const [bx, by, bz] = bounds;
    const color3 = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      // Uniform distribution in bounding box
      positions[i * 3] = (Math.random() - 0.5) * bx;
      positions[i * 3 + 1] = Math.random() * by * 0.8; // Keep mostly above ground
      positions[i * 3 + 2] = (Math.random() - 0.5) * bz;

      // Random slow drift velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.5 + drift[0];
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2 + drift[1];
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5 + drift[2];

      sizes[i] = size * (0.3 + Math.random() * 0.7);
      alphas[i] = opacity * (0.2 + Math.random() * 0.8);
    }

    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));

    positionsRef.current = positions;
    velocitiesRef.current = velocities;
    sizesRef.current = sizes;
    alphasRef.current = alphas;

    return geom;
  }, [count, bounds, color, drift, opacity, size]);

  const material = useMemo(() => {
    const sprite = createParticleSprite(color);
    return new THREE.PointsMaterial({
      map: sprite,
      size: 1,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: false,
      opacity: 1,
      toneMapped: false,
      alphaTest: 0.001,
    });
  }, [color]);

  function createParticleSprite(tint: string) {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, tint);
    grad.addColorStop(0.5, tint.replace(")", ",0.3)").replace("rgb", "rgba"));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  useFrame((state, delta) => {
    if (!pointsRef.current || !positionsRef.current) return;
    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;

    const positions = positionsRef.current;
    const velocities = velocitiesRef.current;
    const [bx, by, bz] = bounds;
    const halfX = bx / 2;
    const halfZ = bz / 2;

    // Simplex-like noise for turbulence (cheap approximation)
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;

      // Apply velocity
      positions[ix] += velocities[ix] * dt;
      positions[iy] += velocities[iy] * dt;
      positions[iz] += velocities[iz] * dt;

      // Turbulence
      const t = timeRef.current * 0.5;
      const nx = Math.sin(positions[iz] * 0.1 + t + i * 0.01) * turbulence;
      const ny = Math.cos(positions[ix] * 0.08 + t * 0.7 + i * 0.01) * turbulence * 0.5;
      const nz = Math.sin(positions[ix] * 0.12 + t * 1.3 + i * 0.01) * turbulence;

      positions[ix] += nx * dt;
      positions[iy] += ny * dt;
      positions[iz] += nz * dt;

      // Wrap around bounds
      if (positions[ix] > halfX) positions[ix] = -halfX;
      if (positions[ix] < -halfX) positions[ix] = halfX;
      if (positions[iy] > by) positions[iy] = 0;
      if (positions[iy] < 0) positions[iy] = by;
      if (positions[iz] > halfZ) positions[iz] = -halfZ;
      if (positions[iz] < -halfZ) positions[iz] = halfZ;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      renderOrder={renderOrder}
    />
  );
}