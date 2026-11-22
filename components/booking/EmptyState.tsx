import Link from "next/link";
import type { JSX, ReactNode } from "react";
import { ArrowRightIcon } from "./icons";
import { primaryButton } from "./styles";

interface EmptyStateProps {
  title: string;
  body: string;
  cta: string;
  href: string;
  icon?: ReactNode;
  footnote?: string;
  className?: string;
}

/** Documented, friendly fallback for direct loads with missing booking state. */
export function EmptyState({
  title,
  body,
  cta,
  href,
  icon,
  footnote,
  className = "",
}: EmptyStateProps): JSX.Element {
  return (
    <div
      className={`glass w-full max-w-[560px] rounded-3xl p-7 sm:p-9 ${className}`}
    >
      {icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D9B15C]/25 bg-[#D9B15C]/10 text-[#F2D493]">
          {icon}
        </span>
      ) : null}
      <h2 className="mt-5 text-balance text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-2.5 text-sm leading-relaxed text-[#A9BACB]">{body}</p>
      <Link href={href} className={`${primaryButton} mt-6 w-full sm:w-auto`}>
        {cta}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
      {footnote ? (
        <p className="mt-4 text-[11px] text-white/30">{footnote}</p>
      ) : null}
    </div>
  );
}
