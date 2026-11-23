"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent, JSX } from "react";
import { AIRPORTS, REGIONS } from "@/lib/flights";
import { useBooking } from "@/lib/store";
import type { CabinClass } from "@/lib/types";
import { BrandLockup } from "./Brand";
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, SwapIcon } from "./icons";
import { inputDefault, labelBase, primaryButton } from "./styles";

const CABIN_OPTIONS: { value: CabinClass | "any"; label: string }[] = [
  { value: "any", label: "Any cabin" },
  { value: "first", label: "First" },
  { value: "business", label: "Business" },
  { value: "economy", label: "Economy" },
];

const selectClass =
  "w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-9 text-[13px] font-medium text-white transition focus:border-[#D9B15C]/60 focus:bg-white/[0.07] focus:outline-none sm:text-sm [&>option]:bg-[#08182b] [&>option]:text-white";

export function SearchForm(): JSX.Element {
  const router = useRouter();
  const search = useBooking((state) => state.search);
  const updateSearch = useBooking((state) => state.updateSearch);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (search.origin === search.destination) {
      setError("Choose two different airports.");
      return;
    }
    if (!search.date) {
      setError("Pick a departure date.");
      return;
    }
    setError(null);
    updateSearch({
      origin: search.origin,
      destination: search.destination,
      date: search.date,
      passengers: search.passengers,
      cabin: search.cabin,
    });
    router.push("/results");
  }

  function swapAirports(): void {
    setError(null);
    updateSearch({
      origin: search.destination,
      destination: search.origin,
    });
  }

  const passengerLabel =
    search.passengers === 1 ? "traveller" : "travellers";

  const originCity =
    AIRPORTS.find((airport) => airport.code === search.origin)?.city ??
    search.origin;
  const destinationCity =
    AIRPORTS.find((airport) => airport.code === search.destination)?.city ??
    search.destination;

  return (
    <div className="pointer-events-auto relative mx-auto flex min-h-dvh w-full max-w-[1180px] flex-col px-5 pb-16 pt-6 sm:px-8 sm:pt-8">
      <header className="flex items-start justify-between gap-6">
        <BrandLockup size="lg" />
        <p className="hidden pt-1 text-right text-[9px] uppercase leading-relaxed tracking-[0.22em] text-white/30 sm:block">
          {originCity} — {destinationCity}
          <br />
          <span className="text-white/55">Daily non-stop</span>
        </p>
      </header>

      <div className="grid flex-1 items-center gap-12 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-20 lg:pb-6 lg:pt-0">
        <section aria-labelledby="hero-heading">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-[#D9B15C]/60" />
            <p className="text-[9.5px] font-medium uppercase tracking-[0.3em] text-[#D9B15C]">
              Book a flight
            </p>
          </div>

          <h1
            id="hero-heading"
            className="mt-5 text-balance text-[46px] font-semibold leading-[1.01] tracking-tight text-[#F3F7FA] sm:text-[60px] lg:text-[64px]"
          >
            Where to <span className="gold-text">next?</span>
          </h1>

          <p className="mt-4 max-w-[340px] text-sm leading-relaxed text-[#A9BACB]">
            A quieter way to fly. Settle into the cabin, choose your view, and
            let the rest of the journey take care of itself.
          </p>

          <div className="glass mt-7 rounded-[26px] p-5 sm:p-6">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_42px_minmax(0,1fr)] sm:gap-1.5">
                <div className="min-w-0">
                  <label htmlFor="search-origin" className={labelBase}>
                    From
                  </label>
                  <div className="relative">
                    <select
                      id="search-origin"
                      value={search.origin}
                      onChange={(event) => {
                        setError(null);
                        updateSearch({ origin: event.target.value });
                      }}
                      className={selectClass}
                    >
                      <AirportOptions exclude={search.destination} />
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={swapAirports}
                  aria-label="Swap origin and destination"
                  className="mb-0.5 hidden h-11 w-[42px] cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition hover:border-[#D9B15C]/40 hover:bg-[#D9B15C]/10 hover:text-[#F2D493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B15C]/50 sm:flex"
                >
                  <SwapIcon className="h-4 w-4" />
                </button>

                <div className="min-w-0">
                  <label htmlFor="search-destination" className={labelBase}>
                    To
                  </label>
                  <div className="relative">
                    <select
                      id="search-destination"
                      value={search.destination}
                      onChange={(event) => {
                        setError(null);
                        updateSearch({ destination: event.target.value });
                      }}
                      className={selectClass}
                    >
                      <AirportOptions exclude={search.origin} />
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="search-date" className={labelBase}>
                    Departure
                  </label>
                  <input
                    id="search-date"
                    type="date"
                    value={search.date}
                    onChange={(event) => {
                      setError(null);
                      updateSearch({ date: event.target.value });
                    }}
                    className={`${inputDefault} tnum cursor-pointer text-[13px] sm:text-sm`}
                  />
                </div>

                <div className="min-w-0">
                  <span className={labelBase}>Travellers</span>
                  <div className="flex h-[46px] items-center justify-between rounded-xl border border-white/10 bg-white/5 px-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateSearch({
                          passengers: Math.max(1, search.passengers - 1),
                        })
                      }
                      disabled={search.passengers <= 1}
                      aria-label="Remove a traveller"
                      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      −
                    </button>
                    <span className="min-w-0 text-center text-[12px] text-white/80">
                      <span className="tnum text-sm font-medium">
                        {search.passengers}
                      </span>
                      <span className="ml-1 text-[10px] text-white/40">
                        {passengerLabel}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateSearch({
                          passengers: Math.min(6, search.passengers + 1),
                        })
                      }
                      disabled={search.passengers >= 6}
                      aria-label="Add a traveller"
                      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="search-cabin" className={labelBase}>
                  Cabin
                </label>
                <div className="relative">
                  <select
                    id="search-cabin"
                    value={search.cabin}
                    onChange={(event) =>
                      updateSearch({
                        cabin: event.target.value as CabinClass | "any",
                      })
                    }
                    className={`${selectClass} text-sm`}
                  >
                    {CABIN_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
                </div>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="mt-3 rounded-lg border border-[#E08A80]/25 bg-[#E08A80]/10 px-3 py-2 text-xs text-[#F2B4AC]"
                >
                  {error}
                </p>
              ) : null}

              <button type="submit" className={`${primaryButton} mt-5 w-full`}>
                Search flights
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </form>
          </div>

          <p className="mt-4 flex items-center gap-2 text-[11px] text-white/40">
            <CheckIcon className="h-3.5 w-3.5 text-[#D9B15C]/80" strokeWidth={2} />
            Free seat selection on Value fares and above
          </p>
        </section>

        <div aria-hidden="true" className="hidden lg:block" />
      </div>
    </div>
  );
}

/** Destinations grouped by region so a 24-airport list stays browsable. */
function AirportOptions({ exclude }: { exclude: string }): JSX.Element {
  return (
    <>
      {REGIONS.map((region) => (
        <optgroup key={region} label={region}>
          {AIRPORTS.filter((airport) => airport.region === region).map(
            (airport) => (
              <option
                key={airport.code}
                value={airport.code}
                disabled={airport.code === exclude}
              >
                {airport.code} · {airport.city}
              </option>
            ),
          )}
        </optgroup>
      ))}
    </>
  );
}
