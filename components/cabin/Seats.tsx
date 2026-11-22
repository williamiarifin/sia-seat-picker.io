"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { JSX } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";

import { useBooking } from "@/lib/store";
import { seatsInCabin } from "@/lib/seatmap";
import { cabinColor, statusColor } from "@/lib/theme";
import type { CabinClass, Seat, SeatFilter } from "@/lib/types";
import { buildSeatParts, type SeatParts } from "./seatGeometry";

const CABIN_SEATS: Record<CabinClass, Seat[]> = {
  first: seatsInCabin("first"),
  business: seatsInCabin("business"),
  economy: seatsInCabin("economy"),
};

/**
 * Moving between the three overlapping instanced meshes of the same seat fires
 * pointerout/pointermove in quick succession, which would make the hover lift
 * flicker. Debounce the clear instead of clearing instantly.
 */
let clearHoverTimer: ReturnType<typeof setTimeout> | null = null;

function cancelHoverClear() {
  if (clearHoverTimer !== null) {
    clearTimeout(clearHoverTimer);
    clearHoverTimer = null;
  }
}

function scheduleHoverClear() {
  cancelHoverClear();
  clearHoverTimer = setTimeout(() => {
    useBooking.getState().hoverSeat(null);
    document.body.style.cursor = "";
    clearHoverTimer = null;
  }, 70);
}

function seatPassesFilter(seat: Seat, filter: SeatFilter): boolean {
  if (filter.cabin !== "all" && seat.cabin !== filter.cabin) return false;
  if (filter.window && !seat.isWindow) return false;
  if (filter.aisle && !seat.isAisle) return false;
  if (filter.exitRow && !seat.isExitRow) return false;
  if (filter.extraLegroom && !seat.isExtraLegroom) return false;
  if (filter.maxPrice !== null && seat.price > filter.maxPrice) return false;
  return true;
}

interface SeatSetProps {
  cabin: CabinClass;
  parts: SeatParts;
}

