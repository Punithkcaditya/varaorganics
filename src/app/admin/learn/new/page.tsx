import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-semibold text-navy">New article</h1>
      <ArticleEditor />
    </div>
  );
}
