/**
 * Mutable scene state shared between the camera director and the 3D layers.
 * Written/read inside useFrame only — never triggers a React render.
 */
export const sceneState = {
  /** 0 = roof cut away for the top-down map, 1 = fuselage fully enclosed. */
  reveal: 0,
  /** Fly-in progress, 0..1. */
  progress: 0,
  /** 0 = outside the aircraft, 1 = standing inside the cabin. */
  inside: 0,
  /** Mirrors prefers-reduced-motion. */
  reduce: false,
};

export type SceneState = typeof sceneState;
