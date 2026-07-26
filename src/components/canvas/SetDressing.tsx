"use client";

import { Float, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { STATION, sectionProgress } from "@/lib/journey";
import { scrollState } from "@/lib/scroll";
import { makeGlowTexture, makeTextTexture } from "@/lib/textures";

/**
 * SetDressing — robotics/defense themed environmental details:
 * - Ground control station near experience section
 * - Radar installation flyby during skills
 * - Target drone interceptors during projects
 * - All models are procedurally generated (no external GLB dependencies)
 */

const _pos = new THREE.Vector3();

function createRadarDish() {
  const group = new THREE.Group();

  // Base
  const baseGeo = new THREE.CylinderGeometry(0.8, 1.2, 1.5, 12);
  const baseMat = new THREE.MeshStandardMaterial({
    color: "#1a1f2e",
    metalness: 0.8,
    roughness: 0.2,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.75;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Pedestal
  const pedestalGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
  const pedestal = new THREE.Mesh(pedestalGeo, baseMat);
  pedestal.position.y = 2.5;
  pedestal.castShadow = true;
  group.add(pedestal);

  // Dish
  const dishGeo = new THREE.SphereGeometry(2.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dishMat = new THREE.MeshStandardMaterial({
    color: "#0d1117",
    metalness: 0.95,
    roughness: 0.02,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  });
  const dish = new THREE.Mesh(dishGeo, dishMat);
  dish.position.y = 4.2;
  dish.rotation.x = -Math.PI / 2;
  dish.castShadow = true;
  group.add(dish);

  // Feed horn
  const feedGeo = new THREE.CylinderGeometry(0.15, 0.25, 0.8, 8);
  const feedMat = new THREE.MeshStandardMaterial({
    color: "#30363d",
    metalness: 0.8,
    roughness: 0.2,
  });
  const feed = new THREE.Mesh(feedGeo, feedMat);
  feed.position.y = 4.2;
  feed.castShadow = true;
  group.add(feed);

  // Support struts
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 4);
    const strut = new THREE.Mesh(strutGeo, baseMat);
    strut.position.set(Math.cos(angle) * 1.5, 2.85, Math.sin(angle) * 1.5);
    strut.lookAt(new THREE.Vector3(0, 4.2, 0));
    strut.rotateX(Math.PI / 2);
    strut.castShadow = true;
    group.add(strut);
  }

  return group;
}

function createGroundControlStation() {
  const group = new THREE.Group();

  // Main shelter
  const shelterGeo = new THREE.BoxGeometry(6, 3, 4);
  const shelterMat = new THREE.MeshStandardMaterial({
    color: "#161b22",
    metalness: 0.7,
    roughness: 0.3,
  });
  const shelter = new THREE.Mesh(shelterGeo, shelterMat);
  shelter.position.y = 1.5;
  shelter.castShadow = true;
  shelter.receiveShadow = true;
  group.add(shelter);

  // Antenna mast
  const mastGeo = new THREE.CylinderGeometry(0.08, 0.12, 5, 8);
  const mastMat = new THREE.MeshStandardMaterial({
    color: "#30363d",
    metalness: 0.8,
    roughness: 0.2,
  });
  const mast = new THREE.Mesh(mastGeo, mastMat);
  mast.position.set(2.5, 5.5, 0);
  mast.castShadow = true;
  group.add(mast);

  // Antenna array
  const arrayGeo = new THREE.BoxGeometry(1.5, 0.1, 0.8);
  const arrayMat = new THREE.MeshStandardMaterial({
    color: "#0d1117",
    metalness: 0.9,
    roughness: 0.1,
  });
  for (let i = 0; i < 3; i++) {
    const array = new THREE.Mesh(arrayGeo, arrayMat);
    array.position.set(2.5, 7.5 + i * 0.6, 0);
    array.castShadow = true;
    group.add(array);
  }

  // Equipment racks (outside)
  const rackGeo = new THREE.BoxGeometry(1.2, 2, 0.6);
  const rackMat = new THREE.MeshStandardMaterial({
    color: "#1a1f2e",
    metalness: 0.8,
    roughness: 0.2,
  });
  for (let i = 0; i < 2; i++) {
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(-3.6, 1, (i - 0.5) * 1.5);
    rack.castShadow = true;
    group.add(rack);
  }

  // Status lights
  const lightGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const redLight = new THREE.MeshBasicMaterial({ color: "#ff3333", toneMapped: false });
  const greenLight = new THREE.MeshBasicMaterial({ color: "#33ff33", toneMapped: false });
  const amberLight = new THREE.MeshBasicMaterial({ color: "#ffaa00", toneMapped: false });

  const lights = [
    { pos: [2.5, 7.5, 0], mat: redLight },
    { pos: [2.5, 8.1, 0], mat: greenLight },
    { pos: [2.5, 8.7, 0], mat: amberLight },
  ];
  lights.forEach(({ pos, mat }) => {
    const light = new THREE.Mesh(lightGeo, mat);
    light.position.set(...pos);
    group.add(light);
  });

  return group;
}

function createTargetDrone() {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.18, 12);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: "#ef4444",
    metalness: 0.7,
    roughness: 0.2,
    emissive: "#ef4444",
    emissiveIntensity: 0.3,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  group.add(body);

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.38, 8);
  const armMat = new THREE.MeshStandardMaterial({
    color: "#991b1b",
    metalness: 0.8,
    roughness: 0.2,
  });
  const armPositions = [
    [0.38, 0, 0],
    [-0.38, 0, 0],
    [0, 0.38, 0],
    [0, -0.38, 0],
  ];
  const armRotations = [
    [0, 0, -Math.PI / 2],
    [0, 0, -Math.PI / 2],
    [Math.PI / 2, 0, 0],
    [Math.PI / 2, 0, 0],
  ];

  armPositions.forEach((pos, i) => {
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(...pos);
    arm.rotation.set(...armRotations[i]);
    arm.castShadow = true;
    group.add(arm);

    // Motor
    const motorGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.035, 12);
    const motor = new THREE.Mesh(motorGeo, armMat);
    motor.position.set(pos[0], pos[1], pos[2] - 0.19);
    motor.castShadow = true;
    group.add(motor);

    // Propellers (static)
    const propGeo = new THREE.BoxGeometry(0.025, 0.003, 0.45);
    const propMat = new THREE.MeshBasicMaterial({
      color: "#000000",
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const prop1 = new THREE.Mesh(propGeo, propMat);
    prop1.position.set(pos[0], pos[1], pos[2] - 0.21);
    prop1.rotation.z = Math.PI / 4;
    group.add(prop1);
    const prop2 = new THREE.Mesh(propGeo, propMat);
    prop2.position.set(pos[0], pos[1], pos[2] - 0.21);
    prop2.rotation.z = -Math.PI / 4;
    group.add(prop2);

    // Nav lights
    const navGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const navMat = i < 2
      ? new THREE.MeshBasicMaterial({ color: "#ff3333", toneMapped: false })
      : new THREE.MeshBasicMaterial({ color: "#33ff33", toneMapped: false });
    const nav = new THREE.Mesh(navGeo, navMat);
    nav.position.set(pos[0], pos[1], pos[2] - 0.21);
    group.add(nav);
  });

  return group;
}

function RadarInstallation() {
  const groupRef = useRef<THREE.Group>(null);
  const dishRef = useRef<THREE.Mesh | null>(null);
  const radarGroup = useMemo(() => createRadarDish(), []);

  const glowMat = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: makeGlowTexture("rgba(76,201,240,0.9)"),
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const sp = sectionProgress(scrollState.progress, "skills");
    const t = THREE.MathUtils.smoothstep(sp, 0.05, 0.95);
    g.visible = sp > 0.001 && sp < 0.999;
    if (!g.visible) return;

    // Move along path
    const from = new THREE.Vector3(60, 0, -100);
    const to = new THREE.Vector3(-50, 0, -80);
    _pos.copy(from).lerp(to, t);
    g.position.copy(_pos);
    g.position.y = 2; // On ground

    // Rotate radar dish
    if (dishRef.current) {
      dishRef.current.rotation.y += dt * 2.5;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <primitive object={radarGroup} scale={1.5} />
      {/* Radar sweep glow at dish center */}
      <sprite
        ref={dishRef}
        material={glowMat}
        scale={[4, 4, 1]}
        position={[0, 4.2, 0]}
      />
      {/* Blinking beacon on base */}
      <pointLight color="#4cc9f0" intensity={3} distance={20} decay={2} position={[0, 1.5, 0]} />
    </group>
  );
}

function GroundControlStation() {
  const groupRef = useRef<THREE.Group>(null);
  const stationGroup = useMemo(() => createGroundControlStation(), []);
  const blinkRef = useRef(0);

  const { mat: labelMat } = useMemo(() => {
    const { texture, aspect } = makeTextTexture("GROUND CONTROL", { size: 100, color: "#4cc9f0" });
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    return { mat, aspect };
  }, []);

  const labelRef = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const p = scrollState.progress;
    g.visible = p > 0.17 && p < 0.38;
    if (!g.visible) return;

    const sp = sectionProgress(p, "experience");
    const alpha =
      THREE.MathUtils.smoothstep(sp, 0.05, 0.3) *
      (1 - THREE.MathUtils.smoothstep(sp, 0.85, 1));
    labelMat.opacity = alpha * 0.9;
    if (labelRef.current) labelRef.current.quaternion.copy(state.camera.quaternion);

    // Blink status lights
    blinkRef.current += dt;
    const blink = Math.sin(blinkRef.current * 4) > 0;
    // Lights are children - would need refs to animate, keeping simple
  });

  return (
    <group ref={groupRef} position={STATION.position} visible={false}>
      <Float speed={0.5} rotationIntensity={0.02} floatIntensity={0.2}>
        <primitive object={stationGroup} scale={1.5} />
      </Float>
      <mesh ref={labelRef} position={[0, 6, 0]} renderOrder={20}>
        <planeGeometry args={[5, 5 / 1.5]} />
        <primitive object={labelMat} attach="material" />
      </mesh>
    </group>
  );
}

