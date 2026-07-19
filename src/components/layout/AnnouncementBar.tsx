/** Sticky top bar — navy background, gold text. Content is settings-driven. */
export function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="bg-navy px-4 py-2.5 text-center text-xs font-light tracking-[0.12em] text-gold-lt">
      {text}
    </div>
  );
}
