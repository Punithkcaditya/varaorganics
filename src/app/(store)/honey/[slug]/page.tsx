import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage } from "@/components/product/ProductPage";
import { resolveProductRoute } from "@/features/products/queries";
import { productStaticParams, productMetadata } from "@/features/products/route";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return productStaticParams("honey");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return productMetadata("honey", slug);
}

export default async function HoneyProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolved = await resolveProductRoute("honey", slug);
  if (!resolved) notFound();
  return <ProductPage product={resolved.product} variant={resolved.variant} />;
}
