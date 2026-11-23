import { seatById } from "./seatmap";
import type { CabinClass, Seat, Step } from "./types";

export interface Pose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

/**
 * Camera presets per booking step. The SceneDirector damps between these so
 * the aircraft feels like one continuous object rather than six pages.
 */
// The aircraft is 39.5 m long and 35.8 m wide, so hero shots need a long lens
// from far away (~80 m) or the frame only catches the middle of the fuselage.
// Distances below assume a 32°–34° vertical FOV and a landscape viewport; the
// seat page deliberately over-frames vertically so a portrait phone still gets
// the whole fuselage.
export const STEP_POSE: Record<Step, Pose> = {
  search: {
    position: [-60, 32, 66],
    target: [-10, -2, -3],
    fov: 32,
  },
  results: {
    position: [64, 26, 44],
    target: [-6, 1, 0],
    fov: 32,
  },
  passengers: {
    position: [-50, 46, -42],
    target: [0, 0.5, 0],
    fov: 34,
  },
  // The seat page takes over the camera entirely once a seat is picked.
  // ~82 m up with a 32° lens gives ~47 m of vertical coverage.
  seats: {
    position: [0, 82, 3.2],
    target: [0, 0, 0.4],
    fov: 32,
  },
  // Inside the cabin, looking aft down the aisle.
  review: {
    position: [0.35, 1.75, -8.5],
    target: [0, 1.0, 5],
    fov: 62,
  },
  confirmation: {
    position: [70, 48, 96],
    target: [0, 1, 0],
    fov: 30,
  },
};

/**
 * In-seat camera pose. You stand in the aisle diagonally in front of the
 * chosen row, at eye height, looking back and down at the seat so the window
 * and the cabin ahead both read. Premium cabins get a little more standoff.
 */
export function seatViewPose(seat: Seat): Pose {
  const premium = seat.cabin !== "economy";
  // Always step toward the aisle, never across into the opposite seat block.
  const aisleDir = seat.x < 0 ? 1 : -1;
  const step = Math.abs(seat.x) * 0.7 + 0.25;
  const eyeX = seat.x + aisleDir * step;
  const eyeY = premium ? 1.6 : 1.58;
  // Stand one row forward in the aisle and turn back toward the seat, so the
  // view is a clean three-quarter of the seat with the window behind it
  // instead of a wall of headrests.
  const eyeZ = seat.z - (premium ? 1.25 : 1.15);

  return {
    position: [eyeX, eyeY, eyeZ],
    target: [seat.x, premium ? 0.9 : 0.82, seat.z + 0.1],
    fov: premium ? 58 : 62,
  };
}

/** Waypoint above the row used to shape the fly-in curve. */
export function approachPose(seat: Seat): Pose {
  return {
    position: [seat.x * 0.55, 9.5, seat.z + 3.2],
    target: [seat.x * 0.6, 0, seat.z],
    fov: 36,
  };
}

/** Wide cabin shot used while the confirm card is open. */
export function confirmingPose(seat: Seat): Pose {
  const pose = seatViewPose(seat);
  return {
    position: [pose.position[0], pose.position[1] + 0.05, pose.position[2] - 0.3],
    target: [pose.target[0], pose.target[1] + 0.06, pose.target[2]],
    fov: pose.fov + 6,
  };
}

export function seatCabinLabel(seatId: string | null | undefined): CabinClass | null {
  return seatById(seatId)?.cabin ?? null;
}
