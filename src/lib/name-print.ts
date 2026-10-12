/** Extra charge for name customisation on towels / bathrobes (₹100). */
export const NAME_PRINT_FEE_PAISE = 10_000;
/** Extra charge for name customisation on baby dohars and baby quilts (₹150). */
export const BABY_NAME_PRINT_FEE_PAISE = 15_000;

const STANDARD_NAME_PRINT = new Set(["towel", "bathrobe"]);
const BABY_NAME_PRINT = new Set(["dohar", "dohars", "quilt", "quilts"]);

export function namePrintFeePaise(category: string | null | undefined): number {
  const id = (category || "").toLowerCase();
  if (BABY_NAME_PRINT.has(id)) return BABY_NAME_PRINT_FEE_PAISE;
  if (STANDARD_NAME_PRINT.has(id)) return NAME_PRINT_FEE_PAISE;
  return 0;
}

export function supportsNamePrint(category: string | null | undefined): boolean {
  return namePrintFeePaise(category) > 0;
}

export function namePrintNoun(category: string | null | undefined): string {
  const id = (category || "").toLowerCase();
  if (id === "bathrobe") return "bathrobe";
  if (id === "dohar" || id === "dohars") return "baby dohar";
  if (id === "quilt" || id === "quilts") return "baby quilt";
  return "towel";
}

export function normalizeCustomName(value: string | null | undefined): string {
  return (value || "").trim().replace(/\s+/g, " ").slice(0, 40);
}

export function lineUnitPaise(
  basePricePaise: number,
  customName: string | null | undefined,
  category?: string | null
): number {
  const name = normalizeCustomName(customName);
  return basePricePaise + (name ? namePrintFeePaise(category) : 0);
}

export function formatLineLabel(opts: {
  name: string;
  size: string;
  quantity: number;
  customName?: string | null;
  sheetFit?: string | null;
  mattress?: string | null;
}): string {
  const custom = normalizeCustomName(opts.customName);
  const print = custom ? ` · Name: “${custom}”` : "";
  const fit =
    opts.sheetFit && opts.sheetFit !== "flat"
      ? ` · ${opts.sheetFit === "elastic" ? "Elastic fitted" : opts.sheetFit === "deep" ? "Deep Elastic Fitted" : opts.sheetFit}`
      : opts.sheetFit === "flat"
        ? " · Flat bedsheet"
        : "";
  const mattress = opts.mattress ? ` · Mattress ${opts.mattress}` : "";
  return `${opts.name} · ${opts.size}${fit}${mattress}${print} × ${opts.quantity}`;
}
