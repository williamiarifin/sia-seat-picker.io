"use client";

import { useEffect } from "react";
import { useBooking } from "@/lib/store";
import { appPath } from "@/lib/paths";
import type { Step } from "@/lib/types";

const PATH_TO_STEP: Record<string, Step> = {
  "/": "search",
  "/results": "results",
  "/passengers": "passengers",
  "/seats": "seats",
  "/review": "review",
  "/confirmation": "confirmation",
};

/** Restores the session booking once, after mount, so SSR stays deterministic. */
export function BookingHydrator() {
  useEffect(() => {
    void useBooking.persist.rehydrate();
  }, []);

  return null;
}

export function pathToStep(pathname: string): Step {
  return PATH_TO_STEP[appPath(pathname)] ?? "search";
}
