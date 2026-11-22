import type { JSX } from "react";
import { BRAND } from "@/lib/theme";

interface BrandMarkProps {
  className?: string;
}

/**
 * Abstract wing mark. Kept as inline SVG so it stays crisp at every size and
 * needs no network asset.
 */
export function BrandMark({ className = "h-9 w-9" }: BrandMarkProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="silverkris-gold-mark"
          x1="10"
          y1="10"
          x2="39"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F7E3B4" />
          <stop offset="0.55" stopColor="#D9B15C" />
          <stop offset="1" stopColor="#B98F3C" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22.25" stroke="currentColor" strokeOpacity="0.22" />
      <path
        d="M37.2 8.6c-.5 5.2-2.2 9.8-5.2 13.9-4.3 5.8-10.9 9.8-19.9 12 1.6-1.8 3.5-3.4 5.7-4.9 6.3-4.3 10.8-8.8 13.5-13.6 1.6-2.8 3.6-5.3 5.9-7.4Z"
        fill="url(#silverkris-gold-mark)"
      />
      <path
        d="M12.1 34.5c4.8-1.2 8.7-3.4 11.9-6.6 2.1-2.1 3.6-4.5 4.6-7.2-3.1 2-5.8 4.5-8.1 7.5-2.2 2.8-5 4.9-8.4 6.3Z"
        fill="url(#silverkris-gold-mark)"
        fillOpacity="0.55"
      />
    </svg>
  );
}

interface BrandLockupProps {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  className?: string;
}

export function BrandLockup({
  size = "sm",
  withTagline = true,
  className = "",
}: BrandLockupProps): JSX.Element {
  const mark =
    size === "lg" ? "h-12 w-12" : size === "md" ? "h-10 w-10" : "h-8 w-8";
  const wordmark =
    size === "lg"
      ? "text-[15px] tracking-[0.34em]"
      : size === "md"
        ? "text-[13px] tracking-[0.3em]"
        : "text-[11.5px] tracking-[0.28em]";

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      <BrandMark className={`${mark} shrink-0 text-white/60`} />
      <div className="min-w-0">
        <p
          className={`${wordmark} truncate font-medium uppercase leading-none text-white`}
        >
          {BRAND.name}
        </p>
        {withTagline ? (
          <p className="mt-1.5 truncate text-[9px] uppercase tracking-[0.26em] text-white/40">
            {BRAND.tagline}
          </p>
        ) : null}
      </div>
    </div>
  );
}
