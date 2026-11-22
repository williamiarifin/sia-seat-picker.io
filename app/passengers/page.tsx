"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/booking/EmptyState";
import { LoadingPanel, PageShell } from "@/components/booking/PageShell";
import { PassengerForm } from "@/components/booking/PassengerForm";
import { TicketIcon } from "@/components/booking/icons";
import { flightById } from "@/lib/flights";
import { useBooking } from "@/lib/store";

export default function PassengersPage() {
  const setStep = useBooking((state) => state.setStep);
  const hydrated = useBooking((state) => state.hydrated);
  const flight = useBooking((state) => flightById(state.flightId));

  useEffect(() => {
    setStep("passengers");
  }, [setStep]);

  return (
    <PageShell
      title="Passenger details"
      subtitle="Tell us who's flying. We'll use these details on the boarding pass and any flight updates."
      backHref="/results"
      backLabel="Back to flights"
    >
      {!hydrated ? (
        <div className="mx-auto w-full max-w-[640px]">
          <LoadingPanel lines={4} />
        </div>
      ) : flight ? (
        <PassengerForm flight={flight} />
      ) : (
        <EmptyState
          className="mx-auto"
          icon={<TicketIcon className="h-5 w-5" />}
          title="Start a new search"
          body="We couldn't find a selected flight. Pick a departure and we'll bring you straight back here."
          cta="Start a new search"
          href="/"
          footnote="Your search and fare choices are saved for this session."
        />
      )}
    </PageShell>
  );
}
