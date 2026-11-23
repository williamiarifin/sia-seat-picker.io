"use client";

import Link from "next/link";
import type { JSX, ReactNode } from "react";
import { BrandLockup } from "./Brand";
import { Stepper } from "./Stepper";
import { ArrowLeftIcon } from "./icons";

interface PageShellProps {
  title: string;
  subtitle?: ReactNode;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  wide?: boolean;
}

/**
 * Shared chrome for every booking step. Deliberately paints no background —
 * the 3D aircraft stays visible behind the floating glass content.
 */
export function PageShell({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  children,
  wide = false,
}: PageShellProps): JSX.Element {
  return (
    <div
      className={`pointer-events-auto mx-auto flex min-h-dvh w-full flex-col px-5 pb-20 sm:px-8 sm:pb-24 print:min-h-0 print:max-w-none print:p-0 ${
        wide ? "max-w-[1280px]" : "max-w-[1100px]"
      }`}
    >
      <header className="flex flex-col gap-4 pt-6 sm:pt-8 md:flex-row md:items-center md:justify-between md:gap-8 print:hidden">
        <Link
          href="/"
          aria-label="Silverkris Air — home"
          className="w-fit rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08182b]"
        >
          <BrandLockup />
        </Link>
        <div className="min-w-0 md:max-w-[600px]">
          <Stepper />
        </div>
      </header>

      <div className="mt-9 sm:mt-12 print:hidden">
        {backHref ? (
          <Link
            href={backHref}
            className="group mb-5 inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/45 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 print:hidden"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            {backLabel}
          </Link>
        ) : null}

        <h1 className="text-balance text-[32px] font-semibold leading-[1.08] tracking-tight text-[#F3F7FA] sm:text-[42px]">
          {title}
        </h1>
        {subtitle ? (
          <div className="mt-3 max-w-2xl text-sm leading-relaxed text-[#A9BACB] sm:text-[15px]">
            {subtitle}
          </div>
        ) : null}
      </div>

      <main className="mt-8 flex-1 sm:mt-10 print:mt-0">{children}</main>
    </div>
  );
}

export function LoadingPanel({ lines = 3 }: { lines?: number }): JSX.Element {
  return (
    <div className="glass rounded-3xl p-6 sm:p-8" aria-hidden="true">
      <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
      <div className="mt-6 flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-white/[0.07]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/5 animate-pulse rounded-full bg-white/[0.08]" />
          <div className="h-3 w-1/4 animate-pulse rounded-full bg-white/[0.05]" />
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-xl bg-white/[0.04]"
            style={{ animationDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
