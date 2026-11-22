"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useBooking } from "@/lib/store";
import { appPath } from "@/lib/paths";
import { pathToStep } from "./BookingHydrator";

/**
 * The 3D canvas is a fixed background layer. This wrapper keeps page content
 * above it, and only lets the canvas receive pointer events on /seats.
 */
export function ContentLayer({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const setStep = useBooking((s) => s.setStep);
  const isSeats = appPath(pathname) === "/seats";

  useEffect(() => {
    setStep(pathToStep(pathname));
  }, [pathname, setStep]);

  return (
    <div
      className={`relative z-10 min-h-dvh ${isSeats ? "pointer-events-none" : ""}`}
    >
      {children}
    </div>
  );
}
