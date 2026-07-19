import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Labeled input wrapper with accessible error wiring. */
export function Field({
  label,
  htmlFor,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-navy/60">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass = (hasError?: boolean) =>
  cn(
    "w-full rounded-[2px] border bg-white px-3 py-2.5 text-sm text-navy outline-none transition-colors focus:border-navy",
    hasError ? "border-danger" : "border-navy/15",
  );

/** Accessible error summary shown at the top of a form on submit failure. */
export function ErrorSummary({ errors }: { errors: { field: string; message: string }[] }) {
  if (errors.length === 0) return null;
  return (
    <div
      role="alert"
      tabIndex={-1}
      className="mb-6 rounded border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
    >
      <p className="mb-2 font-medium">Please fix the following:</p>
      <ul className="list-disc space-y-1 pl-5">
        {errors.map((e) => (
          <li key={e.field}>{e.message}</li>
        ))}
      </ul>
    </div>
  );
}
