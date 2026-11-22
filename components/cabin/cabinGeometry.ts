"use client";

import * as THREE from "three";

import { SEATS, cabinExtent } from "@/lib/seatmap";
import {
  box,
  ceilingBand,
  curvedBand,
  curtainGeometry,
  cylinder,
  mergeParts,
  place,
  softBox,
  type Side,
} from "./builders";

const Z_FRONT = -16.2;
const Z_REAR = 13.0;
const Z_MID = (Z_FRONT + Z_REAR) / 2;
const Z_LENGTH = Z_REAR - Z_FRONT;
const WALL_TOP = 2.3;
const WINDOW_Y = 1.0;
const WINDOW_HALF = 0.135;
const WINDOW_SILL = 0.79;
const WINDOW_HEAD = 1.21;
const BIN_Z0 = -14.55;
const BIN_Z1 = 9.45;
const BIN_MID = (BIN_Z0 + BIN_Z1) / 2;
const BIN_LENGTH = BIN_Z1 - BIN_Z0;

/** One window per seat row, so pitch follows each cabin automatically. */
const WINDOW_Z: number[] = Array.from(
  new Set(SEATS.map((seat) => Math.round(seat.z * 1000) / 1000)),
).sort((a, b) => a - b);

export interface CabinGeometry {
  dado: THREE.BufferGeometry;
  upper: THREE.BufferGeometry;
  ceiling: THREE.BufferGeometry;
  glows: THREE.BufferGeometry;
  bins: THREE.BufferGeometry;
  psu: THREE.BufferGeometry;
  roofGold: THREE.BufferGeometry;
  lightStrips: THREE.BufferGeometry;
  ivory: THREE.BufferGeometry;
  dark: THREE.BufferGeometry;
  gold: THREE.BufferGeometry;
  curtains: THREE.BufferGeometry;
}

function buildWindowFrames(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const side of [1, -1] as Side[]) {
    const rotationY = (-side * Math.PI) / 2;
    const x = side * 1.7;
    for (const z of WINDOW_Z) {
      const bars = [
        box(0.34, 0.075, 0.055, 0, 0.2125, 0),
        box(0.34, 0.075, 0.055, 0, -0.2125, 0),
        box(0.075, 0.5, 0.055, -0.1325, 0, 0),
        box(0.075, 0.5, 0.055, 0.1325, 0, 0),
      ];
      for (const bar of bars) {
        parts.push(place(bar, x, WINDOW_Y, z, 0, rotationY, 0));
      }
    }
  }
  return mergeParts(parts);
}

function buildWindowGlows(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const side of [1, -1] as Side[]) {
    const rotationY = (side * Math.PI) / 2;
    for (const z of WINDOW_Z) {
      parts.push(
        place(
          new THREE.PlaneGeometry(0.3, 0.42),
          side * 1.78,
          WINDOW_Y,
          z,
          0,
          rotationY,
          0,
        ),
      );
    }
  }
  return mergeParts(parts);
}

function buildCeiling(): THREE.BufferGeometry {
  return ceilingBand(Z_FRONT + 0.03, Z_REAR - 0.03, 0.68, 1.1, 6);
}

function buildWalls(): {
  dado: THREE.BufferGeometry;
  upper: THREE.BufferGeometry;
} {
  const dado: THREE.BufferGeometry[] = [];
  const upper: THREE.BufferGeometry[] = [];

  for (const side of [1, -1] as Side[]) {
    dado.push(curvedBand(Z_FRONT, Z_REAR, 0.02, WINDOW_SILL, side, 0.55, 0.24));

    let cursor = Z_FRONT;
    for (const z of WINDOW_Z) {
      const holeStart = z - WINDOW_HALF;
      const holeEnd = z + WINDOW_HALF;
      if (holeStart > cursor) {
        upper.push(
          curvedBand(cursor, holeStart, WINDOW_SILL, WINDOW_HEAD, side, 0.6, 1),
        );
      }
      cursor = holeEnd;
    }
    if (cursor < Z_REAR) {
      upper.push(
        curvedBand(cursor, Z_REAR, WINDOW_SILL, WINDOW_HEAD, side, 0.6, 1),
      );
    }

    upper.push(
      curvedBand(Z_FRONT, Z_REAR, WINDOW_HEAD, WALL_TOP, side, 0.7, 0.24),
    );
  }

  return { dado: mergeParts(dado), upper: mergeParts(upper) };
}

