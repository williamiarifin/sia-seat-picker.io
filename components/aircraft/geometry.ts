"use client";

import * as THREE from "three";

/**
 * Fuselage / wing geometry helpers.
 *
 * The fuselage is a swept shell: a spine of stations (z, radius, axis-y) is
 * sampled from a monotone cubic spline and revolved in angular sectors. Roof,
 * walls and belly are separate meshes that share the same analytic normals, so
 * the seams are invisible even though each one is drawn independently.
 */

export const NOSE_Z = -19.75;
export const TAIL_Z = 19.75;
export const FUSELAGE_LENGTH = TAIL_Z - NOSE_Z;
export const AXIS_Y = 0.95;
export const FUSELAGE_RADIUS = 1.88;
export const BARREL_FRONT_Z = -15.2;
export const BARREL_REAR_Z = 13.4;

export interface Station {
  z: number;
  r: number;
  y: number;
  /** d(radius)/dz */
  dr: number;
  /** d(axis y)/dz */
  dy: number;
}

interface Knot {
  z: number;
  r: number;
  /** Offset from AXIS_Y. */
  y: number;
}

const KNOTS: Knot[] = [
  { z: -19.75, r: 0.04, y: -0.1 },
  { z: -19.6, r: 0.2, y: -0.1 },
  { z: -19.38, r: 0.42, y: -0.095 },
  { z: -19.08, r: 0.66, y: -0.085 },
  { z: -18.72, r: 0.88, y: -0.07 },
  { z: -18.3, r: 1.09, y: -0.05 },
  { z: -17.85, r: 1.28, y: -0.032 },
  { z: -17.3, r: 1.46, y: -0.017 },
  { z: -16.7, r: 1.62, y: -0.006 },
  { z: -16.05, r: 1.74, y: 0 },
  { z: -15.35, r: 1.84, y: 0 },
  { z: -14.6, r: 1.88, y: 0 },
  { z: 3.0, r: 1.88, y: 0 },
  { z: 12.4, r: 1.88, y: 0 },
  { z: 13.4, r: 1.85, y: 0.02 },
  { z: 14.2, r: 1.77, y: 0.06 },
  { z: 15.0, r: 1.62, y: 0.12 },
  { z: 15.8, r: 1.43, y: 0.2 },
  { z: 16.6, r: 1.2, y: 0.3 },
  { z: 17.4, r: 0.96, y: 0.41 },
  { z: 18.1, r: 0.72, y: 0.53 },
  { z: 18.7, r: 0.47, y: 0.65 },
  { z: 19.2, r: 0.25, y: 0.75 },
  { z: 19.55, r: 0.09, y: 0.83 },
  { z: 19.75, r: 0.025, y: 0.87 },
];

interface Spline {
  at(x: number): { value: number; slope: number };
}

function edgeSlope(h0: number, h1: number, d0: number, d1: number): number {
  let slope = ((2 * h0 + h1) * d0 - h0 * d1) / (h0 + h1);
  if (Math.sign(slope) !== Math.sign(d0)) slope = 0;
  else if (Math.sign(d0) !== Math.sign(d1) && Math.abs(slope) > Math.abs(3 * d0)) slope = 3 * d0;
  return slope;
}

