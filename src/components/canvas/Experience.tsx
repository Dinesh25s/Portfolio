"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import type { BloomEffect, ChromaticAberrationEffect } from "postprocessing";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";
import { useUIStore } from "@/lib/store";
import CameraRig from "./CameraRig";
import DroneShowcase from "./DroneShowcase";
import DronePlumes from "./DronePlumes";
import RadarSweep from "./RadarSweep";
import SkillCards from "./SkillCards";
import ProjectOrbit from "./ProjectOrbit";
import SetDressing from "./SetDressing";
import Compass from "./Compass";
import ParticleField from "./ParticleField";

/**
 * Primes the GPU behind the loading screen: compiles every shader program
 * and uploads every texture before the loader lifts. Without this, gated
 * objects compile/upload on the frame they first appear — a visible hitch mid-scroll.
 */
function SceneReady() {
  const setReady = useUIStore((s) => s.setReady);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    let alive = true;

    const collectTextures = (mat: THREE.Material): THREE.Texture[] => {
      const out: THREE.Texture[] = [];
      for (const value of Object.values(mat)) {
        if ((value as THREE.Texture)?.isTexture) out.push(value as THREE.Texture);
      }
      const uniforms = (mat as THREE.ShaderMaterial).uniforms;
      if (uniforms) {
        for (const u of Object.values(uniforms)) {
          if ((u?.value as THREE.Texture)?.isTexture) out.push(u.value as THREE.Texture);
        }
      }
      return out;
    };

    const prime = async () => {
      try {
        await gl.compileAsync(scene, camera);
        scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh && !(o as THREE.Sprite).isSprite) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of mats) {
            if (!mat) continue;
            for (const tex of collectTextures(mat)) gl.initTexture(tex);
          }
        });
      } catch {
        // Priming is best-effort — never block the site on it
      }
      if (alive) setReady(true);
    };

    prime();
    return () => {
      alive = false;
    };
  }, [gl, scene, camera, setReady]);

  return null;
}

/**
 * Once a deferred subtree has resolved (its models/HDR downloaded), compile
 * its programs so the first time it scrolls into view there's no hitch.
 */
function DeferredPrecompile() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    gl.compileAsync(scene, camera).catch(() => {});
  }, [gl, scene, camera]);
  return null;
}

/**
 * The heavy, off-hero GLB models (ISS 4.4 MB, astronaut, spaceship — none
 * appear in the hero) — mounted only AFTER the hero is on screen and
 * interactive (ready === true), so first paint never waits on them. They
 * stream in the background, then precompile (env already set) so scrolling
 * to the Work/About/Skills sections never hitches.
 */
function DeferredScene() {
  const ready = useUIStore((s) => s.ready);
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <SetDressing />
      <DeferredPrecompile />
    </Suspense>
  );
}

/**
 * Surges bloom + chromatic aberration at key scroll moments —
 * cinematic flares for section transitions.
 */
function ImpactPostSurge({
  bloom,
  chroma,
}: {
  bloom: React.RefObject<BloomEffect | null>;
  chroma: React.RefObject<ChromaticAberrationEffect | null>;
}) {
  useFrame(() => {
    const e = scrollState.missionComplete;
    const surge = e * (1 - e) * 4; // peaks mid-sequence, zero at rest
    if (bloom.current) bloom.current.intensity = 0.85 + surge * 1.2;
    const off = chroma.current?.offset as
      | THREE.Vector2
      | [number, number]
      | undefined;
    if (off) {
      const o = 0.0004 + surge * 0.005;
      if (Array.isArray(off)) {
        off[0] = o;
        off[1] = o;
      } else {
        off.x = o;
        off.y = o;
      }
    }
  });
  return null;
}

export default function Experience() {
  const bloomRef = useRef<BloomEffect | null>(null);
  const chromaRef = useRef<ChromaticAberrationEffect | null>(null);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        gl={{
          antialias: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0.4, 10], fov: 45, near: 0.1, far: 400 }}
        onCreated={(state) => {
          state.scene.fog = new THREE.FogExp2("#0a0f0a", 0.0025);
          (window as unknown as { __r3f: typeof state }).__r3f = state;
          state.gl.domElement.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              window.location.reload();
            },
            { once: true }
          );
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#0a0f0a"]} />
          <ambientLight intensity={0.35} color="#8fbc8f" />
          <directionalLight position={[20, 30, 15]} intensity={1.8} color="#f0d080" />
          <directionalLight position={[-15, 10, -20]} intensity={0.6} color="#00d4ff" />

          {/* HDRI for PBR reflections */}
          <group rotation={[0, Math.PI * 0.3, 0]}>
            <Environment
              files="/hdri/dikhololo_night_1k.hdr"
              environmentIntensity={0.4}
            />
          </group>

          <CameraRig />

          {/* Atmospheric particle field */}
          <ParticleField count={8000} bounds={[60, 40, 60]} drift={[0.3, 0.05, 0.2]} color="#00d4ff" opacity={0.15} />

          {/* Ground radar sweep */}
          <RadarSweep
            radius={35}
            y={0.02}
            speed={1.5}
            color="#00d4ff"
            trailLength={50}
            active={true}
          />

          {/* Futuristic Drone Showcase - Multirotor, Fixed-Wing, VTOL */}
          <DroneShowcase />

          
          {/* HUD Compass */}
          <Compass
            trackCamera={true}
            radius={1.8}
            color="#00d4ff"
            showPitchLadder={true}
          />

          <SkillCards />
          <ProjectOrbit />

          <EffectComposer multisampling={4}>
            <Bloom
              ref={bloomRef}
              intensity={0.85}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.85}
              mipmapBlur
            />
            <ChromaticAberration ref={chromaRef} offset={[0.0003, 0.0003]} />
            <Vignette eskil={false} offset={0.22} darkness={0.88} />
          </EffectComposer>

          <ImpactPostSurge bloom={bloomRef} chroma={chromaRef} />
          <SceneReady />
        </Suspense>

        {/* Deferred layer: heavy GLB models stream in AFTER first paint */}
        <DeferredScene />
      </Canvas>
    </div>
  );
}