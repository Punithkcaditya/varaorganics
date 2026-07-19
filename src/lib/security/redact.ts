/**
 * Redact sensitive fields before logging. Never log tokens, signatures, card
 * data, or full contact details. Used by the Shiprocket/Razorpay services and
 * API route error logging.
 */
const SENSITIVE_KEYS = [
  "password",
  "token",
  "authorization",
  "auth",
  "secret",
  "signature",
  "key_secret",
  "razorpay_signature",
  "apikey",
  "api_key",
  "access_token",
  "refresh_token",
  "phone",
  "email",
];

function isSensitive(key: string): boolean {
  const k = key.toLowerCase();
  return SENSITIVE_KEYS.some((s) => k.includes(s));
}

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[TRUNCATED]";
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = isSensitive(k) ? "[REDACTED]" : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

/** Structured server log with redaction. Avoids leaking secrets to stdout. */
export function safeLog(scope: string, message: string, meta?: Record<string, unknown>): void {
  const payload = meta ? redact(meta) : undefined;
  console.log(`[${scope}] ${message}`, payload ? JSON.stringify(payload) : "");
}

export function safeError(scope: string, message: string, meta?: Record<string, unknown>): void {
  const payload = meta ? redact(meta) : undefined;
  console.error(`[${scope}] ${message}`, payload ? JSON.stringify(payload) : "");
}
