"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isExternalImage } from "@/lib/utils";
import { prepareImageForUpload } from "@/lib/compress-image";

type Props = {
  settingKey: string;
  label: string;
  help: string;
  currentUrl: string;
};

export function SiteImageUploader({
  settingKey,
  label,
  help,
  currentUrl,
}: Props) {
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
        body: JSON.stringify({ key: settingKey, url: uploaded.url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setMsg("Updated — live site refreshed");
      router.refresh();
      // Nudge full navigation cache for the storefront
      try {
        await fetch("/?_rsc=" + Date.now(), { cache: "no-store" });
      } catch {
        /* ignore */
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3 border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-end">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden bg-[var(--bg)]">
        <Image
          src={currentUrl}
          alt={label}
          fill
          className="object-contain"
          sizes="112px"
          unoptimized={isExternalImage(currentUrl)}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{help}</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={busy}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            className="btn btn-outline px-3 py-1.5 text-[11px] disabled:opacity-50"
            onClick={() => fileRef.current?.click()}
          >
            {busy ? "Uploading…" : "Upload / replace"}
          </button>
          {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
