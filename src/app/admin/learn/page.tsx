import Link from "next/link";
import { getPublishedArticles } from "@/features/articles/queries";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold text-navy">Learn articles</h1>
        <Link
          href="/admin/learn/new"
          className="rounded-[2px] bg-navy px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ivory hover:bg-amber"
        >
          New article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="rounded border border-navy/10 bg-white p-6 text-sm text-navy/55">
          No published articles yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-navy/10 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-left text-[11px] uppercase tracking-[0.1em] text-navy/45">
                <th scope="col" className="px-4 py-3">Title</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Updated</th>
                <th scope="col" className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/learn/${a.slug}`}
                      className="font-medium text-navy hover:text-amber"
                    >
                      {a.title}
                    </Link>
                    <span className="block text-xs text-navy/45">/learn/{a.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-navy/65">{a.category}</td>
                  <td className="px-4 py-3 text-navy/65">{formatDate(a.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge tone={a.published ? "success" : "muted"}>
                      {a.published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
