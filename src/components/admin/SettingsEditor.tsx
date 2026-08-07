"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/forms/Field";
import type { SiteSettings } from "@/data/site-settings";

/** Homepage/site copy the marketer owns — announcement bar, hero headline. */
export function SettingsEditor({ settings }: { settings: SiteSettings }) {
  const [announcement, setAnnouncement] = useState(settings.announcement);
  const [threshold, setThreshold] = useState(settings.freeShippingThreshold);
  const [heroHeadline, setHeroHeadline] = useState(settings.heroHeadline);
  const [heroHeadlineEm, setHeroHeadlineEm] = useState(settings.heroHeadlineEm);
  const [founderPhotoUrl, setFounderPhotoUrl] = useState(settings.founderPhotoUrl ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcement,
          freeShippingThreshold: Number(threshold),
          heroHeadline,
          heroHeadlineEm,
          founderPhotoUrl,
        }),
      });
      const data = await res.json();
      setStatus(data.ok ? "done" : "error");
      setMessage(data.ok ? "Saved. The site has been refreshed." : (data.message ?? "Could not save."));
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Field label="Announcement bar" htmlFor="announcement" required>
        <textarea
          id="announcement"
          rows={2}
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          className={inputClass(false)}
        />
      </Field>

      <Field label="Free delivery threshold (₹)" htmlFor="threshold" required>
        <input
          id="threshold"
          type="number"
          min={0}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className={inputClass(false)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Hero headline" htmlFor="heroHeadline" required>
          <input
            id="heroHeadline"
            value={heroHeadline}
            onChange={(e) => setHeroHeadline(e.target.value)}
            className={inputClass(false)}
          />
        </Field>
        <Field label="Hero headline (gold italic part)" htmlFor="heroHeadlineEm">
          <input
            id="heroHeadlineEm"
            value={heroHeadlineEm}
            onChange={(e) => setHeroHeadlineEm(e.target.value)}
            className={inputClass(false)}
          />
        </Field>
      </div>

      <p className="rounded border border-navy/10 bg-white p-4 text-sm text-navy/65">
        Preview: <strong className="text-navy">{heroHeadline}</strong>{" "}
        <em className="text-amber">{heroHeadlineEm}</em>
      </p>

      <Field label="Founder photo URL (Our Story page)" htmlFor="founderPhotoUrl">
        <input
          id="founderPhotoUrl"
          value={founderPhotoUrl}
          onChange={(e) => setFounderPhotoUrl(e.target.value)}
          placeholder="https://…/founder.jpg"
          className={inputClass(false)}
        />
        <p className="mt-1 text-xs text-navy/45">
          Paste the image URL after uploading it (e.g. to Supabase Storage). Leave blank to show the
          placeholder.
        </p>
      </Field>

      {message && (
        <p
          role="status"
          className={`rounded p-3 text-sm ${status === "error" ? "bg-danger/5 text-danger" : "bg-success/5 text-success"}`}
        >
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={status === "saving"}
        className="rounded-[2px] bg-navy px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
