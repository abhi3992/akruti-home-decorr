"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent } from "@/lib/site-content";

const FIELDS: { key: keyof SiteContent; label: string; rows?: number }[] = [
  { key: "announcement", label: "Top announcement bar" },
  { key: "heroEyebrow", label: "Hero eyebrow" },
  { key: "heroTitle", label: "Hero title" },
  { key: "heroSubtitle", label: "Hero subtitle", rows: 2 },
  { key: "homeStoryEyebrow", label: "Home story eyebrow" },
  { key: "homeStoryTitle", label: "Home story title" },
  { key: "homeStoryTitleAccent", label: "Home story title (accent italic)" },
  { key: "homeStoryP1", label: "Home story paragraph 1", rows: 3 },
  { key: "homeStoryPull", label: "Home story pull quote" },
  { key: "homeStoryP2", label: "Home story paragraph 2", rows: 3 },
  { key: "founderEyebrow", label: "Founder eyebrow" },
  { key: "founderTitle", label: "Founder title" },
  { key: "founderTitleAccent", label: "Founder title accent" },
  { key: "founderP1", label: "Founder paragraph 1", rows: 3 },
  { key: "founderP2", label: "Founder paragraph 2", rows: 3 },
  { key: "founderTagline", label: "Founder tagline" },
  { key: "ctaTitle", label: "Bottom CTA title" },
  { key: "ctaBody", label: "Bottom CTA body", rows: 2 },
  { key: "aboutIntro", label: "About page intro", rows: 2 },
  { key: "aboutEyebrow", label: "About story eyebrow" },
  { key: "aboutTitle", label: "About story title" },
  { key: "aboutTitleAccent", label: "About story title accent" },
  { key: "aboutP1", label: "About paragraph 1", rows: 4 },
  { key: "aboutPull", label: "About pull quote" },
  { key: "aboutP2", label: "About paragraph 2", rows: 4 },
  { key: "aboutP3", label: "About paragraph 3", rows: 3 },
  { key: "aboutP4", label: "About paragraph 4", rows: 2 },
  { key: "footerTagline", label: "Footer tagline", rows: 2 },
  { key: "footerContact", label: "Footer contact text", rows: 2 },
  { key: "instagramUrl", label: "Instagram profile URL" },
  { key: "whatsappNumber", label: "WhatsApp number (with country code)" },
];

export function SiteContentForm({ initial }: { initial: SiteContent }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const content: Record<string, string> = {};
    for (const { key } of FIELDS) {
      content[key] = String(fd.get(key) || "");
    }
    try {
      const res = await fetch("/api/admin/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      setMsg("Site text saved");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid max-w-3xl gap-3 text-sm">
      {FIELDS.map(({ key, label, rows }) => (
        <label key={key} className="block">
          <span className="mb-1 block text-xs text-[var(--muted)]">{label}</span>
          {rows && rows > 1 ? (
            <textarea
              name={key}
              rows={rows}
              defaultValue={initial[key]}
              className="w-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
            />
          ) : (
            <input
              name={key}
              defaultValue={initial[key]}
              className="w-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
            />
          )}
        </label>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="btn btn-dark disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save site text"}
        </button>
        {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
      </div>
    </form>
  );
}
