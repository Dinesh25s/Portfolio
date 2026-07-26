"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * LIDAR point cloud simulation — rotating scanner generating
 * a spherical point cloud with realistic noise and dropouts.
 * Visualizes the "perception" layer of an autonomous system.
 */

interface LidarScannerProps {
  /** Number of laser channels (vertical resolution) */
  channels?: number;
  /** Points per channel per rotation */
  pointsPerChannel?: number;
  /** Maximum range (meters) */
  maxRange?: number;
  /** Rotation speed (rad/s) */
  rotationSpeed?: number;
  /** Vertical FOV (degrees) */
  verticalFov?: number;
  /** Vertical offset (degrees) */
  verticalOffset?: number;
  /** Point color */
  color?: string;
  /** Point size */
  pointSize?: number;
  /** Noise standard deviation (meters) */
  noiseStdDev?: number;
  /** Dropout probability per point */
  dropoutProb?: number;
  /** Whether scanner is active */
  active?: boolean;
  /** Position offset */
  position?: [number, number, number];
  /** Show scan lines (beam visualization) */
  showBeams?: boolean;
}

const PARTICLE_COUNT = 12000;

export default function LidarScanner({
  channels = 32,
  pointsPerChannel = 400,
  maxRange = 30,
  rotationSpeed = 4.0,
  verticalFov = 40,
  verticalOffset = -15,
  color = "#7df9ff",
  pointSize = 0.08,
  noiseStdDev = 0.02,
  dropoutProb = 0.02,
  active = true,
  position = [0, 0.8, 0],
  showBeams = true,
}: LidarScannerProps) {
  const { scene } = useThree();
  const pointsRef = useRef<THREE.Points | null>(null);
  const angleRef = useRef(0);
  const timeRef = useRef(0);
  const frameCount = useRef(0);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const alphas = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const ages = new Float32Array(PARTICLE_COUNT);
    const lifetimes = new Float32Array(PARTICLE_COUNT);

    const color3 = new THREE.Color(color);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Initialize with random positions
      const r = maxRange * Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * (verticalFov * Math.PI / 180) + verticalOffset * Math.PI / 180;

      positions[i * 3] = r * Math.cos(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi);
      positions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);

      colors[i * 3] = color3.r;
      colors[i * 3 + 1] = color3.g;
      colors[i * 3 + 2] = color3.b;

      alphas[i] = 0.6 + Math.random() * 0.4;
      sizes[i] = pointSize * (0.5 + Math.random() * 0.8);
      ages[i] = Math.random() * 2;
      lifetimes[i] = 1.5 + Math.random() * 1.5;
    }

    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geom.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
    geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute("age", new THREE.BufferAttribute(ages, 1));
    geom.setAttribute("lifetime", new THREE.BufferAttribute(lifetimes, 1));

    return geom;
  }, [channels, pointsPerChannel, maxRange, verticalFov, verticalOffset, color, pointSize]);

  const material = useMemo(() => {
    const sprite = createPointSprite(color);
    return new THREE.PointsMaterial({
      map: sprite,
      size: pointSize,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      opacity: 0.85,
      toneMapped: false,
    });
  }, [color, pointSize]);

  const beamGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(2 * 3);
    positions[0] = 0;
    positions[1] = 0;
    positions[2] = 0;
    positions[3] = 0;
    positions[4] = 0;
    positions[5] = 0;
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  const beamMaterial = useMemo(() =>
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
      toneMapped: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  [color]);

  // Create beam line objects for primitive rendering
  const beamLines = useMemo(() => {
    const lines: THREE.Line[] = [];
    for (let c = 0; c < channels; c++) {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(2 * 3);
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      lines.push(new THREE.Line(geo, beamMaterial.clone()));
    }
    return lines;
  }, [channels, beamMaterial]);

  function createPointSprite(tint: string) {
    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, tint);
    grad.addColorStop(0.5, tint.replace(")", ",0.4)").replace("rgb", "rgba"));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  useFrame((state, delta) => {
    if (!active) return;
    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;
    angleRef.current += rotationSpeed * dt;
    if (angleRef.current > Math.PI * 2) angleRef.current -= Math.PI * 2;
    frameCount.current++;

    const posAttr = pointsRef.current?.geometry.getAttribute("position") as THREE.BufferAttribute;
    const alphaAttr = pointsRef.current?.geometry.getAttribute("alpha") as THREE.BufferAttribute;
    const ageAttr = pointsRef.current?.geometry.getAttribute("age") as THREE.BufferAttribute;
    const lifetimeAttr = pointsRef.current?.geometry.getAttribute("lifetime") as THREE.BufferAttribute;
    const sizeAttr = pointsRef.current?.geometry.getAttribute("size") as THREE.BufferAttribute;

    if (!posAttr || !alphaAttr || !ageAttr || !lifetimeAttr || !sizeAttr) return;

    const positions = posAttr.array as Float32Array;
    const alphas = alphaAttr.array as Float32Array;
    const ages = ageAttr.array as Float32Array;
    const lifetimes = lifetimeAttr.array as Float32Array;
    const sizes = sizeAttr.array as Float32Array;

    const currentAngle = angleRef.current;
    const pointsPerFrame = Math.ceil(PARTICLE_COUNT / (2 * Math.PI / rotationSpeed / 60)); // ~60fps

    // Update existing points (age them out)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      ages[i] += dt;
      const t = ages[i] / lifetimes[i];
      if (t >= 1) {
        // Respawn this point at current scan angle
        const channel = i % channels;
        const vFovRad = (verticalFov * Math.PI) / 180;
        const vOffsetRad = (verticalOffset * Math.PI) / 180;
        const phi = (channel / Math.max(1, channels - 1)) * vFovRad + vOffsetRad - vFovRad / 2;
        const range = maxRange * (0.1 + 0.9 * Math.random());
        const noise = (Math.random() - 0.5) * 2 * noiseStdDev;

        const r = range + noise;
        const theta = currentAngle + (Math.random() - 0.5) * 0.01;

        if (Math.random() > dropoutProb) {
          positions[i * 3] = r * Math.cos(phi) * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(phi);
          positions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
          alphas[i] = 0.7 + Math.random() * 0.3;
          ages[i] = 0;
          lifetimes[i] = 1.5 + Math.random() * 1.5;
          sizes[i] = pointSize * (0.5 + Math.random() * 0.8);
        } else {
          alphas[i] = 0;
        }
      } else {
        // Fade out
        const fade = 1 - t * t;
        alphas[i] = 0.7 * fade;
        sizes[i] = pointSize * fade * (0.5 + Math.random() * 0.3);
      }
    }

    posAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;
    ageAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;

    // Update beam visualization
    if (showBeams) {
      beamLines.forEach((beam, c) => {
        const vFovRad = (verticalFov * Math.PI) / 180;
        const vOffsetRad = (verticalOffset * Math.PI) / 180;
        const phi = (c / Math.max(1, channels - 1)) * vFovRad + vOffsetRad - vFovRad / 2;
        const range = maxRange * 0.8;
        const beamPos = beam.geometry.attributes.position.array as Float32Array;
        beamPos[3] = range * Math.cos(phi) * Math.cos(currentAngle);
        beamPos[4] = range * Math.sin(phi);
        beamPos[5] = range * Math.cos(phi) * Math.sin(currentAngle);
        beam.geometry.attributes.position.needsUpdate = true;
      });
    }
  });

  if (!active) return null;

  return (
    <group position={position}>
      <points
        ref={pointsRef}
        geometry={geometry}
        material={material}
        renderOrder={8}
      />

      {showBeams && (
        <group>
          {beamLines.map((beam, c) => (
            <primitive key={c} object={beam} renderOrder={7} />
          ))}
        </group>
      )}

      {/* Scanner housing */}
      <mesh
        geometry={new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16)}
        material={new THREE.MeshStandardMaterial({
          color: "#1a1f2e",
          metalness: 0.8,
          roughness: 0.2,
        })}
        position={[0, 0, 0]}
        renderOrder={9}
      >
        <mesh
          geometry={new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12)}
          material={new THREE.MeshStandardMaterial({
            color: "#0a0f1a",
            metalness: 0.9,
            roughness: 0.1,
            emissive: color,
            emissiveIntensity: 0.3,
          })}
          position={[0, 0.115, 0]}
          renderOrder={9}
        />
      </mesh>

      {/* Rotating mirror indicator */}
      <mesh
        geometry={new THREE.BoxGeometry(0.02, 0.02, 0.18)}
        material={new THREE.MeshBasicMaterial({
          color: "#ffd700",
          transparent: true,
          opacity: 0.8,
          toneMapped: false,
        })}
        position={[0, 0.22, 0]}
        rotation={[0, angleRef.current, 0]}
        renderOrder={9}
      />
    </group>
  );
}