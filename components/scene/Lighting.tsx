"use client";

import { useMemo, useRef } from "react";
import type { JSX } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

import { sceneState } from "./sceneState";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Studio lighting for the whole scene. Built from <Lightformer> panels rather
 * than an HDRI preset so nothing hits the network at runtime or build time.
 *
 * Shadow maps are off for performance, which means light passes straight
 * through the fuselage. Without correction the cabin interior floods to white
 * once the roof closes, so the rig explicitly dims and warms as the camera
 * moves inside (`sceneState.inside`).
 */
export function Lighting(): JSX.Element {
  const scene = useThree((state) => state.scene);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const cabinFillRef = useRef<THREE.DirectionalLight>(null);
  const cabinRef = useRef<THREE.PointLight>(null);

  const cabinLights = useMemo(
    () => [
      { position: [-0.1, 2.3, -11] as const, intensity: 9 },
      { position: [0.15, 2.3, -5.5] as const, intensity: 10 },
      { position: [-0.15, 2.3, 0] as const, intensity: 10 },
      { position: [0.1, 2.3, 5.5] as const, intensity: 9 },
      { position: [0, 2.3, 10.5] as const, intensity: 8 },
    ],
    [],
  );
  const cabinLightRefs = useRef<(THREE.PointLight | null)[]>([]);

  const envIntensity = useRef(1);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const inside = THREE.MathUtils.clamp(sceneState.inside, 0, 1);
    // Exterior weight: 1 outside, 0 deep in the cabin.
    const out = 1 - inside;

    const k = Math.min(1, dt * 3);

    if (ambientRef.current) {
      ambientRef.current.intensity = lerp(ambientRef.current.intensity, lerp(0.22, 0.3, out), k);
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = lerp(hemiRef.current.intensity, lerp(0.22, 0.46, out), k);
    }
    if (keyRef.current) {
      keyRef.current.intensity = lerp(keyRef.current.intensity, lerp(0.22, 1.28, out), k);
    }
    if (fillRef.current) {
      fillRef.current.intensity = lerp(fillRef.current.intensity, lerp(0.08, 0.4, out), k);
    }
    if (rimRef.current) {
      rimRef.current.intensity = lerp(rimRef.current.intensity, lerp(0.1, 0.32, out), k);
    }
    if (cabinRef.current) {
      cabinRef.current.intensity = lerp(cabinRef.current.intensity, inside * 2.4, k);
    }
    if (cabinFillRef.current) {
      cabinFillRef.current.intensity = lerp(cabinFillRef.current.intensity, inside * 0.85, k);
    }

    for (let i = 0; i < cabinLights.length; i += 1) {
      const light = cabinLightRefs.current[i];
      if (!light) continue;
      light.intensity = lerp(light.intensity, inside * cabinLights[i].intensity, k);
    }

    const target = lerp(0.32, 1, out);
    envIntensity.current = lerp(envIntensity.current, target, k);
    scene.environmentIntensity = envIntensity.current;
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.3} color="#cfe0f2" />
      <hemisphereLight ref={hemiRef} args={["#e6f0fa", "#071422", 0.46]} />

      {/* Key light, high and slightly forward */}
      <directionalLight ref={keyRef} position={[16, 22, 12]} intensity={1.28} color="#fff5e6" />
      {/* Cool fill from the opposite side */}
      <directionalLight ref={fillRef} position={[-14, 9, -18]} intensity={0.4} color="#7fb0e8" />
      {/* Rim light from behind the tail */}
      <directionalLight ref={rimRef} position={[0, 6, 26]} intensity={0.32} color="#ffe9c4" />
      {/* Cabin fill: lifts the aft-facing seat faces once you are inside */}
      <directionalLight ref={cabinFillRef} position={[2, 4, 22]} intensity={0} color="#ffe8c8" />
      {/* Warm cabin bounce, only on inside the tube */}
      <pointLight ref={cabinRef} position={[0, 2.1, -2]} intensity={0} distance={26} decay={1.6} color="#ffd7a0" />

      {/* Pools of warm cabin light along the ceiling */}
      {cabinLights.map((light, index) => (
        <pointLight
          key={index}
          ref={(node) => {
            cabinLightRefs.current[index] = node;
          }}
          position={[light.position[0], light.position[1], light.position[2]]}
          intensity={0}
          distance={9}
          decay={1.8}
          color="#ffdfb4"
        />
      ))}

      <Environment resolution={256} frames={1}>
        {/* Soft overhead bounce card */}
        <Lightformer
          intensity={1.0}
          position={[0, 16, 0]}
          scale={[26, 26, 1]}
          rotation-x={Math.PI / 2}
          color="#ffffff"
        />
        {/* Window strip, camera left */}
        <Lightformer
          intensity={0.55}
          position={[-18, 6, 0]}
          scale={[10, 18, 1]}
          rotation-y={Math.PI / 2}
          color="#bcd8ff"
        />
        {/* Warm kicker, camera right */}
        <Lightformer
          intensity={0.4}
          position={[20, 4, 6]}
          scale={[8, 14, 1]}
          rotation-y={-Math.PI / 2}
          color="#ffd9a8"
        />
        <Lightformer
          intensity={0.22}
          position={[0, -6, 0]}
          scale={[24, 24, 1]}
          rotation-x={-Math.PI / 2}
          color="#4b6d8f"
        />
      </Environment>

      <ContactShadows
        position={[0, -0.08, 0]}
        opacity={0.5}
        scale={72}
        blur={2.6}
        far={22}
        resolution={512}
        frames={1}
        color="#04101d"
      />
    </>
  );
}
