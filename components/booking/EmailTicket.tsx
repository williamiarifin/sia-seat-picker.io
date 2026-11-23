"use client";

import { useState } from "react";
import type { JSX } from "react";

import {
  EmailError,
  emailConfigured,
  isEmailAddress,
  sendTicketEmail,
  type TicketEmailInput,
} from "@/lib/email";
import { CheckCircleIcon, MailIcon, PrintIcon } from "./icons";
import { inputDefault, inputInvalid, labelBase, primaryButton, secondaryButton } from "./styles";

type Status = "idle" | "sending" | "sent";

interface EmailTicketProps {
  defaultEmail: string;
  ticket: Omit<TicketEmailInput, "to">;
}

export function EmailTicket({ defaultEmail, ticket }: EmailTicketProps): JSX.Element {
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const busy = status === "sending";
  const invalid = error !== null;

  async function handleSend(): Promise<void> {
    if (!isEmailAddress(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setStatus("sending");
    setError(null);

    try {
      await sendTicketEmail({ ...ticket, to: email });
      setSentTo(email.trim());
      setStatus("sent");
    } catch (caught) {
      setStatus("idle");
      setError(
        caught instanceof EmailError
          ? caught.message
          : "Something went wrong while sending. Try again.",
      );
    }
  }

  function handlePrint(): void {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <section
      aria-label="Email this ticket"
      className="glass mt-6 rounded-3xl p-5 text-left sm:p-6"
    >
      <div className="flex items-start gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#D9B15C]/25 bg-[#D9B15C]/10 text-[#F2D493]">
          <MailIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-white">
            {status === "sent" ? "Ticket on its way" : "Email this ticket"}
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[#A9BACB]">
            {status === "sent" ? (
              <>
                A copy of your boarding pass was sent to{" "}
                <span className="text-[#F2D493]">{sentTo}</span>.
              </>
            ) : (
              "Send yourself a copy of the pass, or save it as a PDF for the airport."
            )}
          </p>
        </div>
      </div>

      {status === "sent" ? (
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <span
            role="status"
            className="flex items-center gap-2 text-[12px] text-[#7DE2B8]"
          >
            <CheckCircleIcon className="h-4 w-4" />
            Delivered
          </span>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setSentTo(null);
              }}
              className={`${secondaryButton} h-10 px-4 text-[12.5px]`}
            >
              Send to another
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className={`${secondaryButton} h-10 px-4 text-[12.5px]`}
            >
              <PrintIcon className="h-3.5 w-3.5" />
              Save PDF
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5">
            <label htmlFor="ticket-email" className={labelBase}>
              Send to
            </label>
            <input
              id="ticket-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="you@example.com"
              aria-invalid={invalid}
              aria-describedby={error ? "ticket-email-error" : undefined}
              disabled={busy}
              className={invalid ? inputInvalid : inputDefault}
            />
            {error ? (
              <p
                id="ticket-email-error"
                role="alert"
                className="mt-2 text-[11.5px] text-[#E08A80]"
              >
                {error}
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={busy || !emailConfigured}
              className={`${primaryButton} h-11 flex-1 px-5 text-[13px]`}
            >
              {busy ? "Sending…" : "Send ticket"}
              {!busy ? <MailIcon className="h-3.5 w-3.5" /> : null}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className={`${secondaryButton} h-11 px-5 text-[13px]`}
            >
              <PrintIcon className="h-3.5 w-3.5" />
              Save PDF
            </button>
          </div>

          {!emailConfigured ? (
            <p className="mt-3 text-[11px] leading-relaxed text-white/35">
              Email delivery is not switched on for this deployment — add the
              three <span className="text-white/50">NEXT_PUBLIC_EMAILJS_*</span>{" "}
              variables and redeploy. Printing works in the meantime.
            </p>
          ) : null}

          <p aria-live="polite" className="sr-only">
            {status === "sending" ? "Sending your ticket" : ""}
          </p>
        </>
      )}
    </section>
  );
}
