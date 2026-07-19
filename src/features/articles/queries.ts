import "server-only";
import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError } from "@/lib/security/redact";
import { articles as mockArticles } from "@/data/articles";
import type { Article, Category, FaqItem } from "@/types";
import type { LearnContentRow } from "@/types/database";

function mapArticle(row: LearnContentRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category as Category,
    coverImage: row.cover_image,
    bodyMarkdown: row.body_markdown,
    faqs: (row.faqs as FaqItem[] | null) ?? [],
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    readTime: row.read_time ?? 3,
    relatedProduct: row.related_product,
    published: row.published,
    enableHowtoSchema: row.enable_howto_schema,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchPublished(): Promise<Article[]> {
  if (USE_MOCK_DATA) return mockArticles.filter((a) => a.published);
  const sb = getServerSupabase();
  if (!sb) return mockArticles.filter((a) => a.published);
  try {
    const { data, error } = await sb
      .from("learn_content")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as LearnContentRow[]).map(mapArticle);
  } catch (err) {
    // Never substitute demo articles for a live DB — an outage should be
    // visible, not papered over with seed content.
    safeError("articles", "DATABASE READ FAILED — returning no articles", { err: String(err) });
    return [];
  }
}

export const getPublishedArticles = cache(fetchPublished);

export const getArticlesByCategory = cache(async (): Promise<Record<Category, Article[]>> => {
  const all = await getPublishedArticles();
  return {
    ghee: all.filter((a) => a.category === "ghee"),
    oils: all.filter((a) => a.category === "oils"),
    honey: all.filter((a) => a.category === "honey"),
  };
});

export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  if (USE_MOCK_DATA) {
    return mockArticles.find((a) => a.slug === slug && a.published) ?? null;
  }
  const sb = getServerSupabase();
  if (!sb) return mockArticles.find((a) => a.slug === slug && a.published) ?? null;
  try {
    const { data, error } = await sb
      .from("learn_content")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    return data ? mapArticle(data as LearnContentRow) : null;
  } catch (err) {
    safeError("articles", "DATABASE READ FAILED — article unavailable", { err: String(err) });
    return null;
  }
});

export const getRelatedArticles = cache(
  async (article: Article, limit = 3): Promise<Article[]> => {
    const all = await getPublishedArticles();
    return all
      .filter((a) => a.category === article.category && a.slug !== article.slug)
      .slice(0, limit);
  },
);

/** Published slugs for generateStaticParams. */
export const getPublishedSlugs = cache(async (): Promise<string[]> => {
  const all = await getPublishedArticles();
  return all.map((a) => a.slug);
});

/** Fetch specific published articles by slug, preserving the given order. */
export const getArticlesBySlugs = cache(async (slugs: string[]): Promise<Article[]> => {
  if (slugs.length === 0) return [];
  const all = await getPublishedArticles();
  return slugs
    .map((slug) => all.find((a) => a.slug === slug))
    .filter((a): a is Article => Boolean(a));
});
