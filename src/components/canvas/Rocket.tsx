"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { sampleDrone } from "@/lib/journey";
import { scrollState } from "@/lib/scroll";
import { makeGlowTexture, makeTextTexture } from "@/lib/textures";

/* ------------------------------------------------------------------ */
/* Constants + preallocated scratch (no per-frame allocations)         */
/* ------------------------------------------------------------------ */

const TRAIL_N = 80;
const TRAIL_LIFE = 1.2;

const BOOSTER_ANGLES = [Math.PI / 2, (Math.PI * 7) / 6, (Math.PI * 11) / 6];
const FIN_ANGLES = [Math.PI / 6, (Math.PI * 5) / 6, (Math.PI * 3) / 2];

const EXHAUSTS: { pos: [number, number, number]; s: number }[] = [
  { pos: [0, -1.44, 0], s: 1 },
  { pos: [0, -1.08, -0.55], s: 0.5 },
  { pos: [-0.476, -1.08, 0.275], s: 0.5 },
  { pos: [0.476, -1.08, 0.275], s: 0.5 },
];

const NOZZLE_OFFSETS = EXHAUSTS.map((e) => new THREE.Vector3(...e.pos));

const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _qIdle = new THREE.Quaternion();
const _qIdentity = new THREE.Quaternion();
const _eul = new THREE.Euler();
const _mat = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _scl = new THREE.Vector3();
const _back = new THREE.Vector3();
const _col = new THREE.Color();

const PLUME_VERT = `
uniform float uTime;
varying vec2 vUv;
varying float vFres;
void main() {
  vUv = uv;
  vec3 p = position;
  float tail = uv.y;
  float wob =
    sin(uv.x * 18.849 + uTime * 9.0 + tail * 8.0) +
    0.5 * sin(uv.x * 31.415 - uTime * 14.0 + tail * 12.0);
  p.x += normal.x * wob * 0.05 * tail;
  p.z += normal.z * wob * 0.05 * tail;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  vec3 v = normalize(-mv.xyz);
  vFres = pow(abs(dot(n, v)), 1.35);
  gl_Position = projectionMatrix * mv;
}
`;

const PLUME_FRAG = `
uniform float uTime;
uniform float uThrust;
uniform float uAlpha;
uniform vec3 uCore;
uniform vec3 uMid;
uniform vec3 uEdge;
varying vec2 vUv;
varying float vFres;
void main() {
  float tail = vUv.y;
  float flick = 0.82 + 0.18 *
    sin(uTime * 21.0 + vUv.x * 12.566) *
    sin(uTime * 15.0 - tail * 10.0);
  vec3 col = mix(uCore, uMid, smoothstep(0.02, 0.38, tail));
  col = mix(col, uEdge, smoothstep(0.42, 0.95, tail));
  float alpha = 1.0 - smoothstep(0.12, 1.0, tail);
  alpha *= vFres * flick * uAlpha * clamp(uThrust, 0.0, 1.0);
  gl_FragColor = vec4(col * flick, alpha);
}
`;

