"use client";

import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

/**
 * Futuristic Multirotor Drone - Sleek racing/inspection quadcopter
 */
function MultirotorDrone({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const propRefs = useRef<THREE.Mesh[]>([]);

  useFrame((_, delta) => {
    // Spin propellers
    propRefs.current.forEach((prop, i) => {
      if (prop) {
        prop.rotation.y += delta * 80 * (i % 2 === 0 ? 1 : -1);
      }
    });
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main body - sleek hexagonal design */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.12, 6]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.15}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Central dome */}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#0a0a1a"
          metalness={0.95}
          roughness={0.05}
          envMapIntensity={2}
        />
      </mesh>

      {/* LED ring on body */}
      <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.015, 8, 32]} />
        <meshBasicMaterial color="#00ffff" toneMapped={false} />
      </mesh>

      {/* Four arms with gradient effect */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * 0.5;
        const z = Math.sin(angle) * 0.5;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -angle, 0]}>
            {/* Arm */}
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.04, 0.06]} />
              <meshStandardMaterial
                color="#16213e"
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>
            {/* Motor housing */}
            <mesh position={[0.3, 0.02, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
              <meshStandardMaterial
                color="#0f0f23"
                metalness={0.95}
                roughness={0.1}
              />
            </mesh>
            {/* Motor glow */}
            <mesh position={[0.3, 0.055, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.01, 16]} />
              <meshBasicMaterial color="#00ffff" toneMapped={false} />
            </mesh>
            {/* Propeller */}
            <mesh
              ref={(el) => { propRefs.current[i] = el!; }}
              position={[0.3, 0.08, 0]}
              rotation={[0, 0, Math.PI / 4]}
            >
              <boxGeometry args={[0.45, 0.005, 0.04]} />
              <meshStandardMaterial
                color="#2a2a4a"
                metalness={0.3}
                roughness={0.5}
                transparent
                opacity={0.9}
              />
            </mesh>
            {/* Navigation light */}
            <mesh position={[0.3, -0.05, i % 2 === 0 ? 0.08 : -0.08]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial
                color={i % 2 === 0 ? "#ff3366" : "#33ff66"}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* Bottom camera/payload */}
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#0a0a15"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color="#001133"
          emissive="#0033ff"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

/**
 * Futuristic Fixed-Wing Drone - Long range surveillance aircraft
 */
function FixedWingDrone({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle banking motion
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={scale} rotation={[0, Math.PI / 6, 0]}>
      {/* Fuselage - sleek missile-like shape */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 8]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 0, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshStandardMaterial
          color="#0a0a1a"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Main wings - swept delta design */}
      <mesh castShadow position={[0, 0.02, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.8, 0.02, 0.5]} />
        <meshStandardMaterial
          color="#16213e"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Wing tips - angled up for stability */}
      <mesh castShadow position={[0.85, 0.12, 0.1]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.25, 0.02, 0.3]} />
        <meshStandardMaterial
          color="#16213e"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
      <mesh castShadow position={[-0.85, 0.12, 0.1]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.25, 0.02, 0.3]} />
        <meshStandardMaterial
          color="#16213e"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Tail wings - V-tail configuration */}
      <mesh castShadow position={[0, 0.25, 0.55]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.5, 0.015, 0.2]} />
        <meshStandardMaterial
          color="#16213e"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
      <mesh castShadow position={[0, -0.25, 0.55]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.5, 0.015, 0.2]} />
        <meshStandardMaterial
          color="#16213e"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Vertical stabilizers */}
      <mesh castShadow position={[0.15, 0.15, 0.5]}>
        <boxGeometry args={[0.02, 0.25, 0.2]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
      <mesh castShadow position={[-0.15, 0.15, 0.5]}>
        <boxGeometry args={[0.02, 0.25, 0.2]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Sensor dome under nose */}
      <mesh position={[0, -0.12, -0.5]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#001122"
          emissive="#0066ff"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Wing LED strips */}
      <mesh position={[0, 0.03, 0.1]}>
        <boxGeometry args={[1.6, 0.005, 0.02]} />
        <meshBasicMaterial color="#00ffff" toneMapped={false} />
      </mesh>

      {/* Navigation lights */}
      <mesh position={[0.9, 0.02, 0.1]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#ff3333" toneMapped={false} />
      </mesh>
      <mesh position={[-0.9, 0.02, 0.1]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#33ff33" toneMapped={false} />
      </mesh>

      {/* Engine glow (rear) */}
      <mesh position={[0, 0, 0.65]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#ff6600" toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Futuristic VTOL Drone - Tilt-rotor design
 */
function VTOLDrone({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const tiltRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    // Tilt rotors slightly for animation
    tiltRefs.current.forEach((tilt, i) => {
      if (tilt) {
        tilt.rotation.z = Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
      }
    });
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Central fuselage - boxy tactical design */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.2, 0.6]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Top dome/cockpit */}
      <mesh position={[0, 0.15, -0.1]}>
        <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#001122"
          emissive="#0033ff"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* LED status bar */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.35, 0.01, 0.02]} />
        <meshBasicMaterial color="#00ff88" toneMapped={false} />
      </mesh>

      {/* Fixed wings (for forward flight) */}
      <mesh castShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.6, 0.4, 0.03]} />
        <meshStandardMaterial
          color="#16213e"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Tilt-rotor nacelles on wing tips */}
      {[1, -1].map((side, i) => (
        <group
          key={i}
          ref={(el) => { tiltRefs.current[i] = el!; }}
          position={[side * 0.85, 0, 0]}
        >
          {/* Nacelle body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 8]} />
            <meshStandardMaterial
              color="#0f0f23"
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>

          {/* Rotor hub */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.04, 8]} />
            <meshStandardMaterial
              color="#1a1a2e"
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>

          {/* Rotor blades (folded visual) */}
          <mesh position={[0, 0.14, 0]}>
            <boxGeometry args={[0.5, 0.003, 0.06]} />
            <meshStandardMaterial
              color="#2a2a4a"
              metalness={0.3}
              roughness={0.5}
            />
          </mesh>
          <mesh position={[0, 0.14, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.5, 0.003, 0.06]} />
            <meshStandardMaterial
              color="#2a2a4a"
              metalness={0.3}
              roughness={0.5}
            />
          </mesh>

          {/* Motor glow */}
          <mesh position={[0, 0.08, 0]}>
            <torusGeometry args={[0.05, 0.008, 8, 16]} />
            <meshBasicMaterial color="#ff6600" toneMapped={false} />
          </mesh>

          {/* Navigation light */}
          <mesh position={[0, 0, side * 0.08]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial
              color={side === 1 ? "#ff3333" : "#33ff33"}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* Rear thruster */}
      <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.15, 8]} />
        <meshStandardMaterial
          color="#0a0a1a"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Exhaust glow */}
      <mesh position={[0, 0, 0.45]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#ff4400" toneMapped={false} />
      </mesh>

      {/* Landing gear indicators */}
      <mesh position={[0.15, -0.15, 0.2]}>
        <boxGeometry args={[0.03, 0.05, 0.03]} />
        <meshBasicMaterial color="#ffff00" toneMapped={false} />
      </mesh>
      <mesh position={[-0.15, -0.15, 0.2]}>
        <boxGeometry args={[0.03, 0.05, 0.03]} />
        <meshBasicMaterial color="#ffff00" toneMapped={false} />
      </mesh>

      {/* Payload bay indicator */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshBasicMaterial color="#0066ff" toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Drone Showcase - Displays three futuristic drone types
 * Positioned in the scene for dramatic effect
 */
export default function DroneShowcase() {
  const groupRef = useRef<THREE.Group>(null);

  // Fade in based on scroll progress
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;

    const p = scrollState.progress;
    // Show during hero/launch sections
    const alpha = THREE.MathUtils.smoothstep(p, 0.02, 0.08) *
                  (1 - THREE.MathUtils.smoothstep(p, 0.25, 0.35));
    g.visible = alpha > 0.01;
    g.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        child.visible = true;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.6, 0]}>
      {/* Multirotor - Center, closest */}
      <Float
        speed={2}
        rotationIntensity={0.1}
        floatIntensity={0.3}
        position={[0, 0, 0]}
      >
        <MultirotorDrone scale={1.2} />
      </Float>

      {/* Fixed Wing - Back left, higher */}
      <Float
        speed={1.5}
        rotationIntensity={0.05}
        floatIntensity={0.4}
        position={[-4, 1.5, -8]}
      >
        <FixedWingDrone scale={0.8} />
      </Float>

      {/* VTOL - Back right */}
      <Float
        speed={1.8}
        rotationIntensity={0.08}
        floatIntensity={0.35}
        position={[4, 1, -6]}
      >
        <VTOLDrone scale={0.9} />
      </Float>

      {/* Additional floating instances for depth */}
      <Float
        speed={2.2}
        rotationIntensity={0.15}
        floatIntensity={0.25}
        position={[2, -0.5, -4]}
      >
        <MultirotorDrone scale={0.6} />
      </Float>

      <Float
        speed={1.3}
        rotationIntensity={0.06}
        floatIntensity={0.3}
        position={[-2.5, 0.8, -5]}
      >
        <VTOLDrone scale={0.5} />
      </Float>
    </group>
  );
}