"use client";

import { useMemo } from "react";
import type { JSX } from "react";
import * as THREE from "three";

import {
  buildLoftGeometry,
  buildShellGeometry,
  mirrorGeometryX,
  stationsFromPoints,
  type LoftStation,
} from "./geometry";
import { PAINT_FAIRING, PAINT_SOLID } from "./materials";

const DEG = Math.PI / 180;
const DIHEDRAL = 6 * DEG;
const ROOT_X = 1.1;
const ROOT_Y = -0.45;

interface PlanformPoint {
  x: number;
  le: number;
  chord: number;
  t: number;
}

const PLANFORM: PlanformPoint[] = [
  { x: 1.1, le: -4.6, chord: 7.3, t: 0.145 },
  { x: 6.6, le: -2.04, chord: 6.1, t: 0.13 },
  { x: 12.0, le: 0.48, chord: 3.9, t: 0.107 },
  { x: 17.0, le: 2.81, chord: 1.58, t: 0.09 },
];

function planformAt(x: number): PlanformPoint {
  const clamped = Math.min(Math.max(x, PLANFORM[0].x), PLANFORM[PLANFORM.length - 1].x);
  for (let i = 0; i < PLANFORM.length - 1; i += 1) {
    const a = PLANFORM[i];
    const b = PLANFORM[i + 1];
    if (clamped <= b.x) {
      const t = (clamped - a.x) / (b.x - a.x);
      return {
        x: clamped,
        le: a.le + (b.le - a.le) * t,
        chord: a.chord + (b.chord - a.chord) * t,
        t: a.t + (b.t - a.t) * t,
      };
    }
  }
  return { ...PLANFORM[PLANFORM.length - 1] };
}

function wingY(x: number): number {
  return ROOT_Y + (x - ROOT_X) * Math.tan(DIHEDRAL);
}

function buildWingStations(): LoftStation[] {
  const wingX = [1.1, 2.2, 3.4, 4.6, 5.8, 6.6, 7.8, 9.0, 10.2, 11.4, 12.6, 13.8, 14.9, 15.8, 16.5, 17.0];
  const stations: LoftStation[] = wingX.map((x) => {
    const plan = planformAt(x);
    return {
      x,
      y: wingY(x),
      leZ: plan.le,
      chord: plan.chord,
      thickness: plan.t,
      camber: 0.015,
    };
  });

  /* Blended winglet: the span tangent gradually rotates from horizontal to
     nearly vertical, so the airfoil sections twist smoothly into the tip. */
  const winglet: LoftStation[] = [
    { x: 17.04, y: 1.29, leZ: 2.86, chord: 1.54, thickness: 0.088, camber: 0.012 },
    { x: 17.12, y: 1.46, leZ: 2.99, chord: 1.44, thickness: 0.085, camber: 0.012 },
    { x: 17.28, y: 1.79, leZ: 3.09, chord: 1.31, thickness: 0.082, camber: 0.01 },
    { x: 17.46, y: 2.22, leZ: 3.19, chord: 1.16, thickness: 0.078, camber: 0.01 },
    { x: 17.63, y: 2.72, leZ: 3.29, chord: 1.01, thickness: 0.073, camber: 0.008 },
    { x: 17.79, y: 3.2, leZ: 3.37, chord: 0.89, thickness: 0.068, camber: 0.008 },
    { x: 17.9, y: 3.58, leZ: 3.43, chord: 0.78, thickness: 0.063, camber: 0.006 },
    { x: 17.95, y: 3.86, leZ: 3.48, chord: 0.62, thickness: 0.055, camber: 0.004 },
  ];

  return [...stations, ...winglet];
}