function makeSpline(xs: number[], ys: number[]): Spline {
  const n = xs.length;
  const h = new Array<number>(n - 1);
  const delta = new Array<number>(n - 1);
  for (let i = 0; i < n - 1; i += 1) {
    h[i] = xs[i + 1] - xs[i];
    delta[i] = (ys[i + 1] - ys[i]) / h[i];
  }

  const m = new Array<number>(n).fill(0);
  m[0] = edgeSlope(h[0], h[1], delta[0], delta[1]);
  m[n - 1] = edgeSlope(h[n - 2], h[n - 3], delta[n - 2], delta[n - 3]);

  for (let i = 1; i < n - 1; i += 1) {
    if (delta[i - 1] * delta[i] <= 0) {
      m[i] = 0;
    } else {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / delta[i - 1] + w2 / delta[i]);
    }
  }

  return {
    at(x: number) {
      const clamped = Math.min(Math.max(x, xs[0]), xs[n - 1]);
      let lo = 0;
      let hi = n - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (xs[mid] > clamped) hi = mid;
        else lo = mid;
      }
      const i = Math.min(Math.max(lo, 0), n - 2);
      const hh = h[i];
      const t = (clamped - xs[i]) / hh;
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;
      return {
        value: h00 * ys[i] + h10 * hh * m[i] + h01 * ys[i + 1] + h11 * hh * m[i + 1],
        slope:
          ((6 * t2 - 6 * t) / hh) * ys[i] +
          (3 * t2 - 4 * t + 1) * m[i] +
          ((-6 * t2 + 6 * t) / hh) * ys[i + 1] +
          (3 * t2 - 2 * t) * m[i + 1],
      };
    },
  };
}

const radiusSpline = makeSpline(
  KNOTS.map((knot) => knot.z),
  KNOTS.map((knot) => knot.r),
);
const offsetSpline = makeSpline(
  KNOTS.map((knot) => knot.z),
  KNOTS.map((knot) => knot.y),
);

export function sampleFuselageSpine(z0: number, z1: number, count: number): Station[] {
  return Array.from({ length: count }, (_, index) => {
    const t = count <= 1 ? 0 : index / (count - 1);
    const z = z0 + (z1 - z0) * t;
    const radius = radiusSpline.at(z);
    const offset = offsetSpline.at(z);
    return {
      z,
      r: Math.max(radius.value, 0.018),
      y: AXIS_Y + offset.value,
      dr: radius.slope,
      dy: offset.slope,
    };
  });
}

export function fuselageTopAt(z: number): number {
  return AXIS_Y + offsetSpline.at(z).value + radiusSpline.at(z).value;
}