function SeatSet({ cabin, parts }: SeatSetProps) {
  const seats = CABIN_SEATS[cabin];
  const count = seats.length;

  const upholsteryRef = useRef<THREE.InstancedMesh>(null);
  const frameRef = useRef<THREE.InstancedMesh>(null);
  const accentRef = useRef<THREE.InstancedMesh>(null);

  const hoveredSeatId = useBooking((state) => state.hoveredSeatId);
  const selectedSeatId = useBooking((state) => state.selectedSeatId);
  const filter = useBooking((state) => state.filter);
  const hoverSeat = useBooking((state) => state.hoverSeat);
  const selectSeat = useBooking((state) => state.selectSeat);

  const palette = useMemo(
    () => ({
      base: new THREE.Color(cabinColor[cabin].base),
      glow: new THREE.Color(cabinColor[cabin].glow),
      dim: new THREE.Color(cabinColor[cabin].dim),
      occupied: new THREE.Color(statusColor.occupied),
      selected: new THREE.Color(statusColor.selected),
      ink: new THREE.Color("#0b1522"),
      paper: new THREE.Color("#e9edf2"),
    }),
    [cabin],
  );

  useLayoutEffect(() => {
    const upholstery = upholsteryRef.current;
    const frameMesh = frameRef.current;
    const accentMesh = accentRef.current;
    if (!upholstery || !frameMesh || !accentMesh) return;

    upholstery.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    frameMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    accentMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const matrix = new THREE.Matrix4();
    const upholsteryColor = new THREE.Color();
    const frameColor = new THREE.Color();
    const accentColor = new THREE.Color();

    for (let index = 0; index < seats.length; index += 1) {
      const seat = seats[index];
      const isHovered = seat.id === hoveredSeatId;
      const isSelected = seat.id === selectedSeatId;
      const isOccupied = seat.status === "occupied";
      const lift = isSelected ? 0.06 : isHovered ? 0.04 : 0;

      matrix.makeTranslation(seat.x, lift, seat.z);
      upholstery.setMatrixAt(index, matrix);
      frameMesh.setMatrixAt(index, matrix);
      accentMesh.setMatrixAt(index, matrix);

      if (isOccupied) {
        upholsteryColor.copy(palette.occupied);
        frameColor
          .copy(palette.occupied)
          .multiplyScalar(0.78)
          .lerp(palette.ink, 0.28);
        accentColor.copy(palette.occupied).lerp(palette.paper, 0.32);
      } else if (isSelected) {
        upholsteryColor.copy(palette.selected);
        frameColor
          .copy(palette.selected)
          .multiplyScalar(0.72)
          .lerp(palette.ink, 0.18);
        accentColor.copy(palette.selected);
      } else if (isHovered) {
        upholsteryColor.copy(palette.glow);
        frameColor
          .copy(palette.glow)
          .multiplyScalar(0.78)
          .lerp(palette.ink, 0.16);
        accentColor.copy(palette.glow);
      } else {
        upholsteryColor.copy(palette.base);
        frameColor
          .copy(palette.base)
          .multiplyScalar(0.8)
          .lerp(palette.ink, 0.2);
        accentColor.copy(palette.base).lerp(palette.paper, 0.58);
      }

      if (!seatPassesFilter(seat, filter)) {
        upholsteryColor.lerp(palette.dim, 0.72).multiplyScalar(0.55);
        frameColor.lerp(palette.dim, 0.72).multiplyScalar(0.5);
        accentColor.lerp(palette.dim, 0.72).multiplyScalar(0.5);
      }

      upholstery.setColorAt(index, upholsteryColor);
      frameMesh.setColorAt(index, frameColor);
      accentMesh.setColorAt(index, accentColor);
    }

    upholstery.instanceMatrix.needsUpdate = true;
    frameMesh.instanceMatrix.needsUpdate = true;
    accentMesh.instanceMatrix.needsUpdate = true;
    if (upholstery.instanceColor) upholstery.instanceColor.needsUpdate = true;
    if (frameMesh.instanceColor) frameMesh.instanceColor.needsUpdate = true;
    if (accentMesh.instanceColor) accentMesh.instanceColor.needsUpdate = true;
  }, [seats, hoveredSeatId, selectedSeatId, filter, palette]);

  const handleMove = (event: ThreeEvent<PointerEvent>) => {
    const instanceId = event.instanceId;
    if (instanceId === undefined) return;
    const seat = seats[instanceId];
    if (!seat) return;
    event.stopPropagation();
    cancelHoverClear();
    if (useBooking.getState().hoveredSeatId !== seat.id) hoverSeat(seat.id);
    document.body.style.cursor = seat.status === "available" ? "pointer" : "";
  };

  const handleOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    scheduleHoverClear();
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    const instanceId = event.instanceId;
    if (instanceId === undefined) return;
    const seat = seats[instanceId];
    if (!seat) return;
    event.stopPropagation();
    if (seat.status === "occupied") return;
    cancelHoverClear();
    document.body.style.cursor = "";
    selectSeat(seat.id);
  };

  return (
    <group>
      <instancedMesh
        ref={upholsteryRef}
        args={[parts.upholstery, undefined, count]}
        frustumCulled={false}
        dispose={null}
        onPointerMove={handleMove}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.72}
          metalness={0.04}
        />
      </instancedMesh>
      <instancedMesh
        ref={frameRef}
        args={[parts.frame, undefined, count]}
        frustumCulled={false}
        dispose={null}
        onPointerMove={handleMove}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.46}
          metalness={0.24}
        />
      </instancedMesh>
      <instancedMesh
        ref={accentRef}
        args={[parts.accent, undefined, count]}
        frustumCulled={false}
        dispose={null}
        onPointerMove={handleMove}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.34}
          metalness={0.32}
        />
      </instancedMesh>
    </group>
  );
}

export function Seats(): JSX.Element {
  const parts = useMemo(
    () => ({
      first: buildSeatParts("first"),
      business: buildSeatParts("business"),
      economy: buildSeatParts("economy"),
    }),
    [],
  );

  useEffect(
    () => () => {
      for (const set of Object.values(parts)) {
        set.upholstery.dispose();
        set.frame.dispose();
        set.accent.dispose();
      }
    },
    [parts],
  );

  useEffect(
    () => () => {
      document.body.style.cursor = "";
      cancelHoverClear();
      useBooking.getState().hoverSeat(null);
    },
    [],
  );

  return (
    <group>
      <SeatSet cabin="first" parts={parts.first} />
      <SeatSet cabin="business" parts={parts.business} />
      <SeatSet cabin="economy" parts={parts.economy} />
    </group>
  );
}
