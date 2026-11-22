/** Shared class strings so every booking surface speaks the same language. */

export const primaryButton =
  "inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F2D493] to-[#C99B3F] px-6 text-sm font-semibold text-[#0A1B33] shadow-[0_10px_30px_-12px_rgba(217,177,92,0.65)] transition hover:brightness-[1.06] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2D493]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08182b] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100";

export const secondaryButton =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.02] px-5 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08182b]";

const inputBase =
  "w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 transition focus:outline-none";

export const inputDefault = `${inputBase} border-white/10 focus:border-[#D9B15C]/60 focus:bg-white/[0.07]`;

export const inputInvalid = `${inputBase} border-[#E08A80]/65 focus:border-[#E08A80]`;

export const labelBase =
  "mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-white/45";

export const eyebrow =
  "text-[10px] font-medium uppercase tracking-[0.24em] text-[#D9B15C]";

export const glassCard = "glass rounded-3xl";

export const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/55";
