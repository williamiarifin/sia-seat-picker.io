"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { JSX } from "react";
import { BRAND } from "@/lib/theme";
import type { Flight } from "@/lib/types";
import { BrandMark } from "./Brand";
import { formatDate } from "./format";
import { PlaneIcon } from "./icons";

interface BoardingPassProps {
  pnr: string;
  boardingGroup: string;
  flight: Flight;
  date: string;
  passenger: string;
  seatId: string;
  seatZone: string;
  cabin: string;
}

export function BoardingPass({
  pnr,
  boardingGroup,
  flight,
  date,
  passenger,
  seatId,
  seatZone,
  cabin,
}: BoardingPassProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative w-full">
      <motion.div
        initial={
          reduceMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.985 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: reduceMotion ? 0.2 : 0.75,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative w-full rounded-[26px] bg-[#F4F0E6] shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95)] ring-1 ring-black/10"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-10 h-[3px] rounded-t-[26px] bg-gradient-to-r from-[#B98F3C] via-[#F2D493] to-[#B98F3C]"
        />

        <div className="grid md:grid-cols-[minmax(0,1fr)_244px]">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <BrandMark className="h-8 w-8 shrink-0 text-[#0A1B33] sm:h-9 sm:w-9" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A1B33] sm:text-[11px] sm:tracking-[0.26em]">
                    {BRAND.name}
                  </p>
                  <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.2em] text-[#0A1B33]/45 sm:text-[8.5px] sm:tracking-[0.24em]">
                    Boarding pass
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[8.5px] font-medium uppercase tracking-[0.2em] text-[#0A1B33]/40">
                  Booking ref
                </p>
                <p className="tnum mt-1 text-[13px] font-semibold tracking-[0.16em] text-[#0A1B33]">
                  {pnr}
                </p>
              </div>
            </div>

            <div className="mt-7 border-t border-[#0A1B33]/10 pt-5">
              <p className="text-[8.5px] font-medium uppercase tracking-[0.22em] text-[#0A1B33]/40">
                Passenger
              </p>
              <p className="mt-1.5 break-words text-lg font-semibold uppercase tracking-[0.04em] text-[#0A1B33]">
                {passenger}
              </p>
            </div>

            <div className="mt-6 flex items-end justify-between gap-3">
              <div>
                <p className="tnum text-[32px] font-semibold leading-none tracking-tight text-[#0A1B33] sm:text-[38px]">
                  {flight.origin}
                </p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-[#0A1B33]/45">
                  {flight.originCity}
                </p>
              </div>

              <div className="min-w-0 flex-1 pb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 border-t border-dashed border-[#0A1B33]/25"
                  />
                  <PlaneIcon className="h-3.5 w-3.5 shrink-0 text-[#A67C2E]" />
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 border-t border-dashed border-[#0A1B33]/25"
                  />
                </div>
                <p className="mt-1.5 text-center text-[8.5px] uppercase tracking-[0.18em] text-[#0A1B33]/35">
                  {flight.duration}
                </p>
              </div>

              <div className="text-right">
                <p className="tnum text-[32px] font-semibold leading-none tracking-tight text-[#0A1B33] sm:text-[38px]">
                  {flight.destination}
                </p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-[#0A1B33]/45">
                  {flight.destinationCity}
                </p>
              </div>
            </div>

            <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-[#0A1B33]/10 pt-5 sm:grid-cols-4">
              <PassDetail label="Flight" value={flight.number} />
              <PassDetail label="Date" value={formatDate(date)} />
              <PassDetail label="Gate" value={flight.gate} />
              <PassDetail label="Boarding" value={`Group ${boardingGroup}`} />
            </dl>

            <div className="mt-6">
              <Barcode value={`${pnr}${seatId}${flight.number}`} />
              <div className="mt-2 flex items-center justify-between gap-3 text-[8px] uppercase tracking-[0.16em] text-[#0A1B33]/35">
                <span>{pnr} · {flight.number} · {seatId}</span>
                <span>Keep with you at the gate</span>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col justify-between rounded-b-[26px] border-t border-dashed border-white/20 bg-[#0A1B33] p-6 md:rounded-b-none md:rounded-r-[26px] md:border-l md:border-t-0 sm:p-7">
            <span
              aria-hidden="true"
              className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-[#050d1a] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)] ring-1 ring-black/30"
            />
            <span
              aria-hidden="true"
              className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-[#050d1a] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)] ring-1 ring-black/30 md:-bottom-2.5 md:-left-2.5 md:right-auto md:top-auto"
            />

            <div>
              <p className="text-[8.5px] font-medium uppercase tracking-[0.24em] text-white/40">
                Seat
              </p>
              <p className="gold-text tnum mt-1 text-[64px] font-semibold leading-none tracking-tight">
                {seatId}
              </p>
              <p className="mt-2 text-[11px] text-white/45">
                {seatZone.toLowerCase() === cabin.toLowerCase()
                  ? cabin
                  : `${cabin} · ${seatZone}`}
              </p>
            </div>

            <dl className="mt-8 space-y-4">
              <div>
                <dt className="text-[8.5px] font-medium uppercase tracking-[0.2em] text-white/35">
                  Boarding group
                </dt>
                <dd className="tnum mt-1 text-base font-semibold text-[#F2D493]">
                  {boardingGroup}
                </dd>
              </div>
              <div>
                <dt className="text-[8.5px] font-medium uppercase tracking-[0.2em] text-white/35">
                  Flight
                </dt>
                <dd className="tnum mt-1 text-sm text-white/80">
                  {flight.number}
                </dd>
              </div>
              <div>
                <dt className="text-[8.5px] font-medium uppercase tracking-[0.2em] text-white/35">
                  Terminal
                </dt>
                <dd className="mt-1 text-sm text-white/80">{flight.terminal}</dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-white/10 pt-4">
              <p className="text-[8.5px] uppercase leading-relaxed tracking-[0.16em] text-white/30">
                Gate closes 15 minutes before departure
              </p>
              <div className="mt-4 flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: 12 }, (_, index) => (
                  <span
                    key={index}
                    className="h-4 flex-1 rounded-[1px] bg-white/25"
                    style={{ opacity: 0.25 + (index % 4) * 0.16 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PassDetail({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <dt className="text-[8.5px] font-medium uppercase tracking-[0.18em] text-[#0A1B33]/40">
        {label}
      </dt>
      <dd className="tnum mt-1 text-[13px] font-semibold text-[#0A1B33]">
        {value}
      </dd>
    </div>
  );
}

function Barcode({ value }: { value: string }): JSX.Element {
  const source = value.length > 0 ? value : "SILVERKRIS";
  const bars = Array.from({ length: 44 }, (_, index) => {
    const code = source.charCodeAt(index % source.length);
    return {
      width: ((code + index * 7) % 3) + 1,
      dim: (code + index) % 5 === 0,
    };
  });

  return (
    <div className="flex h-10 items-stretch gap-[2px]" aria-hidden="true">
      {bars.map((bar, index) => (
        <span
          key={index}
          className={`h-full rounded-[1px] bg-[#0A1B33] ${
            bar.dim ? "opacity-45" : "opacity-85"
          }`}
          style={{ width: `${bar.width}px` }}
        />
      ))}
    </div>
  );
}
