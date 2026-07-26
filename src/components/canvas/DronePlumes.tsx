"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Particle system for drone motor exhaust / thruster plumes.
 * Uses additive blended points with noise-driven motion.
 */

const PARTICLE_COUNT = 180;
const PARTICLE_SIZE = 0.035;

type PlumeProps = {
  /** World position of the motor mount */
  position: readonly [number, number, number];
  /** Local rotation of the motor (default points down) */
  rotation?: readonly [number, number, number];
  /** Base color of the plume */
  color?: string;
  /** Intensity multiplier */
  intensity?: number;
  /** Whether plume is active */
  active?: boolean;
};

function Plume({
  position,
  rotation = [-Math.PI / 2, 0, 0],
  color = "#4cc9f0",
  intensity = 1,
  active = true,
}: PlumeProps) {
  const { scene } = useThree();
  const pointsRef = useRef<THREE.Points | null>(null);
  const positionsRef = useRef<Float32Array | null>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const lifetimesRef = useRef<Float32Array | null>(null);
  const agesRef = useRef<Float32Array | null>(null);
  const timeRef = useRef(0);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const lifetimes = new Float32Array(PARTICLE_COUNT);
    const ages = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const alphas = new Float32Array(PARTICLE_COUNT);

    // Set refs BEFORE initializing particles
    positionsRef.current = positions;
    velocitiesRef.current = velocities;
    lifetimesRef.current = lifetimes;
    agesRef.current = ages;

    // Initialize particles with refs now available
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      resetParticle(i);
      ages[i] = Math.random() * lifetimes[i];
      sizes[i] = PARTICLE_SIZE * (0.5 + Math.random() * 0.8);
      alphas[i] = 0.6 + Math.random() * 0.4;
    }

    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
    geom.setAttribute("lifetime", new THREE.BufferAttribute(lifetimes, 1));
    geom.setAttribute("age", new THREE.BufferAttribute(ages, 1));
    geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));

    return geom;
  }, []);

  const material = useMemo(() => {
    const tex = createParticleTexture(color);
    return new THREE.PointsMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      size: PARTICLE_SIZE,
      vertexColors: false,
      sizeAttenuation: true,
      opacity: 0.8 * intensity,
    });
  }, [color, intensity]);

  function createParticleTexture(tint: string) {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, tint);
    grad.addColorStop(0.3, tint.replace(")", ",0.6)").replace("rgb", "rgba"));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function resetParticle(i: number) {
    const pos = positionsRef.current!;
    const vel = velocitiesRef.current!;
    const life = lifetimesRef.current!;

    // Emit from a small disk at motor exit
    const r = 0.015 * Math.sqrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    pos[i * 3] = r * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(theta);
    pos[i * 3 + 2] = 0;

    // Initial velocity: fast down with spread
    const speed = 1.8 + Math.random() * 1.2;
    vel[i * 3] = (Math.random() - 0.5) * 0.4;
    vel[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
    vel[i * 3 + 2] = -speed;

    life[i] = 0.35 + Math.random() * 0.25;
  }

  useFrame((state, delta) => {
    if (!active || !pointsRef.current) return;

    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;

    const pos = positionsRef.current!;
    const vel = velocitiesRef.current!;
    const life = lifetimesRef.current!;
    const age = agesRef.current!;
    const sizes = pointsRef.current.geometry.getAttribute("size") as THREE.BufferAttribute;
    const alphas = pointsRef.current.geometry.getAttribute("alpha") as THREE.BufferAttribute;

    // Turbulence field (curl noise approximation)
    const turbX = Math.sin(timeRef.current * 2.3) * 0.3;
    const turbY = Math.cos(timeRef.current * 1.7) * 0.3;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      age[i] += dt;

      if (age[i] >= life[i]) {
        resetParticle(i);
        age[i] = 0;
        continue;
      }

      const t = age[i] / life[i];

      // Position update with turbulence
      pos[i * 3] += vel[i * 3] * dt + turbX * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt + turbY * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;

      // Velocity decay + buoyancy
      vel[i * 3] *= 0.985;
      vel[i * 3 + 1] *= 0.985;
      vel[i * 3 + 2] *= 0.99;
      vel[i * 3 + 2] += 0.15 * dt; // slight upward buoyancy

      // Size & alpha fade
      const fade = 1 - t * t;
      sizes.array[i] = PARTICLE_SIZE * (0.5 + 0.5 * fade) * (0.5 + Math.random() * 0.3);
      alphas.array[i] = 0.8 * intensity * fade * fade;
    }

    sizes.needsUpdate = true;
    alphas.needsUpdate = true;
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.set(...rotation);
      pointsRef.current.position.set(...position);
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} renderOrder={10} />
  );
}

/**
 * Four motor plumes for a quadcopter.
 */
export default function DronePlumes({
  basePosition = [0, 0.4, 0],
  armLength = 0.38,
  active = true,
  intensity = 1,
}: {
  basePosition?: [number, number, number];
  armLength?: number;
  active?: boolean;
  intensity?: number;
}) {
  const motorPositions = useMemo(() => [
    [basePosition[0] + armLength, basePosition[1], basePosition[2]],
    [basePosition[0] - armLength, basePosition[1], basePosition[2]],
    [basePosition[0], basePosition[1] + armLength, basePosition[2]],
    [basePosition[0], basePosition[1] - armLength, basePosition[2]],
  ] as const, [basePosition, armLength]);

  return (
    <group>
      {motorPositions.map((pos, i) => (
        <Plume
          key={i}
          position={pos}
          color={i < 2 ? "#4cc9f0" : "#7c3aed"}
          intensity={intensity}
          active={active}
        />
      ))}
    </group>
  );
}