import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { getAllProducts } from "@/features/products/queries";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getAllProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl font-semibold text-navy">{product.productName}</h1>
      <p className="mb-6 text-sm text-navy/55">/{product.routePrefix}/{product.slug}</p>
      <ProductEditor product={product} />
    </div>
  );
}
