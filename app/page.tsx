"use client";

import { useEffect } from "react";
import { SearchForm } from "@/components/booking/SearchForm";
import { useBooking } from "@/lib/store";

export default function HomePage() {
  const setStep = useBooking((state) => state.setStep);

  useEffect(() => {
    setStep("search");
  }, [setStep]);

  return <SearchForm />;
}
