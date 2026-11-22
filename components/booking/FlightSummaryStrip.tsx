import type { JSX } from "react";
import type { Flight } from "@/lib/types";
import { formatDate, passengerCount } from "./format";
import { PlaneIcon } from "./icons";

interface FlightSummaryStripProps {
  flight: Flight;
  date: string;
  passengers: number;
  cabin?: string;
  className?: string;
}

/** Compact "what you're booking" strip used above forms and in the review. */
export function FlightSummaryStrip({
  flight,
  date,
  passengers,
  cabin,
  className = "",
}: FlightSummaryStripProps): JSX.Element {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 ${className}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D9B15C]/25 bg-[#D9B15C]/10 text-[#F2D493]">
        <PlaneIcon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-white">
          {flight.number}
          <span className="mx-1.5 text-white/25">·</span>
          <span className="tnum">
            {flight.origin} → {flight.destination}
          </span>
        </p>
        <p className="mt-0.5 truncate text-[11px] text-white/40">
          {formatDate(date)}
          <span className="mx-1.5 text-white/20">·</span>
          {passengerCount(passengers)}
          {cabin ? (
            <>
              <span className="mx-1.5 text-white/20">·</span>
              {cabin}
            </>
          ) : null}
        </p>
      </div>

      <p className="tnum shrink-0 text-sm text-white/75">
        {flight.depart}
        <span className="mx-1.5 text-white/25">–</span>
        {flight.arrive}
      </p>
    </div>
  );
}
