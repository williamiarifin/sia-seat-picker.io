"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { seatById } from "./seatmap";
import type {
  Confirmation,
  ContactDetails,
  FareFamily,
  ScenePhase,
  SearchParams,
  Seat,
  SeatFilter,
  Step,
  Traveller,
} from "./types";

const PNR_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makePnr(): string {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += PNR_ALPHABET[Math.floor(Math.random() * PNR_ALPHABET.length)];
  }
  return out;
}

const MAX_TRAVELLERS = 9;

const blankTraveller = (): Traveller => ({ firstName: "", lastName: "" });

const initialSearch: SearchParams = {
  origin: "SIN",
  destination: "DPS",
  date: "2026-12-18",
  passengers: 1,
  cabin: "any",
};

const initialContact: ContactDetails = { email: "", phone: "" };

const initialFilter: SeatFilter = {
  cabin: "all",
  window: false,
  aisle: false,
  exitRow: false,
  extraLegroom: false,
  maxPrice: null,
};

export interface BookingState {
  step: Step;
  search: SearchParams;
  flightId: string | null;
  fare: FareFamily;
  travellers: Traveller[];
  contact: ContactDetails;
  /** One seat id (or null) per traveller, index-aligned with `travellers`. */
  seats: (string | null)[];
  activeIndex: number;
  /** The seat the camera is currently flying to or sitting at. */
  selectedSeatId: string | null;
  hoveredSeatId: string | null;
  phase: ScenePhase;
  filter: SeatFilter;
  confirmation: Confirmation | null;
  hydrated: boolean;

  setStep: (step: Step) => void;
  updateSearch: (patch: Partial<SearchParams>) => void;
  selectFlight: (id: string) => void;
  setFare: (fare: FareFamily) => void;
  updateContact: (patch: Partial<ContactDetails>) => void;
  updateTraveller: (index: number, patch: Partial<Traveller>) => void;
  ensureTravellers: (count: number) => void;
  setActiveTraveller: (index: number) => void;
  updateFilter: (patch: Partial<SeatFilter>) => void;
  hoverSeat: (id: string | null) => void;
  selectSeat: (id: string) => void;
  arriveAtSeat: () => void;
  confirmSeat: () => void;
  nextTraveller: () => void;
  releaseSeat: () => void;
  setPhase: (phase: ScenePhase) => void;
  resetBooking: () => void;
}

