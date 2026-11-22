"use client";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Formats an ISO date (YYYY-MM-DD) as "18 Dec" without timezone drift. */
export function formatShortDate(iso: string): string {
  const parts = iso.split("-");
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isFinite(month) || !Number.isFinite(day)) return iso;
  const label = MONTHS[month - 1];
  if (!label) return iso;
  return `${day} ${label}`;
}

export function formatSGD(amount: number): string {
  return `SGD ${amount}`;
}
