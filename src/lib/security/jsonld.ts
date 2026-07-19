/**
 * Safely serialize a JSON-LD object for embedding in a <script> tag.
 *
 * Escapes the characters that can break out of a script context or be abused
 * for XSS: `<`, `>`, `&`, and the U+2028 / U+2029 line separators. This turns a
 * malicious `</script>` inside DB-sourced content into an inert escape sequence.
 * Use with <script type="application/ld+json" dangerouslySetInnerHTML>.
 */
const BACKSLASH = String.fromCharCode(92);
const TARGETS = new RegExp(
  "[<>&" + String.fromCharCode(0x2028) + String.fromCharCode(0x2029) + "]",
  "g",
);

function escapeChar(char: string): string {
  return BACKSLASH + "u" + char.charCodeAt(0).toString(16).padStart(4, "0");
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(TARGETS, escapeChar);
}
