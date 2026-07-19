import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { getArticleBySlug } from "@/features/articles/queries";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-1 font-serif text-3xl font-semibold text-navy">Edit article</h1>
      <p className="mb-6 text-sm text-navy/55">/learn/{article.slug}</p>
      <ArticleEditor article={article} />
    </div>
  );
}
