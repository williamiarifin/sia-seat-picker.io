"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/booking/EmptyState";
import { OrderSummary } from "@/components/booking/OrderSummary";
import { LoadingPanel, PageShell } from "@/components/booking/PageShell";
import { TicketIcon } from "@/components/booking/icons";
import { flightById } from "@/lib/flights";
import { useBooking } from "@/lib/store";

export default function ReviewPage() {
  const setStep = useBooking((state) => state.setStep);
  const hydrated = useBooking((state) => state.hydrated);
  const flight = useBooking((state) => flightById(state.flightId));

  useEffect(() => {
    setStep("review");
  }, [setStep]);

  return (
    <PageShell
      wide
      title="Review & pay"
      subtitle="One last look before we issue your boarding pass. Your fare, seat and traveller details are all here."
      backHref="/seats"
      backLabel="Back to seats"
    >
      {!hydrated ? (
        <LoadingPanel lines={5} />
      ) : flight ? (
        <OrderSummary flight={flight} />
      ) : (
        <EmptyState
          icon={<TicketIcon className="h-5 w-5" />}
          title="Start a new search"
          body="There's no flight attached to this booking yet. Choose a departure and your fare will be waiting."
          cta="Start a new search"
          href="/"
          footnote="Seats and fares are kept for this browsing session."
        />
      )}
    </PageShell>
  );
}
