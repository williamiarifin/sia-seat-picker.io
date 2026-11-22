import type { CabinClass } from "./types";

/**
 * Cabin accent colours. These are used by BOTH the 3D seat map (instanceColor)
 * and the 2D UI, so the two always agree. Values are sRGB hex for CSS;
 * use `new THREE.Color(hex)` in the scene (three converts to linear automatically).
 */
export const cabinColor: Record<
  CabinClass,
  { base: string; glow: string; dim: string; label: string; perk: string }
> = {
  first: {
    base: "#E0B45C",
    glow: "#FFD98A",
    dim: "#5c4a25",
    label: "First",
    perk: "Priority boarding · Lounge access · Extra-wide recliner",
  },
  business: {
    base: "#5B8FFF",
    glow: "#9BBAFF",
    dim: "#243a63",
    label: "Business",
    perk: "Lounge access · Recliner with leg rest",
  },
  economy: {
    base: "#8FB3C9",
    glow: "#C6DEEC",
    dim: "#2b3a45",
    label: "Economy",
    perk: "Standard seat · Complimentary meal",
  },
};

export const statusColor = {
  available: "#7DE2B8",
  occupied: "#33404F",
  selected: "#FFD98A",
};

/** App-level palette. Keep the UI in sync via CSS variables in globals.css. */
export const palette = {
  navy: "#0A1B33",
  navyDeep: "#050D1A",
  ink: "#071322",
  gold: "#D9B15C",
  goldBright: "#F2D493",
  mist: "#A9BACB",
  white: "#F3F7FA",
};

export const BRAND = {
  name: "Silverkris Air",
  tagline: "Fly the quiet skies",
  flightPrefix: "SQ",
};
