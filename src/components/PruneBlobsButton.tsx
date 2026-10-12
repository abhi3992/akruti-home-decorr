"use client";

import { useState } from "react";

export function PruneBlobsButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function removeUnused() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/blobs/prune", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not remove unused files");
      setMessage(
        json.removed
          ? `Removed ${json.removed} unused file${json.removed === 1 ? "" : "s"} from storage. ${json.kept} photos still in use were kept.`
          : `No unused files. ${json.kept} photos in use were kept.`
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not remove unused files");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={removeUnused}
        disabled={busy}
        className="btn btn-outline min-h-10 px-4 text-[11px] disabled:opacity-50"
      >
        {busy ? "Removing…" : "Remove unused photos from storage"}
      </button>
      {message && <p className="mt-2 text-sm text-[var(--muted)]">{message}</p>}
    </div>
  );
}