export const useBooking = create<BookingState>()(
  persist(
    (set, get) => ({
      step: "search",
      search: initialSearch,
      flightId: null,
      fare: "value",
      travellers: [blankTraveller()],
      contact: initialContact,
      seats: [null],
      activeIndex: 0,
      selectedSeatId: null,
      hoveredSeatId: null,
      phase: "overview",
      filter: initialFilter,
      confirmation: null,
      hydrated: false,

      setStep: (step) => set({ step }),

      updateSearch: (patch) =>
        set((state) => {
          const search = { ...state.search, ...patch };
          return { search };
        }),

      selectFlight: (id) =>
        set((state) =>
          id === state.flightId
            ? { step: "passengers" }
            : {
                flightId: id,
                step: "passengers",
                seats: state.seats.map(() => null),
                selectedSeatId: null,
                hoveredSeatId: null,
                phase: "overview",
                confirmation: null,
              },
        ),

      setFare: (fare) => set({ fare }),

      updateContact: (patch) =>
        set((state) => ({ contact: { ...state.contact, ...patch } })),

      updateTraveller: (index, patch) =>
        set((state) => {
          if (index < 0 || index >= state.travellers.length) return state;
          const travellers = state.travellers.map((traveller, i) =>
            i === index ? { ...traveller, ...patch } : traveller,
          );
          return { travellers };
        }),

      /**
       * Keeps the traveller list and seat list the same length as the chosen
       * party size. Called when the passenger or seat page mounts.
       */
      ensureTravellers: (count) =>
        set((state) => {
          const size = Math.max(1, Math.min(MAX_TRAVELLERS, Math.floor(count)));
          const travellers = Array.from(
            { length: size },
            (_, i) => state.travellers[i] ?? blankTraveller(),
          );
          const seats = Array.from(
            { length: size },
            (_, i) => state.seats[i] ?? null,
          );
          const activeIndex = Math.min(state.activeIndex, size - 1);
          return {
            travellers,
            seats,
            activeIndex,
            selectedSeatId:
              state.selectedSeatId && seats.includes(state.selectedSeatId)
                ? state.selectedSeatId
                : null,
          };
        }),

      setActiveTraveller: (index) =>
        set((state) => {
          if (index < 0 || index >= state.travellers.length) return state;
          if (state.phase !== "overview") return state;
          return { activeIndex: index, hoveredSeatId: null };
        }),

      updateFilter: (patch) =>
        set((state) => ({ filter: { ...state.filter, ...patch } })),

      hoverSeat: (id) => set({ hoveredSeatId: id }),

      selectSeat: (id) => {
        const seat = seatById(id);
        if (!seat || seat.status === "occupied") return;

        const { seats, activeIndex } = get();
        // Already taken by somebody else in this booking.
        const takenByOther = seats.some(
          (assigned, index) => assigned === id && index !== activeIndex,
        );
        if (takenByOther) return;

        set({ selectedSeatId: id, phase: "flying" });
      },

      arriveAtSeat: () => {
        if (get().phase === "flying") set({ phase: "in-seat" });
      },

      confirmSeat: () => {
        const { selectedSeatId, seats, activeIndex } = get();
        if (!selectedSeatId) return;

        const nextSeats = [...seats];
        nextSeats[activeIndex] = selectedSeatId;

        set({
          seats: nextSeats,
          phase: "confirming",
          confirmation: get().confirmation ?? {
            pnr: makePnr(),
            boardingGroup: "2",
            issuedAt: Date.now(),
          },
        });
      },

      nextTraveller: () => {
        const { activeIndex, travellers } = get();
        const next = activeIndex + 1;
        if (next >= travellers.length) return;
        set({
          activeIndex: next,
          selectedSeatId: null,
          hoveredSeatId: null,
          phase: "overview",
        });
      },

      /** Undo the seat currently in focus: release it if it was confirmed. */
      releaseSeat: () =>
        set((state) => {
          const nextSeats = [...state.seats];
          if (state.phase === "confirming") {
            nextSeats[state.activeIndex] = null;
          }
          return {
            seats: nextSeats,
            selectedSeatId: null,
            hoveredSeatId: null,
            phase: "overview",
          };
        }),

      setPhase: (phase) => set({ phase }),

      resetBooking: () =>
        set({
          step: "search",
          search: initialSearch,
          flightId: null,
          fare: "value",
          travellers: [blankTraveller()],
          contact: initialContact,
          seats: [null],
          activeIndex: 0,
          selectedSeatId: null,
          hoveredSeatId: null,
          phase: "overview",
          filter: initialFilter,
          confirmation: null,
        }),
    }),
    {
      name: "silverkris-booking",
      version: 2,
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      // v1 stored a single `passenger`; that shape cannot be migrated safely,
      // so fall back to the defaults and start the booking again.
      migrate: (persisted, version) =>
        version < 2 ? {} : (persisted as Partial<BookingState>),
      partialize: (state) => ({
        search: state.search,
        flightId: state.flightId,
        fare: state.fare,
        travellers: state.travellers,
        contact: state.contact,
        seats: state.seats,
        activeIndex: state.activeIndex,
        phase: state.phase,
        filter: state.filter,
        confirmation: state.confirmation,
      }),
      onRehydrateStorage: () => (state) => {
        state?.ensureTravellers(state.search.passengers);
        useBooking.setState({ hydrated: true });
      },
    },
  ),
);

/** Assigned seats, in traveller order, skipping unassigned travellers. */
export function assignedSeats(state: BookingState): Seat[] {
  return state.seats
    .map((id) => seatById(id))
    .filter((seat): seat is Seat => Boolean(seat));
}

export function seatedCount(state: BookingState): number {
  return state.seats.filter(Boolean).length;
}

export function isFullySeated(state: BookingState): boolean {
  return state.seats.length > 0 && state.seats.every(Boolean);
}

export function activeTraveller(state: BookingState): Traveller {
  return state.travellers[state.activeIndex] ?? { firstName: "", lastName: "" };
}

/** Seat selection for every traveller, plus the fare-family delta once. */
export function bookingTotal(state: BookingState): number {
  const seats = assignedSeats(state);
  if (seats.length === 0) return 0;
  const fareDelta =
    state.fare === "flex" ? 180 : state.fare === "value" ? 60 : 0;
  const seatsTotal = seats.reduce((sum, seat) => sum + seat.price, 0);
  return seatsTotal + fareDelta;
}

/** Per-traveller airfare taxes, added once per passenger. */
export const TAXES_PER_TRAVELLER = 62;

/** What the card is actually charged. */
export function bookingGrandTotal(state: BookingState): number {
  const count = Math.max(1, state.travellers.length);
  return bookingTotal(state) + TAXES_PER_TRAVELLER * count;
}
