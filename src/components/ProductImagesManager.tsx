"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isExternalImage } from "@/lib/utils";
import { prepareImageForUpload } from "@/lib/compress-image";

type Props = {
  productId: string;
  images: string[];
};

export function ProductImagesManager({ productId, images: initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setBusy(true);
    setMsg("");
    try {
      const urls: string[] = [];
      for (const file of list) {
        const prepared = await prepareImageForUpload(file);
        const uploadData = new FormData();
        uploadData.set("file", prepared);
        const up = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploaded = await up.json();
        if (!up.ok) throw new Error(uploaded.error || "Upload failed");
        urls.push(uploaded.url);
      }

      const res = await fetch("/api/admin/products/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, add: urls }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setMsg(
        urls.length === 1 ? "Photo added" : `${urls.length} photos added`
      );
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function patch(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/products/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, ...body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setMsg(okMsg);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex flex-wrap gap-2">
        {initial.map((src, i) => (
          <div
            key={`${src.slice(0, 48)}-${i}`}
            className="relative h-20 w-16 overflow-hidden border border-[var(--line)] bg-[var(--bg)]"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
              unoptimized={isExternalImage(src)}
            />
            {i === 0 && (
              <span className="absolute left-0 top-0 bg-[var(--ink)] px-1 py-0.5 text-[9px] uppercase tracking-wide text-white">
                Main
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex gap-0.5 bg-black/55 p-0.5">
              {i !== 0 && (
                <button
                  type="button"
                  disabled={busy}
                  className="flex-1 text-[9px] text-white disabled:opacity-50"
                  onClick={() => patch({ makePrimary: src }, "Set as main")}
                >
                  Main
                </button>
              )}
              <button
                type="button"
                disabled={busy || initial.length <= 1}
                className="flex-1 text-[9px] text-white disabled:opacity-40"
                onClick={() => patch({ remove: src }, "Photo removed")}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
          }}
        />
        <button
          type="button"
          disabled={busy}
          className="btn btn-outline px-3 py-1.5 text-[11px] disabled:opacity-50"
          onClick={() => fileRef.current?.click()}
        >
          {busy ? "Uploading…" : "Add photos"}
        </button>
        {msg && <span className="text-[var(--muted)]">{msg}</span>}
      </div>
      <p className="text-[10px] text-[var(--muted)]">
        Up to 5MB each · multiple files OK · first photo is main
      </p>
    </div>
  );
}
