"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import "easymde/dist/easymde.min.css";
import { Field, inputClass } from "@/components/forms/Field";
import type { Article, Category } from "@/types";

// SimpleMDE touches the DOM directly — load it client-side only.
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
  loading: () => <p className="text-sm text-navy/50">Loading editor…</p>,
});

const CATEGORIES: Category[] = ["ghee", "honey", "oils"];

/**
 * Learn-article editor for the marketer — write in a Google-Docs-like editor,
 * no Markdown syntax knowledge needed. Reading time is computed on save.
 *
 * Markdown convention: `#` renders as H2 on the article page (the title is the
 * only H1), so headings written here stay SEO-correct automatically.
 */
export function ArticleEditor({ article }: { article?: Article }) {
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [category, setCategory] = useState<Category>(article?.category ?? "ghee");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [body, setBody] = useState(article?.bodyMarkdown ?? "");
  const [metaTitle, setMetaTitle] = useState(article?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(article?.metaDescription ?? "");
  const [relatedProduct, setRelatedProduct] = useState(article?.relatedProduct ?? "");
  const [published, setPublished] = useState(article?.published ?? false);
  const [howto, setHowto] = useState(article?.enableHowtoSchema ?? false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const options = useMemo(
    () => ({
      spellChecker: false,
      status: false,
      placeholder: "Write the article. Use # for section headings.",
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "|",
        "preview",
      ] as const,
    }),
    [],
  );

  async function save() {
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title,
          excerpt,
          category,
          coverImage,
          bodyMarkdown: body,
          metaTitle,
          metaDescription,
          relatedProduct,
          published,
          enableHowtoSchema: howto,
          faqs: article?.faqs ?? [],
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("saved");
        setMessage(published ? "Saved and published." : "Saved as draft.");
      } else {
        setStatus("error");
        setMessage(data.message ?? "Could not save.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="title" required>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass(false)}
          />
        </Field>
        <Field label="Slug (URL)" htmlFor="slug" required>
          <input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="what-is-bilona-ghee"
            className={inputClass(false)}
          />
        </Field>
        <Field label="Category" htmlFor="category" required>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className={inputClass(false)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cover image URL" htmlFor="coverImage">
          <input
            id="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className={inputClass(false)}
          />
        </Field>
      </div>

      <Field label="Excerpt (2 sentences)" htmlFor="excerpt" required>
        <textarea
          id="excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={inputClass(false)}
        />
      </Field>

      <div>
        <p className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-navy/60">
          Article body
        </p>
        <SimpleMDE value={body} onChange={setBody} options={options} />
        <p className="mt-1 text-xs text-navy/45">
          Headings written with <code>#</code> render as H2 on the live page — the article title is
          the only H1.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Meta title (SEO)" htmlFor="metaTitle">
          <input
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className={inputClass(false)}
          />
        </Field>
        <Field label="Meta description (SEO)" htmlFor="metaDescription">
          <input
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className={inputClass(false)}
          />
        </Field>
        <Field label="Related product slug" htmlFor="relatedProduct">
          <input
            id="relatedProduct"
            value={relatedProduct}
            onChange={(e) => setRelatedProduct(e.target.value)}
            placeholder="a2-gir-cow-bilona-ghee-500ml"
            className={inputClass(false)}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="accent-navy"
          />
          Published (visible on the site)
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={howto}
            onChange={(e) => setHowto(e.target.checked)}
            className="accent-navy"
          />
          Enable HowTo schema (step-by-step articles)
        </label>
      </div>

      {message && (
        <p
          role="status"
          className={`rounded p-3 text-sm ${
            status === "error" ? "bg-danger/5 text-danger" : "bg-success/5 text-success"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={status === "saving"}
        className="rounded-[2px] bg-navy px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save article"}
      </button>
    </div>
  );
}
