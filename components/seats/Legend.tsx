"use client";

import { TOTAL_SEATS } from "@/lib/seatmap";
import { cabinColor, statusColor } from "@/lib/theme";

const CLASSES = [
  cabinColor.first,
  cabinColor.business,
  cabinColor.economy,
] as const;

function Swatch({ color, halo = false }: { color: string; halo?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="h-2 w-2 shrink-0 rounded-full border border-white/10"
      style={{
        backgroundColor: color,
        boxShadow: halo ? `0 0 0 2px ${color}2e` : undefined,
      }}
    />
  );
}

export function Legend() {
  return (
    <section
      aria-label="Seat map legend"
      onClick={(event) => event.stopPropagation()}
      className="glass pointer-events-auto rounded-2xl px-4 py-3.5"
    >
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-mist/70">
          Legend
        </h2>
        <span className="tnum text-[9px] uppercase tracking-[0.14em] text-mist/40">
          {TOTAL_SEATS} seats
        </span>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <p className="mb-1.5 text-[9px] uppercase tracking-[0.16em] text-mist/35">
            Cabin
          </p>
          <ul className="space-y-1.5">
            {CLASSES.map((cabin) => (
              <li
                key={cabin.label}
                className="flex items-center gap-2 text-[11px] text-white/80"
              >
                <Swatch color={cabin.base} />
                {cabin.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1.5 text-[9px] uppercase tracking-[0.16em] text-mist/35">
            Status
          </p>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2 text-[11px] text-white/80">
              <Swatch color={statusColor.available} />
              Available
            </li>
            <li className="flex items-center gap-2 text-[11px] text-white/55">
              <Swatch color={statusColor.occupied} />
              Occupied
            </li>
            <li className="flex items-center gap-2 text-[11px] text-white/80">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${statusColor.selected} 0%, #C99B3F 100%)`,
                  boxShadow: `0 0 0 2px ${statusColor.selected}2e`,
                }}
              />
              Selected
            </li>
          </ul>
        </div>
      </div>

      <p className="mt-3 border-t border-white/[0.06] pt-2.5 text-[10px] leading-relaxed text-mist/45">
        Prices include taxes and fees.
      </p>
    </section>
  );
}
