import type { FareFamily, Flight } from "./types";

export const FLIGHTS: Flight[] = [
  {
    id: "sq938",
    number: "SQ 938",
    origin: "SIN",
    originCity: "Singapore",
    destination: "DPS",
    destinationCity: "Denpasar",
    depart: "08:20",
    arrive: "11:05",
    duration: "2h 45m",
    aircraft: "Boeing 737-800",
    registration: "9V-MBA",
    terminal: "Terminal 2",
    gate: "B4",
    priceFrom: 248,
    seatsLeft: 32,
  },
  {
    id: "sq942",
    number: "SQ 942",
    origin: "SIN",
    originCity: "Singapore",
    destination: "DPS",
    destinationCity: "Denpasar",
    depart: "12:35",
    arrive: "15:20",
    duration: "2h 45m",
    aircraft: "Boeing 737-800",
    registration: "9V-MBC",
    terminal: "Terminal 2",
    gate: "B7",
    priceFrom: 262,
    seatsLeft: 18,
  },
  {
    id: "sq946",
    number: "SQ 946",
    origin: "SIN",
    originCity: "Singapore",
    destination: "DPS",
    destinationCity: "Denpasar",
    depart: "17:50",
    arrive: "20:35",
    duration: "2h 45m",
    aircraft: "Boeing 737-800",
    registration: "9V-MBE",
    terminal: "Terminal 2",
    gate: "B2",
    priceFrom: 231,
    seatsLeft: 9,
  },
];

export const FLIGHT_BY_ID = new Map(FLIGHTS.map((f) => [f.id, f]));

export function flightById(id: string | null): Flight | undefined {
  return id ? FLIGHT_BY_ID.get(id) : undefined;
}

export const AIRPORTS = [
  { code: "SIN", city: "Singapore", country: "Singapore" },
  { code: "DPS", city: "Denpasar", country: "Indonesia" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "PEN", city: "Penang", country: "Malaysia" },
  { code: "HKT", city: "Phuket", country: "Thailand" },
  { code: "CGK", city: "Jakarta", country: "Indonesia" },
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
];

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
