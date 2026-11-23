import type { FareFamily, Flight } from "./types";

export const REGIONS = [
  "Southeast Asia",
  "East Asia",
  "South Asia",
  "Oceania",
] as const;

export type Region = (typeof REGIONS)[number];

interface Airport {
  code: string;
  city: string;
  country: string;
  region: Region;
  /** lat, lon — used to estimate sector length. */
  coordinates: [number, number];
  /** Standard UTC offset in minutes (Singapore is +480). */
  utcOffsetMinutes: number;
}

export const AIRPORTS: Airport[] = [
  // Southeast Asia
  { code: "SIN", city: "Singapore", country: "Singapore", region: "Southeast Asia", coordinates: [1.3644, 103.9915], utcOffsetMinutes: 480 },
  { code: "JHB", city: "Johor Bahru", country: "Malaysia", region: "Southeast Asia", coordinates: [1.6413, 103.6697], utcOffsetMinutes: 480 },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", region: "Southeast Asia", coordinates: [2.7456, 101.7099], utcOffsetMinutes: 480 },
  { code: "PEN", city: "Penang", country: "Malaysia", region: "Southeast Asia", coordinates: [5.2971, 100.2769], utcOffsetMinutes: 480 },
  { code: "DPS", city: "Denpasar", country: "Indonesia", region: "Southeast Asia", coordinates: [-8.7482, 115.1672], utcOffsetMinutes: 480 },
  { code: "CGK", city: "Jakarta", country: "Indonesia", region: "Southeast Asia", coordinates: [-6.1256, 106.6559], utcOffsetMinutes: 420 },
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam", region: "Southeast Asia", coordinates: [10.8188, 106.652], utcOffsetMinutes: 420 },
  { code: "BKK", city: "Bangkok", country: "Thailand", region: "Southeast Asia", coordinates: [13.69, 100.7501], utcOffsetMinutes: 420 },
  { code: "HKT", city: "Phuket", country: "Thailand", region: "Southeast Asia", coordinates: [8.1132, 98.3169], utcOffsetMinutes: 420 },
  { code: "PNH", city: "Phnom Penh", country: "Cambodia", region: "Southeast Asia", coordinates: [11.5466, 104.8441], utcOffsetMinutes: 420 },
  { code: "MNL", city: "Manila", country: "Philippines", region: "Southeast Asia", coordinates: [14.5086, 121.0198], utcOffsetMinutes: 480 },

  // East Asia
  { code: "HKG", city: "Hong Kong", country: "Hong Kong", region: "East Asia", coordinates: [22.308, 113.9185], utcOffsetMinutes: 480 },
  { code: "TPE", city: "Taipei", country: "Taiwan", region: "East Asia", coordinates: [25.0777, 121.2328], utcOffsetMinutes: 480 },
  { code: "PVG", city: "Shanghai", country: "China", region: "East Asia", coordinates: [31.1443, 121.8083], utcOffsetMinutes: 480 },
  { code: "ICN", city: "Seoul", country: "South Korea", region: "East Asia", coordinates: [37.4602, 126.4407], utcOffsetMinutes: 540 },
  { code: "HND", city: "Tokyo", country: "Japan", region: "East Asia", coordinates: [35.5494, 139.7798], utcOffsetMinutes: 540 },
  { code: "KIX", city: "Osaka", country: "Japan", region: "East Asia", coordinates: [34.432, 135.2304], utcOffsetMinutes: 540 },

  // South Asia
  { code: "CMB", city: "Colombo", country: "Sri Lanka", region: "South Asia", coordinates: [7.1808, 79.8841], utcOffsetMinutes: 330 },
  { code: "MLE", city: "Malé", country: "Maldives", region: "South Asia", coordinates: [4.1918, 73.5291], utcOffsetMinutes: 300 },
  { code: "DAC", city: "Dhaka", country: "Bangladesh", region: "South Asia", coordinates: [23.8433, 90.3978], utcOffsetMinutes: 360 },
  { code: "RGN", city: "Yangon", country: "Myanmar", region: "South Asia", coordinates: [16.9073, 96.1332], utcOffsetMinutes: 390 },

  // Oceania
  { code: "PER", city: "Perth", country: "Australia", region: "Oceania", coordinates: [-31.9403, 115.9669], utcOffsetMinutes: 480 },
  { code: "SYD", city: "Sydney", country: "Australia", region: "Oceania", coordinates: [-33.9399, 151.1753], utcOffsetMinutes: 660 },
  { code: "MEL", city: "Melbourne", country: "Australia", region: "Oceania", coordinates: [-37.669, 144.841], utcOffsetMinutes: 660 },
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

function formatClock(totalMinutes: number): string {
  const wrapped = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

function toMinutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

const DEPARTURES = ["08:20", "12:35", "17:50"];
const REGISTRATIONS = ["9V-MBA", "9V-MBC", "9V-MBE"];
const SEATS_LEFT = [32, 18, 9];

/**
 * Builds the three daily services for any city pair. The same inputs always
 * produce the same flights, so the numbers on the results page, the seat map
 * and the boarding pass cannot drift apart.
 *
 * Duration comes from great-circle distance; arrival is converted into the
 * destination's local time, which is why SIN → HND lands "later" than the
 * flight time alone would suggest.
 */
export function flightsForRoute(origin: string, destination: string): Flight[] {
  const from = airport(origin);
  const to = airport(destination);
  const km = distanceKm(from, to);
  const seed = hash(`${from.code}${to.code}`);
  const offsetMinutes = to.utcOffsetMinutes - from.utcOffsetMinutes;

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
      arrive: formatClock(toMinutes(depart) + minutes + offsetMinutes),
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
