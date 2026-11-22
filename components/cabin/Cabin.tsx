"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { JSX } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import { palette } from "@/lib/theme";
import { sceneState } from "@/components/scene/sceneState";
import { buildCabin } from "./cabinGeometry";

const Z_FRONT = -16.2;
const Z_REAR = 13.0;
const Z_MID = (Z_FRONT + Z_REAR) / 2;
const Z_LENGTH = Z_REAR - Z_FRONT;

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createCarpetTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#0b1a2b";
  context.fillRect(0, 0, size, size);

  const random = seededRandom(7);
  for (let i = 0; i < 9000; i += 1) {
    const x = random() * size;
    const y = random() * size;
    const shade = random();
    context.fillStyle =
      shade > 0.82
        ? "rgba(64, 94, 128, 0.35)"
        : shade > 0.4
          ? "rgba(28, 49, 74, 0.5)"
          : "rgba(5, 14, 26, 0.45)";
    context.fillRect(x, y, 1.4, 1.4);
  }

  context.strokeStyle = "rgba(122, 146, 172, 0.05)";
  context.lineWidth = 1;
  for (let y = 0; y < size; y += 8) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(size, y);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.2, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function Cabin(): JSX.Element {
  const geometry = useMemo(buildCabin, []);
  const carpet = useMemo(createCarpetTexture, []);

  useEffect(
    () => () => {
      for (const part of Object.values(geometry)) part.dispose();
    },
    [geometry],
  );

  useEffect(
    () => () => {
      carpet?.dispose();
    },
    [carpet],
  );

  const roofRef = useRef<THREE.Group>(null);
  const roofMaterials = useRef<THREE.Material[]>([]);

  useLayoutEffect(() => {
    const materials: THREE.Material[] = [];
    roofRef.current?.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const material = object.material;
        if (Array.isArray(material)) materials.push(...material);
        else materials.push(material);
      }
    });
    roofMaterials.current = materials;
  }, []);

  useFrame(() => {
    const roof = roofRef.current;
    if (!roof) return;
    const opacity = THREE.MathUtils.smoothstep(sceneState.reveal, 0.02, 0.55);
    roof.visible = opacity > 0.015;
    for (const material of roofMaterials.current) {
      material.opacity = opacity;
    }
  });

  return (
    <group>
      <mesh geometry={geometry.dado} dispose={null}>
        <meshStandardMaterial
          color="#b7ab94"
          roughness={0.88}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh geometry={geometry.ivory} dispose={null}>
        <meshStandardMaterial
          color="#ded6c4"
          roughness={0.7}
          metalness={0.04}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={geometry.dark} dispose={null}>
        <meshStandardMaterial
          color="#26313d"
          roughness={0.46}
          metalness={0.3}
        />
      </mesh>
      <mesh geometry={geometry.gold} dispose={null}>
        <meshStandardMaterial
          color={palette.gold}
          roughness={0.3}
          metalness={0.62}
        />
      </mesh>
      <mesh geometry={geometry.curtains} dispose={null}>
        <meshStandardMaterial
          color="#1d3557"
          roughness={0.86}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh geometry={geometry.glows} dispose={null}>
        <meshBasicMaterial
          color="#dcefff"
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0, Z_MID]}>
        <planeGeometry args={[2.87, Z_LENGTH]} />
        <meshStandardMaterial
          map={carpet ?? undefined}
          color={carpet ? "#ffffff" : "#0c1b2b"}
          roughness={0.96}
          metalness={0}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, -2.9]}>
        <planeGeometry args={[0.92, 24.8]} />
        <meshStandardMaterial
          color="#173a5b"
          roughness={0.82}
          metalness={0.06}
        />
      </mesh>

      <group ref={roofRef} visible={false}>
        <mesh geometry={geometry.upper} dispose={null}>
          <meshStandardMaterial
            color="#ddd5c3"
            roughness={0.78}
            metalness={0.03}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
        <mesh geometry={geometry.ceiling} dispose={null}>
          <meshStandardMaterial
            color="#efe9db"
            roughness={0.9}
            metalness={0.01}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
        <mesh geometry={geometry.bins} dispose={null}>
          <meshStandardMaterial
            color="#e5ddca"
            roughness={0.56}
            metalness={0.08}
            transparent
          />
        </mesh>
        <mesh geometry={geometry.psu} dispose={null}>
          <meshStandardMaterial
            color="#a99f8b"
            roughness={0.62}
            metalness={0.12}
            transparent
          />
        </mesh>
        <mesh geometry={geometry.roofGold} dispose={null}>
          <meshStandardMaterial
            color={palette.gold}
            roughness={0.3}
            metalness={0.6}
            transparent
          />
        </mesh>
        <mesh geometry={geometry.lightStrips} dispose={null}>
          <meshBasicMaterial color="#e6c48f" />
        </mesh>
      </group>
    </group>
  );
}
