"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FlightCard } from "@/components/booking/FlightCard";
import { LoadingPanel, PageShell } from "@/components/booking/PageShell";
import {
  cabinLabel,
  formatLongDate,
  passengerCount,
} from "@/components/booking/format";
import { chip } from "@/components/booking/styles";
import { FLIGHTS } from "@/lib/flights";
import { useBooking } from "@/lib/store";

export default function ResultsPage() {
  const router = useRouter();
  const setStep = useBooking((state) => state.setStep);
  const search = useBooking((state) => state.search);
  const fare = useBooking((state) => state.fare);
  const setFare = useBooking((state) => state.setFare);
  const selectFlight = useBooking((state) => state.selectFlight);
  const releaseSeat = useBooking((state) => state.releaseSeat);
  const flightId = useBooking((state) => state.flightId);
  const hydrated = useBooking((state) => state.hydrated);

  useEffect(() => {
    setStep("results");
  }, [setStep]);

  const route = FLIGHTS[0];

  function handleSelect(id: string): void {
    // A seat belongs to a flight; changing flights invalidates it.
    if (flightId !== null && flightId !== id) releaseSeat();
    selectFlight(id);
    router.push("/passengers");
  }

  return (
    <PageShell
      title={`${route.origin} → ${route.destination}`}
      subtitle={
        <>
          {formatLongDate(search.date)}
          <span className="mx-2 text-white/20">·</span>
          {passengerCount(search.passengers)}
          <span className="mx-2 text-white/20">·</span>
          {cabinLabel(search.cabin)}
        </>
      }
      backHref="/"
      backLabel="New search"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className={chip}>Outbound</span>
          <span className="truncate text-[11px] text-white/35">
            {route.originCity} — {route.destinationCity}
          </span>
        </div>
        <span className="rounded-full border border-[#D9B15C]/20 bg-[#D9B15C]/[0.07] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#F2D493]">
          {FLIGHTS.length} flights
        </span>
      </div>

      <div className="mt-5 w-full max-w-[520px] space-y-4">
        {!hydrated ? (
          <LoadingPanel />
        ) : (
          FLIGHTS.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              fare={fare}
              selected={flightId === flight.id}
              onFareChange={setFare}
              onSelect={handleSelect}
            />
          ))
        )}
      </div>

      <p className="mt-5 w-full max-w-[520px] text-[10px] leading-relaxed text-white/30">
        Fares are per traveller and include taxes. Seat selection is included on
        Value fares and above.
      </p>
    </PageShell>
  );
}
