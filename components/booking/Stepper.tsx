"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { JSX } from "react";
import { useBooking } from "@/lib/store";
import type { Step } from "@/lib/types";
import { CheckIcon } from "./icons";

interface ProgressStep {
  id: Step;
  label: string;
  href: string;
}

const STEPS: ProgressStep[] = [
  { id: "search", label: "Search", href: "/" },
  { id: "results", label: "Flights", href: "/results" },
  { id: "passengers", label: "Details", href: "/passengers" },
  { id: "seats", label: "Seats", href: "/seats" },
  { id: "review", label: "Payment", href: "/review" },
  { id: "confirmation", label: "Done", href: "/confirmation" },
];

export function Stepper(): JSX.Element {
  const step = useBooking((state) => state.step);
  const listRef = useRef<HTMLOListElement>(null);
  const activeRef = useRef<HTMLLIElement>(null);

  const found = STEPS.findIndex((item) => item.id === step);
  const activeIndex = found === -1 ? 0 : found;

  useEffect(() => {
    const list = listRef.current;
    const active = activeRef.current;
    if (!list || !active) return;
    if (list.scrollWidth <= list.clientWidth + 2) return;

    const target =
      active.offsetLeft - list.clientWidth / 2 + active.clientWidth / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({
      left: Math.max(0, target),
      behavior: reduce ? "auto" : "smooth",
    });
  }, [activeIndex]);

  return (
    <nav aria-label="Booking progress" className="min-w-0">
      <ol
        ref={listRef}
        className="no-scrollbar relative flex items-center gap-0.5 overflow-x-auto py-1"
      >
        {STEPS.map((item, index) => {
          const completed = index < activeIndex;
          const current = index === activeIndex;

          const indicator = (
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium tnum transition ${
                completed
                  ? "border-transparent bg-gradient-to-br from-[#F2D493] to-[#C99B3F] text-[#0A1B33]"
                  : current
                    ? "border-[#D9B15C]/70 bg-[#D9B15C]/10 text-[#F2D493]"
                    : "border-white/15 bg-white/[0.02] text-white/35"
              }`}
            >
              {completed ? (
                <CheckIcon className="h-3 w-3" strokeWidth={2.6} />
              ) : (
                index + 1
              )}
            </span>
          );

          const label = (
            <span
              className={`whitespace-nowrap text-[9.5px] font-medium uppercase tracking-[0.14em] transition ${
                completed
                  ? "text-white/55 group-hover:text-white"
                  : current
                    ? "text-[#F2D493]"
                    : "text-white/30"
              }`}
            >
              {item.label}
            </span>
          );

          return (
            <li
              key={item.id}
              ref={current ? activeRef : undefined}
              className="flex shrink-0 items-center"
            >
              {completed ? (
                <Link
                  href={item.href}
                  aria-label={`${item.label} — completed, go back`}
                  className="group flex cursor-pointer items-center gap-1.5 rounded-full px-1 py-1 transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B15C]/50 md:gap-2"
                >
                  {indicator}
                  {label}
                </Link>
              ) : (
                <div
                  aria-current={current ? "step" : undefined}
                  aria-disabled={!current}
                  className="flex items-center gap-1.5 px-1 py-1 md:gap-2"
                >
                  {indicator}
                  {label}
                </div>
              )}

              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`mx-0.5 h-px w-3 shrink-0 sm:w-4 ${
                    index < activeIndex ? "bg-[#D9B15C]/45" : "bg-white/10"
                  }`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
