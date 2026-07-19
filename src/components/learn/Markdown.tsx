import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Markdown renderer with:
 *  - sanitization (rehype-sanitize; unsafe raw HTML disabled by default)
 *  - configurable heading offset. Learn articles pass offset=1 so `#`→H2,
 *    `##`→H3, `###`→H4 (the article title is the only H1 — Learn Brief §05).
 *    Product descriptions use offset=0 (standard mapping).
 *  - internal links open in the same tab; external links open in a new tab
 *    with rel="noopener noreferrer".
 *  - images render through a next/image wrapper (never raw <img>).
 */
function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function headingComponent(level: number) {
  // Never emit an <h1> from markdown — the page/article title is the only H1.
  const clamped = Math.min(6, Math.max(2, level));
  const styles: Record<number, string> = {
    2: "mt-10 mb-3 font-serif text-2xl font-semibold text-navy",
    3: "mt-8 mb-2 font-serif text-xl font-semibold text-navy",
    4: "mt-6 mb-2 font-sans text-lg font-semibold text-navy",
    5: "mt-4 mb-2 font-sans text-base font-semibold text-navy",
    6: "mt-4 mb-2 font-sans text-sm font-semibold text-navy",
  };
  const Tag = `h${clamped}` as "h2" | "h3" | "h4" | "h5" | "h6";
  return function Heading(props: ComponentPropsWithoutRef<"h2">) {
    return <Tag className={styles[clamped] ?? styles[4]} {...props} />;
  };
}

export function Markdown({ content, headingOffset = 0 }: { content: string; headingOffset?: number }) {
  const components: Components = {
    // Markdown level L → HTML heading (L + offset), clamped to h2..h6.
    // Article offset=1: # → H2, ## → H3, ### → H4 (Learn Brief §05).
    h1: headingComponent(1 + headingOffset),
    h2: headingComponent(2 + headingOffset),
    h3: headingComponent(3 + headingOffset),
    h4: headingComponent(4 + headingOffset),
    p: (props) => <p className="mb-4 text-[15px] font-light leading-relaxed text-navy/75" {...props} />,
    ul: (props) => <ul className="mb-4 list-disc space-y-1.5 pl-5 text-[15px] font-light text-navy/75" {...props} />,
    ol: (props) => <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-[15px] font-light text-navy/75" {...props} />,
    strong: (props) => <strong className="font-medium text-navy" {...props} />,
    a: ({ href, children, ...rest }) => {
      const target = href ?? "#";
      if (isExternal(target)) {
        return (
          <a
            href={target}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber underline underline-offset-2"
            {...rest}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={target} className="text-amber underline underline-offset-2">
          {children}
        </Link>
      );
    },
    img: ({ src, alt }) =>
      typeof src === "string" ? (
        <span className="my-6 block overflow-hidden rounded border border-navy/10">
          <Image
            src={src}
            alt={alt ?? ""}
            width={800}
            height={450}
            className="h-auto w-full object-cover"
          />
        </span>
      ) : null,
  };

  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/** Extract the `#`-level headings (rendered as H2) — used to build HowTo steps. */
export function extractH1Headings(markdown: string): string[] {
  return markdown
    .split("\n")
    .filter((line) => /^#\s+/.test(line))
    .map((line) => line.replace(/^#\s+/, "").trim());
}
