"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { indianPhone } from "@/lib/validation/checkout";
import { Field, inputClass, ErrorSummary } from "@/components/forms/Field";

const schema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(100),
    email: z.string().trim().email("Enter a valid email"),
    phone: indianPhone.optional().or(z.literal("")),
    message: z.string().trim().max(2000),
    company: z.string().max(0).optional(), // honeypot
    intent: z.enum(["contact", "restock"]),
    productName: z.string().trim().max(160).optional(),
    variantName: z.string().trim().max(80).optional(),
    sku: z.string().trim().max(80).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.intent === "contact" && values.message.length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: "Please enter a longer message",
      });
    }
  });
type ContactInput = z.infer<typeof schema>;

export interface RestockContext {
  productName: string;
  variantName: string;
  sku?: string;
}

export function ContactForm({ restock }: { restock?: RestockContext }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      intent: restock ? "restock" : "contact",
      productName: restock?.productName,
      variantName: restock?.variantName,
      sku: restock?.sku,
      message: "",
    },
  });
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
      <div role="status" className="border-success/30 bg-success/5 rounded border p-6 text-center">
        <p className="text-success font-medium">
          {restock
            ? "Your restock request has been sent."
            : "Thank you — your message has been sent."}
        </p>
        <p className="text-navy/60 mt-1 text-sm">
          {restock
            ? `Our team will email you when ${restock.productName}, ${restock.variantName}, is available.`
            : "We'll get back to you shortly."}
        </p>
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

      <input type="hidden" {...register("intent")} />
      <input type="hidden" {...register("productName")} />
      <input type="hidden" {...register("variantName")} />
      <input type="hidden" {...register("sku")} />

      {restock && (
        <div
          className="border-amber/30 bg-amber/5 rounded border p-4"
          aria-label="Selected product"
        >
          <p className="text-amber text-[10px] font-semibold tracking-[0.16em] uppercase">
            Back-in-stock request
          </p>
          <p className="text-navy mt-1 font-serif text-lg font-semibold">{restock.productName}</p>
          <p className="text-navy/60 mt-1 text-sm">
            Selected size: <strong className="text-navy">{restock.variantName}</strong>
            {restock.sku ? ` · SKU: ${restock.sku}` : ""}
          </p>
          <p className="text-navy/55 mt-2 text-xs">
            Enter your email below. Our team will contact you manually when this exact size is
            available.
          </p>
        </div>
      )}

      <Field label="Name" htmlFor="name" required error={errors.name?.message}>
        <input id="name" className={inputClass(!!errors.name)} {...register("name")} />
      </Field>
      <Field label="Email" htmlFor="email" required error={errors.email?.message}>
        <input
          id="email"
          type="email"
          className={inputClass(!!errors.email)}
          {...register("email")}
        />
      </Field>
      <Field label="Phone (optional)" htmlFor="phone" error={errors.phone?.message}>
        <input
          id="phone"
          inputMode="tel"
          className={inputClass(!!errors.phone)}
          {...register("phone")}
        />
      </Field>
      <Field
        label={restock ? "Additional note (optional)" : "Message"}
        htmlFor="message"
        required={!restock}
        error={errors.message?.message}
      >
        <textarea
          id="message"
          rows={restock ? 3 : 5}
          className={inputClass(!!errors.message)}
          {...register("message")}
        />
      </Field>

      {status === "error" && (
        <p role="alert" className="bg-danger/5 text-danger rounded p-3 text-sm">
          Something went wrong. Please try again or call us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-navy text-ivory hover:bg-amber rounded-[2px] px-8 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : restock ? "Notify Me" : "Send Message"}
      </button>
    </form>
  );
}
