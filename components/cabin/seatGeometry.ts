"use client";

import * as THREE from "three";

import type { CabinClass } from "@/lib/types";
import { box, mergeParts, softBox } from "./builders";

export interface SeatParts {
  upholstery: THREE.BufferGeometry;
  frame: THREE.BufferGeometry;
  accent: THREE.BufferGeometry;
}

const RECLINE: Record<CabinClass, number> = {
  first: 0.16,
  business: 0.15,
  economy: 0.12,
};

/** Standard slimline seat: skids, low pan, thin back, tray hint. */
function economyParts(): SeatParts {
  const tilt = RECLINE.economy;
  const frame = [
    box(0.05, 0.36, 0.34, -0.15, 0.21, 0.04),
    box(0.05, 0.36, 0.34, 0.15, 0.21, 0.04),
    box(0.44, 0.06, 0.42, 0, 0.42, 0.02),
    box(0.44, 0.58, 0.055, 0, 0.78, 0.22, tilt),
    box(0.045, 0.05, 0.34, -0.19, 0.63, 0.03),
    box(0.045, 0.05, 0.34, 0.19, 0.63, 0.03),
    box(0.03, 0.12, 0.03, -0.19, 0.555, 0.14),
    box(0.03, 0.12, 0.03, 0.19, 0.555, 0.14),
  ];
  const upholstery = [
    softBox(0.4, 0.09, 0.41, 0.028, 0, 0.48, -0.01),
    box(0.4, 0.46, 0.05, 0, 0.79, 0.185, tilt),
    box(0.32, 0.16, 0.075, 0, 1.1, 0.275, tilt),
  ];
  const accent = [
    box(0.36, 0.014, 0.15, 0, 0.7, 0.258, tilt),
    box(0.03, 0.008, 0.3, -0.19, 0.658, 0.03),
    box(0.03, 0.008, 0.3, 0.19, 0.658, 0.03),
    box(0.28, 0.18, 0.012, 0, 0.57, 0.252, tilt),
    box(0.34, 0.006, 0.035, 0, 0.527, 0.02),
  ];
  return {
    frame: mergeParts(frame),
    upholstery: mergeParts(upholstery),
    accent: mergeParts(accent),
  };
}

/** Business recliner: sculpted shell, privacy cheeks, deployed leg rest. */
function businessParts(): SeatParts {
  const tilt = RECLINE.business;
  const frame = [
    box(0.48, 0.1, 0.4, 0, 0.06, 0.02),
    box(0.28, 0.3, 0.34, 0, 0.24, 0.02),
    softBox(0.58, 0.72, 0.12, 0.045, 0, 0.84, 0.25, tilt),
    softBox(0.05, 0.42, 0.34, 0.02, -0.285, 0.84, 0.09),
    softBox(0.05, 0.42, 0.34, 0.02, 0.285, 0.84, 0.09),
    box(0.05, 0.07, 0.44, -0.28, 0.66, 0.02),
    box(0.05, 0.07, 0.44, 0.28, 0.66, 0.02),
    box(0.035, 0.13, 0.035, -0.28, 0.575, 0.15),
    box(0.035, 0.13, 0.035, 0.28, 0.575, 0.15),
    box(0.42, 0.04, 0.24, 0, 0.245, -0.36, -0.22),
  ];
  const upholstery = [
    softBox(0.53, 0.1, 0.47, 0.03, 0, 0.485, -0.005),
    softBox(0.5, 0.58, 0.075, 0.04, 0, 0.84, 0.185, tilt),
    softBox(0.4, 0.17, 0.085, 0.035, 0, 1.19, 0.31, tilt),
    softBox(0.44, 0.08, 0.3, 0.025, 0, 0.3, -0.4, -0.22),
  ];
  const accent = [
    box(0.42, 0.014, 0.16, 0, 0.74, 0.3, tilt),
    box(0.05, 0.008, 0.34, -0.28, 0.7, 0.02),
    box(0.05, 0.008, 0.34, 0.28, 0.7, 0.02),
    box(0.36, 0.012, 0.03, 0, 0.61, 0.28, tilt),
    box(0.34, 0.2, 0.012, 0, 0.58, 0.278, tilt),
    box(0.44, 0.006, 0.04, 0, 0.537, 0.015),
  ];
  return {
    frame: mergeParts(frame),
    upholstery: mergeParts(upholstery),
    accent: mergeParts(accent),
  };
}

/** First suite: wide shell, big privacy wings, ottoman-style leg rest. */
function firstParts(): SeatParts {
  const tilt = RECLINE.first;
  const frame = [
    box(0.62, 0.08, 0.55, 0, 0.04, 0.02),
    box(0.46, 0.3, 0.46, 0, 0.23, 0.02),
    softBox(0.64, 0.78, 0.15, 0.06, 0, 0.88, 0.27, tilt),
    softBox(0.05, 0.55, 0.48, 0.035, -0.31, 0.88, 0.14),
    softBox(0.05, 0.55, 0.48, 0.035, 0.31, 0.88, 0.14),
    softBox(0.06, 0.09, 0.52, 0.03, -0.3, 0.68, 0.03),
    softBox(0.06, 0.09, 0.52, 0.03, 0.3, 0.68, 0.03),
    box(0.04, 0.14, 0.05, -0.3, 0.58, 0.16),
    box(0.04, 0.14, 0.05, 0.3, 0.58, 0.16),
    box(0.46, 0.05, 0.28, 0, 0.235, -0.41, -0.24),
  ];
  const upholstery = [
    softBox(0.59, 0.12, 0.52, 0.04, 0, 0.5, -0.01),
    softBox(0.56, 0.64, 0.09, 0.045, 0, 0.88, 0.19, tilt),
    softBox(0.48, 0.21, 0.105, 0.045, 0, 1.3, 0.35, tilt),
    softBox(0.52, 0.1, 0.36, 0.03, 0, 0.3, -0.46, -0.24),
  ];
  const accent = [
    box(0.5, 0.014, 0.18, 0, 0.76, 0.332, tilt),
    box(0.06, 0.01, 0.38, -0.3, 0.732, 0.03),
    box(0.06, 0.01, 0.38, 0.3, 0.732, 0.03),
    box(0.44, 0.012, 0.09, 0, 1.398, 0.37, tilt),
    box(0.4, 0.22, 0.012, 0, 0.59, 0.304, tilt),
    box(0.5, 0.006, 0.04, 0, 0.562, 0.015),
  ];
  return {
    frame: mergeParts(frame),
    upholstery: mergeParts(upholstery),
    accent: mergeParts(accent),
  };
}

export function buildSeatParts(cabin: CabinClass): SeatParts {
  if (cabin === "first") return firstParts();
  if (cabin === "business") return businessParts();
  return economyParts();
}
