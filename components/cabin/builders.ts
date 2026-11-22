"use client";

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Small geometry toolkit for the cabin interior and the instanced seats.
 * Everything here is deterministic and dependency free apart from three.
 */

export type Side = 1 | -1;

/** Point on the fuselage circle at a given height (cabin radius 1.72). */
export function arcX(y: number, side: Side, radius = 1.715): number {
  const dy = y - 0.95;
  return side * Math.sqrt(Math.max(0.0004, radius * radius - dy * dy));
}

export function place(
  geometry: THREE.BufferGeometry,
  x: number,
  y: number,
  z: number,
  rx = 0,
  ry = 0,
  rz = 0,
): THREE.BufferGeometry {
  const matrix = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(rx, ry, rz, "XYZ"),
  );
  matrix.setPosition(x, y, z);
  geometry.applyMatrix4(matrix);
  return geometry;
}

export function box(
  width: number,
  height: number,
  depth: number,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
): THREE.BufferGeometry {
  return place(new THREE.BoxGeometry(width, height, depth), x, y, z, rx, ry, rz);
}

export function cylinder(
  radius: number,
  height: number,
  segments: number,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
): THREE.BufferGeometry {
  return place(
    new THREE.CylinderGeometry(radius, radius, height, segments),
    x,
    y,
    z,
    rx,
    ry,
    rz,
  );
}

function roundedRectPoints(
  width: number,
  height: number,
  radius: number,
  cornerSegments: number,
): THREE.Vector2[] {
  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.max(0.001, Math.min(radius, Math.min(halfW, halfH) - 0.001));
  const corners: Array<{ cx: number; cy: number; start: number }> = [
    { cx: halfW - r, cy: halfH - r, start: 0 },
    { cx: -halfW + r, cy: halfH - r, start: Math.PI / 2 },
    { cx: -halfW + r, cy: -halfH + r, start: Math.PI },
    { cx: halfW - r, cy: -halfH + r, start: Math.PI * 1.5 },
  ];
  const points: THREE.Vector2[] = [];
  for (const corner of corners) {
    for (let i = 0; i <= cornerSegments; i += 1) {
      const angle = corner.start + (Math.PI / 2) * (i / cornerSegments);
      points.push(
        new THREE.Vector2(
          corner.cx + Math.cos(angle) * r,
          corner.cy + Math.sin(angle) * r,
        ),
      );
    }
  }
  return points;
}

/**
 * A cheap bevelled box. The outline uses a low-poly rounded rectangle so the
 * result stays around 90 triangles instead of the several hundred a
 * high-smoothness RoundedBoxGeometry costs.
 */
export function softBox(
  width: number,
  height: number,
  depth: number,
  radius: number,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
): THREE.BufferGeometry {
  const bevel = Math.max(0.0015, Math.min(radius * 0.5, depth * 0.24, 0.02));
  const shape = new THREE.Shape(
    roundedRectPoints(
      Math.max(0.01, width - bevel * 2),
      Math.max(0.01, height - bevel * 2),
      Math.max(0.002, radius - bevel),
      2,
    ),
  );
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.002, depth - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    curveSegments: 1,
    steps: 1,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return place(geometry, x, y, z, rx, ry, rz);
}

export function mergeParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (parts.length === 0) return new THREE.BufferGeometry();
  const list = parts.map((geometry) => {
    const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry;
    if (nonIndexed !== geometry) geometry.dispose();
    for (const name of Object.keys(nonIndexed.attributes)) {
      if (name !== "position" && name !== "normal" && name !== "uv") {
        nonIndexed.deleteAttribute(name);
      }
    }
    if (!nonIndexed.getAttribute("uv")) {
      const count = nonIndexed.getAttribute("position").count;
      nonIndexed.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array(count * 2), 2),
      );
    }
    return nonIndexed;
  });
  const merged = mergeGeometries(list, false);
  for (const geometry of list) geometry.dispose();
  if (!merged) throw new Error("Cabin geometry merge failed");
  merged.computeBoundingSphere();
  return merged;
}

/**
 * A curved quad strip that follows the fuselage cross-section. Used for the
 * sidewall below, between and above the window line.
 */
export function curvedBand(
  z0: number,
  z1: number,
  y0: number,
  y1: number,
  side: Side,
  segZ: number,
  segY: number,
  radius = 1.715,
): THREE.BufferGeometry {
  const cols = Math.max(1, Math.ceil(Math.abs(z1 - z0) / segZ));
  const rows = Math.max(1, Math.ceil(Math.abs(y1 - y0) / segY));
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= rows; j += 1) {
    const y = y0 + ((y1 - y0) * j) / rows;
    const x = arcX(y, side, radius);
    for (let i = 0; i <= cols; i += 1) {
      const z = z0 + ((z1 - z0) * i) / cols;
      positions.push(x, y, z);
      uvs.push(i / cols, j / rows);
    }
  }

  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < cols; i += 1) {
      const a = j * (cols + 1) + i;
      const b = a + 1;
      const c = a + cols + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Curved ceiling strip from port wall shoulder, over the crown, to starboard. */
export function ceilingBand(
  z0: number,
  z1: number,
  shoulderAngle: number,
  segZ: number,
  segA: number,
  radius = 1.712,
): THREE.BufferGeometry {
  const cols = Math.max(1, Math.ceil(Math.abs(z1 - z0) / segZ));
  const rows = segA;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= rows; j += 1) {
    const angle = -shoulderAngle + (shoulderAngle * 2 * j) / rows;
    const x = Math.sin(angle) * radius;
    const y = 0.95 + Math.cos(angle) * radius;
    for (let i = 0; i <= cols; i += 1) {
      const z = z0 + ((z1 - z0) * i) / cols;
      positions.push(x, y, z);
      uvs.push(i / cols, j / rows);
    }
  }

  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < cols; i += 1) {
      const a = j * (cols + 1) + i;
      const b = a + 1;
      const c = a + cols + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Soft curtain with vertical folds, used at the aisle bulkheads. */
export function curtainGeometry(
  width: number,
  y0: number,
  y1: number,
  z: number,
  folds: number,
  columns = 14,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= columns; i += 1) {
    const t = i / columns;
    const x = -width / 2 + width * t;
    const zz = z + Math.sin(t * Math.PI * folds) * 0.035;
    positions.push(x, y0, zz, x, y1, zz);
    uvs.push(t, 0, t, 1);
  }

  for (let i = 0; i < columns; i += 1) {
    const a = i * 2;
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
