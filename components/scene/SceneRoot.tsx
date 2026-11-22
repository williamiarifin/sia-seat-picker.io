"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";

import { Aircraft } from "@/components/aircraft/Aircraft";
import { Cabin } from "@/components/cabin/Cabin";
import { CabinLabels } from "@/components/cabin/CabinLabels";
import { Seats } from "@/components/cabin/Seats";
import { useBooking } from "@/lib/store";
import { appPath } from "@/lib/paths";
import { CameraDirector } from "./CameraDirector";
import { Effects } from "./Effects";
import { Lighting } from "./Lighting";
import { sceneState } from "./sceneState";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

export function SceneRoot() {
  const pathname = usePathname();
  const phase = useBooking((state) => state.phase);
  const [ready, setReady] = useState(false);
  const isSeats = appPath(pathname) === "/seats";

  useEffect(() => {
    const mq = window.matchMedia(REDUCE_QUERY);
    const sync = () => {
      sceneState.reduce = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-0 ${isSeats ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden
    >
      <Canvas
        dpr={[1, 1.75]}
        shadows={false}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
        camera={{ position: [-54, 30, 60], fov: 32, near: 0.05, far: 400 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearAlpha(0);
          setReady(true);
        }}
      >
        <Suspense fallback={null}>
          <Lighting />
          <Aircraft />
          <Cabin />
          <Seats />
          <CabinLabels visible={isSeats && phase === "overview"} />
          <CameraDirector />
          <Effects />
          <AdaptiveDpr pixelated={false} />
          <Preload all />
        </Suspense>
      </Canvas>

      {/* Soft fade-in so the first shader compile does not flash */}
      <div
        className={`pointer-events-none absolute inset-0 bg-[#050d1a] transition-opacity duration-[1200ms] ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
