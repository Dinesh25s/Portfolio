"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Drone/UAV model — a sleek quadcopter with animated props,
 * navigation lights, and optional sensor payloads.
 * Used as the hero "rocket" replacement for aerial robotics theme.
 */

const BLADE_GEOM = new THREE.BoxGeometry(0.025, 0.003, 0.45);
const ARM_GEOM = new THREE.CylinderGeometry(0.018, 0.018, 0.38, 8);
const BODY_GEOM = new THREE.CylinderGeometry(0.08, 0.1, 0.18, 12);
const PAYLOAD_GEOM = new THREE.BoxGeometry(0.12, 0.06, 0.14);
const LENS_GEOM = new THREE.CylinderGeometry(0.02, 0.025, 0.03, 16);

const ARM_POSITIONS = [
  [0.38, 0, 0],
  [-0.38, 0, 0],
  [0, 0.38, 0],
  [0, -0.38, 0],
] as const;

const ARM_ROTATIONS = [
  [0, 0, -Math.PI / 2],
  [0, 0, -Math.PI / 2],
  [Math.PI / 2, 0, 0],
  [Math.PI / 2, 0, 0],
] as const;

export default function Drone({
  position = [0, 0.4, 0],
  scale = 1,
  showPayload = true,
  showSensors = true,
  propellerSpeed = 1,
}: {
  position?: [number, number, number];
  scale?: number;
  showPayload?: boolean;
  showSensors?: boolean;
  propellerSpeed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const propRefs = useRef<(THREE.Mesh | null)[]>([]);
  const navLightRefs = useRef<(THREE.Mesh | null)[]>([]);
  const payloadRef = useRef<THREE.Mesh | null>(null);
  const sensorRefs = useRef<(THREE.Mesh | null)[]>([]);
  const timeRef = useRef(0);

  const materials = useMemo(() => {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: "#0d1117",
      metalness: 0.85,
      roughness: 0.15,
      envMapIntensity: 1.2,
    });
    const armMat = new THREE.MeshStandardMaterial({
      color: "#161b22",
      metalness: 0.7,
      roughness: 0.25,
    });
    const propMat = new THREE.MeshStandardMaterial({
      color: "#000000",
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const propBlurMat = new THREE.MeshStandardMaterial({
      color: "#0d1117",
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const payloadMat = new THREE.MeshStandardMaterial({
      color: "#0d1117",
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.5,
    });
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: "#1f6feb",
      metalness: 0.95,
      roughness: 0.02,
      transmission: 0.95,
      thickness: 0.5,
      ior: 1.5,
      envMapIntensity: 2,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    const navRedMat = new THREE.MeshBasicMaterial({
      color: "#ff3333",
      transparent: true,
      opacity: 0.9,
      toneMapped: false,
    });
    const navGreenMat = new THREE.MeshBasicMaterial({
      color: "#33ff33",
      transparent: true,
      opacity: 0.9,
      toneMapped: false,
    });
    const navWhiteMat = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.8,
      toneMapped: false,
    });

    return {
      bodyMat,
      armMat,
      propMat,
      propBlurMat,
      payloadMat,
      lensMat,
      navRedMat,
      navGreenMat,
      navWhiteMat,
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;

    // Propeller spin
    const speed = 80 * propellerSpeed;
    propRefs.current.forEach((prop, i) => {
      if (prop) {
        prop.rotation.x += speed * dt * (i % 2 === 0 ? 1 : -1);
      }
    });

    // Navigation light pulse
    navLightRefs.current.forEach((light, i) => {
      if (light && light.material) {
        const mat = light.material as THREE.MeshBasicMaterial;
        const phase = timeRef.current * 3 + i * Math.PI * 0.5;
        mat.opacity = 0.5 + 0.4 * Math.sin(phase);
      }
    });

    // Subtle body idle animation
    const g = groupRef.current;
    if (g) {
      g.rotation.y = 0.02 * Math.sin(timeRef.current * 0.7);
      g.position.y = position[1] + 0.015 * Math.sin(timeRef.current * 1.3);
    }

    // Payload sensor sweep
    if (payloadRef.current && showSensors) {
      payloadRef.current.rotation.z = 0.15 * Math.sin(timeRef.current * 0.9);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Central body */}
      <mesh geometry={BODY_GEOM} material={materials.bodyMat} castShadow receiveShadow />

      {/* Arms & Propellers */}
      {ARM_POSITIONS.map((pos, i) => (
        <group key={i} position={pos} rotation={ARM_ROTATIONS[i]}>
          {/* Arm */}
          <mesh geometry={ARM_GEOM} material={materials.armMat} castShadow receiveShadow />

          {/* Motor housing */}
          <mesh
            position={[0, 0, -0.19]}
            geometry={new THREE.CylinderGeometry(0.028, 0.028, 0.035, 12)}
            material={materials.armMat}
            castShadow
            receiveShadow
          />

          {/* Static propeller (visible when slow) */}
          <mesh
            ref={(m) => { propRefs.current[i] = m; }}
            geometry={BLADE_GEOM}
            material={materials.propMat}
            rotation={[0, 0, Math.PI / 4]}
          />
          <mesh
            geometry={BLADE_GEOM}
            material={materials.propMat}
            rotation={[0, 0, -Math.PI / 4]}
          />

          {/* Motion blur propeller disk */}
          <mesh
            geometry={new THREE.CylinderGeometry(0.22, 0.22, 0.002, 32)}
            material={materials.propBlurMat}
            position={[0, 0, -0.001]}
          />

          {/* Navigation lights at motor tips */}
          <mesh
            ref={(m) => { navLightRefs.current[i * 2] = m; }}
            geometry={new THREE.SphereGeometry(0.012, 8, 8)}
            material={i < 2 ? materials.navRedMat : materials.navGreenMat}
            position={[0, 0, -0.21]}
          />
        </group>
      ))}

      {/* Payload bay (camera/gimbal/sensors) */}
      {showPayload && (
        <group ref={payloadRef} position={[0, -0.12, 0]}>
          <mesh geometry={PAYLOAD_GEOM} material={materials.payloadMat} castShadow receiveShadow />

          {/* Front-facing camera / LiDAR */}
          {showSensors && (
            <>
              <mesh
                ref={(m) => { sensorRefs.current[0] = m; }}
                geometry={LENS_GEOM}
                material={materials.lensMat}
                position={[0.07, -0.03, 0.08]}
                rotation={[-Math.PI / 2, 0, 0]}
                castShadow
              />
              {/* Downward camera */}
              <mesh
                ref={(m) => { sensorRefs.current[1] = m; }}
                geometry={LENS_GEOM}
                material={materials.lensMat}
                position={[0, 0, -0.06]}
                rotation={[-Math.PI / 2, 0, 0]}
                castShadow
              />
              {/* LiDAR puck (top) */}
              <mesh
                geometry={new THREE.CylinderGeometry(0.045, 0.045, 0.015, 16)}
                material={new THREE.MeshStandardMaterial({
                  color: "#161b22",
                  metalness: 0.9,
                  roughness: 0.1,
                  envMapIntensity: 1.5,
                })}
                position={[0, 0, 0.065]}
              />
            </>
          )}

          {/* Antenna */}
          <mesh
            geometry={new THREE.CylinderGeometry(0.003, 0.003, 0.08, 8)}
            material={new THREE.MeshStandardMaterial({
              color: "#30363d",
              metalness: 0.8,
              roughness: 0.2,
            })}
            position={[-0.06, 0.03, 0.07]}
            rotation={[0.3, 0, 0]}
          />
        </group>
      )}

      {/* Status LEDs on body */}
      <mesh
        geometry={new THREE.SphereGeometry(0.008, 8, 8)}
        material={materials.navWhiteMat}
        position={[0.06, 0.02, 0.07]}
      />
      <mesh
        geometry={new THREE.SphereGeometry(0.008, 8, 8)}
        material={materials.navWhiteMat}
        position={[-0.06, 0.02, 0.07]}
      />
    </group>
  );
}