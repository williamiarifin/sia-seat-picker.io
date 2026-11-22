"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import {
  CatmullRomCurve3,
  MathUtils,
  PerspectiveCamera,
  Vector3,
} from "three";
import { easing } from "maath";

import {
  STEP_POSE,
  approachPose,
  confirmingPose,
  seatViewPose,
  type Pose,
} from "@/lib/camera";
import { seatById } from "@/lib/seatmap";
import { useBooking } from "@/lib/store";
import { appPath } from "@/lib/paths";
import type { ScenePhase, Step } from "@/lib/types";

import { sceneState } from "./sceneState";

// ---------------------------------------------------------------------------
// Lookup / constants
// ---------------------------------------------------------------------------

const STEP_BY_PATH: Record<string, Step> = {
  "/": "search",
  "/results": "results",
  "/passengers": "passengers",
  "/seats": "seats",
  "/review": "review",
  "/confirmation": "confirmation",
};

function stepFromPathname(pathname: string): Step {
  return STEP_BY_PATH[appPath(pathname)] ?? "search";
}

const SETTLE_TIME = 0.6;
const REDUCED_TIME = 0.25;
/** Full fly-in duration in seconds. */
const FLY_DURATION = 1.6;
/** Pointer free-look cap on both axes. */
const MAX_FREE_LOOK = MathUtils.degToRad(18);
const FREE_LOOK_TIME = 0.5;
/** ± metres of idle drift on exterior steps. */
const DRIFT_AMPLITUDE = 0.15;
const BOB_AMPLITUDE = 0.008;
const BOB_HZ = 0.35;
/** Time spent easing from the held pose onto a curve when a flight starts. */
const ENTRY_BLEND = 0.35;
const TAU = Math.PI * 2;
const UP = new Vector3(0, 1, 0);

/** Fast start, long settle — the brief's "ease-out-heavy" flight. */
function easeOutQuart(t: number): number {
  const inv = 1 - t;
  return 1 - inv * inv * inv * inv;
}

