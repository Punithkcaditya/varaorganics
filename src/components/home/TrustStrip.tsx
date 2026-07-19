const items = [
  { icon: "🧪", label: "NABL Tested" },
  { icon: "🐄", label: "Own Farm Source" },
  { icon: "📦", label: "Free Blr ₹999+" },
  { icon: "🔄", label: "7-Day Returns" },
  { icon: "📱", label: "QR Traced" },
  { icon: "🪵", label: "Ghani Pressed" },
];

/** Paper trust strip. Wraps on mobile, no JS (design). */
export function TrustStrip() {
  return (
    <div className="border-y border-navy/[0.07] bg-paper px-6 py-4">
      <ul className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-navy/60"
          >
            <span aria-hidden="true" className="text-sm">
              {item.icon}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
