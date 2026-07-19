import { BatchEditor } from "@/components/admin/BatchEditor";
import { getAllProducts } from "@/features/products/queries";

export const dynamic = "force-dynamic";

export default async function AdminBatchesPage() {
  const products = (await getAllProducts()).filter((p) => !p.isBundle);

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold text-navy">Batches</h1>
      <p className="mb-6 text-sm text-navy/60">
        Add a new batch with its lab results. Marking a batch active makes it the current batch —
        it&apos;s stamped onto new orders and shown on the product page.
      </p>
      <BatchEditor products={products} />
    </div>
  );
}
