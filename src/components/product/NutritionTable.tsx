import type { NutritionInfo } from "@/types";

/** Nutritional information table (Dev Kit §08). */
export function NutritionTable({ info }: { info: NutritionInfo }) {
  return (
    <section aria-label="Nutritional information">
      <h2 className="mb-3 font-serif text-2xl font-semibold text-navy">Nutritional Information</h2>
      <table className="w-full border-collapse overflow-hidden rounded border border-navy/10 text-sm">
        <caption className="sr-only">Nutrition {info.servingSize}</caption>
        <thead>
          <tr className="bg-paper/50 text-left text-[11px] uppercase tracking-[0.1em] text-navy/50">
            <th scope="col" className="px-4 py-2.5">Nutrient</th>
            <th scope="col" className="px-4 py-2.5 text-right">{info.servingSize}</th>
          </tr>
        </thead>
        <tbody>
          {info.rows.map((row) => (
            <tr key={row.label} className="border-t border-navy/5">
              <td className="px-4 py-2.5 font-light text-navy/70">{row.label}</td>
              <td className="px-4 py-2.5 text-right font-medium text-navy">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
