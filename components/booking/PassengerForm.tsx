"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function PassengerForm({ flight }: PassengerFormProps): JSX.Element {
  const router = useRouter();
  const passenger = useBooking((state) => state.passenger);
  const updatePassenger = useBooking((state) => state.updatePassenger);
  const search = useBooking((state) => state.search);

  const [errors, setErrors] = useState<FormErrors>({});

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  function clearError(key: keyof FormErrors): void {
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (passenger.firstName.trim().length < 2) {
      next.firstName = "Enter your first name as it appears on your passport.";
    }
    if (passenger.lastName.trim().length < 2) {
      next.lastName = "Enter your last name as it appears on your passport.";
    }
    if (passenger.email.trim().length === 0) {
      next.email = "Enter your email so we can send your boarding pass.";
    } else if (!EMAIL_PATTERN.test(passenger.email.trim())) {
      next.email = "That email address doesn't look quite right.";
    }
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const next = validate();
    setErrors(next);

    if (next.firstName) {
      firstNameRef.current?.focus();
      return;
    }
    if (next.lastName) {
      lastNameRef.current?.focus();
      return;
    }
    if (next.email) {
      emailRef.current?.focus();
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

      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9.5px] font-medium uppercase tracking-[0.24em] text-[#D9B15C]">
              Lead passenger
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-white">
              Traveller 1
            </h2>
          </div>
          <span
            aria-hidden="true"
            className="tnum flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[11px] text-white/35"
          >
            01
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-white/40">
          Enter the name exactly as it appears on the passport or travel
          document.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="passenger-first-name" className={labelBase}>
                First name
              </label>
              <input
                ref={firstNameRef}
                id="passenger-first-name"
                type="text"
                autoComplete="given-name"
                value={passenger.firstName}
                onChange={(event) => {
                  updatePassenger({ firstName: event.target.value });
                  clearError("firstName");
                }}
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={
                  errors.firstName ? "passenger-first-name-error" : undefined
                }
                placeholder="Amelia"
                className={errors.firstName ? inputInvalid : inputDefault}
              />
              {errors.firstName ? (
                <p
                  id="passenger-first-name-error"
                  role="alert"
                  className="mt-1.5 text-[11px] leading-snug text-[#F2B4AC]"
                >
                  {errors.firstName}
                </p>
              ) : null}
            </div>

            <div className="min-w-0">
              <label htmlFor="passenger-last-name" className={labelBase}>
                Last name
              </label>
              <input
                ref={lastNameRef}
                id="passenger-last-name"
                type="text"
                autoComplete="family-name"
                value={passenger.lastName}
                onChange={(event) => {
                  updatePassenger({ lastName: event.target.value });
                  clearError("lastName");
                }}
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={
                  errors.lastName ? "passenger-last-name-error" : undefined
                }
                placeholder="Tan"
                className={errors.lastName ? inputInvalid : inputDefault}
              />
              {errors.lastName ? (
                <p
                  id="passenger-last-name-error"
                  role="alert"
                  className="mt-1.5 text-[11px] leading-snug text-[#F2B4AC]"
                >
                  {errors.lastName}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="passenger-email" className={labelBase}>
              Email
            </label>
            <input
              ref={emailRef}
              id="passenger-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={passenger.email}
              onChange={(event) => {
                updatePassenger({ email: event.target.value });
                clearError("email");
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "passenger-email-error" : "passenger-email-hint"
              }
              placeholder="amelia.tan@example.com"
              className={errors.email ? inputInvalid : inputDefault}
            />
            {errors.email ? (
              <p
                id="passenger-email-error"
                role="alert"
                className="mt-1.5 text-[11px] leading-snug text-[#F2B4AC]"
              >
                {errors.email}
              </p>
            ) : (
              <p id="passenger-email-hint" className="mt-1.5 text-[11px] text-white/30">
                Your boarding pass and updates will be sent here.
              </p>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="passenger-phone" className={labelBase}>
              Phone <span className="normal-case tracking-normal text-white/25">(optional)</span>
            </label>
            <input
              id="passenger-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={passenger.phone}
              onChange={(event) =>
                updatePassenger({ phone: event.target.value })
              }
              placeholder="+65 9123 4567"
              className={inputDefault}
            />
          </div>

          <button type="submit" className={`${primaryButton} mt-6 w-full`}>
            Continue to seats
            <ArrowRightIcon className="h-4 w-4" />
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-white/30">
            <LockIcon className="h-3 w-3" />
            Your details are only used for this booking.
          </p>
        </form>
      </div>
    </div>
  );
}
