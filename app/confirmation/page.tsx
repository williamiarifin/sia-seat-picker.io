"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BoardingPass } from "@/components/booking/BoardingPass";
import { EmptyState } from "@/components/booking/EmptyState";
import { LoadingPanel, PageShell } from "@/components/booking/PageShell";
import {
  cabinLabel,
  passengerName,
} from "@/components/booking/format";
import { CheckCircleIcon, TicketIcon } from "@/components/booking/icons";
import { primaryButton } from "@/components/booking/styles";
import { flightById } from "@/lib/flights";
import { seatById } from "@/lib/seatmap";
import { useBooking } from "@/lib/store";

export default function ConfirmationPage() {
  const router = useRouter();
  const setStep = useBooking((state) => state.setStep);
  const hydrated = useBooking((state) => state.hydrated);
  const confirmation = useBooking((state) => state.confirmation);
  const flight = useBooking((state) => flightById(state.flightId));
  const seat = useBooking((state) => seatById(state.selectedSeatId));
  const passenger = useBooking((state) => state.passenger);
  const search = useBooking((state) => state.search);
  const resetBooking = useBooking((state) => state.resetBooking);

  useEffect(() => {
    setStep("confirmation");
  }, [setStep]);

  function handleStartOver(): void {
    resetBooking();
    router.push("/");
  }

  if (!hydrated) {
    return (
      <PageShell
        title="Your boarding pass"
        subtitle="Just a moment while we fetch your booking."
      >
        <div className="mx-auto w-full max-w-[780px]">
          <LoadingPanel lines={4} />
        </div>
      </PageShell>
    );
  }

  if (!confirmation || !flight) {
    return (
      <PageShell
        title="Your boarding pass"
        subtitle="This is where your seat, gate and boarding group will live."
        backHref="/"
        backLabel="Home"
      >
        <EmptyState
          className="mx-auto"
          icon={<TicketIcon className="h-5 w-5" />}
          title="No booking yet"
          body="Choose a flight, pick your seat and confirm the details — your boarding pass will appear here."
          cta="Start a new search"
          href="/"
          footnote="Your boarding pass appears here as soon as you confirm a seat."
        />
      </PageShell>
    );
  }

  const traveller = passengerName(passenger, "Guest traveller");
  const seatId = seat?.id ?? "—";

  return (
    <PageShell
      title="You're all set"
      subtitle="Your booking is complete. Everything you need for the gate is below."
      wide
    >
      <div className="mx-auto w-full max-w-[780px]">
        <BoardingPass
          pnr={confirmation.pnr}
          boardingGroup={confirmation.boardingGroup}
          flight={flight}
          date={search.date}
          passenger={traveller}
          seatId={seatId}
          seatZone={seat?.zone ?? "Seat confirmed"}
          cabin={seat ? cabinLabel(seat.cabin) : "Cabin"}
        />

        <div className="mt-8 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#D9B15C]/25 bg-[#D9B15C]/10 text-[#F2D493]">
            <CheckCircleIcon className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
            Your seat is confirmed
          </h2>
          <p className="mx-auto mt-2 max-w-md break-words text-sm leading-relaxed text-[#A9BACB]">
            {seat
              ? `Seat ${seat.id} is yours on ${flight.number}.`
              : `${flight.number} is booked.`}{" "}
            {passenger.email
              ? `We've sent a copy to ${passenger.email}.`
              : "Show this pass at the gate."}
          </p>

          <button
            type="button"
            onClick={handleStartOver}
            className={`${primaryButton} mt-6`}
          >
            Start over
          </button>

          <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-white/30">
            Booking ref <span className="tnum text-white/50">{confirmation.pnr}</span>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
