"use client";

import { useState } from "react";
import Image from "next/image";
import { isExternalImage } from "@/lib/utils";

type Props = {
  name: string;
  images: string[];
};

export function ProductGallery({ name, images }: Props) {
  const list =
    images.length > 0 ? images : ["/products/sky-voyage.jpg"];
  const [active, setActive] = useState(0);
  const main = list[Math.min(active, list.length - 1)];

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--line)]">
        <Image
          src={main}
          alt={name}
          fill
          priority
          quality={90}
          unoptimized={isExternalImage(main)}
          className="object-cover"
          sizes="(max-width:768px) 100vw, 50vw"
        />
      </div>

      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-14 shrink-0 overflow-hidden border-2 transition ${
                i === active
                  ? "border-[var(--ink)]"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
                unoptimized={isExternalImage(src)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
