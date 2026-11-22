"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

import { FARES, flightById } from "@/lib/flights";
import { seatById, seatsForRow } from "@/lib/seatmap";
import { useBooking } from "@/lib/store";
import { cabinColor } from "@/lib/theme";
import type { Seat } from "@/lib/types";

import { formatSGD, formatShortDate } from "./format";
import { ArrowRightIcon, CheckIcon, PlaneIcon } from "./icons";

const BUTTON_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B15C]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071322]";

function SeatGlyph({ seat, chosen }: { seat: Seat; chosen: boolean }) {
  const occupied = seat.status === "occupied";

  return (
    <span
      className={`flex h-[22px] w-[19px] items-center justify-center rounded-[5px] border text-[8px] font-medium leading-none ${
        chosen
          ? "border-transparent text-[#0A1B33] shadow-[0_2px_10px_rgba(217,177,92,0.35)]"
          : occupied
            ? "border-white/[0.04] bg-white/[0.02] text-white/20"
            : "border-white/10 bg-white/[0.05] text-white/55"
      }`}
      style={
        chosen
          ? {
              background: "linear-gradient(135deg, #F2D493 0%, #C99B3F 100%)",
            }
          : undefined
      }
    >
      {seat.letter}
    </span>
  );
}

function SeatRowGlyph({ seat }: { seat: Seat }) {
  const rowSeats = seatsForRow(seat.row);
  const port = rowSeats.filter((rowSeat) => rowSeat.x < 0);
  const starboard = rowSeats.filter((rowSeat) => rowSeat.x > 0);

  return (
    <div className="shrink-0 pt-1" aria-hidden="true">
      <p className="mb-1.5 text-right text-[8px] uppercase tracking-[0.18em] text-mist/40">
        Row {seat.row}
      </p>
      <div className="flex items-center justify-end gap-[3px]">
        {port.map((rowSeat) => (
          <SeatGlyph
            key={rowSeat.id}
            seat={rowSeat}
            chosen={rowSeat.id === seat.id}
          />
        ))}
        <span className="mx-[2px] h-4 w-px self-center bg-white/10" />
        {starboard.map((rowSeat) => (
          <SeatGlyph
            key={rowSeat.id}
            seat={rowSeat}
            chosen={rowSeat.id === seat.id}
          />
        ))}
      </div>

    </div>
  );
}

