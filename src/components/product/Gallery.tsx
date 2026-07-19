"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

/** Accessible image carousel with a thumbnail strip (Dev Kit §08, §19). */
export function Gallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return <div className="aspect-square w-full rounded bg-paper" aria-hidden="true" />;
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded border border-navy/10 bg-ivory">
        <Image
          src={current.url}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div
        className="mt-3 grid grid-cols-4 gap-3"
        role="tablist"
        aria-label={`${productName} images`}
      >
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`View image ${i + 1}`}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-square overflow-hidden rounded border transition-colors",
              i === active ? "border-amber" : "border-navy/10 hover:border-navy/30",
            )}
          >
            <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