function buildWingBodyFairing(): THREE.BufferGeometry {
  const stations = [
    { z: -7.8, w: 0.05, h: 0.03, y: -0.73 },
    { z: -7.0, w: 0.52, h: 0.17, y: -0.72 },
    { z: -5.8, w: 1.02, h: 0.36, y: -0.68 },
    { z: -4.4, w: 1.34, h: 0.49, y: -0.64 },
    { z: -2.8, w: 1.5, h: 0.56, y: -0.62 },
    { z: -0.6, w: 1.56, h: 0.58, y: -0.6 },
    { z: 1.8, w: 1.5, h: 0.55, y: -0.6 },
    { z: 3.8, w: 1.4, h: 0.5, y: -0.62 },
    { z: 5.6, w: 1.15, h: 0.42, y: -0.65 },
    { z: 7.0, w: 0.8, h: 0.3, y: -0.7 },
    { z: 8.2, w: 0.4, h: 0.16, y: -0.73 },
    { z: 8.9, w: 0.05, h: 0.03, y: -0.76 },
  ];

  const segments = 18;
  const cols = segments + 1;
  const positions: number[] = [];
  const indices: number[] = [];

  for (const station of stations) {
    for (let k = 0; k < cols; k += 1) {
      const phi = -Math.PI + (2 * Math.PI * k) / segments;
      positions.push(
        station.w * Math.sin(phi),
        station.y + station.h * Math.cos(phi),
        station.z,
      );
    }
  }

  for (let i = 0; i < stations.length - 1; i += 1) {
    for (let k = 0; k < segments; k += 1) {
      const a = i * cols + k;
      const b = (i + 1) * cols + k;
      const c = (i + 1) * cols + k + 1;
      const d = i * cols + k + 1;
      indices.push(a, b, c, a, c, d);
    }
  }

  const startCenter = positions.length / 3;
  positions.push(0, stations[0].y, stations[0].z);
  for (let k = 0; k < segments; k += 1) indices.push(startCenter, k, k + 1);

  const endCenter = positions.length / 3;
  const base = (stations.length - 1) * cols;
  positions.push(0, stations[stations.length - 1].y, stations[stations.length - 1].z);
  for (let k = 0; k < segments; k += 1) {
    indices.push(endCenter, base + k + 1, base + k);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function buildFlapTrack(): THREE.BufferGeometry {
  return buildShellGeometry(
    stationsFromPoints([
      { z: -0.85, r: 0.02, y: 0 },
      { z: -0.7, r: 0.085, y: 0 },
      { z: -0.35, r: 0.15, y: 0 },
      { z: 0.05, r: 0.17, y: 0 },
      { z: 0.4, r: 0.135, y: 0 },
      { z: 0.65, r: 0.065, y: 0 },
      { z: 0.8, r: 0.02, y: 0 },
    ]),
    -Math.PI,
    Math.PI,
    10,
    { capStart: true, capEnd: true },
  );
}

const FLAP_TRACK_X = [3.6, 6.4, 9.0, 11.6];

export function Wings(): JSX.Element {
  const starboard = useMemo(
    () => buildLoftGeometry(buildWingStations(), { capEnd: true, samples: 14 }),
    [],
  );
  const port = useMemo(() => mirrorGeometryX(starboard), [starboard]);
  const fairing = useMemo(() => buildWingBodyFairing(), []);
  const flapTrack = useMemo(() => buildFlapTrack(), []);

  const skinMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial(PAINT_SOLID),
    [],
  );
  const fairingMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial(PAINT_FAIRING),
    [],
  );
  const redLight = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#4a1010",
        emissive: new THREE.Color("#ff2a2a"),
        emissiveIntensity: 1.4,
        roughness: 0.35,
        metalness: 0.1,
      }),
    [],
  );
  const greenLight = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0d2a1c",
        emissive: new THREE.Color("#2dff9a"),
        emissiveIntensity: 1.4,
        roughness: 0.35,
        metalness: 0.1,
      }),
    [],
  );

  const flapTracks = useMemo(
    () =>
      FLAP_TRACK_X.map((x) => {
        const plan = planformAt(x);
        const teZ = plan.le + plan.chord;
        return { x, z: teZ - 0.25, y: wingY(x) - 0.19 };
      }),
    [],
  );

  return (
    <group name="wings">
      <mesh geometry={starboard} material={skinMaterial} name="wing-starboard" />
      <mesh geometry={port} material={skinMaterial} name="wing-port" />
      <mesh geometry={fairing} material={fairingMaterial} name="wing-body-fairing" />

      {flapTracks.map((track, index) => (
        <group key={`flap-${index}`}>
          <mesh
            geometry={flapTrack}
            material={fairingMaterial}
            position={[track.x, track.y, track.z]}
            scale={[0.82, 1.15, 1]}
            name="flap-track-fairing"
          />
          <mesh
            geometry={flapTrack}
            material={fairingMaterial}
            position={[-track.x, track.y, track.z]}
            scale={[0.82, 1.15, 1]}
            name="flap-track-fairing"
          />
        </group>
      ))}

      <mesh position={[-17.97, 3.62, 3.55]} material={redLight} name="nav-light-port">
        <sphereGeometry args={[0.055, 8, 6]} />
      </mesh>
      <mesh position={[17.97, 3.62, 3.55]} material={greenLight} name="nav-light-starboard">
        <sphereGeometry args={[0.055, 8, 6]} />
      </mesh>
      <mesh position={[0.0, -0.97, 9.6]} material={redLight} name="beacon-belly">
        <sphereGeometry args={[0.05, 8, 6]} />
      </mesh>
    </group>
  );
}
