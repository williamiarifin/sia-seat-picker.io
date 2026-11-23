"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CabinSummary } from "@/components/seats/CabinSummary";
import { FilterBar } from "@/components/seats/FilterBar";
import { formatSGD, formatShortDate } from "@/components/seats/format";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  PlaneIcon,
  SlidersIcon,
  TapIcon,
} from "@/components/seats/icons";
import { Legend } from "@/components/seats/Legend";
import { SeatDetailCard } from "@/components/seats/SeatDetailCard";
import { TravellerStrip } from "@/components/seats/TravellerStrip";
import { ViewHint } from "@/components/seats/ViewHint";
import { FARES } from "@/lib/flights";
import { SEATS, seatById } from "@/lib/seatmap";
import { bookingTotal, seatedCount, useBooking } from "@/lib/store";
import { cabinColor, statusColor } from "@/lib/theme";
import type { ScenePhase, Seat } from "@/lib/types";

const AVAILABLE_SEATS = SEATS.filter((seat) => seat.status === "available");
const AVAILABLE_COUNT = AVAILABLE_SEATS.length;
const CHEAPEST_AVAILABLE =
  AVAILABLE_SEATS.length > 0
    ? Math.min(...AVAILABLE_SEATS.map((seat) => seat.price))
    : 0;

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B15C]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071322]";

function phaseLabel(phase: ScenePhase, seatId: string | null): string {
  if (phase === "overview") return "Seat map";
  if (phase === "flying") return seatId ? `To ${seatId}` : "On the way";
  if (phase === "in-seat") return seatId ? `Seat ${seatId}` : "Seat view";
  return "Seat held";
}

function HoverPreview({ seat }: { seat: Seat }) {
  const cabin = cabinColor[seat.cabin];
  const occupied = seat.status === "occupied";

  return (
    <div className="flex items-center gap-3">
      <span className="tnum shrink-0 text-[22px] font-semibold leading-none tracking-tight text-white">
        {seat.id}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[10.5px] text-white/80">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: cabin.base }}
          />
          <span className="shrink-0">{cabin.label}</span>
          <span className="text-mist/30">·</span>
          <span className="truncate text-mist/55">{seat.zone}</span>
        </p>
        <p
          className="mt-1 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em]"
          style={{
            color: occupied ? "rgba(169,186,203,0.4)" : "rgba(125,226,184,0.85)",
          }}
        >
          <span
            aria-hidden="true"
            className="h-1 w-1 rounded-full"
            style={{
              backgroundColor: occupied
                ? statusColor.occupied
                : statusColor.available,
            }}
          />
          {occupied ? "Occupied" : "Available"}
          {seat.isWindow ? " · Window" : seat.isAisle ? " · Aisle" : ""}
        </p>
      </div>

      <span className="tnum shrink-0 text-[12px] text-[#E8CE93]">
        {formatSGD(seat.price)}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 grid place-items-center p-5">
      <div
        onClick={(event) => event.stopPropagation()}
        className="glass pointer-events-auto w-full max-w-[420px] rounded-3xl p-8 text-center"
      >
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#D9B15C]/25 bg-[#D9B15C]/[0.08] text-[#E8CE93]">
          <PlaneIcon className="h-5 w-5" />
        </span>
        <p className="mt-5 text-[9px] uppercase tracking-[0.22em] text-[#D9B15C]/80">
          Seat selection
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Pick a flight first
        </h1>
        <p className="mx-auto mt-2 max-w-[300px] text-[12.5px] leading-relaxed text-mist">
          Choose a flight and fare, then return to walk the cabin and choose
          your seat.
        </p>
        <Link
          href="/results"
          onClick={(event) => event.stopPropagation()}
          className={`mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#F2D493] to-[#C99B3F] text-[12px] font-semibold text-[#0A1B33] shadow-[0_12px_32px_-14px_rgba(217,177,92,0.6)] transition hover:brightness-[1.06] ${FOCUS}`}
        >
          Browse flights
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          onClick={(event) => event.stopPropagation()}
          className={`mt-2 flex h-10 w-full items-center justify-center rounded-full border border-white/10 text-[11px] font-medium text-mist transition-colors hover:bg-white/[0.06] hover:text-white ${FOCUS}`}
        >
          Start a new search
        </Link>
      </div>
    </div>
  );
}

