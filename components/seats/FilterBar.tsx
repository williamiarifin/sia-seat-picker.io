"use client";

import type { ComponentType } from "react";

import { SEATS } from "@/lib/seatmap";
import { useBooking } from "@/lib/store";
import { cabinColor, palette } from "@/lib/theme";
import type { CabinClass, SeatFilter } from "@/lib/types";

import {
  AisleIcon,
  CloseIcon,
  ExitIcon,
  LegroomIcon,
  MinusIcon,
  PlusIcon,
  SlidersIcon,
  WindowIcon,
} from "./icons";

type IconComponent = ComponentType<{ className?: string }>;

const CABIN_OPTIONS: ReadonlyArray<{
  value: CabinClass | "all";
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "first", label: "First" },
  { value: "business", label: "Business" },
  { value: "economy", label: "Economy" },
];

const CHIPS: ReadonlyArray<{
  key: "window" | "aisle" | "exitRow" | "extraLegroom";
  label: string;
  Icon: IconComponent;
}> = [
  { key: "window", label: "Window", Icon: WindowIcon },
  { key: "aisle", label: "Aisle", Icon: AisleIcon },
  { key: "exitRow", label: "Exit row", Icon: ExitIcon },
  { key: "extraLegroom", label: "Extra legroom", Icon: LegroomIcon },
];

const PRICE_MIN = Math.min(...SEATS.map((seat) => seat.price));
const PRICE_MAX = Math.max(...SEATS.map((seat) => seat.price));
const PRICE_STEP = 50;

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B15C]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1b33]";

export function FilterBar() {
  const filter = useBooking((state) => state.filter);
  const updateFilter = useBooking((state) => state.updateFilter);

  const isActive =
    filter.cabin !== "all" ||
    filter.window ||
    filter.aisle ||
    filter.exitRow ||
    filter.extraLegroom ||
    filter.maxPrice !== null;

  const cap = filter.maxPrice ?? PRICE_MAX;
  const fill = Math.max(
    0,
    Math.min(100, ((cap - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100),
  );

  function lowerCap() {
    const next =
      filter.maxPrice === null
        ? PRICE_MAX - PRICE_STEP
        : filter.maxPrice - PRICE_STEP;
    updateFilter({ maxPrice: Math.max(PRICE_MIN, next) });
  }

  function raiseCap() {
    if (filter.maxPrice === null) return;
    const next = filter.maxPrice + PRICE_STEP;
    updateFilter({ maxPrice: next >= PRICE_MAX ? null : next });
  }

  function resetFilters() {
    const patch: SeatFilter = {
      cabin: "all",
      window: false,
      aisle: false,
      exitRow: false,
      extraLegroom: false,
      maxPrice: null,
    };
    updateFilter(patch);
  }

  return (
    <section
      aria-label="Seat filters"
      onClick={(event) => event.stopPropagation()}
      className="glass pointer-events-auto rounded-2xl p-4"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersIcon className="h-3.5 w-3.5 text-mist/70" />
          <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-mist/70">
            Filters
          </h2>
        </div>
        {isActive ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              resetFilters();
            }}
            className={`text-[10px] font-medium text-[#D9B15C] underline-offset-4 transition-colors hover:text-[#F2D493] hover:underline ${FOCUS}`}
          >
            Reset
          </button>
        ) : null}
      </header>

      <p className="mb-1.5 mt-3.5 text-[9px] uppercase tracking-[0.18em] text-mist/40">
        Cabin
      </p>
      <div
        role="group"
        aria-label="Cabin"
        className="grid grid-cols-4 gap-0.5 rounded-xl border border-white/[0.08] bg-black/20 p-1"
      >
        {CABIN_OPTIONS.map((option) => {
          const active = filter.cabin === option.value;
          const accent =
            option.value === "all"
              ? palette.gold
              : cabinColor[option.value].base;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={(event) => {
                event.stopPropagation();
                updateFilter({ cabin: option.value });
              }}
              className={`flex h-8 items-center justify-center gap-1.5 rounded-lg text-[10px] font-medium tracking-wide transition-colors ${FOCUS} ${
                active
                  ? "text-[#F3F7FA]"
                  : "text-mist hover:bg-white/[0.05] hover:text-white"
              }`}
              style={
                active
                  ? {
                      backgroundColor: `${accent}24`,
                      boxShadow: `inset 0 0 0 1px ${accent}66`,
                    }
                  : undefined
              }
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="mb-1.5 mt-3.5 text-[9px] uppercase tracking-[0.18em] text-mist/40">
        Preferences
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {CHIPS.map(({ key, label, Icon }) => {
          const active = filter[key];
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={(event) => {
                event.stopPropagation();
                updateFilter({ [key]: !active });
              }}
              className={`flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-medium transition-colors ${FOCUS} ${
                active
                  ? "border-[#D9B15C]/40 bg-[#D9B15C]/[0.12] text-[#F2D493]"
                  : "border-white/10 bg-white/[0.03] text-mist hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3.5 border-t border-white/[0.06] pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] uppercase tracking-[0.18em] text-mist/40">
            Max price
          </span>
          <span className="flex items-center gap-1.5">
            <span className="tnum text-[11px] text-white/80">
              {filter.maxPrice === null
                ? "No cap"
                : `SGD ${filter.maxPrice}`}
            </span>
            {filter.maxPrice !== null ? (
              <button
                type="button"
                aria-label="Clear maximum price"
                onClick={(event) => {
                  event.stopPropagation();
                  updateFilter({ maxPrice: null });
                }}
                className={`grid h-4 w-4 place-items-center rounded-full text-mist/60 transition-colors hover:bg-white/10 hover:text-white ${FOCUS}`}
              >
                <CloseIcon className="h-2.5 w-2.5" />
              </button>
            ) : null}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            aria-label="Lower maximum price"
            onClick={(event) => {
              event.stopPropagation();
              lowerCap();
            }}
            disabled={filter.maxPrice !== null && filter.maxPrice <= PRICE_MIN}
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-mist transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 ${FOCUS}`}
          >
            <MinusIcon className="h-3.5 w-3.5" />
          </button>

          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              aria-hidden="true"
              className={`h-full rounded-full bg-gradient-to-r from-[#C99B3F]/70 to-[#F2D493] transition-[width] duration-300 ${
                filter.maxPrice === null ? "opacity-35" : ""
              }`}
              style={{ width: `${fill}%` }}
            />
          </div>

          <button
            type="button"
            aria-label="Raise maximum price"
            onClick={(event) => {
              event.stopPropagation();
              raiseCap();
            }}
            disabled={filter.maxPrice === null}
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-mist transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 ${FOCUS}`}
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="mt-3 border-t border-white/[0.06] pt-2.5 text-[10px] leading-relaxed text-mist/45">
        Filters tint the 3D cabin only — every seat stays selectable.
      </p>
    </section>
  );
}
