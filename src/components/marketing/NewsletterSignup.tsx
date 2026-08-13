"use client";

import { useState } from "react";

/**
 * Newsletter signup (footer). Posts to /api/newsletter which adds the email to
 * the Resend Audience. Styled for the dark footer background.
 */
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("done");
        setMessage("You're on the list. Watch your inbox for lab reports and launch news.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message ?? "Could not subscribe. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-lt">
        Stay in the loop
      </h2>
      <p className="mb-3 max-w-xs text-[13px] font-light leading-relaxed text-ivory/45">
        Lab reports, new batches, and launch news. No spam.
      </p>
      <form onSubmit={submit} className="flex max-w-xs flex-wrap gap-2">
        {/* Honeypot — visually hidden, not for real users. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="hidden"
        />
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="min-w-0 flex-1 rounded-[2px] border border-white/15 bg-white/[0.06] px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/35 outline-none focus:border-gold-lt"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-[2px] bg-gold px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy transition-colors hover:bg-gold-lt disabled:opacity-60"
        >
          {status === "saving" ? "…" : "Subscribe"}
        </button>
      </form>
      {message && (
        <p
          role="status"
          className={`mt-2 text-[12px] ${status === "error" ? "text-danger" : "text-success-lt"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