function buildRoof(): {
  bins: THREE.BufferGeometry;
  psu: THREE.BufferGeometry;
  roofGold: THREE.BufferGeometry;
  lightStrips: THREE.BufferGeometry;
} {
  const binParts: THREE.BufferGeometry[] = [];
  const psuParts: THREE.BufferGeometry[] = [];
  const goldParts: THREE.BufferGeometry[] = [];
  const lightParts: THREE.BufferGeometry[] = [];

  for (const side of [1, -1] as Side[]) {
    binParts.push(softBox(0.84, 0.38, BIN_LENGTH, 0.055, side * 0.92, 2.0, BIN_MID));
    psuParts.push(box(0.11, 0.055, BIN_LENGTH - 0.2, side * 1.16, 1.79, BIN_MID));

    for (const z of WINDOW_Z) {
      if (z < BIN_Z0 + 0.2 || z > BIN_Z1 - 0.2) continue;
      goldParts.push(box(0.05, 0.032, 0.12, side * 0.515, 1.797, z));
      goldParts.push(cylinder(0.022, 0.012, 6, side * 1.12, 1.758, z));
    }

    lightParts.push(box(0.11, 0.018, Z_LENGTH - 1.4, side * 0.42, 2.6, Z_MID));
  }

  return {
    bins: mergeParts(binParts),
    psu: mergeParts(psuParts),
    roofGold: mergeParts(goldParts),
    lightStrips: mergeParts(lightParts),
  };
}

function buildBulkheads(): {
  ivory: THREE.BufferGeometry;
  gold: THREE.BufferGeometry;
  curtains: THREE.BufferGeometry;
} {
  const firstRear = cabinExtent("first").rear;
  const businessFront = cabinExtent("business").front;
  const businessRear = cabinExtent("business").rear;
  const economyFront = cabinExtent("economy").front;
  const boundaries = [
    (firstRear + businessFront) / 2,
    (businessRear + economyFront) / 2,
  ];

  const ivory: THREE.BufferGeometry[] = [];
  const gold: THREE.BufferGeometry[] = [];
  const curtains: THREE.BufferGeometry[] = [];

  for (const z of boundaries) {
    ivory.push(box(1.05, 2.0, 0.06, -0.835, 1.0, z));
    ivory.push(box(1.05, 2.0, 0.06, 0.835, 1.0, z));
    gold.push(box(1.05, 0.03, 0.09, -0.835, 2.015, z));
    gold.push(box(1.05, 0.03, 0.09, 0.835, 2.015, z));
    gold.push(box(0.62, 0.025, 0.06, 0, 2.03, z));
    curtains.push(curtainGeometry(0.58, 0.92, 2.015, z, 5));
  }

  return {
    ivory: mergeParts(ivory),
    gold: mergeParts(gold),
    curtains: mergeParts(curtains),
  };
}

