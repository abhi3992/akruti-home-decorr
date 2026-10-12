"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/** Thin top progress bar so product clicks feel responsive while the page loads. */
export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setActive(true);
    const done = window.setTimeout(() => setActive(false), 700);
    return () => window.clearTimeout(done);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }
      if (a.getAttribute("target") === "_blank") return;
      if (href === pathname) return;
      setActive(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
      aria-hidden
    >
      <div className="nav-progress-bar h-full w-full bg-[var(--accent)]" />
    </div>
  );
}
