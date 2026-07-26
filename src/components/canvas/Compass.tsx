"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * HUD Compass / Heading indicator — shows drone orientation,
 * cardinal directions, and current heading.
 */

interface CompassProps {
  /** Follow camera or track a specific heading */
  trackCamera?: boolean;
  /** Fixed heading if not tracking camera (degrees) */
  fixedHeading?: number;
  /** Position in screen space (NDC) */
  position?: [number, number];
  /** Radius in world units (when in 3D) */
  radius?: number;
  /** Color theme */
  color?: string;
  /** Show pitch ladder */
  showPitchLadder?: boolean;
}

export default function Compass({
  trackCamera = true,
  fixedHeading = 0,
  radius = 1.5,
  color = "#4cc9f0",
  showPitchLadder = true,
}: CompassProps) {
  const { camera } = useThree();
  const compassRef = useRef<THREE.Group | null>(null);
  const headingRef = useRef(0);
  const pitchRef = useRef(0);

  const tickGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(72 * 3);
    let idx = 0;
    for (let i = 0; i < 72; i++) {
      const angle = (i / 72) * Math.PI * 2;
      const major = i % 9 === 0;
      const r1 = major ? radius * 0.9 : radius * 0.95;
      const r2 = radius;
      positions[idx++] = Math.cos(angle) * r1;
      positions[idx++] = Math.sin(angle) * r1;
      positions[idx++] = 0;
      positions[idx++] = Math.cos(angle) * r2;
      positions[idx++] = Math.sin(angle) * r2;
      positions[idx++] = 0;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [radius]);

  const tickMaterial = useMemo(() =>
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.7,
      toneMapped: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }), [color]);

  const pitchMaterial = useMemo(() =>
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.4,
      toneMapped: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }), [color]);

  useFrame(() => {
    if (!compassRef.current) return;

    if (trackCamera) {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      headingRef.current = Math.atan2(dir.x, dir.z);

      const pitchDir = camera.getWorldDirection(new THREE.Vector3());
      pitchRef.current = Math.asin(Math.max(-1, Math.min(1, -pitchDir.y)));
    } else {
      headingRef.current = THREE.MathUtils.degToRad(fixedHeading);
    }

    compassRef.current.rotation.z = -headingRef.current;

    if (showPitchLadder) {
      pitchLines.forEach((line, i) => {
        const pitchDeg = (i - 10) * 9;
        const targetY = (pitchDeg / 45) * radius * 0.8 - pitchRef.current * radius * 2;
        const pos = line.geometry.attributes.position.array as Float32Array;
        pos[1] = targetY;
        pos[4] = targetY;
        line.geometry.attributes.position.needsUpdate = true;
      });
    }
  });

  const labels = useMemo(() => {
    const sprites: THREE.Sprite[] = [];
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    dirs.forEach((dir, i) => {
      ctx.clearRect(0, 0, 128, 64);
      ctx.font = "700 36px 'JetBrains Mono', monospace";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fillText(dir, 64, 32);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        toneMapped: false,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.5, 0.25, 1);
      const angle = (i / 8) * Math.PI * 2;
      sprite.position.set(Math.cos(angle) * radius * 1.25, Math.sin(angle) * radius * 1.25, 0);
      sprites.push(sprite);
    });

    return sprites;
  }, [color, radius]);

  // Create line objects for primitive rendering
  const tickLine = useMemo(() => new THREE.Line(tickGeometry, tickMaterial), [tickGeometry, tickMaterial]);
  
  const horizonLine = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(2 * 3);
    positions[0] = -radius * 1.2;
    positions[1] = 0;
    positions[2] = 0;
    positions[3] = radius * 1.2;
    positions[4] = 0;
    positions[5] = 0;
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Line(geo, new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      toneMapped: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      linewidth: 2,
    }));
  }, [radius, color]);

  const aircraftLine = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(8 * 3);
    positions[0] = 0; positions[1] = -radius * 0.15; positions[2] = 0;
    positions[3] = 0; positions[4] = radius * 0.15; positions[5] = 0;
    positions[6] = -radius * 0.2; positions[7] = 0; positions[8] = 0;
    positions[9] = radius * 0.2; positions[10] = 0; positions[11] = 0;
    positions[12] = -radius * 0.08; positions[13] = -radius * 0.12; positions[14] = 0;
    positions[15] = radius * 0.08; positions[16] = -radius * 0.12; positions[17] = 0;
    positions[18] = 0; positions[19] = radius * 0.2; positions[20] = 0;
    positions[21] = -radius * 0.05; positions[22] = radius * 0.1; positions[23] = 0;
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Line(geo, new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 1,
      toneMapped: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
  }, [radius, color]);

  const pitchLines = useMemo(() => {
    const lines: THREE.Line[] = [];
    for (let i = 0; i <= 20; i++) {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(2 * 3);
      const y = (i - 10) / 10 * radius * 0.8;
      const len = i === 10 ? radius * 1.2 : radius * 0.6;
      positions[0] = -len; positions[1] = y; positions[2] = 0;
      positions[3] = len; positions[4] = y; positions[5] = 0;
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const line = new THREE.Line(geo, pitchMaterial.clone());
      lines.push(line);
    }
    return lines;
  }, [pitchMaterial, radius]);

  return (
    <group ref={compassRef} position={[0, 0, 0]} renderOrder={15}>
      {/* Outer ring */}
      <mesh
        geometry={new THREE.RingGeometry(radius * 0.98, radius * 1.02, 128)}
        material={new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.2,
          toneMapped: false,
          depthWrite: false,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        })}
        rotation={[0, 0, 0]}
      />

      {/* Tick marks (rotating with compass) */}
      <primitive object={tickLine} />

      {/* Cardinal labels (fixed, not rotating) */}
      {labels.map((sprite, i) => (
        <primitive key={i} object={sprite} />
      ))}

      {/* Pitch ladder */}
      {showPitchLadder && (
        <group rotation={[0, 0, 0]}>
          {pitchLines.map((line, i) => (
            <primitive key={i} object={line} />
          ))}
        </group>
      )}

      {/* Center aircraft symbol */}
      <group>
        <primitive object={aircraftLine} />
      </group>

      {/* Digital heading readout */}
      <primitive
        object={(() => {
          const canvas = document.createElement("canvas");
          canvas.width = 256;
          canvas.height = 96;
          const ctx = canvas.getContext("2d")!;
          const tex = new THREE.CanvasTexture(canvas);
          tex.colorSpace = THREE.SRGBColorSpace;
          const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            toneMapped: false,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
          });
          const sprite = new THREE.Sprite(mat);
          sprite.scale.set(2.5, 1, 1);
          sprite.position.set(0, -radius * 1.8, 0);

          const update = () => {
            const deg = (THREE.MathUtils.radToDeg(-headingRef.current) + 360) % 360;
            ctx.clearRect(0, 0, 256, 96);
            ctx.font = "700 52px 'JetBrains Mono', monospace";
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            ctx.fillText(`${deg.toFixed(0).padStart(3, "0")}°`, 128, 48);
            tex.needsUpdate = true;
          };
          update();
          setInterval(update, 100);

          return sprite;
        })()}
      />
    </group>
  );
}