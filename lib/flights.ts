import type { FareFamily, Flight } from "./types";

interface Airport {
  code: string;
  city: string;
  country: string;
  /** lat, lon — used to estimate sector length. */
  coordinates: [number, number];
}

export const AIRPORTS: Airport[] = [
  { code: "SIN", city: "Singapore", country: "Singapore", coordinates: [1.3644, 103.9915] },
  { code: "DPS", city: "Denpasar", country: "Indonesia", coordinates: [-8.7482, 115.1672] },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", coordinates: [2.7456, 101.7099] },
  { code: "PEN", city: "Penang", country: "Malaysia", coordinates: [5.2971, 100.2769] },
  { code: "HKT", city: "Phuket", country: "Thailand", coordinates: [8.1132, 98.3169] },
  { code: "CGK", city: "Jakarta", country: "Indonesia", coordinates: [-6.1256, 106.6559] },
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam", coordinates: [10.8188, 106.652] },
];

export const AIRPORT_BY_CODE = new Map(AIRPORTS.map((airport) => [airport.code, airport]));

function airport(code: string): Airport {
  return AIRPORT_BY_CODE.get(code) ?? AIRPORTS[0];
}

/** Great-circle distance in kilometres. */
function distanceKm(from: Airport, to: Airport): number {
  const [lat1, lon1] = from.coordinates;
  const [lat2, lon2] = to.coordinates;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function hash(value: string): number {
  let result = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const DEPARTURES = ["08:20", "12:35", "17:50"];
const REGISTRATIONS = ["9V-MBA", "9V-MBC", "9V-MBE"];
const SEATS_LEFT = [32, 18, 9];

/**
 * Builds the three daily services for any city pair. The same inputs always
 * produce the same flights, so the numbers on the results page, the seat map
 * and the boarding pass cannot drift apart. Distances are great-circle, so a
 * short hop (SIN–KUL) really does come out shorter than SIN–DPS.
 */
export function flightsForRoute(origin: string, destination: string): Flight[] {
  const from = airport(origin);
  const to = airport(destination);
  const km = distanceKm(from, to);
  const seed = hash(`${from.code}${to.code}`);

  const baseMinutes = Math.max(50, Math.round(((km / 760 + 0.45) * 60) / 5) * 5);
  const baseNumber = 900 + (seed % 60);
  const basePrice = Math.round((175 + km * 0.042) / 2) * 2;

  return DEPARTURES.map((depart, index) => {
    const minutes = baseMinutes + index * 5;
    const number = baseNumber + index * 4;
    return {
      id: `${from.code}-${to.code}-${number}`,
      number: `SQ ${number}`,
      origin: from.code,
      originCity: from.city,
      destination: to.code,
      destinationCity: to.city,
      depart,
      arrive: addMinutes(depart, minutes),
      duration: formatDuration(minutes),
      aircraft: "Boeing 737-800",
      registration: REGISTRATIONS[index],
      terminal: "Terminal 2",
      gate: `B${2 + index * 2}`,
      priceFrom: basePrice + index * 14,
      seatsLeft: Math.max(3, SEATS_LEFT[index] - (seed % 7)),
    };
  });
}

export const FARES: {
  id: FareFamily;
  name: string;
  price: number;
  blurb: string;
  perks: string[];
}[] = [
  {
    id: "lite",
    name: "Lite",
    price: 0,
    blurb: "Carry-on only",
    perks: ["1 carry-on bag", "Standard seat selection fee applies"],
  },
  {
    id: "value",
    name: "Value",
    price: 60,
    blurb: "Checked bag included",
    perks: ["25kg checked bag", "Free standard seat selection", "Meal included"],
  },
  {
    id: "flex",
    name: "Flex",
    price: 180,
    blurb: "Change your mind",
    perks: ["30kg checked bag", "Free seat selection", "Free date changes", "Priority boarding"],
  },
];
