"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent, JSX } from "react";
import { useBooking } from "@/lib/store";
import type { Flight } from "@/lib/types";
import { cabinLabel } from "./format";
import { FlightSummaryStrip } from "./FlightSummaryStrip";
import { ArrowRightIcon, LockIcon } from "./icons";
import {
  inputDefault,
  inputInvalid,
  labelBase,
  primaryButton,
} from "./styles";

interface PassengerFormProps {
  flight: Flight;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function PassengerForm({ flight }: PassengerFormProps): JSX.Element {
  const router = useRouter();
  const search = useBooking((state) => state.search);
  const travellers = useBooking((state) => state.travellers);
  const contact = useBooking((state) => state.contact);
  const updateTraveller = useBooking((state) => state.updateTraveller);
  const updateContact = useBooking((state) => state.updateContact);
  const ensureTravellers = useBooking((state) => state.ensureTravellers);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    ensureTravellers(search.passengers);
  }, [ensureTravellers, search.passengers]);

  function clearError(key: string): void {
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};

    travellers.forEach((traveller, index) => {
      if (traveller.firstName.trim().length < 2) {
        next[`${index}.firstName`] = "Enter the first name as printed on the passport.";
      }
      if (traveller.lastName.trim().length < 2) {
        next[`${index}.lastName`] = "Enter the last name as printed on the passport.";
      }
    });

    if (contact.email.trim().length === 0) {
      next.email = "Enter an email so we can send the boarding passes.";
    } else if (!EMAIL_PATTERN.test(contact.email.trim())) {
      next.email = "That email address doesn't look quite right.";
    }

    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const next = validate();
    setErrors(next);

    const firstKey = Object.keys(next)[0];
    if (firstKey) {
      const id = firstKey === "email" ? "contact-email" : `traveller-${firstKey}`;
      document.getElementById(id)?.focus();
      return;
    }

    router.push("/seats");
  }

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <FlightSummaryStrip
        flight={flight}
        date={search.date}
        passengers={search.passengers}
        cabin={cabinLabel(search.cabin)}
        className="mb-5"
      />

      <form onSubmit={handleSubmit} noValidate>
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9.5px] font-medium uppercase tracking-[0.24em] text-[#D9B15C]">
                {travellers.length > 1 ? "Travellers" : "Traveller"}
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-white">
                Who is flying?
              </h2>
            </div>
            <span className="tnum shrink-0 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/40">
              {travellers.length} {travellers.length === 1 ? "seat" : "seats"}
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-white/40">
            Enter each name exactly as it appears on the passport. Every
            traveller gets their own boarding pass.
          </p>

          <div className="mt-6 space-y-4">
            {travellers.map((traveller, index) => {
              const firstError = errors[`${index}.firstName`];
              const lastError = errors[`${index}.lastName`];

              return (
                <fieldset
                  key={index}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                >
                  <legend className="sr-only">
                    Traveller {index + 1}
                  </legend>

                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
                      <span className="tnum grid h-6 w-6 place-items-center rounded-full border border-white/10 text-[9px] text-white/50">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {index === 0 ? "Lead passenger" : `Traveller ${index + 1}`}
                    </span>
                    {index === 0 && travellers.length > 1 ? (
                      <span className="rounded-full border border-[#D9B15C]/25 bg-[#D9B15C]/10 px-2 py-0.5 text-[8.5px] uppercase tracking-[0.14em] text-[#F2D493]">
                        Contact
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label
                        htmlFor={`traveller-${index}.firstName`}
                        className={labelBase}
                      >
                        First name
                      </label>
                      <input
                        id={`traveller-${index}.firstName`}
                        type="text"
                        autoComplete={index === 0 ? "given-name" : "off"}
                        value={traveller.firstName}
                        onChange={(event) => {
                          updateTraveller(index, {
                            firstName: event.target.value,
                          });
                          clearError(`${index}.firstName`);
                        }}
                        aria-invalid={Boolean(firstError)}
                        placeholder={index === 0 ? "Amelia" : "First name"}
                        className={firstError ? inputInvalid : inputDefault}
                      />
                      {firstError ? (
                        <p
                          role="alert"
                          className="mt-1.5 text-[11px] leading-snug text-[#F2B4AC]"
                        >
                          {firstError}
                        </p>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <label
                        htmlFor={`traveller-${index}.lastName`}
                        className={labelBase}
                      >
                        Last name
                      </label>
                      <input
                        id={`traveller-${index}.lastName`}
                        type="text"
                        autoComplete={index === 0 ? "family-name" : "off"}
                        value={traveller.lastName}
                        onChange={(event) => {
                          updateTraveller(index, {
                            lastName: event.target.value,
                          });
                          clearError(`${index}.lastName`);
                        }}
                        aria-invalid={Boolean(lastError)}
                        placeholder={index === 0 ? "Tan" : "Last name"}
                        className={lastError ? inputInvalid : inputDefault}
                      />
                      {lastError ? (
                        <p
                          role="alert"
                          className="mt-1.5 text-[11px] leading-snug text-[#F2B4AC]"
                        >
                          {lastError}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </fieldset>
              );
            })}
          </div>

          <div className="mt-6 border-t border-white/[0.08] pt-6">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
              Where should we send the passes?
            </h3>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/35">
              All {travellers.length > 1 ? `${travellers.length} boarding passes` : "boarding pass"}{" "}
              go to this address. You can change it on the confirmation screen.
            </p>

            <div className="mt-4">
              <label htmlFor="contact-email" className={labelBase}>
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={contact.email}
                onChange={(event) => {
                  updateContact({ email: event.target.value });
                  clearError("email");
                }}
                aria-invalid={Boolean(errors.email)}
                placeholder="amelia.tan@example.com"
                className={errors.email ? inputInvalid : inputDefault}
              />
              {errors.email ? (
                <p
                  role="alert"
                  className="mt-1.5 text-[11px] leading-snug text-[#F2B4AC]"
                >
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="mt-4">
              <label htmlFor="contact-phone" className={labelBase}>
                Phone{" "}
                <span className="normal-case tracking-normal text-white/25">
                  (optional)
                </span>
              </label>
              <input
                id="contact-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={contact.phone}
                onChange={(event) =>
                  updateContact({ phone: event.target.value })
                }
                placeholder="+65 9123 4567"
                className={inputDefault}
              />
            </div>
          </div>

          <button type="submit" className={`${primaryButton} mt-7 w-full`}>
            Continue to seats
            <ArrowRightIcon className="h-4 w-4" />
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-white/30">
            <LockIcon className="h-3 w-3" />
            Your details are only used for this booking.
          </p>
        </div>
      </form>
    </div>
  );
}