function buildGalley(): {
  ivory: THREE.BufferGeometry;
  dark: THREE.BufferGeometry;
  gold: THREE.BufferGeometry;
} {
  const ivory: THREE.BufferGeometry[] = [];
  const dark: THREE.BufferGeometry[] = [];
  const gold: THREE.BufferGeometry[] = [];

  // Forward pressure bulkhead and flight-deck door.
  ivory.push(box(2.7, 2.2, 0.09, 0, 1.1, Z_FRONT + 0.045));
  dark.push(box(0.68, 1.95, 0.05, 0, 1.0, Z_FRONT + 0.115));
  gold.push(box(0.03, 0.2, 0.03, 0.24, 1.0, Z_FRONT + 0.145));

  // Forward lavatory, port side.
  const lavZ = -15.55;
  ivory.push(box(0.9, 2.02, 0.95, -0.93, 1.01, lavZ));
  dark.push(box(0.74, 1.9, 0.022, -0.93, 1.0, lavZ + 0.492));
  ivory.push(box(0.66, 1.82, 0.026, -0.93, 1.0, lavZ + 0.505));
  gold.push(box(0.032, 0.18, 0.03, -0.67, 1.0, lavZ + 0.53));
  dark.push(box(0.22, 0.07, 0.02, -0.93, 1.82, lavZ + 0.522));

  // Forward galley, starboard.
  ivory.push(box(1.05, 0.88, 0.92, 0.9, 0.44, -15.48));
  dark.push(box(1.12, 0.05, 1.0, 0.9, 0.905, -15.48));
  ivory.push(box(0.98, 0.68, 0.55, 0.9, 1.72, -15.68));
  dark.push(box(0.2, 0.3, 0.2, 0.68, 1.08, -15.35));
  gold.push(box(0.24, 0.02, 0.24, 0.68, 1.235, -15.35));
  dark.push(box(0.3, 0.012, 0.24, 1.0, 0.912, -15.55));
  gold.push(box(1.05, 0.018, 0.02, 0.9, 0.933, -15.0));
  dark.push(box(0.7, 0.02, 0.04, 0.9, 0.62, -15.015));
  gold.push(box(0.7, 0.025, 0.02, 0.9, 0.66, -15.005));

  // Rear pressure bulkhead and aft service door.
  ivory.push(box(2.7, 2.15, 0.09, 0, 1.075, Z_REAR - 0.045));
  dark.push(box(0.68, 1.9, 0.05, 0, 1.0, Z_REAR - 0.115));
  gold.push(box(0.03, 0.18, 0.03, 0.24, 1.0, Z_REAR - 0.145));

  // Rear galley, port side.
  ivory.push(box(1.0, 0.9, 1.15, -0.9, 0.45, 10.6));
  dark.push(box(1.06, 0.05, 1.2, -0.9, 0.925, 10.6));
  ivory.push(box(0.96, 0.62, 0.6, -0.9, 1.68, 10.2));
  dark.push(box(0.34, 0.7, 0.44, -0.9, 0.37, 11.35));
  gold.push(box(0.36, 0.022, 0.022, -0.9, 0.73, 11.575));
  dark.push(box(0.3, 0.012, 0.3, -0.9, 0.912, 10.65));
  gold.push(box(1.0, 0.018, 0.02, -0.9, 0.933, 11.16));

  // Rear lavatory, starboard.
  ivory.push(box(0.92, 2.02, 1.16, 0.9, 1.01, 11.4));
  dark.push(box(0.76, 1.88, 0.022, 0.9, 1.0, 10.817));
  ivory.push(box(0.68, 1.8, 0.026, 0.9, 1.0, 10.802));
  gold.push(box(0.032, 0.18, 0.03, 1.14, 1.0, 10.78));
  dark.push(box(0.22, 0.07, 0.02, 0.9, 1.82, 10.789));

  // Gold pin-stripes along the dado / window-sill transition.
  gold.push(box(0.015, 0.02, Z_LENGTH - 1.0, 1.7, 0.7, Z_MID));
  gold.push(box(0.015, 0.02, Z_LENGTH - 1.0, -1.7, 0.7, Z_MID));
  gold.push(box(0.014, 0.003, 24.8, 0.47, 0.0065, -2.9));
  gold.push(box(0.014, 0.003, 24.8, -0.47, 0.0065, -2.9));

  return {
    ivory: mergeParts(ivory),
    dark: mergeParts(dark),
    gold: mergeParts(gold),
  };
}

export function buildCabin(): CabinGeometry {
  const walls = buildWalls();
  const roof = buildRoof();
  const bulkheads = buildBulkheads();
  const galley = buildGalley();
  const frames = buildWindowFrames();
  const glows = buildWindowGlows();

  return {
    dado: walls.dado,
    upper: walls.upper,
    ceiling: buildCeiling(),
    glows,
    bins: roof.bins,
    psu: roof.psu,
    roofGold: roof.roofGold,
    lightStrips: roof.lightStrips,
    ivory: mergeParts([frames, bulkheads.ivory, galley.ivory]),
    dark: galley.dark,
    gold: mergeParts([bulkheads.gold, galley.gold]),
    curtains: bulkheads.curtains,
  };
}
