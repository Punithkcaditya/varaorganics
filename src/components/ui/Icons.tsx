import type { SVGProps } from "react";

/**
 * Small inline SVG icon set — avoids shipping a large icon library
 * (perf requirement §17). Each icon is decorative unless given a title/aria.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function CreditCardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

export function SupportIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <path d="M18 19a2 2 0 0 1-2 2h-2" />
      <rect x="2" y="14" width="4" height="6" rx="1" />
      <rect x="18" y="14" width="4" height="6" rx="1" />
    </svg>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M1 3h13v13H1z" />
      <path d="M14 8h4l3 3v5h-7" />
      <circle cx="5.5" cy="18.5" r="1.5" />
      <circle cx="17.5" cy="18.5" r="1.5" />
    </svg>
  );
}

// ── Trust / product icons (replace emoji — Website Changes §01) ──

/** Laboratory flask — NABL testing. */
export function FlaskIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 3h6" />
      <path d="M10 3v6.5L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-8.5V3" />
      <path d="M7.5 14h9" />
    </svg>
  );
}

/** Sprout / leaf — own farm, natural sourcing. */
export function SproutIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21v-8" />
      <path d="M12 13c0-3-2.5-5-6-5 0 3 2.5 5 6 5z" />
      <path d="M12 11c0-3 2.5-5 6-5 0 3-2.5 5-6 5z" />
    </svg>
  );
}

/** Wood log — ghani / wood-pressed method. */
export function LogIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="7" width="18" height="10" rx="5" />
      <ellipse cx="7" cy="12" rx="2" ry="4" />
      <path d="M7 10.5v3" />
    </svg>
  );
}

/** QR code — batch traceability. */
export function QrIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3M21 14v7h-7v-3" />
    </svg>
  );
}

/** Circular refresh — returns. */
export function RefreshIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

/** Shield with check — verification / testing. */
export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 4 6v6c0 5 3.4 7.7 8 9 4.6-1.3 8-4 8-9V6l-8-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/** Factory — industrial shortcuts (pain point). */
export function FactoryIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 21V9l6 4V9l6 4V6h6v15z" />
      <path d="M3 21h18" />
    </svg>
  );
}

/** Gear — machine processing (pain point). */
export function GearIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </svg>
  );
}
