import { FARES } from "@/lib/flights";
import type { CabinClass, FareFamily, Seat } from "@/lib/types";

const CABIN_LABEL: Record<CabinClass, string> = {
  first: "First",
  business: "Business",
  economy: "Economy",
};

export function cabinLabel(cabin: CabinClass | "any" | "all"): string {
  if (cabin === "any") return "Any cabin";
  if (cabin === "all") return "All cabins";
  return CABIN_LABEL[cabin];
}

export function fareName(fare: FareFamily): string {
  return FARES.find((f) => f.id === fare)?.name ?? "Value";
}

export function farePrice(fare: FareFamily): number {
  return FARES.find((f) => f.id === fare)?.price ?? 0;
}

export function fareByFamily(fare: FareFamily) {
  return FARES.find((f) => f.id === fare) ?? FARES[1];
}

/** "SGD 248" */
export function sgd(amount: number): string {
  return `SGD ${amount.toLocaleString("en-SG")}`;
}

/** "Thu 18 Dec" */
export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(date)
    .replace(",", "");
}

/** "Thu 18 December 2026" */
export function formatLongDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replace(",", "");
}

export function passengerCount(count: number): string {
  return `${count} ${count === 1 ? "passenger" : "passengers"}`;
}

export function passengerName(
  passenger: { firstName: string; lastName: string },
  fallback = "Traveller",
): string {
  const name = `${passenger.firstName} ${passenger.lastName}`.trim();
  return name.length > 0 ? name : fallback;
}

/**
 * The portion of a seat's price that reads as seat selection rather than fare.
 * Purely presentational — the review total is always derived from bookingTotal.
 */
export function seatSelectionFee(seat: Seat): number {
  if (seat.isExitRow) return 80;
  if (seat.isExtraLegroom) return 45;
  if (seat.isWindow) return 20;
  if (seat.isAisle) return 10;
  return 0;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SK";
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvc(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}
