"use client";

import { useMemo } from "react";
import type { JSX } from "react";
import * as THREE from "three";

import {
  buildDorsalGeometry,
  buildLoftGeometry,
  mirrorGeometryX,
  type LoftStation,
} from "./geometry";
import { DARK_METAL, NAVY_PAINT, PAINT_SOLID } from "./materials";
import { getFinMap } from "./textures";

const FIN: LoftStation[] = [
  { x: 0, y: 1.9, leZ: 13.45, chord: 6.15, thickness: 0.105 },
  { x: 0, y: 2.55, leZ: 13.6, chord: 6.0, thickness: 0.105 },
  { x: 0, y: 3.5, leZ: 13.95, chord: 5.65, thickness: 0.105 },
  { x: 0, y: 4.9, leZ: 14.65, chord: 4.95, thickness: 0.102 },
  { x: 0, y: 6.4, leZ: 15.65, chord: 3.95, thickness: 0.1 },
  { x: 0, y: 7.8, leZ: 16.65, chord: 2.85, thickness: 0.095 },
  { x: 0, y: 9.0, leZ: 17.5, chord: 1.75, thickness: 0.09 },
  { x: 0, y: 9.7, leZ: 18.05, chord: 1.1, thickness: 0.085 },
  { x: 0, y: 9.95, leZ: 18.3, chord: 0.75, thickness: 0.078 },
];

const STABILISER: LoftStation[] = [
  { x: 0.55, y: 1.95, leZ: 14.3, chord: 3.95, thickness: 0.1 },
  { x: 2.0, y: 2.02, leZ: 15.2, chord: 3.2, thickness: 0.1 },
  { x: 3.5, y: 2.1, leZ: 16.0, chord: 2.5, thickness: 0.095 },
  { x: 5.0, y: 2.2, leZ: 16.8, chord: 1.9, thickness: 0.09 },
  { x: 6.2, y: 2.28, leZ: 17.5, chord: 1.4, thickness: 0.085 },
  { x: 6.95, y: 2.34, leZ: 17.9, chord: 1.05, thickness: 0.08 },
];

export function Tail(): JSX.Element {
  const finMap = useMemo(() => getFinMap(), []);

  const fin = useMemo(() => {
    const v = FIN.map((station) => (station.y - FIN[0].y) / (FIN[FIN.length - 1].y - FIN[0].y));
    return buildLoftGeometry(FIN, { capEnd: true, samples: 16, v });
  }, []);

  const starboardStab = useMemo(
    () => buildLoftGeometry(STABILISER, { capEnd: true, samples: 12 }),
    [],
  );
  const portStab = useMemo(() => mirrorGeometryX(starboardStab), [starboardStab]);
  const dorsal = useMemo(() => buildDorsalGeometry(), []);

  const finMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        map: finMap,
        roughness: 0.35,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.07,
        envMapIntensity: 1,
      }),
    [finMap],
  );
  const dorsalMaterial = useMemo(() => new THREE.MeshPhysicalMaterial(NAVY_PAINT), []);
  const stabMaterial = useMemo(() => new THREE.MeshPhysicalMaterial(PAINT_SOLID), []);
  const apuMaterial = useMemo(() => new THREE.MeshPhysicalMaterial(DARK_METAL), []);
  const tailLight = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f8f2e2",
        emissive: new THREE.Color("#fff1cf"),
        emissiveIntensity: 1.2,
        roughness: 0.4,
      }),
    [],
  );

  return (
    <group name="tail">
      <mesh geometry={fin} material={finMaterial} name="vertical-fin" />
      <mesh geometry={dorsal} material={dorsalMaterial} name="dorsal-fillet" />
      <mesh geometry={starboardStab} material={stabMaterial} name="stabiliser-starboard" />
      <mesh geometry={portStab} material={stabMaterial} name="stabiliser-port" />

      <mesh
        position={[0, 1.83, 19.7]}
        rotation={[Math.PI / 2, 0, 0]}
        material={apuMaterial}
        name="apu-exhaust"
      >
        <cylinderGeometry args={[0.12, 0.1, 0.3, 16]} />
      </mesh>

      <mesh position={[0, 9.92, 19.02]} material={tailLight} name="tail-nav-light">
        <sphereGeometry args={[0.045, 8, 6]} />
      </mesh>
    </group>
  );
}
