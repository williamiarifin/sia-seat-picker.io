"use client";

import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  );
}

export function PlaneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z" />
    </Icon>
  );
}

export function WindowIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <path d="M4 10h16" />
      <path d="M8 14h8" />
    </Icon>
  );
}

export function AisleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h5" />
      <path d="m7 9-3 3 3 3" />
      <path d="M20 12h-5" />
      <path d="m17 9 3 3-3 3" />
    </Icon>
  );
}

export function ExitIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
      <path d="M11 12h9" />
      <path d="m16 8 4 4-4 4" />
    </Icon>
  );
}

export function LegroomIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 4v9a2 2 0 0 0 2 2h7" />
      <path d="M6 20h6" />
      <path d="M9 20v-3" />
      <path d="M16 12v5" />
      <path d="m13 14 3 3 3-3" />
    </Icon>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </Icon>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h9" />
      <path d="M18 7h2" />
      <circle cx="15.5" cy="7" r="2" />
      <path d="M4 17h4" />
      <path d="M13 17h7" />
      <circle cx="10.5" cy="17" r="2" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function MoveIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="m9 6 3-3 3 3" />
      <path d="m9 18 3 3 3-3" />
      <path d="m6 9-3 3 3 3" />
      <path d="m18 9 3 3-3 3" />
    </Icon>
  );
}

export function TapIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 3.5v2" />
      <path d="M12 18.5v2" />
      <path d="M3.5 12h2" />
      <path d="M18.5 12h2" />
      <path d="m6 6 1.4 1.4" />
      <path d="m16.6 16.6 1.4 1.4" />
      <path d="m18 6-1.4 1.4" />
      <path d="m7.4 16.6-1.4 1.4" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </Icon>
  );
}
