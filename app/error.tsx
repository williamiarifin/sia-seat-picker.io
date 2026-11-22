"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="glass pointer-events-auto w-full max-w-md rounded-3xl p-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#D9B15C]">
          Something went off course
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          We hit some turbulence
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#A9BACB]">
          The seat map could not finish loading. This is usually a transient
          WebGL hiccup — trying again normally sorts it out.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-gradient-to-r from-[#F2D493] to-[#C99B3F] px-6 py-3 text-sm font-semibold text-[#0A1B33] transition hover:brightness-105"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back to search
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-6 text-[11px] text-white/25">ref {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
