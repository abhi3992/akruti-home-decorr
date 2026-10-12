"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { prepareImageForUpload } from "@/lib/compress-image";
import { SITE_IMAGES } from "@/lib/site-content";

/** @deprecated Prefer SiteImageUploader — kept for compatibility */
export function ReplaceFounderImage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onChange(file: File | null) {
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const prepared = await prepareImageForUpload(file);
      const uploadData = new FormData();
      uploadData.set("file", prepared);
      const up = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadData,
      });
      const uploaded = await up.json();
      if (!up.ok) throw new Error(uploaded.error || "Upload failed");

      const res = await fetch("/api/admin/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: SITE_IMAGES.founderImage.key,
          url: uploaded.url,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setMsg("Founder photo updated");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={busy}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      <button
        type="button"
        disabled={busy}
        className="btn btn-outline px-3 py-1.5 text-[11px] disabled:opacity-50"
        onClick={() => fileRef.current?.click()}
      >
        {busy ? "Uploading…" : "Upload / replace photo"}
      </button>
      {msg && <span className="text-[var(--muted)]">{msg}</span>}
    </div>
  );
}
