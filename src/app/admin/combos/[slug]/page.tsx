import { notFound } from "next/navigation";
import { ComboEditor } from "@/components/admin/ComboEditor";
import { getAdminCombos } from "@/features/combos/queries";
import { getAllProducts } from "@/features/products/queries";

export const dynamic = "force-dynamic";

export default async function AdminComboEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [combos, products] = await Promise.all([getAdminCombos(), getAllProducts()]);
  const combo = combos.find((candidate) => candidate.slug === slug);
  if (!combo) notFound();

  return (
    <div>
      <h1 className="text-navy mb-1 font-serif text-3xl font-semibold">{combo.names.english}</h1>
      <p className="text-navy/55 mb-6 text-sm">
        /combos#{combo.slug} · {combo.checkout.sku}
      </p>
      <ComboEditor combo={combo} products={products.filter((product) => !product.isBundle)} />
    </div>
  );
}