export default function SeatsPage() {
  const hydrated = useBooking((state) => state.hydrated);
  const setStep = useBooking((state) => state.setStep);
  const flight = useBooking((state) => state.flight);
  const phase = useBooking((state) => state.phase);
  const selectedSeatId = useBooking((state) => state.selectedSeatId);
  const hoveredSeatId = useBooking((state) => state.hoveredSeatId);
  const fare = useBooking((state) => state.fare);
  const filter = useBooking((state) => state.filter);
  const search = useBooking((state) => state.search);
  const ensureTravellers = useBooking((state) => state.ensureTravellers);
  const seated = useBooking(seatedCount);
  const bookedTotal = useBooking(bookingTotal);

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setStep("seats");
    ensureTravellers(useBooking.getState().search.passengers);
  }, [setStep, ensureTravellers]);

  const selectedSeat = seatById(selectedSeatId);
  const hoveredSeat = seatById(hoveredSeatId);

  const farePrice = FARES.find((option) => option.id === fare)?.price ?? 0;
  const headlinePrice =
    seated > 0 ? bookedTotal : CHEAPEST_AVAILABLE + farePrice;
  const priceLabel = seated > 0 ? "Total" : "From";
  const currentPhaseLabel = phaseLabel(phase, selectedSeatId);

  const activeFilterCount =
    Number(filter.cabin !== "all") +
    Number(filter.window) +
    Number(filter.aisle) +
    Number(filter.exitRow) +
    Number(filter.extraLegroom) +
    Number(filter.maxPrice !== null);

  const showDetail =
    (phase === "in-seat" || phase === "confirming") &&
    selectedSeat !== undefined;

  if (!hydrated) {
    return <div className="pointer-events-none fixed inset-0 z-20" />;
  }

  if (!flight) return <EmptyState />;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden text-[#F3F7FA]">
      <header
        onClick={(event) => event.stopPropagation()}
        className="glass pointer-events-auto absolute inset-x-3 top-3 z-40 mx-auto flex h-[60px] max-w-[1480px] items-center gap-2.5 rounded-2xl px-2.5 sm:inset-x-5 sm:top-5 sm:gap-3 sm:px-4"
      >
        <Link
          href="/passengers"
          aria-label="Back to passenger details"
          onClick={(event) => event.stopPropagation()}
          className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-mist transition-colors hover:bg-white/[0.08] hover:text-white sm:w-auto sm:px-3 ${FOCUS}`}
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <span className="hidden h-6 w-px bg-white/10 sm:block" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium leading-tight text-white sm:text-[13px]">
            {flight.number}
            <span className="mx-1 text-mist/35">·</span>
            <span className="text-white/90">{flight.origin}</span>{" "}
            <span className="text-mist/45">→</span>{" "}
            <span className="text-white/90">{flight.destination}</span>
            <span className="hidden text-mist/50 md:inline">
              {" "}
              · {flight.aircraft}
            </span>
          </p>
          <p className="mt-0.5 hidden truncate text-[9px] uppercase tracking-[0.16em] text-mist/40 sm:block">
            {formatShortDate(search.date)} · {search.passengers}{" "}
            {search.passengers === 1 ? "passenger" : "passengers"}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-mist/55 sm:hidden">
            <span
              aria-hidden="true"
              className={`h-1 w-1 rounded-full bg-[#D9B15C] ${
                phase === "flying" ? "animate-pulse-soft" : ""
              }`}
            />
            {currentPhaseLabel}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[8.5px] uppercase tracking-[0.16em] text-mist/80 sm:flex">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full bg-[#D9B15C] ${
                phase === "flying" ? "animate-pulse-soft" : ""
              }`}
            />
            {currentPhaseLabel}
          </span>

          <div className="text-right">
            <p className="text-[8px] uppercase tracking-[0.16em] text-mist/40">
              {priceLabel}
            </p>
            <p className="tnum text-[12.5px] font-semibold text-[#E8CE93] sm:text-[13.5px]">
              {formatSGD(headlinePrice)}
            </p>
          </div>
        </div>
      </header>

      <aside
        aria-label="Travellers, seat filters, legend and cabin availability"
        className="no-scrollbar pointer-events-none absolute left-5 top-[92px] z-30 hidden max-h-[calc(100dvh_-_176px)] w-[296px] flex-col gap-2.5 overflow-y-auto overscroll-contain lg:flex lg:[&>section]:shrink-0"
      >
        <TravellerStrip />
        <FilterBar />
        <Legend />
        <CabinSummary />
      </aside>

      {phase === "overview" ? (
        <div className="pointer-events-none absolute bottom-6 right-6 z-30 hidden w-[356px] lg:block">
          <section
            aria-label="Seat map hints"
            onClick={(event) => event.stopPropagation()}
            className="glass pointer-events-auto rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-mist/70">
                <TapIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[12.5px] font-medium leading-snug text-white">
                  Tap any available seat to step inside
                </p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-mist/55">
                  The cabin will fly you down to the row.
                </p>
              </div>
            </div>

            <div className="mt-3 border-t border-white/[0.07] pt-3">
              {hoveredSeat ? (
                <HoverPreview seat={hoveredSeat} />
              ) : (
                <p className="text-[10.5px] leading-relaxed text-mist/45">
                  Hover a seat to preview its cabin, zone and price.
                </p>
              )}
            </div>
          </section>
        </div>
      ) : null}

      <AnimatePresence>
        {phase === "flying" ? (
          <motion.div
            key="flying"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-x-0 top-[44%] z-40 flex justify-center px-4"
          >
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[#071322]/[0.78] px-4 py-2 text-[11.5px] text-white/90 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-[#D9B15C]/50" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-[#F2D493]" />
              </span>
              {selectedSeat
                ? `Taking you to seat ${selectedSeat.id}…`
                : "Taking you to your seat…"}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showDetail ? <SeatDetailCard /> : null}

      <ViewHint
        key={phase}
        mode={phase}
        className="absolute bottom-5 left-6 z-30 hidden lg:flex"
      />

      {phase === "overview" ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom)_+_4.75rem)] z-20 lg:hidden">
          <div
            onClick={(event) => event.stopPropagation()}
            className="glass-soft pointer-events-auto mx-auto flex max-w-lg items-center gap-2 rounded-full px-3.5 py-2"
          >
            <TapIcon className="h-3.5 w-3.5 shrink-0 text-[#D9B15C]/80" />
            <p className="truncate text-[10.5px] text-white/75">
              Tap any available seat to step inside
            </p>
          </div>
        </div>
      ) : null}

      {phase === "overview" ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-2 pb-[calc(env(safe-area-inset-bottom)_+_0.5rem)] lg:hidden">
          <div
            onClick={(event) => event.stopPropagation()}
            className="pointer-events-auto mx-auto w-full max-w-lg overflow-hidden rounded-[22px] border border-white/10 bg-[#071322]/[0.88] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
          >
            <button
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="seat-filters-panel"
              onClick={(event) => {
                event.stopPropagation();
                setFiltersOpen((open) => !open);
              }}
              className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left ${FOCUS}`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-mist/70">
                <SlidersIcon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[9px] uppercase tracking-[0.18em] text-mist/45">
                  Cabin &amp; filters
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-white/85">
                  {activeFilterCount > 0
                    ? `${activeFilterCount} active · map tinted`
                    : `${AVAILABLE_COUNT} seats available`}
                </span>
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-mist/60 transition-transform duration-300 ${
                  filtersOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {filtersOpen ? (
                <motion.div
                  key="mobile-filters"
                  id="seat-filters-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="no-scrollbar max-h-[56dvh] space-y-2 overflow-y-auto overscroll-contain px-2 pb-2.5">
                    <TravellerStrip />
                    <FilterBar />
                    <Legend />
                    <CabinSummary />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      ) : null}
    </div>
  );
}
