import type { CabinClass, CabinConfig, Seat, SeatStatus } from "./types";

// ---------------------------------------------------------------------------
// Aircraft geometry (metres). A Boeing 737-800 is ~39.5 m long with a 3.54 m
// wide cabin; these values are close enough to read correctly in 3D.
// ---------------------------------------------------------------------------
export const AIRCRAFT = {
  length: 39.5,
  noseZ: -19.75,
  tailZ: 19.75,
  fuselageRadius: 1.88,
  cabinRadius: 1.72,
  fuselageAxisY: 0.95,
  floorY: 0,
  wingSpan: 35.8,
  cabinFrontZ: -14.0,
  cabinRearZ: 12.6,
} as const;

/**
 * Cabin layout. Positions are generated from pitch so the whole aircraft
 * reflows automatically if a row count changes.
 *
 * Real SIA 737-800s are two-class (Business + Economy). This three-class
 * layout is an illustrative demo config — see README.
 */
export const CABINS: CabinConfig[] = [
  {
    class: "first",
    label: "First",
    startRow: 1,
    rows: 2,
    letters: ["A", "C", "D", "F"],
    pitch: 0.965,
    xByLetter: { A: -1.18, C: -0.48, D: 0.48, F: 1.18 },
    seatWidth: 0.62,
    basePrice: 890,
    dividerAfter: 0.35,
  },
  {
    class: "business",
    label: "Business",
    startRow: 3,
    rows: 4,
    letters: ["A", "C", "D", "F"],
    pitch: 0.864,
    xByLetter: { A: -1.16, C: -0.52, D: 0.52, F: 1.16 },
    seatWidth: 0.54,
    basePrice: 520,
    dividerAfter: 0.35,
  },
  {
    class: "economy",
    label: "Economy",
    startRow: 7,
    rows: 23,
    letters: ["A", "B", "C", "D", "E", "F"],
    pitch: 0.762,
    xByLetter: { A: -1.34, B: -0.9, C: -0.46, D: 0.46, E: 0.9, F: 1.34 },
    seatWidth: 0.44,
    basePrice: 180,
    dividerAfter: 0,
  },
];

export const EXIT_ROWS = new Set([12, 13]);

export const CABIN_BY_CLASS = Object.fromEntries(
  CABINS.map((c) => [c.class, c]),
) as Record<CabinClass, CabinConfig>;

// ---------------------------------------------------------------------------
// Deterministic occupancy so the server and client render the same plane.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function priceZone(cabin: CabinClass, row: number): { delta: number; zone: string } {
  if (cabin === "first") return { delta: 0, zone: "First cabin" };
  if (cabin === "business") return { delta: 0, zone: "Business cabin" };

  if (EXIT_ROWS.has(row)) return { delta: 80, zone: "Exit row · extra legroom" };
  if (row >= 7 && row <= 9) return { delta: 45, zone: "Forward economy" };
  if (row >= 26) return { delta: -35, zone: "Rear economy" };
  return { delta: 0, zone: "Economy" };
}

function buildSeats(): Seat[] {
  const seats: Seat[] = [];
  let z = AIRCRAFT.cabinFrontZ;

  for (const cabin of CABINS) {
    for (let offset = 0; offset < cabin.rows; offset += 1) {
      const row = cabin.startRow + offset;

      for (const letter of cabin.letters) {
        const id = `${row}${letter}`;
        const isWindow = letter === cabin.letters[0] || letter === cabin.letters[cabin.letters.length - 1];
        const isAisle = letter === "C" || letter === "D";

        const { delta, zone } = priceZone(cabin.class, row);
        const positionDelta = cabin.class === "economy" ? (isWindow ? 20 : isAisle ? 10 : 0) : 0;

        // Deterministic pseudo-occupancy. Rear rows fill up faster.
        const rng = mulberry32(hashString(id));
        const loadFactor = cabin.class === "economy" && row > 20 ? 0.55 : 0.34;
        const status: SeatStatus = rng() < loadFactor ? "occupied" : "available";

        seats.push({
          id,
          row,
          letter,
          cabin: cabin.class,
          x: cabin.xByLetter[letter],
          z,
          price: cabin.basePrice + delta + positionDelta,
          status,
          isExitRow: EXIT_ROWS.has(row),
          isWindow,
          isAisle,
          isExtraLegroom: EXIT_ROWS.has(row),
          zone,
        });
      }

      z += cabin.pitch;
    }

    z += cabin.dividerAfter;
  }

  return seats;
}

export const SEATS: Seat[] = buildSeats();

export const SEAT_BY_ID = new Map(SEATS.map((seat) => [seat.id, seat]));

export const TOTAL_SEATS = SEATS.length;

export function seatById(id: string | null | undefined): Seat | undefined {
  if (!id) return undefined;
  return SEAT_BY_ID.get(id);
}

export function seatsInCabin(cabin: CabinClass): Seat[] {
  return SEATS.filter((seat) => seat.cabin === cabin);
}

export function seatsForRow(row: number): Seat[] {
  return SEATS.filter((seat) => seat.row === row);
}

export function cabinRows(cabin: CabinClass): number[] {
  const config = CABIN_BY_CLASS[cabin];
  return Array.from({ length: config.rows }, (_, i) => config.startRow + i);
}

/** World-space point at the centre of a seat cushion. */
export function seatWorldPosition(seat: Seat): [number, number, number] {
  return [seat.x, 0.46, seat.z];
}

/** World-space Z where each cabin begins/ends, for labels and bulkheads. */
export function cabinExtent(cabin: CabinClass): { front: number; rear: number } {
  const seats = SEATS.filter((s) => s.cabin === cabin);
  if (seats.length === 0) return { front: 0, rear: 0 };
  return { front: seats[0].z, rear: seats[seats.length - 1].z };
}

export const AISLE_X = 0;
