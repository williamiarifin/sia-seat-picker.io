"use client";

import type { JSX } from "react";
import { FARES } from "@/lib/flights";
import type { FareFamily, Flight } from "@/lib/types";
import { fareByFamily, farePrice, sgd } from "./format";
import { ArrowRightIcon } from "./icons";
import { primaryButton } from "./styles";

interface FlightCardProps {
  flight: Flight;
  fare: FareFamily;
  selected: boolean;
  onFareChange: (fare: FareFamily) => void;
  onSelect: (flight: Flight) => void;
}

export function FlightCard({
  flight,
  fare,
  selected,
  onFareChange,
  onSelect,
}: FlightCardProps): JSX.Element {
  const chosenFare = fareByFamily(fare);
  const totalFrom = flight.priceFrom + farePrice(fare);
  const lowAvailability = flight.seatsLeft < 12;

  return (
    <article
      className={`relative rounded-2xl border p-5 backdrop-blur-xl transition-colors duration-300 sm:p-6 ${
        selected
          ? "border-[#D9B15C]/45 bg-[#0b1e38]/85 shadow-[0_24px_70px_-30px_rgba(217,177,92,0.35)]"
          : "border-white/10 bg-[#0a1b33]/65 hover:border-white/20 hover:bg-[#0a1b33]/75"
      }`}
    >
      {selected ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D9B15C]/80 to-transparent"
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="tnum text-[15px] font-semibold tracking-tight text-white">
              {flight.number}
            </h2>
            {selected ? (
              <span className="rounded-full border border-[#D9B15C]/30 bg-[#D9B15C]/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-[#F2D493]">
                Selected
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[11px] text-white/40">{flight.aircraft}</p>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${
            lowAvailability
              ? "border-amber-300/25 bg-amber-300/10 text-amber-200"
              : "border-emerald-300/15 bg-emerald-300/[0.06] text-[#9EE6C5]"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              lowAvailability ? "bg-amber-300" : "bg-[#7DE2B8]"
            }`}
          />
          {flight.seatsLeft} seats left
        </span>
      </div>

      <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 sm:gap-3">
        <div>
          <p className="tnum text-[26px] font-semibold leading-none text-white sm:text-[28px]">
            {flight.depart}
          </p>
          <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
            {flight.origin}
          </p>
        </div>

        <div className="min-w-0 px-1">
          <p className="whitespace-nowrap text-center text-[10px] text-white/35">
            {flight.duration}
            <span className="hidden sm:inline"> · Non-stop</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/35" />
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-white/25 via-white/15 to-[#D9B15C]/55"
            />
            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-[#D9B15C]/80"
            />
          </div>
        </div>

        <div className="text-right">
          <p className="tnum text-[26px] font-semibold leading-none text-white sm:text-[28px]">
            {flight.arrive}
          </p>
          <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
            {flight.destination}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-white/35">
        <span className="tnum">{flight.registration}</span>
        <span className="mx-1.5 text-white/20">·</span>
        {flight.terminal}
      </p>

      <div className="mt-5">
        <div
          role="radiogroup"
          aria-label={`Fare family for ${flight.number}`}
          className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.07] bg-black/15 p-1"
        >
          {FARES.map((option) => {
            const active = option.id === fare;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onFareChange(option.id)}
                className={`cursor-pointer rounded-lg px-2 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B15C]/50 ${
                  active
                    ? "bg-[#12294a] text-[#F2D493] shadow-[inset_0_0_0_1px_rgba(217,177,92,0.35)]"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <span className="block text-[11px] font-medium">
                  {option.name}
                </span>
                <span
                  className={`mt-0.5 block text-[9.5px] tnum ${
                    active ? "text-[#D9B15C]/80" : "text-white/30"
                  }`}
                >
                  {option.price === 0 ? "Base" : `+${sgd(option.price)}`}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 px-1 text-[10px] text-white/35">
          {chosenFare.blurb}
          <span className="mx-1.5 text-white/15">·</span>
          {chosenFare.perks[0]}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
            From
          </p>
          <p className="tnum mt-0.5 text-[19px] font-semibold text-white">
            {sgd(totalFrom)}
          </p>
          <p className="text-[10px] text-white/30">per traveller</p>
        </div>

        <button
          type="button"
          onClick={() => onSelect(flight)}
          aria-label={`Select ${flight.number}, departs ${flight.depart}`}
          className={primaryButton}
        >
          Select
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
