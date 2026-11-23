"use client";

import { useBooking } from "@/lib/store";
import type { JSX } from "react";

import { CheckIcon } from "./icons";

/**
 * Shows every traveller and the seat they have picked. The active row is the
 * one the seat map is currently assigning seats to.
 */
export function TravellerStrip(): JSX.Element {
  const travellers = useBooking((state) => state.travellers);
  const seats = useBooking((state) => state.seats);
  const activeIndex = useBooking((state) => state.activeIndex);
  const phase = useBooking((state) => state.phase);
  const setActiveTraveller = useBooking((state) => state.setActiveTraveller);

  const seated = seats.filter(Boolean).length;

  return (
    <section
      aria-label="Travellers"
      onClick={(event) => event.stopPropagation()}
      className="glass pointer-events-auto rounded-2xl p-4"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-mist/70">
          Travellers
        </h2>
        <span className="tnum text-[9px] uppercase tracking-[0.14em] text-mist/40">
          {seated}/{travellers.length} seated
        </span>
      </header>

      <ul className="mt-2.5 space-y-1">
        {travellers.map((traveller, index) => {
          const seatId = seats[index];
          const active = index === activeIndex;
          const name =
            `${traveller.firstName} ${traveller.lastName}`.trim() ||
            `Traveller ${index + 1}`;

          return (
            <li key={index}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveTraveller(index);
                }}
                disabled={phase !== "overview"}
                aria-current={active ? "true" : undefined}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B15C]/60 ${
                  active
                    ? "bg-[#D9B15C]/[0.1] ring-1 ring-inset ring-[#D9B15C]/35"
                    : "hover:bg-white/[0.05]"
                } ${phase !== "overview" ? "cursor-default" : "cursor-pointer"}`}
              >
                <span
                  className={`tnum grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[8.5px] ${
                    seatId
                      ? "border-[#7DE2B8]/40 bg-[#7DE2B8]/10 text-[#7DE2B8]"
                      : active
                        ? "border-[#D9B15C]/50 text-[#F2D493]"
                        : "border-white/12 text-white/40"
                  }`}
                >
                  {seatId ? <CheckIcon className="h-2.5 w-2.5" strokeWidth={3} /> : index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] leading-tight text-white/90">
                    {name}
                  </span>
                  <span className="mt-0.5 block text-[9px] uppercase tracking-[0.14em] text-mist/40">
                    {seatId ? `Seat ${seatId}` : active ? "Choosing a seat" : "No seat yet"}
                  </span>
                </span>

                {seatId ? (
                  <span className="tnum shrink-0 text-[13px] font-semibold text-[#F2D493]">
                    {seatId}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
