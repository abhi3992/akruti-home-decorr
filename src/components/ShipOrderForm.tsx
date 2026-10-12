"use client";

type Props = {
  orderId: string;
  shareAction: (formData: FormData) => Promise<void>;
  initialTrackingId?: string;
  initialTrackingUrl?: string;
  alreadyShipped?: boolean;
};

export function ShipOrderForm({
  orderId,
  shareAction,
  initialTrackingId = "",
  initialTrackingUrl = "",
  alreadyShipped = false,
}: Props) {
  return (
    <form
      action={shareAction}
      className="mt-3 w-full max-w-sm space-y-2 border border-[var(--line)] bg-[var(--bg)] p-3"
    >
      <input type="hidden" name="id" value={orderId} />
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
        {alreadyShipped ? "Update tracking" : "Share tracking & ship"}
      </p>
      <label className="block text-xs text-[var(--muted)]">
        Tracking ID
        <input
          name="trackingId"
          required
          defaultValue={initialTrackingId}
          placeholder="e.g. DTDC123456789"
          className="mt-1 w-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
      </label>
      <label className="block text-xs text-[var(--muted)]">
        Tracking link
        <input
          name="trackingUrl"
          type="url"
          required
          defaultValue={initialTrackingUrl}
          placeholder="https://…"
          className="mt-1 w-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
      </label>
      <button
        type="submit"
        className="btn btn-dark min-h-10 w-full px-3 py-2 text-[11px]"
      >
        {alreadyShipped
          ? "Update & email customer"
          : "Share tracking · mark shipped"}
      </button>
      <p className="text-[10px] leading-relaxed text-[var(--muted)]">
        Customer gets an email with tracking details and greetings. Order is
        marked shipped.
      </p>
    </form>
  );
}
