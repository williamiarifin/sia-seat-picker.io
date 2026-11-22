import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="glass pointer-events-auto w-full max-w-md rounded-3xl p-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#D9B15C]">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          Not on the flight plan
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#A9BACB]">
          That page does not exist. Let&apos;s get you back to the departure
          hall.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-full bg-gradient-to-r from-[#F2D493] to-[#C99B3F] px-6 py-3 text-sm font-semibold text-[#0A1B33] transition hover:brightness-105"
        >
          Start a new search
        </Link>
      </div>
    </div>
  );
}
