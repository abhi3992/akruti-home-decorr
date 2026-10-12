"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RestoreProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function restore() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/products/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Restore failed");
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={restore}
      className="text-xs text-[var(--accent)] disabled:opacity-50"
    >
      {busy ? "Restoring…" : "Restore to shop"}
    </button>
  );
}
