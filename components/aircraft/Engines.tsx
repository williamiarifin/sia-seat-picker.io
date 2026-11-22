"use client";

import { useMemo } from "react";
import type { JSX } from "react";
import * as THREE from "three";

import { buildShellGeometry, stationsFromPoints } from "./geometry";
import {
  CHROME,
  DARK_METAL,
  FAN_METAL,
  LIVERY,
  PAINT_SOLID,
} from "./materials";

const ENGINE_X = 5.05;
const ENGINE_Y = -1.55;

const NACELLE_PROFILE = [
  { z: -6.85, r: 0.695, y: 0 },
  { z: -6.8, r: 0.755, y: 0 },
  { z: -6.66, r: 0.805, y: 0 },
  { z: -6.35, r: 0.835, y: 0 },
  { z: -5.9, r: 0.845, y: 0 },
  { z: -5.4, r: 0.838, y: 0 },
  { z: -4.9, r: 0.818, y: 0 },
  { z: -4.4, r: 0.79, y: 0 },
  { z: -4.05, r: 0.755, y: 0 },
  { z: -3.7, r: 0.7, y: 0 },
  { z: -3.3, r: 0.625, y: 0 },
  { z: -2.9, r: 0.56, y: 0 },
  { z: -2.5, r: 0.505, y: 0 },
  { z: -2.15, r: 0.46, y: 0 },
  { z: -1.95, r: 0.44, y: 0 },
];

function buildPylonGeometry(): THREE.BufferGeometry {
  /* Points are (world z, y relative to the nacelle centreline). */
  const outline: [number, number][] = [
    [-5.75, 0.7],
    [-4.85, 1.02],
    [-3.4, 1.46],
    [-0.85, 1.42],
    [-1.55, 0.7],
  ];

  const shape = new THREE.Shape();
  outline.forEach(([z, y], index) => {
    const x = -z;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    steps: 1,
  });
  geometry.rotateY(Math.PI / 2);
  geometry.translate(-0.1, 0, 0);
  geometry.computeVertexNormals();
  return geometry;
}

function buildFanGeometry(): THREE.BufferGeometry {
  const blades = 20;
  const stations = 5;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let blade = 0; blade < blades; blade += 1) {
    const baseAngle = (blade / blades) * Math.PI * 2;
    const start = positions.length / 3;

    for (let k = 0; k < stations; k += 1) {
      const t = k / (stations - 1);
      const radius = 0.16 + 0.44 * t;
      const sweep = 0.42 * t;
      const width = 0.13 + 0.1 * t;
      for (let j = 0; j < 2; j += 1) {
        const angle = baseAngle + sweep + j * width;
        positions.push(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          -0.035 * t + j * 0.014,
        );
      }
    }

    for (let k = 0; k < stations - 1; k += 1) {
      const a = start + k * 2;
      const b = a + 1;
      const c = a + 3;
      const d = a + 2;
      indices.push(a, b, c, a, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function Engines(): JSX.Element {
  const nacelle = useMemo(
    () => buildShellGeometry(stationsFromPoints(NACELLE_PROFILE), -Math.PI, Math.PI, 40),
    [],
  );
  const pylon = useMemo(() => buildPylonGeometry(), []);
  const fan = useMemo(() => buildFanGeometry(), []);

  const nacelleMaterial = useMemo(() => new THREE.MeshPhysicalMaterial(PAINT_SOLID), []);
  const pylonMaterial = useMemo(() => new THREE.MeshPhysicalMaterial(PAINT_SOLID), []);
  const lipMaterial = useMemo(() => new THREE.MeshPhysicalMaterial(CHROME), []);
  const darkMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ ...DARK_METAL, side: THREE.DoubleSide }),
    [],
  );
  const fanMaterial = useMemo(() => new THREE.MeshPhysicalMaterial(FAN_METAL), []);
  const goldMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: LIVERY.gold,
        metalness: 0.85,
        roughness: 0.24,
        clearcoat: 0.5,
        clearcoatRoughness: 0.15,
      }),
    [],
  );

  const engine = (side: 1 | -1) => (
    <group
      key={side}
      position={[ENGINE_X * side, ENGINE_Y, 0]}
      name={side > 0 ? "engine-starboard" : "engine-port"}
    >
      <mesh geometry={nacelle} material={nacelleMaterial} name="nacelle" />

      <mesh
        position={[0, 0, -6.85]}
        material={lipMaterial}
        name="nacelle-inlet-lip"
      >
        <torusGeometry args={[0.725, 0.05, 10, 48]} />
      </mesh>

      <mesh
        position={[0, 0, -6.55]}
        rotation={[Math.PI / 2, 0, 0]}
        material={goldMaterial}
        name="nacelle-gold-ring"
      >
        <torusGeometry args={[0.815, 0.012, 6, 48]} />
      </mesh>

      <mesh
        position={[0, 0, -6.45]}
        rotation={[Math.PI / 2, 0, 0]}
        material={darkMaterial}
        name="inlet-duct"
      >
        <cylinderGeometry args={[0.58, 0.69, 0.6, 36, 1, true]} />
      </mesh>

      <mesh
        position={[0, 0, -6.24]}
        rotation={[0, Math.PI, 0]}
        material={darkMaterial}
        name="fan-face"
      >
        <circleGeometry args={[0.6, 40]} />
      </mesh>

      <mesh
        geometry={fan}
        material={fanMaterial}
        position={[0, 0, -6.3]}
        name="fan-blades"
      />

      <mesh
        position={[0, 0, -6.42]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={darkMaterial}
        name="spinner"
      >
        <coneGeometry args={[0.19, 0.46, 24]} />
      </mesh>

      <mesh
        position={[0, 0, -1.62]}
        rotation={[Math.PI / 2, 0, 0]}
        material={darkMaterial}
        name="exhaust-cone"
      >
        <coneGeometry args={[0.38, 0.92, 26]} />
      </mesh>

      <mesh
        position={[0, 0, -1.96]}
        material={darkMaterial}
        name="exhaust-face"
      >
        <circleGeometry args={[0.435, 32]} />
      </mesh>

      <mesh
        position={[0, 0, -1.94]}
        rotation={[Math.PI / 2, 0, 0]}
        material={darkMaterial}
        name="exhaust-ring"
      >
        <torusGeometry args={[0.415, 0.03, 8, 32]} />
      </mesh>

      <mesh geometry={pylon} material={pylonMaterial} name="pylon" />
    </group>
  );

  return (
    <group name="engines">
      {engine(1)}
      {engine(-1)}
    </group>
  );
}