export function SeatDetailCard() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const phase = useBooking((state) => state.phase);
  const selectedSeatId = useBooking((state) => state.selectedSeatId);
  const flightId = useBooking((state) => state.flightId);
  const fare = useBooking((state) => state.fare);
  const date = useBooking((state) => state.search.date);
  const confirmation = useBooking((state) => state.confirmation);
  const confirmSeat = useBooking((state) => state.confirmSeat);
  const releaseSeat = useBooking((state) => state.releaseSeat);

  const seat = seatById(selectedSeatId);
  const visible = phase === "in-seat" || phase === "confirming";

  if (!visible || !seat) return null;

  const cabin = cabinColor[seat.cabin];
  const flight = flightById(flightId);
  const fareInfo = FARES.find((option) => option.id === fare);
  const farePrice = fareInfo?.price ?? 0;
  const total = seat.price + farePrice;
  const confirmed = phase === "confirming";
  const pnr = confirmation?.pnr ?? "—";

  return (
    <motion.section
      aria-label={`Seat ${seat.id} details`}
      onClick={(event) => event.stopPropagation()}
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.985 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="glass pointer-events-auto absolute inset-x-0 bottom-0 z-30 max-h-[70dvh] overflow-y-auto overscroll-contain rounded-t-[28px] px-5 pb-[calc(env(safe-area-inset-bottom)_+_1.25rem)] pt-3 no-scrollbar sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-h-[calc(100dvh_-_7rem)] sm:w-[380px] sm:rounded-2xl sm:p-6"
    >
      <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-white/15 sm:mb-3 sm:hidden" />

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full border px-2 py-[3px] text-[9px] font-medium uppercase tracking-[0.16em]"
              style={{
                color: cabin.base,
                backgroundColor: `${cabin.base}1f`,
                borderColor: `${cabin.base}55`,
              }}
            >
              {cabin.label}
            </span>
            <span className="text-[9px] uppercase tracking-[0.16em] text-mist/45">
              {seat.isWindow
                ? "Window seat"
                : seat.isAisle
                  ? "Aisle seat"
                  : "Middle seat"}
            </span>
          </div>

          <h2 className="tnum mt-2 text-[54px] font-semibold leading-[0.85] tracking-[-0.045em] text-white sm:text-[62px]">
            {seat.id}
          </h2>
          <p className="mt-2 text-[11px] leading-relaxed text-mist sm:mt-2.5">
            {seat.zone}
          </p>
        </div>

        <SeatRowGlyph seat={seat} />
      </header>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 sm:mt-5">
        <span className="flex min-w-0 items-center gap-2 text-[10.5px] text-white/85">
          <PlaneIcon className="h-3.5 w-3.5 shrink-0 text-mist/60" />
          <span className="font-medium">{flight?.number ?? "SQ 938"}</span>
          <span className="text-mist/40">·</span>
          <span className="truncate">
            {flight?.origin ?? "SIN"} → {flight?.destination ?? "DPS"}
          </span>
        </span>
        <span className="shrink-0 tnum text-[10.5px] text-mist">
          {formatShortDate(date)}
        </span>
      </div>

      <p className="mt-2.5 flex gap-2 text-[11px] leading-relaxed text-mist/85 sm:mt-3">
        <span
          aria-hidden="true"
          className="mt-[5px] h-1 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: cabin.base }}
        />
        {cabin.perk}
      </p>

      <div className="mt-3.5 rounded-xl border border-white/[0.07] bg-[#050d1a]/35 p-3 sm:mt-4 sm:p-3.5">
        <div className="flex items-baseline justify-between gap-3 text-[11px]">
          <span className="text-mist">Seat {seat.id} selection</span>
          <span className="tnum text-white/85">{formatSGD(seat.price)}</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-3 text-[11px]">
          <span className="text-mist">{fareInfo?.name ?? "Value"} fare</span>
          <span className="tnum text-white/85">
            {farePrice === 0 ? "Included" : `+ ${formatSGD(farePrice)}`}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-white/[0.07] pt-2.5">
          <span className="text-[9px] uppercase tracking-[0.18em] text-mist/50">
            Total
          </span>
          <span className="gold-text tnum text-xl font-semibold tracking-tight">
            {formatSGD(total)}
          </span>
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {confirmed ? (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3.5 sm:mt-4"
          >
            <div className="rounded-xl border border-[#D9B15C]/25 bg-[#D9B15C]/[0.07] p-4">
              <div className="flex items-start gap-3">
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 22,
                    delay: 0.05,
                  }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#F2D493] to-[#C99B3F] text-[#0A1B33] shadow-[0_0_26px_rgba(217,177,92,0.38)]"
                >
                  <CheckIcon className="h-5 w-5" strokeWidth={2.4} />
                </motion.span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold text-white">
                      Seat {seat.id} held
                    </p>
                    {confirmation ? (
                      <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.14em] text-mist/70">
                        Group {confirmation.boardingGroup}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[10px] text-mist/65">
                    Booking reference
                  </p>
                  <p className="tnum mt-0.5 text-[15px] font-medium tracking-[0.26em] text-[#F2D493]">
                    {pnr}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                router.push("/review");
              }}
              className={`group mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#F2D493] to-[#C99B3F] text-[12.5px] font-semibold tracking-wide text-[#0A1B33] shadow-[0_12px_32px_-14px_rgba(217,177,92,0.65)] transition hover:brightness-[1.06] active:scale-[0.99] ${BUTTON_FOCUS}`}
            >
              Continue to payment
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                releaseSeat();
              }}
              className={`mt-2 flex h-10 w-full items-center justify-center rounded-full border border-white/10 text-[11px] font-medium text-mist transition-colors hover:bg-white/[0.06] hover:text-white ${BUTTON_FOCUS}`}
            >
              Change seat
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3.5 sm:mt-4"
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                confirmSeat();
              }}
              className={`group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#F2D493] to-[#C99B3F] text-[12.5px] font-semibold tracking-wide text-[#0A1B33] shadow-[0_12px_32px_-14px_rgba(217,177,92,0.65)] transition hover:brightness-[1.06] active:scale-[0.99] ${BUTTON_FOCUS}`}
            >
              Confirm this seat
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                releaseSeat();
              }}
              className={`mt-2 flex h-10 w-full items-center justify-center rounded-full border border-white/10 text-[11px] font-medium text-mist transition-colors hover:bg-white/[0.06] hover:text-white ${BUTTON_FOCUS}`}
            >
              Choose another seat
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