function easeOutCubic(t: number): number {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ---------------------------------------------------------------------------
// Flight rig (built once per selected seat)
// ---------------------------------------------------------------------------

interface FlightRig {
  seatId: string;
  positionCurve: CatmullRomCurve3;
  targetCurve: CatmullRomCurve3;
  viewPose: Pose;
  confirmPose: Pose;
  startFov: number;
  endFov: number;
}

function posePosition(pose: Pose): Vector3 {
  return new Vector3(pose.position[0], pose.position[1], pose.position[2]);
}

function poseTarget(pose: Pose): Vector3 {
  return new Vector3(pose.target[0], pose.target[1], pose.target[2]);
}

function buildFlightRig(seatId: string): FlightRig | null {
  const seat = seatById(seatId);
  if (!seat) return null;

  const overview = STEP_POSE.seats;
  const approach = approachPose(seat);
  const view = seatViewPose(seat);
  const confirm = confirmingPose(seat);

  return {
    seatId,
    positionCurve: new CatmullRomCurve3(
      [
        posePosition(overview),
        posePosition(approach),
        posePosition(view),
      ],
      false,
      "centripetal",
      0.5,
    ),
    targetCurve: new CatmullRomCurve3(
      [poseTarget(overview), poseTarget(approach), poseTarget(view)],
      false,
      "centripetal",
      0.5,
    ),
    viewPose: view,
    confirmPose: confirm,
    startFov: overview.fov,
    endFov: view.fov,
  };
}

interface ShellState {
  reveal: number;
  inside: number;
}

/**
 * Progress drives the roof and shell blend:
 *   reveal 0→1 between progress 0.15 and 0.55,
 *   inside 0→1 between progress 0.45 and 1.
 */
function writeFlightState(progress: number, shell: ShellState): void {
  const reveal = MathUtils.clamp((progress - 0.15) / 0.4, 0, 1);
  const inside = MathUtils.clamp((progress - 0.45) / 0.55, 0, 1);

  sceneState.progress = progress;
  sceneState.reveal = reveal;
  sceneState.inside = inside;
  shell.reveal = reveal;
  shell.inside = inside;
}

type Mode = "settle" | "fly" | "reverse" | "reduced" | "hold";

/**
 * Drives the single scene camera. Renders nothing.
 *
 * Exterior steps damp between presets with a slow sine drift. On /seats the
 * camera either holds the top-down map, rides a Catmull-Rom flight path into
 * the selected seat, or reverses that same path when the seat is released.
 */
export function CameraDirector(): null {
  const pathname = usePathname();
  const step = stepFromPathname(pathname);
  const isSeats = step === "seats";

  const phase = useBooking((state) => state.phase);
  const selectedSeatId = useBooking((state) => state.selectedSeatId);
  const arriveAtSeat = useBooking((state) => state.arriveAtSeat);

  const rig = useMemo(
    () => (selectedSeatId ? buildFlightRig(selectedSeatId) : null),
    [selectedSeatId],
  );

  // Everything below is pre-allocated so useFrame never creates garbage.
  const basePos = useMemo(
    () => new Vector3(...STEP_POSE.search.position),
    [],
  );
  const lookTarget = useMemo(
    () => new Vector3(...STEP_POSE.search.target),
    [],
  );
  const desiredPos = useMemo(() => new Vector3(), []);
  const desiredTarget = useMemo(() => new Vector3(), []);
  const flightPos = useMemo(() => new Vector3(), []);
  const flightTarget = useMemo(() => new Vector3(), []);
  const entryFromPos = useMemo(() => new Vector3(), []);
  const entryFromTarget = useMemo(() => new Vector3(), []);
  const freeLook = useMemo(() => ({ yaw: 0, pitch: 0 }), []);
  const shellRef = useRef<ShellState>({
    reveal: sceneState.reveal,
    inside: sceneState.inside,
  });

  const rigRef = useRef<FlightRig | null>(null);
  const modeRef = useRef<Mode>("settle");
  const progressRef = useRef(0);
  const flyStartRef = useRef(0);
  const flyElapsedRef = useRef(0);
  const flySeatRef = useRef<string | null>(null);
  const reverseStartRef = useRef(0);
  const reverseElapsedRef = useRef(0);
  const entryElapsedRef = useRef(0);
  const entryFromFovRef = useRef(STEP_POSE.seats.fov);
  const arrivedSeatRef = useRef<string | null>(null);
  const prevIsSeatsRef = useRef(isSeats);
  const prevPhaseRef = useRef<ScenePhase>(phase);
  const lastFovRef = useRef<number | null>(null);

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const shell = shellRef.current;
    const dt = Math.min(delta, 0.1);
    const elapsed = state.clock.elapsedTime;
    const reduce = sceneState.reduce;
    const smooth = reduce ? REDUCED_TIME : SETTLE_TIME;

    if (rig) rigRef.current = rig;
    const activeRig = rig ?? rigRef.current;

    const justLeftSeats = prevIsSeatsRef.current && !isSeats;
    const flyingStarted = phase === "flying" && phase !== prevPhaseRef.current;

    // ------------------------------------------------------------------
    // Pick the mode for this frame.
    // ------------------------------------------------------------------
    let mode = modeRef.current;

    if (justLeftSeats && progressRef.current > 0.001 && activeRig) {
      mode = "reverse";
    }

    if (!isSeats) {
      if (mode !== "reverse") mode = "settle";
    } else if (phase === "overview") {
      mode = progressRef.current > 0.0005 ? "reverse" : "settle";
    } else if (phase === "flying" && activeRig) {
      if (flyingStarted || activeRig.seatId !== flySeatRef.current) {
        flySeatRef.current = activeRig.seatId;
        progressRef.current = 0;
        flyStartRef.current = 0;
        flyElapsedRef.current = 0;
        arrivedSeatRef.current = null;
        // Force the branch below to capture the current pose for a smooth
        // join even if the previous frame was also a flight.
        modeRef.current = "settle";
      }
      mode = reduce ? "reduced" : "fly";
    } else if (
      (phase === "in-seat" || phase === "confirming") &&
      activeRig
    ) {
      if (progressRef.current < 0.9999) {
        // Returning to /seats with a seat already held: fly in again.
        mode = reduce ? "reduced" : "fly";
      } else {
        mode = "hold";
      }
    } else {
      mode = "settle";
    }

    // ------------------------------------------------------------------
    // Advance the active mode.
    // ------------------------------------------------------------------
    let handled = false;

    if (mode === "fly" && activeRig) {
      if (modeRef.current !== "fly") {
        flyStartRef.current = progressRef.current;
        flyElapsedRef.current = 0;
        entryElapsedRef.current = 0;
        entryFromPos.copy(basePos);
        entryFromTarget.copy(lookTarget);
        entryFromFovRef.current = camera.fov;
      }
      modeRef.current = "fly";

      const start = flyStartRef.current;
      const span = 1 - start;
      const duration = Math.max(0.35, FLY_DURATION * span);

      flyElapsedRef.current += dt;
      const raw = Math.min(1, flyElapsedRef.current / duration);
      const progress = start + span * easeOutQuart(raw);

      progressRef.current = progress;
      activeRig.positionCurve.getPoint(progress, flightPos);
      activeRig.targetCurve.getPoint(progress, flightTarget);

      const curveFov = lerp(
        activeRig.startFov,
        activeRig.endFov,
        progress,
      );

      if (entryElapsedRef.current < ENTRY_BLEND) {
        entryElapsedRef.current += dt;
        const blend = easeOutCubic(
          Math.min(1, entryElapsedRef.current / ENTRY_BLEND),
        );
        basePos.lerpVectors(entryFromPos, flightPos, blend);
        lookTarget.lerpVectors(entryFromTarget, flightTarget, blend);
        camera.fov = lerp(entryFromFovRef.current, curveFov, blend);
      } else {
        basePos.copy(flightPos);
        lookTarget.copy(flightTarget);
        camera.fov = curveFov;
      }

      writeFlightState(progress, shell);

      if (raw >= 1) {
        progressRef.current = 1;
        writeFlightState(1, shell);
        if (
          phase === "flying" &&
          arrivedSeatRef.current !== activeRig.seatId
        ) {
          arrivedSeatRef.current = activeRig.seatId;
          arriveAtSeat();
        }
      }

      handled = true;
    } else if (mode === "reverse" && activeRig) {
      if (modeRef.current !== "reverse") {
        reverseStartRef.current = progressRef.current;
        reverseElapsedRef.current = 0;
        entryElapsedRef.current = 0;
        entryFromPos.copy(basePos);
        entryFromTarget.copy(lookTarget);
        entryFromFovRef.current = camera.fov;
      }
      modeRef.current = "reverse";

      if (reduce) {
        // Reduced motion: drop the flight entirely, let settle() damp home.
        progressRef.current = 0;
        writeFlightState(0, shell);
        modeRef.current = "settle";
      } else {
        const start = reverseStartRef.current;
        const duration = Math.max(0.5, FLY_DURATION * Math.max(start, 0.15));
        reverseElapsedRef.current += dt;
        const raw = Math.min(1, reverseElapsedRef.current / duration);
        // Fast exit, long settle at the overview end of the curve.
        const progress = start * (1 - easeOutQuart(raw));

        progressRef.current = progress;
        activeRig.positionCurve.getPoint(progress, flightPos);
        activeRig.targetCurve.getPoint(progress, flightTarget);

        const curveFov = lerp(
          activeRig.startFov,
          activeRig.endFov,
          progress,
        );

        if (entryElapsedRef.current < ENTRY_BLEND) {
          // Join the curve from the held pose (e.g. the wide confirming
          // shot) instead of popping onto the curve endpoint.
          entryElapsedRef.current += dt;
          const blend = easeOutCubic(
            Math.min(1, entryElapsedRef.current / ENTRY_BLEND),
          );
          basePos.lerpVectors(entryFromPos, flightPos, blend);
          lookTarget.lerpVectors(entryFromTarget, flightTarget, blend);
          camera.fov = lerp(entryFromFovRef.current, curveFov, blend);
        } else {
          basePos.copy(flightPos);
          lookTarget.copy(flightTarget);
          camera.fov = curveFov;
        }

        writeFlightState(progress, shell);

        if (raw >= 1) {
          progressRef.current = 0;
          writeFlightState(0, shell);
          modeRef.current = "settle";
        }
        handled = true;
      }
    } else if (mode === "reduced" && activeRig) {
      modeRef.current = "reduced";
      progressRef.current = 1;
      writeFlightState(1, shell);

      easing.damp3(basePos, activeRig.viewPose.position, REDUCED_TIME, dt);
      easing.damp3(
        lookTarget,
        activeRig.viewPose.target,
        REDUCED_TIME,
        dt,
      );
      easing.damp(camera, "fov", activeRig.viewPose.fov, REDUCED_TIME, dt);

      if (
        phase === "flying" &&
        arrivedSeatRef.current !== activeRig.seatId
      ) {
        arrivedSeatRef.current = activeRig.seatId;
        arriveAtSeat();
      }

      handled = true;
    } else if (mode === "hold" && activeRig) {
      modeRef.current = "hold";
      const pose =
        phase === "confirming" ? activeRig.confirmPose : activeRig.viewPose;

      progressRef.current = 1;
      sceneState.progress = 1;
      sceneState.reveal = 1;
      sceneState.inside = 1;
      shell.reveal = 1;
      shell.inside = 1;

      easing.damp3(basePos, pose.position, smooth, dt);
      easing.damp3(lookTarget, pose.target, smooth, dt);
      easing.damp(camera, "fov", pose.fov, smooth, dt);

      handled = true;
    }

    if (!handled) {
      // Exterior steps, /seats overview, and the tail of any reversal.
      modeRef.current = "settle";
      progressRef.current = 0;

      const pose = STEP_POSE[step];
      const drift = isSeats ? 0 : DRIFT_AMPLITUDE;

      desiredPos.set(
        pose.position[0] + Math.sin(elapsed * 0.21) * drift,
        pose.position[1] + Math.sin(elapsed * 0.17 + 1.3) * drift,
        pose.position[2],
      );
      desiredTarget.set(pose.target[0], pose.target[1], pose.target[2]);

      easing.damp3(basePos, desiredPos, smooth, dt);
      easing.damp3(lookTarget, desiredTarget, smooth, dt);
      easing.damp(camera, "fov", pose.fov, smooth, dt);

      if (step === "review") {
        // The review page lives inside the cabin: no fade needed.
        shell.reveal = 1;
        shell.inside = 1;
      } else {
        const revealTarget = isSeats ? 0 : 1;
        easing.damp(shell, "reveal", revealTarget, smooth, dt);
        easing.damp(shell, "inside", 0, smooth, dt);
      }

      sceneState.progress = 0;
      sceneState.reveal = shell.reveal;
      sceneState.inside = shell.inside;
    }

    // ------------------------------------------------------------------
    // Apply the rig to the camera.
    // ------------------------------------------------------------------
    camera.position.copy(basePos);

    if (phase === "in-seat" && modeRef.current === "hold") {
      camera.position.y +=
        Math.sin(elapsed * TAU * BOB_HZ) * BOB_AMPLITUDE;
    }

    camera.lookAt(lookTarget);

    // Pointer free-look is intentionally gated on a completed fly-in. When the
    // confirm card opens we keep applying the damped offsets so the view eases
    // back to centre instead of snapping.
    const inSeatedHold =
      modeRef.current === "hold" &&
      progressRef.current >= 0.9999 &&
      (phase === "in-seat" || phase === "confirming");
    const pointerDrivesLook = inSeatedHold && phase === "in-seat";

    const yawTarget = pointerDrivesLook
      ? MathUtils.clamp(-state.pointer.x, -1, 1) * MAX_FREE_LOOK
      : 0;
    const pitchTarget = pointerDrivesLook
      ? MathUtils.clamp(state.pointer.y, -1, 1) * MAX_FREE_LOOK
      : 0;

    easing.damp(freeLook, "yaw", yawTarget, FREE_LOOK_TIME, dt);
    easing.damp(freeLook, "pitch", pitchTarget, FREE_LOOK_TIME, dt);

    // Keep applying any residual offset while it eases out, so releasing a
    // seat or opening the confirm card never snaps the view back to centre.
    const hasResidualLook =
      Math.abs(freeLook.yaw) > 1e-4 || Math.abs(freeLook.pitch) > 1e-4;

    if (inSeatedHold || hasResidualLook) {
      camera.rotateOnWorldAxis(UP, freeLook.yaw);
      camera.rotateX(freeLook.pitch);
    }

    if (
      lastFovRef.current === null ||
      Math.abs(camera.fov - lastFovRef.current) > 1e-6
    ) {
      lastFovRef.current = camera.fov;
      camera.updateProjectionMatrix();
    }

    prevIsSeatsRef.current = isSeats;
    prevPhaseRef.current = phase;
  });

  return null;
}
