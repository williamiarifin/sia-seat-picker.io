"use client";

import { useMemo } from "react";
import type { JSX } from "react";
import * as THREE from "three";

import { CHROME, HUB, LIVERY, TIRE } from "./materials";

interface WheelProps {
  position: [number, number, number];
  radius: number;
  width: number;
  tire: THREE.Material;
  hub: THREE.Material;
}

function Wheel({ position, radius, width, tire, hub }: WheelProps): JSX.Element {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={tire}>
        <cylinderGeometry args={[radius, radius, width, 24]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={hub}>
        <cylinderGeometry args={[radius * 0.56, radius * 0.56, width * 1.06, 20]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={hub}>
        <cylinderGeometry args={[radius * 0.22, radius * 0.22, width * 1.12, 12]} />
      </mesh>
    </group>
  );
}

export function Gear(): JSX.Element {
  const tireMaterial = useMemo(() => new THREE.MeshStandardMaterial(TIRE), []);
  const hubMaterial = useMemo(() => new THREE.MeshPhysicalMaterial(HUB), []);
  const strutMaterial = useMemo(() => new THREE.MeshPhysicalMaterial(CHROME), []);
  const doorMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: LIVERY.ivoryWarm,
        roughness: 0.46,
        metalness: 0.05,
        clearcoat: 0.7,
        clearcoatRoughness: 0.14,
      }),
    [],
  );
  const wellMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2A3036",
        roughness: 0.8,
        metalness: 0.3,
      }),
    [],
  );

  const mainGear = (side: 1 | -1) => {
    const x = 2.5 * side;
    return (
      <group key={`main-${side}`} name={side > 0 ? "main-gear-starboard" : "main-gear-port"}>
        {/* Trunnion / wing attach fairing */}
        <mesh position={[x, -0.5, 1.0]} material={strutMaterial}>
          <cylinderGeometry args={[0.16, 0.13, 0.5, 14]} />
        </mesh>

        {/* Main oleo */}
        <mesh position={[x, -1.25, 1.0]} material={strutMaterial}>
          <cylinderGeometry args={[0.105, 0.085, 1.55, 14]} />
        </mesh>

        {/* Torque link */}
        <mesh
          position={[x - 0.13 * side, -1.35, 0.94]}
          rotation={[0, 0, 0.28 * side]}
          material={strutMaterial}
        >
          <cylinderGeometry args={[0.035, 0.035, 0.65, 8]} />
        </mesh>

        {/* Axle beam */}
        <mesh position={[x, -2.08, 1.0]} rotation={[0, 0, Math.PI / 2]} material={strutMaterial}>
          <cylinderGeometry args={[0.07, 0.07, 0.82, 12]} />
        </mesh>

        <Wheel
          position={[x - 0.24, -2.23, 1.0]}
          radius={0.5}
          width={0.3}
          tire={tireMaterial}
          hub={hubMaterial}
        />
        <Wheel
          position={[x + 0.24, -2.23, 1.0]}
          radius={0.5}
          width={0.3}
          tire={tireMaterial}
          hub={hubMaterial}
        />

        {/* Wheel-well interior panel */}
        <mesh position={[x, -0.87, 1.0]} material={wellMaterial}>
          <boxGeometry args={[0.85, 0.04, 2.1]} />
        </mesh>

        {/* Hanging gear door, outboard of the wheels */}
        <mesh
          position={[x + 0.63 * side, -1.2, 0.55]}
          rotation={[0, 0, -0.14 * side]}
          material={doorMaterial}
        >
          <boxGeometry args={[0.045, 0.95, 1.9]} />
        </mesh>
      </group>
    );
  };

  return (
    <group name="landing-gear">
      {mainGear(1)}
      {mainGear(-1)}

      <group name="nose-gear">
        <mesh position={[0, -1.35, -13.35]} material={strutMaterial}>
          <cylinderGeometry args={[0.075, 0.065, 1.3, 12]} />
        </mesh>

        <mesh position={[0, -2.25, -13.35]} rotation={[0, 0, Math.PI / 2]} material={strutMaterial}>
          <cylinderGeometry args={[0.055, 0.055, 0.5, 10]} />
        </mesh>

        <mesh
          position={[0.09, -1.45, -13.5]}
          rotation={[0.3, 0, 0.06]}
          material={strutMaterial}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        </mesh>

        <Wheel
          position={[-0.19, -2.38, -13.35]}
          radius={0.37}
          width={0.19}
          tire={tireMaterial}
          hub={hubMaterial}
        />
        <Wheel
          position={[0.19, -2.38, -13.35]}
          radius={0.37}
          width={0.19}
          tire={tireMaterial}
          hub={hubMaterial}
        />

        {/* Nose gear bay doors */}
        <mesh
          position={[-0.28, -1.03, -13.1]}
          rotation={[0.05, 0, -0.1]}
          material={doorMaterial}
        >
          <boxGeometry args={[0.045, 0.78, 1.15]} />
        </mesh>
        <mesh
          position={[0.28, -1.03, -13.1]}
          rotation={[0.05, 0, 0.1]}
          material={doorMaterial}
        >
          <boxGeometry args={[0.045, 0.78, 1.15]} />
        </mesh>
      </group>
    </group>
  );
}
