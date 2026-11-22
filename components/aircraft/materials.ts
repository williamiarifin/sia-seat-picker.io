"use client";

import * as THREE from "three";

/** Shared palette for the exterior. */
export const LIVERY = {
  ivory: "#F4F1E8",
  ivoryWarm: "#F8F5ED",
  belly: "#CDD2D4",
  navy: "#0A1B33",
  navyLight: "#16304F",
  gold: "#D9B15C",
  goldBright: "#F2D493",
  glass: "#0D1A24",
  chrome: "#D3DBE1",
  darkMetal: "#1C2228",
  tire: "#141518",
  hub: "#98A1A8",
  fairing: "#DDE0DF",
} as const;

/** Painted shell: the livery map carries the colour, so base colour is white. */
export const PAINT: THREE.MeshPhysicalMaterialParameters = {
  color: "#ffffff",
  roughness: 1,
  metalness: 0.04,
  clearcoat: 0.55,
  clearcoatRoughness: 0.22,
  envMapIntensity: 0.9,
  side: THREE.FrontSide,
};

/** Solid painted parts (wing skins, pylons, fairings). */
export const PAINT_SOLID: THREE.MeshPhysicalMaterialParameters = {
  color: "#D9DAE0",
  roughness: 0.62,
  metalness: 0.06,
  clearcoat: 0.18,
  clearcoatRoughness: 0.45,
  envMapIntensity: 0.6,
  side: THREE.FrontSide,
};

export const PAINT_FAIRING: THREE.MeshPhysicalMaterialParameters = {
  color: "#D0D2D4",
  roughness: 0.7,
  metalness: 0.04,
  clearcoat: 0.1,
  clearcoatRoughness: 0.5,
  envMapIntensity: 0.5,
  side: THREE.FrontSide,
};

export const CHROME: THREE.MeshPhysicalMaterialParameters = {
  color: LIVERY.chrome,
  roughness: 0.16,
  metalness: 1,
  clearcoat: 0.4,
  clearcoatRoughness: 0.08,
  envMapIntensity: 1.15,
};

export const DARK_METAL: THREE.MeshPhysicalMaterialParameters = {
  color: LIVERY.darkMetal,
  roughness: 0.42,
  metalness: 0.72,
  envMapIntensity: 0.85,
};

export const FAN_METAL: THREE.MeshPhysicalMaterialParameters = {
  color: "#2A3238",
  roughness: 0.4,
  metalness: 0.7,
  side: THREE.DoubleSide,
  envMapIntensity: 0.8,
};

export const TIRE: THREE.MeshStandardMaterialParameters = {
  color: LIVERY.tire,
  roughness: 0.92,
  metalness: 0.02,
};

export const HUB: THREE.MeshPhysicalMaterialParameters = {
  color: LIVERY.hub,
  roughness: 0.3,
  metalness: 0.9,
  clearcoat: 0.3,
  clearcoatRoughness: 0.2,
};

export const NAVY_PAINT: THREE.MeshPhysicalMaterialParameters = {
  color: LIVERY.navy,
  roughness: 0.33,
  metalness: 0.06,
  clearcoat: 1,
  clearcoatRoughness: 0.07,
  envMapIntensity: 1,
};
