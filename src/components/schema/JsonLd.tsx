import { serializeJsonLd } from "@/lib/security/jsonld";

/** Renders a JSON-LD block with safe serialization (prevents script breakout). */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
