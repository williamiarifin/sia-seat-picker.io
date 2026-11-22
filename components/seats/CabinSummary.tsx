"use client";

import { CABINS, seatsInCabin } from "@/lib/seatmap";
import { useBooking } from "@/lib/store";
import { cabinColor } from "@/lib/theme";
import type { CabinClass } from "@/lib/types";

interface CabinStat {
  cls: CabinClass;
  label: string;
  total: number;
  available: number;
  cheapest: number | null;
}

const CABIN_STATS: CabinStat[] = CABINS.map((cabin) => {
  const seats = seatsInCabin(cabin.class);
  const available = seats.filter((seat) => seat.status === "available");
  return {
    cls: cabin.class,
    label: cabin.label,
    total: seats.length,
    available: available.length,
    cheapest:
      available.length > 0
        ? Math.min(...available.map((seat) => seat.price))
        : null,
  };
});

const TOTAL_AVAILABLE = CABIN_STATS.reduce(
  (sum, stat) => sum + stat.available,
  0,
);

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B15C]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1b33]";

export function CabinSummary() {
  const cabinFilter = useBooking((state) => state.filter.cabin);
  const updateFilter = useBooking((state) => state.updateFilter);

  return (
    <section
      aria-label="Cabin availability"
      onClick={(event) => event.stopPropagation()}
      className="glass pointer-events-auto rounded-2xl p-3.5"
    >
      <header className="flex items-baseline justify-between gap-2 px-0.5">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-mist/70">
          Cabin availability
        </h2>
        <span className="tnum text-[9px] uppercase tracking-[0.14em] text-mist/40">
          {TOTAL_AVAILABLE} open
        </span>
      </header>

      <div className="mt-2 space-y-0.5">
        {CABIN_STATS.map((stat) => {
          const active = cabinFilter === stat.cls;
          const color = cabinColor[stat.cls].base;
          const share =
            stat.total > 0 ? (stat.available / stat.total) * 100 : 0;

          return (
            <button
              key={stat.cls}
              type="button"
              aria-pressed={active}
              onClick={(event) => {
                event.stopPropagation();
                updateFilter({ cabin: active ? "all" : stat.cls });
              }}
              className={`w-full rounded-xl px-2 py-2 text-left transition-colors ${FOCUS} ${
                active ? "bg-white/[0.06]" : "hover:bg-white/[0.035]"
              }`}
              style={
                active
                  ? { boxShadow: `inset 0 0 0 1px ${color}4d` }
                  : undefined
              }
            >
              <span className="flex items-baseline gap-2">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow: active ? `0 0 8px ${color}99` : undefined,
                  }}
                />
                <span
                  className={`text-[11.5px] font-medium ${
                    active ? "text-white" : "text-white/80"
                  }`}
                >
                  {stat.label}
                </span>
                <span className="ml-auto tnum text-[10.5px] text-mist/70">
                  <span className="text-white/90">{stat.available}</span>
                  <span className="text-mist/40"> / {stat.total}</span>
                </span>
              </span>

              <span className="mt-1.5 flex items-center gap-2">
                <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                  <span
                    className="block h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${share}%`,
                      backgroundColor: color,
                      opacity: active ? 1 : 0.7,
                    }}
                  />
                </span>
                <span className="shrink-0 tnum text-[9px] text-mist/50">
                  {stat.cheapest === null
                    ? "Sold out"
                    : `from SGD ${stat.cheapest}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-1.5 px-2 text-[9.5px] leading-relaxed text-mist/35">
        Tap a cabin to tint the map. Available / total seats.
      </p>
    </section>
  );
}
