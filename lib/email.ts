import type { Flight, PassengerDetails } from "./types";

/**
 * Transactional email is handled by EmailJS so the site can stay a static
 * export on GitHub Pages. The public key is safe to ship (it is designed to be
 * used from the browser) — restrict it to your own domain in the EmailJS
 * dashboard so nobody else can spend your quota.
 *
 * Configure with:
 *   NEXT_PUBLIC_EMAILJS_SERVICE_ID
 *   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
 *   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
 */
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";

export const emailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export interface TicketEmailInput {
  to: string;
  passenger: PassengerDetails;
  flight: Flight;
  date: string;
  pnr: string;
  boardingGroup: string;
  seatId: string;
  cabin: string;
  seatZone: string;
  total: number;
}

export function isEmailAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export class EmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailError";
  }
}

/**
 * Sends the boarding pass. The params map 1:1 onto the EmailJS template
 * variables documented in the README.
 */
export async function sendTicketEmail(input: TicketEmailInput): Promise<void> {
  if (!emailConfigured) {
    throw new EmailError("Email delivery is not configured for this deployment.");
  }
  if (!isEmailAddress(input.to)) {
    throw new EmailError("That email address does not look right.");
  }

  const { flight, passenger } = input;
  const name = `${passenger.firstName} ${passenger.lastName}`.trim() || "Traveller";

  // Loaded on demand so the 3D bundle is not carrying the mail client.
  const emailjs = (await import("@emailjs/browser")).default;

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: input.to.trim(),
        to_name: name,
        pnr: input.pnr,
        passenger_name: name,
        flight_number: flight.number,
        origin: flight.origin,
        origin_city: flight.originCity,
        destination: flight.destination,
        destination_city: flight.destinationCity,
        depart: flight.depart,
        arrive: flight.arrive,
        duration: flight.duration,
        aircraft: flight.aircraft,
        registration: flight.registration,
        terminal: flight.terminal,
        gate: flight.gate,
        date: input.date,
        seat: input.seatId,
        cabin: input.cabin,
        seat_zone: input.seatZone,
        boarding_group: input.boardingGroup,
        total: `SGD ${input.total.toLocaleString("en-SG")}`,
      },
      { publicKey: PUBLIC_KEY },
    );
  } catch (error) {
    const detail =
      typeof error === "object" && error !== null && "text" in error
        ? String((error as { text: unknown }).text)
        : "";
    throw new EmailError(
      detail
        ? `The mail service rejected the message: ${detail}`
        : "Could not reach the mail service. Try again in a moment.",
    );
  }
}
