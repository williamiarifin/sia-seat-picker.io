"use client";

import type { JSX } from "react";

import { Engines } from "./Engines";
import { Fuselage } from "./Fuselage";
import { Gear } from "./Gear";
import { Tail } from "./Tail";
import { Wings } from "./Wings";

/**
 * Boeing 737-800 exterior in world metres: nose toward -Z, tail at +Z, cabin
 * floor on y = 0, fuselage axis at y = 0.95. No lights are added here — the
 * scene provides those globally.
 */
export function Aircraft(): JSX.Element {
  return (
    <group name="aircraft" position={[0, 0, 0]}>
      <Fuselage />
      <Wings />
      <Engines />
      <Tail />
      <Gear />
    </group>
  );
}
