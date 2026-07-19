import { NextResponse } from "next/server";
import { safeError } from "@/lib/security/redact";

/** Consistent JSON responses. Never leaks raw errors to clients (§23). */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, ...data }, init);
}

export function fail(status: number, code: string, message?: string) {
  return NextResponse.json({ ok: false, code, message: message ?? code }, { status });
}

export function serverError(scope: string, err: unknown) {
  safeError(scope, "unhandled error", { err: String(err) });
  return fail(500, "server_error", "Something went wrong. Please try again.");
}