function makePlumeMaterial(
  core: THREE.Color,
  mid: THREE.Color,
  edge: THREE.Color,
  alpha: number
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: PLUME_VERT,
    fragmentShader: PLUME_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uThrust: { value: 0 },
      uAlpha: { value: alpha },
      uCore: { value: core },
      uMid: { value: mid },
      uEdge: { value: edge },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

const PLUME_CORE = new THREE.Color(0x507fff);
const PLUME_MID = new THREE.Color(0x00e5ff);
const PLUME_EDGE = new THREE.Color(0x0066aa);

function makeLiveryTexture(callSign: string): THREE.CanvasTexture {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const canvas = document.createElement("canvas");
  canvas.width = 512 * dpr;
  canvas.height = 256 * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, 512, 256);

  const grad = ctx.createLinearGradient(0, 160, 512, 200);
  grad.addColorStop(0, "rgba(0, 212, 255, 0)");
  grad.addColorStop(0.5, "rgba(0, 212, 255, 0.7)");
  grad.addColorStop(1, "rgba(0, 212, 255, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 170, 512, 30);

  ctx.font = "700 44px 'JetBrains Mono', 'Menlo', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#00d4ff";
  ctx.shadowColor = "rgba(0, 212, 255, 0.6)";
  ctx.shadowBlur = 10;
  ctx.fillText(callSign, 256, 185);

  ctx.strokeStyle = "rgba(0, 212, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, 200);
  ctx.lineTo(80, 200);
  ctx.moveTo(432, 200);
  ctx.lineTo(492, 200);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export default function Rocket() {
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.InstancedMesh>(null);
  const plumes = useRef<(THREE.Mesh | null)[]>([]);
  const [plumeMats, setPlumeMats] = useState<THREE.ShaderMaterial[]>([]);

  const idleRef = useRef(0);
  const idleQ = useRef(new THREE.Quaternion());
  const propulsionAlphas = useRef<number[]>([]);
  const smoothPRef = useRef(0);

  useEffect(() => {
    const mats = EXHAUSTS.map(() =>
      makePlumeMaterial(PLUME_CORE, PLUME_MID, PLUME_EDGE, 1)
    );
    setPlumeMats(mats);
    propulsionAlphas.current = mats.map(() => 0.5);
  }, []);

  const livery = useMemo(() => makeLiveryTexture("UAV-01"), []);

  useFrame((state, dt) => {
    const group = groupRef.current;
    if (!group) return;

    smoothPRef.current = THREE.MathUtils.damp(
      smoothPRef.current,
      scrollState.progress,
      2.5,
      dt
    );
    const p = smoothPRef.current;

    _pos.set(0, 0, 0);
    _quat.identity();
    const thrust = sampleDrone(p, _pos, _quat);

    const t = state.clock.elapsedTime;
    idleRef.current += dt;
    const hover = Math.sin(t * 1.8) * 0.008 + Math.cos(t * 2.3) * 0.005;
    _eul.set(hover, hover * 0.6, 0);
    _qIdle.setFromEuler(_eul);

    group.position.copy(_pos);
    group.quaternion.copy(_quat).multiply(_qIdle);

    plumes.current.forEach((mesh, i) => {
      if (!mesh || !plumeMats[i]) return;
      const mat = plumeMats[i];
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      mat.uniforms.uThrust.value = thrust;
      const baseAlpha = 0.5 + thrust * 0.5;
      const jitter = (Math.sin(state.clock.elapsedTime * 17 + i * 3) * 0.12 + 0.94);
      propulsionAlphas.current[i] = THREE.MathUtils.damp(
        propulsionAlphas.current[i],
        baseAlpha,
        dt * 5
      );
      mat.uniforms.uAlpha.value = propulsionAlphas.current[i] * jitter;
    });

    if (trailRef.current) {
      const instCount = TRAIL_N;
      const inst = trailRef.current;
      const dummy = new THREE.Object3D();
      for (let i = instCount - 1; i > 0; i--) {
        dummy.position.setFromArray(inst.geometry.attributes.position.array, (i - 1) * 3);
        inst.setMatrixAt(i, dummy.matrix);
        inst.geometry.attributes.position.setXYZ(
          i,
          dummy.position.x,
          dummy.position.y,
          dummy.position.z
        );
      }
      const spread = 0.04;
      dummy.position.copy(group.position);
      dummy.position.x += (Math.random() - 0.5) * spread;
      dummy.position.y += (Math.random() - 0.5) * spread;
      dummy.position.z += (Math.random() - 0.5) * spread;
      inst.setMatrixAt(0, dummy.matrix);
      inst.geometry.attributes.position.setXYZ(0, dummy.position.x, dummy.position.y, dummy.position.z);

      const posAttr = inst.geometry.attributes.position;
      for (let i = 0; i < instCount; i++) {
        const age = (i / instCount) * TRAIL_LIFE;
        const alive = 1 - age / TRAIL_LIFE;
        const s = 0.02 + 0.08 * alive;
        _scl.set(s, s * 2.5, s);
        dummy.position.setFromArray(posAttr.array, i * 3);
        dummy.scale.copy(_scl);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      posAttr.needsUpdate = true;
      inst.instanceMatrix.needsUpdate = true;
    }
  });

  const consume = 1 - THREE.MathUtils.smoothstep(
    scrollState.missionComplete,
    0.4,
    0.8
  );

  return (
    <group ref={groupRef} visible={consume > 0.001}>
      <group position={[0, 0.04, 0]}>
        <mesh castShadow>
          <latheGeometry args={[hullKnot(), 64]} />
          <meshPhysicalMaterial
            color="#e0ddd8"
            metalness={0.35}
            roughness={0.40}
            clearcoat={0.3}
            clearcoatRoughness={0.25}
          />
        </mesh>

        <mesh position={[0, 0.46, 0]} castShadow>
          <coneGeometry args={[0.17, 0.23, 32, 1, true]} />
          <meshStandardMaterial
            color="#d0cdc8"
            metalness={0.2}
            roughness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[0, -0.02, 0]}>
          <torusGeometry args={[0.295, 0.007, 16, 48]} />
          <meshStandardMaterial
            color="#16213e"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
      </group>

      {FIN_ANGLES.map((ang, i) => (
        <group key={i} rotation={[0, 0, ang]}>
          <mesh
            castShadow
            position={[0.26, -0.02, 0]}
            rotation={[0, 0, THREE.MathUtils.degToRad(15)]}
          >
            <boxGeometry args={[0.35, 0.006, 0.12]} />
            <meshStandardMaterial
              color="#0f0f23"
              metalness={0.85}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0.44, 0.01, 0]} castShadow>
            <boxGeometry args={[0.07, 0.004, 0.04]} />
            <meshStandardMaterial
              color="#0f0f23"
              metalness={0.85}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}

      {BOOSTER_ANGLES.map((ang, i) => {
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const x = 0.26 * ca;
        const z = 0.26 * sa;
        return (
          <group key={i} position={[x, -0.02, z]} rotation={[0, -ang, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.09, 0.12, 0.45, 16]} />
              <meshPhysicalMaterial
                color="#e0ddd8"
                metalness={0.35}
                roughness={0.40}
                clearcoat={0.3}
                clearcoatRoughness={0.25}
              />
            </mesh>
            <mesh position={[0, -0.24, 0]}>
              <cylinderGeometry args={[0.07, 0.10, 0.08, 16]} />
              <meshStandardMaterial
                color="#0a0a15"
                metalness={0.95}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[0, 0.19, 0]}>
              <torusGeometry args={[0.095, 0.004, 8, 32]} />
              <meshStandardMaterial
                color="#16213e"
                metalness={0.9}
                roughness={0.15}
              />
            </mesh>
          </group>
        );
      })}

      <group position={[0, 0.25, 0]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.11, 0.08, 16]} />
          <meshStandardMaterial
            color="#d0cdc8"
            metalness={0.3}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.11, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#16213e"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0.15, -0.02, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
          <meshStandardMaterial color="#0a0a15" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.15, -0.02, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
          <meshStandardMaterial color="#0a0a15" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.02, 0.15]}>
          <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
          <meshStandardMaterial color="#0a0a15" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.02, -0.15]}>
          <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
          <meshStandardMaterial color="#0a0a15" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {plumeMats.map((mat, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) plumes.current[i] = el; }}
          position={new THREE.Vector3(...NOZZLE_OFFSETS[i].toArray())}
          rotation={[Math.PI, 0, 0]}
        >
          <coneGeometry args={[0.08, 0.4, 16, 1, true]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}

      <mesh
        position={[0, 0.07, 0.26]}
        rotation={[0, 0, 0]}
        renderOrder={10}
      >
        <planeGeometry args={[0.3, 0.15]} />
        <meshBasicMaterial
          map={livery}
          transparent={true}
          depthWrite={false}
          blending={THREE.NormalBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <instancedMesh
        ref={trailRef}
        args={[undefined, undefined, TRAIL_N]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.02]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}

function hullKnot(): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  const N = 48;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let y: number;
    if (t < 0.15) {
      y = 0.15 + (t / 0.15) * 0.17;
    } else if (t < 0.25) {
      y = 0.32 + ((t - 0.15) / 0.1) * 0.04;
    } else if (t < 0.55) {
      y = 0.36 + ((t - 0.25) / 0.3) * 0.1;
    } else {
      y = 0.46 + ((t - 0.55) / 0.45) * 0.12;
    }
    const r = y < 0.32 ? 0.26 : 0.32 - (y - 0.32) * (0.32 / 0.42);
    pts.push(new THREE.Vector3(r, y - 0.5, 0));
  }
  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
}