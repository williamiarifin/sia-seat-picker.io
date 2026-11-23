"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BoardingPass } from "@/components/booking/BoardingPass";
import { EmailTicket } from "@/components/booking/EmailTicket";
import { EmptyState } from "@/components/booking/EmptyState";
import { LoadingPanel, PageShell } from "@/components/booking/PageShell";
import {
  cabinLabel,
  formatLongDate,
  passengerName,
} from "@/components/booking/format";
import { CheckCircleIcon, TicketIcon } from "@/components/booking/icons";
import { primaryButton } from "@/components/booking/styles";
import { flightById } from "@/lib/flights";
import { seatById } from "@/lib/seatmap";
import { bookingGrandTotal, useBooking } from "@/lib/store";

export default function ConfirmationPage() {
  const router = useRouter();
  const setStep = useBooking((state) => state.setStep);
  const hydrated = useBooking((state) => state.hydrated);
  const confirmation = useBooking((state) => state.confirmation);
  const flight = useBooking((state) => flightById(state.flightId));
  const travellers = useBooking((state) => state.travellers);
  const seats = useBooking((state) => state.seats);
  const contact = useBooking((state) => state.contact);
  const search = useBooking((state) => state.search);
  const resetBooking = useBooking((state) => state.resetBooking);
  const total = useBooking(bookingGrandTotal);

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
        title="Your boarding passes"
        subtitle="Just a moment while we fetch your booking."
      >
        <div className="mx-auto w-full max-w-[780px]">
          <LoadingPanel lines={4} />
        </div>
      </PageShell>
    );
  }

  const issued = travellers
    .map((traveller, index) => ({
      traveller,
      name: passengerName(traveller, `Traveller ${index + 1}`),
      seat: seatById(seats[index]),
    }))
    .filter((entry) => entry.seat !== undefined);

  if (!confirmation || !flight || issued.length === 0) {
    return (
      <PageShell
        title="Your boarding passes"
        subtitle="This is where your seats, gate and boarding group will live."
        backHref="/"
        backLabel="Home"
      >
        <EmptyState
          className="mx-auto"
          icon={<TicketIcon className="h-5 w-5" />}
          title="No booking yet"
          body="Choose a flight, pick seats for everyone travelling and confirm the details — your boarding passes will appear here."
          cta="Start a new search"
          href="/"
          footnote="Your boarding passes appear here as soon as you confirm a seat."
        />
      </PageShell>
    );
  }

  const plural = issued.length > 1;
  const date = formatLongDate(search.date);

  const tickets = issued.map((entry, index) => ({
    passenger: entry.traveller,
    flight,
    date,
    pnr: confirmation.pnr,
    boardingGroup: confirmation.boardingGroup,
    seatId: entry.seat!.id,
    cabin: cabinLabel(entry.seat!.cabin),
    seatZone: entry.seat!.zone,
    total,
    passengerLabel: `Passenger ${index + 1} of ${issued.length}`,
  }));

  return (
    <PageShell
      title="You're all set"
      subtitle={
        plural
          ? `All ${issued.length} boarding passes are ready. Everything you need for the gate is below.`
          : "Your booking is complete. Everything you need for the gate is below."
      }
      wide
    >
      <div className="mx-auto w-full max-w-[780px]">
        <div className="print-exact space-y-5">
          {issued.map((entry, index) => (
            <div key={entry.traveller.firstName + index} className="relative">
              {plural ? (
                <p className="mb-2 text-[9.5px] font-medium uppercase tracking-[0.24em] text-[#D9B15C]/70 print:hidden">
                  Passenger {index + 1} of {issued.length}
                </p>
              ) : null}
              <BoardingPass
                pnr={confirmation.pnr}
                boardingGroup={confirmation.boardingGroup}
                flight={flight}
                date={search.date}
                passenger={entry.name}
                seatId={entry.seat!.id}
                seatZone={entry.seat!.zone}
                cabin={cabinLabel(entry.seat!.cabin)}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center print:hidden">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#D9B15C]/25 bg-[#D9B15C]/10 text-[#F2D493]">
            <CheckCircleIcon className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
            {plural ? "Your seats are confirmed" : "Your seat is confirmed"}
          </h2>
          <p className="mx-auto mt-2 max-w-md break-words text-sm leading-relaxed text-[#A9BACB]">
            {issued
              .map((entry) => `${entry.name.split(" ")[0]} ${entry.seat!.id}`)
              .join(" · ")}
            . Keep these passes handy — email them or save a PDF.
          </p>
        </div>

        <div className="print:hidden">
          <EmailTicket defaultEmail={contact.email} tickets={tickets} />
        </div>

        <div className="mt-6 text-center print:hidden">
          <button type="button" onClick={handleStartOver} className={primaryButton}>
            Start over
          </button>

          <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-white/30">
            Booking ref{" "}
            <span className="tnum text-white/50">{confirmation.pnr}</span>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
