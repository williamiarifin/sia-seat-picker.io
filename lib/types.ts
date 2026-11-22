// Shared domain types for the seat-selection demo.
// NOTE: world units are metres. +X = starboard (right), +Y = up, +Z = aft.
// The nose points toward -Z, so the cockpit is at negative Z and the tail at positive Z.

export type CabinClass = "first" | "business" | "economy";

export type SeatStatus = "available" | "occupied";

export type Step =
  | "search"
  | "results"
  | "passengers"
  | "seats"
  | "review"
  | "confirmation";

/** Where the 3D scene currently is. Driven by the seat flow. */
export type ScenePhase = "overview" | "flying" | "in-seat" | "confirming";

export type FareFamily = "lite" | "value" | "flex";

export interface Seat {
  /** e.g. "12A" */
  id: string;
  row: number;
  letter: string;
  cabin: CabinClass;
  /** Lateral position in metres. Negative = port (left) side. */
  x: number;
  /** Longitudinal position in metres. Negative = toward the nose. */
  z: number;
  /** Total price in SGD for this seat, including the fare family base. */
  price: number;
  status: SeatStatus;
  isExitRow: boolean;
  isWindow: boolean;
  isAisle: boolean;
  isExtraLegroom: boolean;
  /** Human label for the price zone, e.g. "Forward cabin". */
  zone: string;
}

export interface CabinConfig {
  class: CabinClass;
  label: string;
  /** First row number in this cabin. */
  startRow: number;
  /** How many rows of seats. */
  rows: number;
  /** Letters from port to starboard, excluding the aisle. */
  letters: string[];
  /** Seat pitch in metres. */
  pitch: number;
  /** Lateral centre of each letter, in metres. */
  xByLetter: Record<string, number>;
  /** Width of a single seat cushion, metres. */
  seatWidth: number;
  /** Base fare in SGD before modifiers. */
  basePrice: number;
  /** Extra gap inserted after this cabin, metres (bulkhead / curtain). */
  dividerAfter: number;
}

export interface Flight {
  id: string;
  number: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  depart: string;
  arrive: string;
  duration: string;
  aircraft: string;
  registration: string;
  terminal: string;
  gate: string;
  priceFrom: number;
  seatsLeft: number;
}

export interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
  cabin: CabinClass | "any";
}

export interface Confirmation {
  pnr: string;
  boardingGroup: string;
  issuedAt: number;
}

export interface SeatFilter {
  cabin: CabinClass | "all";
  window: boolean;
  aisle: boolean;
  exitRow: boolean;
  extraLegroom: boolean;
  maxPrice: number | null;
}
