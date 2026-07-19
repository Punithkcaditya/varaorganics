"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { indianPhone } from "@/lib/validation/checkout";
import { Field, inputClass, ErrorSummary } from "@/components/forms/Field";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email"),
  phone: indianPhone.optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please enter a longer message").max(2000),
  company: z.string().max(0).optional(), // honeypot
});
type ContactInput = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(schema) });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const errorList = Object.entries(errors).map(([field, e]) => ({
    field,
    message: (e as { message?: string }).message ?? "Invalid",
  }));

  async function onSubmit(values: ContactInput) {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("sent");
        reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded border border-success/30 bg-success/5 p-6 text-center">
        <p className="font-medium text-success">Thank you — your message has been sent.</p>
        <p className="mt-1 text-sm text-navy/60">We&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <ErrorSummary errors={errorList} />
      {/* Honeypot — hidden from users, catches bots (§15). */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <Field label="Name" htmlFor="name" required error={errors.name?.message}>
        <input id="name" className={inputClass(!!errors.name)} {...register("name")} />
      </Field>
      <Field label="Email" htmlFor="email" required error={errors.email?.message}>
        <input id="email" type="email" className={inputClass(!!errors.email)} {...register("email")} />
      </Field>
      <Field label="Phone (optional)" htmlFor="phone" error={errors.phone?.message}>
        <input id="phone" inputMode="tel" className={inputClass(!!errors.phone)} {...register("phone")} />
      </Field>
      <Field label="Message" htmlFor="message" required error={errors.message?.message}>
        <textarea id="message" rows={5} className={inputClass(!!errors.message)} {...register("message")} />
      </Field>

      {status === "error" && (
        <p role="alert" className="rounded bg-danger/5 p-3 text-sm text-danger">
          Something went wrong. Please try again or call us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-[2px] bg-navy px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
