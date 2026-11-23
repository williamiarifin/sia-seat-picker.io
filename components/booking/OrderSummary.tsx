"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent, JSX, ReactNode } from "react";
import { seatById } from "@/lib/seatmap";
import {
  TAXES_PER_TRAVELLER,
  bookingGrandTotal,
  bookingTotal,
  isFullySeated,
  useBooking,
} from "@/lib/store";
import type { Flight, Seat, Traveller } from "@/lib/types";
import {
  cabinLabel,
  fareByFamily,
  fareName,
  farePrice,
  formatCardNumber,
  formatCvc,
  formatExpiry,
  formatLongDate,
  passengerCount,
  passengerName,
  sgd,
} from "./format";
import { ArrowRightIcon, LockIcon, PlaneIcon, SeatIcon } from "./icons";
import {
  chip,
  eyebrow,
  inputDefault,
  labelBase,
  primaryButton,
} from "./styles";

interface OrderSummaryProps {
  flight: Flight;
}

interface SeatLine {
  traveller: Traveller;
  label: string;
  seat: Seat | undefined;
}

export function OrderSummary({ flight }: OrderSummaryProps): JSX.Element {
  const router = useRouter();

  const search = useBooking((state) => state.search);
  const fare = useBooking((state) => state.fare);
  const travellers = useBooking((state) => state.travellers);
  const seats = useBooking((state) => state.seats);
  const contact = useBooking((state) => state.contact);
  const confirmation = useBooking((state) => state.confirmation);
  const confirmSeat = useBooking((state) => state.confirmSeat);
  const setPhase = useBooking((state) => state.setPhase);

  const total = useBooking(bookingGrandTotal);
  const subtotal = useBooking(bookingTotal);
  const allSeated = useBooking(isFullySeated);

  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");

  const lines: SeatLine[] = travellers.map((traveller, index) => ({
    traveller,
    label: passengerName(traveller, `Traveller ${index + 1}`),
    seat: seatById(seats[index]),
  }));

  const seatsTotal = lines.reduce((sum, line) => sum + (line.seat?.price ?? 0), 0);
  const fareDelta = farePrice(fare);
  const taxes = TAXES_PER_TRAVELLER * travellers.length;
  const chosenFare = fareByFamily(fare);
  const leadName = lines[0]?.label ?? "Guest traveller";
  const cabin = cabinLabel(lines.find((line) => line.seat)?.seat?.cabin ?? search.cabin);

  const cardDigits = card.replace(/\s/g, "");
  const ready =
    allSeated &&
    cardDigits.length === 16 &&
    expiry.length === 5 &&
    cvc.length >= 3 &&
    nameOnCard.trim().length >= 2;

  function handlePay(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!ready || !allSeated) return;
    if (!confirmation) confirmSeat();
    router.push("/confirmation");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start">
      <section className="glass rounded-3xl p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={eyebrow}>
              Outbound · {passengerCount(search.passengers)}
            </p>
            <h2 className="tnum mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
              {flight.origin}
              <span className="mx-2 text-white/25">→</span>
              {flight.destination}
            </h2>
            <p className="mt-1.5 text-sm text-[#A9BACB]">
              {formatLongDate(search.date)}
            </p>
          </div>
          <span className={chip}>{flight.number}</span>
        </div>

        <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div>
            <p className="tnum text-xl font-semibold leading-none text-white">
              {flight.depart}
            </p>
            <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
              {flight.origin}
            </p>
          </div>
          <div className="min-w-0">
            <p className="whitespace-nowrap text-center text-[10px] text-white/35">
              {flight.duration}
              <span className="hidden sm:inline"> · Non-stop</span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-white/25"
              />
              <PlaneIcon className="h-3.5 w-3.5 shrink-0 text-[#D9B15C]/85" />
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-gradient-to-r from-white/25 via-white/20 to-transparent"
              />
            </div>
          </div>
          <div className="text-right">
            <p className="tnum text-xl font-semibold leading-none text-white">
              {flight.arrive}
            </p>
            <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
              {flight.destination}
            </p>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-white/35">
          {flight.aircraft}
          <span className="mx-1.5 text-white/20">·</span>
          <span className="tnum">{flight.registration}</span>
          <span className="mx-1.5 text-white/20">·</span>
          {flight.terminal}
          <span className="mx-1.5 text-white/20">·</span>
          Gate {flight.gate}
        </p>

        <dl className="mt-6 border-t border-white/[0.08]">
          <SummaryRow label="Travellers">
            <span className="font-medium text-white">
              {lines.length} {lines.length === 1 ? "passenger" : "passengers"}
            </span>
            <span className="mt-0.5 block text-[11px] text-white/35">
              {contact.email || "No email provided"}
            </span>
          </SummaryRow>

          <SummaryRow label="Fare">
            <span className="font-medium text-white">
              {cabin} · {fareName(fare)}
            </span>
            <span className="mt-0.5 block text-[11px] text-white/35">
              {chosenFare.blurb}
            </span>
          </SummaryRow>

          <div className="border-b border-white/[0.08] py-3.5">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
                Seats
              </dt>
              <Link
                href="/seats"
                onClick={() => setPhase("overview")}
                className="cursor-pointer rounded-full border border-white/12 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/55 transition hover:border-[#D9B15C]/40 hover:text-[#F2D493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B15C]/50"
              >
                {allSeated ? "Change" : "Choose seats"}
              </Link>
            </div>

            <ul className="mt-2.5 space-y-2">
              {lines.map((line, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate text-white/75">
                    {line.label}
                  </span>
                  {line.seat ? (
                    <span className="shrink-0 text-right">
                      <span className="tnum font-medium text-white">
                        {line.seat.id}
                      </span>
                      <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-white/30">
                        {line.seat.zone}
                      </span>
                    </span>
                  ) : (
                    <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-[#F2D493]">
                      No seat yet
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </dl>

        <div className="mt-5 border-t border-white/[0.08] pt-5">
          <h3 className="text-[9.5px] font-medium uppercase tracking-[0.22em] text-white/35">
            Fare breakdown
          </h3>
          <dl className="mt-4 space-y-3.5 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-white/55">
                Seats
                <span className="ml-2 text-[10px] text-white/25">
                  {lines.filter((line) => line.seat).length} of {lines.length}
                </span>
              </dt>
              <dd className="tnum shrink-0 text-white/85">{sgd(seatsTotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-white/55">
                {fareName(fare)} fare
                <span className="ml-2 text-[10px] text-white/25">once</span>
              </dt>
              <dd className="tnum shrink-0 text-white/85">
                {fareDelta === 0 ? "Included" : sgd(fareDelta)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-white/55">
                Taxes &amp; fees
                <span className="ml-2 text-[10px] text-white/25">
                  {sgd(TAXES_PER_TRAVELLER)} × {travellers.length}
                </span>
              </dt>
              <dd className="tnum shrink-0 text-white/85">{sgd(taxes)}</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/[0.08] pt-4">
            <div>
              <p className="text-sm font-medium text-white">Total</p>
              <p className="mt-0.5 text-[10px] text-white/30">
                Including taxes &amp; fees
              </p>
            </div>
            <p className="tnum text-[26px] font-semibold leading-none text-[#F2D493]">
              {allSeated ? sgd(total) : sgd(subtotal + taxes)}
            </p>
          </div>
        </div>
      </section>

      {allSeated ? (
        <section className="glass rounded-3xl p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Payment
            </h2>
            <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-white/35">
              <LockIcon className="h-3 w-3" />
              Secure
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-white/35">
            Your card details are encrypted end to end.
          </p>

          <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
            {["Visa", "Mastercard", "Amex"].map((brand) => (
              <span
                key={brand}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-white/45"
              >
                {brand}
              </span>
            ))}
          </div>

          <form onSubmit={handlePay} className="mt-5" noValidate>
            <div>
              <label htmlFor="card-number" className={labelBase}>
                Card number
              </label>
              <input
                id="card-number"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                value={card}
                onChange={(event) =>
                  setCard(formatCardNumber(event.target.value))
                }
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className={`${inputDefault} tnum tracking-[0.12em]`}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <label htmlFor="card-expiry" className={labelBase}>
                  Expiry
                </label>
                <input
                  id="card-expiry"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={expiry}
                  onChange={(event) =>
                    setExpiry(formatExpiry(event.target.value))
                  }
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`${inputDefault} tnum tracking-[0.12em]`}
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="card-cvc" className={labelBase}>
                  CVC
                </label>
                <input
                  id="card-cvc"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={cvc}
                  onChange={(event) => setCvc(formatCvc(event.target.value))}
                  placeholder="123"
                  maxLength={4}
                  className={`${inputDefault} tnum tracking-[0.12em]`}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="card-name" className={labelBase}>
                Name on card
              </label>
              <input
                id="card-name"
                type="text"
                autoComplete="cc-name"
                value={nameOnCard}
                onChange={(event) => setNameOnCard(event.target.value)}
                placeholder={leadName}
                className={inputDefault}
              />
            </div>

            <button
              type="submit"
              disabled={!ready}
              className={`${primaryButton} mt-6 w-full`}
            >
              <LockIcon className="h-4 w-4" />
              Pay <span className="tnum">{sgd(total)}</span>
            </button>
            {!ready ? (
              <p className="mt-2 text-center text-[10px] text-white/25">
                Complete all card fields to continue.
              </p>
            ) : null}
          </form>

          <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-white/30">
            <LockIcon className="mt-0.5 h-3 w-3 shrink-0" />
            Demo checkout — no card is charged and no details are sent
            anywhere.
          </p>
        </section>
      ) : (
        <section className="glass rounded-3xl border-[#D9B15C]/20! p-6 sm:p-7">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D9B15C]/25 bg-[#D9B15C]/10 text-[#F2D493]">
            <SeatIcon className="h-5 w-5" />
          </span>
          <h2 className="mt-5 text-balance text-xl font-semibold tracking-tight text-white">
            Seats still needed
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#A9BACB]">
            {lines.filter((line) => !line.seat).length} of {lines.length}{" "}
            travellers still need a seat. Pick a window for the view or the exit
            row for the legroom — the total updates instantly.
          </p>
          <Link
            href="/seats"
            onClick={() => setPhase("overview")}
            className={`${primaryButton} mt-6 w-full`}
          >
            Choose the remaining seats
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <p className="mt-3.5 text-[10px] uppercase tracking-[0.14em] text-white/30">
            Seats from SGD 180 · Window, aisle &amp; exit row
          </p>
        </section>
      )}
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  children: ReactNode;
}

function SummaryRow({ label, children }: SummaryRowProps): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] py-3.5 last:border-b-0">
      <dt className="pt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-right text-sm text-white/80">{children}</dd>
    </div>
  );
}
