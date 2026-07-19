import { getStoreProducts } from "@/features/products/queries";
import { canonical, site } from "@/config/site";

export const runtime = "nodejs";
export const revalidate = 3600;

/**
 * Google Merchant Center product feed (RSS 2.0 + g: namespace).
 * One entry per purchasable variant. Regenerates hourly, so price/stock changes
 * flow through automatically.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const products = await getStoreProducts();

  const items = products.flatMap((product) =>
    product.variants
      .filter((v) => v.active && v.routeSlug)
      .map((variant) => {
        const url = canonical(`${product.routePrefix}/${variant.routeSlug}`);
        const image = product.images[0]
          ? `${site.url}${product.images[0].url}`
          : `${site.url}/placeholders/og-default.svg`;
        return `    <item>
      <g:id>${escapeXml(variant.sku)}</g:id>
      <g:title>${escapeXml(`${product.productName} — ${variant.size}`)}</g:title>
      <g:description>${escapeXml(product.shortDescription)}</g:description>
      <g:link>${escapeXml(url)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:availability>${variant.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${variant.price}.00 INR</g:price>
      <g:brand>${escapeXml(site.name)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${escapeXml(product.category)}</g:product_type>
    </item>`;
      }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${site.url}</link>
    <description>${escapeXml(site.description)}</description>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
