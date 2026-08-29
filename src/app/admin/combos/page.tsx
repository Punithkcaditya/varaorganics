import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getAdminCombos } from "@/features/combos/queries";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCombosPage() {
  const combos = await getAdminCombos();

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-navy font-serif text-3xl font-semibold">Combos</h1>
        <Link href="/combos" className="text-amber text-sm font-semibold hover:underline">
          View combo page →
        </Link>
      </div>
      <p className="text-navy/60 mb-6 text-sm">
        Edit all seven Excel-defined combos, their contents, prices, labels and visibility.
      </p>

      <div className="border-navy/10 overflow-x-auto rounded border bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-navy/10 text-navy/45 border-b text-left text-[11px] tracking-[0.1em] uppercase">
              <th scope="col" className="px-4 py-3">
                Combo
              </th>
              <th scope="col" className="px-4 py-3">
                Contents
              </th>
              <th scope="col" className="px-4 py-3">
                Price
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {combos.map((combo) => (
              <tr key={combo.id} className="border-navy/5 border-b last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/combos/${combo.slug}`}
                    className="text-navy hover:text-amber font-medium"
                  >
                    {combo.names.english}
                  </Link>
                  <p className="text-navy/45 mt-0.5 text-xs">{combo.names.kannada}</p>
                </td>
                <td className="text-navy/65 max-w-md px-4 py-3">
                  {combo.contents.map((item) => `${item.productName} ${item.variant}`).join(" · ")}
                </td>
                <td className="text-navy/65 px-4 py-3 whitespace-nowrap">
                  {formatPrice(combo.comboPrice)}{" "}
                  <span className="text-navy/35 line-through">
                    {formatPrice(combo.mrpIndividual)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Badge tone={combo.published ? "success" : "muted"}>
                    {combo.published ? "Live" : "Draft"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/combos/${combo.slug}`}
                    className="text-amber font-semibold hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