function TargetInterceptorSwarm() {
  const groupRef = useRef<THREE.Group>(null);
  const droneRefs = useRef<THREE.Group[]>([]);
  const droneGroup = useMemo(() => createTargetDrone(), []);

  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const sp = sectionProgress(scrollState.progress, "projects");
    g.visible = sp > 0.001 && sp < 0.999;
    if (!g.visible) return;

    const time = performance.now() * 0.001;

    droneRefs.current.forEach((drone, i) => {
      if (!drone) return;

      // Each drone follows a different intercept trajectory
      const phase = (i / 4) * Math.PI * 2;
      const radius = 15 + i * 3;
      const height = 2 + Math.sin(time * 0.8 + phase) * 1.5;

      drone.position.x = Math.cos(time * 0.6 + phase) * radius;
      drone.position.z = -80 + Math.sin(time * 0.6 + phase) * radius * 0.5;
      drone.position.y = height;

      // Point toward center (intercept point)
      drone.lookAt(new THREE.Vector3(0, 1.5, -90));

      // Propeller spin simulation (rotate children)
      drone.children.forEach((child, j) => {
        if (child.geometry && child.geometry.type === "BoxGeometry" &&
            child.material && child.material.transparent) {
          child.rotation.x += dt * 80 * (j % 2 === 0 ? 1 : -1);
        }
      });
    });
  });

  // Create 4 interceptor drones
  const drones = Array.from({ length: 4 }, (_, i) => (
    <group
      key={i}
      ref={(el) => { droneRefs.current[i] = el; }}
      position={[
        Math.cos((i / 4) * Math.PI * 2) * 15,
        3,
        -80 + Math.sin((i / 4) * Math.PI * 2) * 8
      ]}
    >
      <primitive object={droneGroup} scale={0.8} />
    </group>
  ));

  return (
    <group ref={groupRef} visible={false}>
      {drones}
    </group>
  );
}

export default function SetDressing() {
  return (
    <>
      <GroundControlStation />
      <RadarInstallation />
      <TargetInterceptorSwarm />
    </>
  );
}