export function stationsFromPoints(points: { z: number; r: number; y: number }[]): Station[] {
  return points.map((point, index) => {
    const prev = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const dz = next.z - prev.z || 1;
    return {
      z: point.z,
      r: point.r,
      y: point.y,
      dr: (next.r - prev.r) / dz,
      dy: (next.y - prev.y) / dz,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Revolved shell                                                             */
/* -------------------------------------------------------------------------- */

export interface ShellOptions {
  capStart?: boolean;
  capEnd?: boolean;
}

/**
 * Sweep a ring along the spine. phi is measured from +Y (0 = roof, PI = belly).
 * Indices are wound for outward-facing normals with THREE.FrontSide.
 */
export function buildShellGeometry(
  stations: Station[],
  phiStart: number,
  phiEnd: number,
  segments: number,
  options: ShellOptions = {},
): THREE.BufferGeometry {
  const rows = stations.length;
  const cols = segments + 1;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i < rows; i += 1) {
    const station = stations[i];
    for (let j = 0; j < cols; j += 1) {
      const t = segments === 0 ? 0 : j / segments;
      const phi = phiStart + (phiEnd - phiStart) * t;
      const s = Math.sin(phi);
      const c = Math.cos(phi);

      positions.push(station.r * s, station.y + station.r * c, station.z);

      const nx = station.r * s;
      const ny = station.r * c;
      const nz = -station.dr * station.r - station.dy * station.r * c;
      const length = Math.hypot(nx, ny, nz) || 1;
      normals.push(nx / length, ny / length, nz / length);

      uvs.push((Math.PI - phi) / (2 * Math.PI), (station.z - NOSE_Z) / FUSELAGE_LENGTH);
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < rows - 1; i += 1) {
    for (let j = 0; j < segments; j += 1) {
      const a = i * cols + j;
      const b = (i + 1) * cols + j;
      const c = (i + 1) * cols + j + 1;
      const d = i * cols + j + 1;
      indices.push(a, b, c, a, c, d);
    }
  }

  if (options.capStart) {
    const station = stations[0];
    const center = positions.length / 3;
    positions.push(0, station.y, station.z);
    normals.push(0, 0, -1);
    uvs.push(0.5, (station.z - NOSE_Z) / FUSELAGE_LENGTH);
    for (let j = 0; j < segments; j += 1) {
      indices.push(center, j, j + 1);
    }
  }

  if (options.capEnd) {
    const station = stations[rows - 1];
    const center = positions.length / 3;
    const base = (rows - 1) * cols;
    positions.push(0, station.y, station.z);
    normals.push(0, 0, 1);
    uvs.push(0.5, (station.z - NOSE_Z) / FUSELAGE_LENGTH);
    for (let j = 0; j < segments; j += 1) {
      indices.push(center, base + j + 1, base + j);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

/* -------------------------------------------------------------------------- */
/* Lifting surfaces                                                           */
/* -------------------------------------------------------------------------- */

export interface AirfoilPoint {
  /** Chord fraction, 0 = leading edge, 1 = trailing edge. */
  c: number;
  /** Signed offset normal to the chord, as a fraction of chord. */
  h: number;
}

export function airfoilProfile(
  thickness: number,
  camber = 0,
  samples = 14,
): AirfoilPoint[] {
  const thicknessAt = (e: number) =>
    thickness *
    5 *
    (0.2969 * Math.sqrt(e) -
      0.126 * e -
      0.3516 * e * e +
      0.2843 * e * e * e -
      0.1036 * e * e * e * e);
  const camberAt = (e: number) => {
    if (camber === 0) return 0;
    const p = 0.4;
    const m = camber;
    if (e < p) return (m / (p * p)) * (2 * p * e - e * e);
    return (m / ((1 - p) * (1 - p))) * (1 - 2 * p + 2 * p * e - e * e);
  };

  const points: AirfoilPoint[] = [];
  for (let k = 0; k <= samples; k += 1) {
    const e = (1 - Math.cos((Math.PI * k) / samples)) / 2;
    points.push({ c: e, h: camberAt(e) + thicknessAt(e) });
  }
  for (let k = samples - 1; k >= 1; k -= 1) {
    const e = (1 - Math.cos((Math.PI * k) / samples)) / 2;
    points.push({ c: e, h: camberAt(e) - thicknessAt(e) });
  }
  return points;
}

export interface LoftStation {
  x: number;
  y: number;
  leZ: number;
  chord: number;
  /** Max thickness as a fraction of the local chord. */
  thickness: number;
  camber?: number;
}

export interface LoftOptions {
  capEnd?: boolean;
  /** Optional explicit v coordinate per station (for mapped fins). */
  v?: number[];
  samples?: number;
}

/**
 * Loft an airfoil along a spanwise path. The station path may bend upward (for
 * the blended winglet); the airfoil section rotates with the local span tangent.
 */
export function buildLoftGeometry(
  stations: LoftStation[],
  options: LoftOptions = {},
): THREE.BufferGeometry {
  const rows = stations.length;
  const samples = options.samples ?? 14;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let cols = 0;

  for (let j = 0; j < rows; j += 1) {
    const station = stations[j];
    const profile = airfoilProfile(station.thickness, station.camber ?? 0, samples);
    cols = profile.length;

    const prev = stations[Math.max(0, j - 1)];
    const next = stations[Math.min(rows - 1, j + 1)];
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const length = Math.hypot(tx, ty) || 1;
    tx /= length;
    ty /= length;
    const vx = -ty;
    const vy = tx;

    for (let i = 0; i < cols; i += 1) {
      const point = profile[i];
      positions.push(
        station.x + vx * point.h * station.chord,
        station.y + vy * point.h * station.chord,
        station.leZ + point.c * station.chord,
      );
      uvs.push(point.c, options.v?.[j] ?? (rows <= 1 ? 0 : j / (rows - 1)));
    }
  }

  for (let j = 0; j < rows - 1; j += 1) {
    for (let i = 0; i < cols - 1; i += 1) {
      const a = j * cols + i;
      const b = j * cols + i + 1;
      const c = (j + 1) * cols + i + 1;
      const d = (j + 1) * cols + i;
      indices.push(a, b, c, a, c, d);
    }

    /* Close the loop across the leading edge (last profile point -> first). */
    const a = j * cols + (cols - 1);
    const b = j * cols;
    const c = (j + 1) * cols;
    const d = (j + 1) * cols + (cols - 1);
    indices.push(a, b, c, a, c, d);
  }

  if (options.capEnd) {
    const last = stations[rows - 1];
    const base = (rows - 1) * cols;
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (let i = 0; i < cols; i += 1) {
      cx += positions[(base + i) * 3];
      cy += positions[(base + i) * 3 + 1];
      cz += positions[(base + i) * 3 + 2];
    }
    cx /= cols;
    cy /= cols;
    cz /= cols;

    const prev = stations[Math.max(0, rows - 2)];
    let tx = last.x - prev.x;
    let ty = last.y - prev.y;
    const length = Math.hypot(tx, ty) || 1;
    tx /= length;
    ty /= length;

    const ax = positions[base * 3];
    const ay = positions[base * 3 + 1];
    const az = positions[base * 3 + 2];
    const bx = positions[(base + 1) * 3];
    const by = positions[(base + 1) * 3 + 1];
    const bz = positions[(base + 1) * 3 + 2];
    const ux = bx - ax;
    const uy = by - ay;
    const uz = bz - az;
    const wx = cx - ax;
    const wy = cy - ay;
    const wz = cz - az;
    const nx = uy * wz - uz * wy;
    const ny = uz * wx - ux * wz;
    const flip = nx * tx + ny * ty < 0;

    const center = positions.length / 3;
    positions.push(cx, cy, cz);
    uvs.push(0.5, 1);

    for (let i = 0; i < cols - 1; i += 1) {
      if (flip) indices.push(center, base + i + 1, base + i);
      else indices.push(center, base + i, base + i + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function mirrorGeometryX(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geometry = source.clone();
  geometry.scale(-1, 1, 1);
  const index = geometry.getIndex();
  if (index) {
    const array = index.array;
    for (let i = 0; i < array.length; i += 3) {
      const swap = array[i + 1];
      array[i + 1] = array[i + 2];
      array[i + 2] = swap;
    }
    index.needsUpdate = true;
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/* -------------------------------------------------------------------------- */
/* Dorsal fin fillet                                                          */
/* -------------------------------------------------------------------------- */

interface DorsalStation {
  z: number;
  base: number;
  top: number;
  wBase: number;
}

const DORSAL_STATIONS: DorsalStation[] = [
  { z: 10.55, base: 2.6, top: 2.78, wBase: 0.16 },
  { z: 11.3, base: 2.72, top: 2.98, wBase: 0.36 },
  { z: 12.1, base: 2.76, top: 3.22, wBase: 0.44 },
  { z: 12.9, base: 2.7, top: 3.55, wBase: 0.42 },
  { z: 13.7, base: 2.6, top: 4.0, wBase: 0.35 },
  { z: 14.5, base: 2.5, top: 4.62, wBase: 0.24 },
  { z: 15.2, base: 2.4, top: 5.18, wBase: 0.12 },
];

export function buildDorsalGeometry(): THREE.BufferGeometry {
  const segments = 12;
  const positions: number[] = [];
  const indices: number[] = [];
  const cols = segments + 1;

  for (const station of DORSAL_STATIONS) {
    for (let k = 0; k <= segments; k += 1) {
      const theta = Math.PI * (1 - k / segments);
      const x = station.wBase * Math.cos(theta);
      const y = station.base + (station.top - station.base) * Math.pow(Math.sin(theta), 0.72);
      positions.push(x, y, station.z);
    }
  }

  for (let i = 0; i < DORSAL_STATIONS.length - 1; i += 1) {
    for (let k = 0; k < segments; k += 1) {
      const a = i * cols + k;
      const b = (i + 1) * cols + k;
      const c = (i + 1) * cols + k + 1;
      const d = i * cols + k + 1;
      indices.push(a, b, c, a, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
