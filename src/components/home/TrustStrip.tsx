import type { ComponentType } from "react";
import {
  FlaskIcon,
  SproutIcon,
  TruckIcon,
  RefreshIcon,
  QrIcon,
  LogIcon,
} from "@/components/ui/Icons";

const items: { Icon: ComponentType<{ width?: number; height?: number; className?: string }>; label: string }[] = [
  { Icon: FlaskIcon, label: "NABL Tested" },
  { Icon: SproutIcon, label: "Own Farm Source" },
  { Icon: TruckIcon, label: "Free Blr ₹999+" },
  { Icon: RefreshIcon, label: "7-Day Returns" },
  { Icon: QrIcon, label: "QR Traced" },
  { Icon: LogIcon, label: "Ghani Pressed" },
];

/** Paper trust strip with consistent navy line icons (no emoji). */
export function TrustStrip() {
  return (
    <div className="border-y border-navy/[0.07] bg-paper px-6 py-4">
      <ul className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {items.map(({ Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-navy/60"
          >
            <Icon width={16} height={16} className="text-amber" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
