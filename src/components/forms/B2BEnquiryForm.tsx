"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, inputClass, ErrorSummary } from "@/components/forms/Field";

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid work email"),
  company: z.string().trim().min(2, "Company name is required").max(120),
  country: z.string().trim().min(2, "Country is required").max(80),
  productInterest: z.enum(["Ghee", "Honey", "Oils", "All products"], {
    message: "Select a product interest",
  }),
  monthlyQuantity: z.string().trim().min(1, "Estimated monthly quantity is required").max(120),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});
type B2BInput = z.infer<typeof schema>;

/**
 * Inline B2B / export enquiry form (Website Changes §06). Posts to the shared
 * contact endpoint with the trade details folded into the message, so it emails
 * the internal inbox without a new backend route.
 */
export function B2BEnquiryForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<B2BInput>({ resolver: zodResolver(schema) });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const errorList = Object.entries(errors).map(([field, e]) => ({
    field,
    message: (e as { message?: string }).message ?? "Invalid",
  }));

  async function onSubmit(values: B2BInput) {
    setStatus("sending");
    const message =
      `B2B / Export enquiry\n` +
      `Company: ${values.company}\n` +
      `Country: ${values.country}\n` +
      `Product interest: ${values.productInterest}\n` +
      `Estimated monthly quantity: ${values.monthlyQuantity}\n\n` +
      `${values.message || "(no additional message)"}`;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.fullName,
          email: values.email,
          message,
          kind: "b2b",
          companyName: values.company,
        }),
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
        <p className="font-medium text-success">Thank you — your enquiry has been sent.</p>
        <p className="mt-1 text-sm text-navy/60">Our B2B team will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <ErrorSummary errors={errorList} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
          <input id="fullName" className={inputClass(!!errors.fullName)} {...register("fullName")} />
        </Field>
        <Field label="Work email" htmlFor="email" required error={errors.email?.message}>
          <input id="email" type="email" className={inputClass(!!errors.email)} {...register("email")} />
        </Field>
        <Field label="Company name" htmlFor="company" required error={errors.company?.message}>
          <input id="company" className={inputClass(!!errors.company)} {...register("company")} />
        </Field>
        <Field label="Country" htmlFor="country" required error={errors.country?.message}>
          <input id="country" className={inputClass(!!errors.country)} {...register("country")} />
        </Field>
        <Field
          label="Product interest"
          htmlFor="productInterest"
          required
          error={errors.productInterest?.message}
        >
          <select
            id="productInterest"
            defaultValue=""
            className={inputClass(!!errors.productInterest)}
            {...register("productInterest")}
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="Ghee">Ghee</option>
            <option value="Honey">Honey</option>
            <option value="Oils">Oils</option>
            <option value="All products">All products</option>
          </select>
        </Field>
        <Field
          label="Estimated monthly quantity"
          htmlFor="monthlyQuantity"
          required
          error={errors.monthlyQuantity?.message}
        >
          <input
            id="monthlyQuantity"
            placeholder="e.g. 200 L / month"
            className={inputClass(!!errors.monthlyQuantity)}
            {...register("monthlyQuantity")}
          />
        </Field>
      </div>
      <Field label="Message (optional)" htmlFor="message" error={errors.message?.message}>
        <textarea id="message" rows={4} className={inputClass(!!errors.message)} {...register("message")} />
      </Field>

      {status === "error" && (
        <p role="alert" className="rounded bg-danger/5 p-3 text-sm text-danger">
          Something went wrong. Please try again, or email hello@varaorganic.com directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-[2px] bg-navy px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Enquiry"}
      </button>
    </form>
  );
}
