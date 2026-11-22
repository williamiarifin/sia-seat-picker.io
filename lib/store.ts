"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { seatById } from "./seatmap";
import type {
  Confirmation,
  FareFamily,
  PassengerDetails,
  ScenePhase,
  SearchParams,
  SeatFilter,
  Step,
} from "./types";

const PNR_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makePnr(): string {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += PNR_ALPHABET[Math.floor(Math.random() * PNR_ALPHABET.length)];
  }
  return out;
}

const initialSearch: SearchParams = {
  origin: "SIN",
  destination: "DPS",
  date: "2026-12-18",
  passengers: 1,
  cabin: "any",
};

const initialPassenger: PassengerDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

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
  passenger: PassengerDetails;
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
  updatePassenger: (patch: Partial<PassengerDetails>) => void;
  updateFilter: (patch: Partial<SeatFilter>) => void;
  hoverSeat: (id: string | null) => void;
  selectSeat: (id: string) => void;
  arriveAtSeat: () => void;
  confirmSeat: () => void;
  setPhase: (phase: ScenePhase) => void;
  releaseSeat: () => void;
  resetBooking: () => void;
}

export const useBooking = create<BookingState>()(
  persist(
    (set, get) => ({
      step: "search",
      search: initialSearch,
      flightId: null,
      fare: "value",
      passenger: initialPassenger,
      selectedSeatId: null,
      hoveredSeatId: null,
      phase: "overview",
      filter: initialFilter,
      confirmation: null,
      hydrated: false,

      setStep: (step) => set({ step }),

      updateSearch: (patch) =>
        set((state) => ({ search: { ...state.search, ...patch } })),

      selectFlight: (id) => set({ flightId: id, step: "passengers" }),

      setFare: (fare) => set({ fare }),

      updatePassenger: (patch) =>
        set((state) => ({ passenger: { ...state.passenger, ...patch } })),

      updateFilter: (patch) =>
        set((state) => ({ filter: { ...state.filter, ...patch } })),

      hoverSeat: (id) => set({ hoveredSeatId: id }),

      selectSeat: (id) => {
        const seat = seatById(id);
        if (!seat || seat.status === "occupied") return;
        set({ selectedSeatId: id, phase: "flying" });
      },

      arriveAtSeat: () => {
        if (get().phase === "flying") set({ phase: "in-seat" });
      },

      confirmSeat: () => {
        if (!get().selectedSeatId) return;
        set({
          phase: "confirming",
          confirmation: {
            pnr: makePnr(),
            boardingGroup: get().selectedSeatId ? "2" : "3",
            issuedAt: Date.now(),
          },
        });
      },

      setPhase: (phase) => set({ phase }),

      releaseSeat: () =>
        set({
          selectedSeatId: null,
          hoveredSeatId: null,
          phase: "overview",
          confirmation: null,
        }),

      resetBooking: () =>
        set({
          step: "search",
          search: initialSearch,
          flightId: null,
          fare: "value",
          passenger: initialPassenger,
          selectedSeatId: null,
          hoveredSeatId: null,
          phase: "overview",
          filter: initialFilter,
          confirmation: null,
        }),
    }),
    {
      name: "silverkris-booking",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (state) => ({
        search: state.search,
        flightId: state.flightId,
        fare: state.fare,
        passenger: state.passenger,
        selectedSeatId: state.selectedSeatId,
        phase: state.phase,
        filter: state.filter,
        confirmation: state.confirmation,
      }),
      onRehydrateStorage: () => () => {
        useBooking.setState({ hydrated: true });
      },
    },
  ),
);

/** Seat selection price + fare-family delta, in SGD. */
export function bookingTotal(state: BookingState): number {
  const seat = seatById(state.selectedSeatId);
  if (!seat) return 0;
  const fareDelta = state.fare === "flex" ? 180 : state.fare === "value" ? 60 : 0;
  return seat.price + fareDelta;
}
