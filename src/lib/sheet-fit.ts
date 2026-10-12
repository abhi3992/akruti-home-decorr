export const SHEET_FITS = [
  {
    id: "flat",
    label: "Flat bedsheet",
    help: "Traditional flat drape",
    extraPaise: 0,
    badge: "Default",
  },
  {
    id: "elastic",
    label: "Elastic fitted",
    help: "Snug fit, elastic all around",
    extraPaise: 25_000,
  },
  {
    id: "deep",
    label: "Deep Elastic Fitted",
    help: "Snug elastic fit, for mattresses above 8 inches",
    extraPaise: 45_000,
  },
] as const;

export type SheetFitId = (typeof SHEET_FITS)[number]["id"];

export function isBedsheet(category: string | null | undefined): boolean {
  return category === "bedsheet";
}

export function sheetFitById(id: string | null | undefined) {
  return SHEET_FITS.find((f) => f.id === id) || SHEET_FITS[0];
}

export function sheetFitExtraPaise(
  category: string | null | undefined,
  fitId: string | null | undefined
): number {
  if (!isBedsheet(category)) return 0;
  return sheetFitById(fitId).extraPaise;
}

export function sheetFitLabel(fitId: string | null | undefined): string {
  if (!fitId || fitId === "flat") return "";
  return sheetFitById(fitId).label;
}

export type MattressUnit = "in" | "cm";

export const MATTRESS_CHART: { name: string; length: number; width: number }[] = [
  { name: "Single", length: 72, width: 36 },
  { name: "Single XL", length: 78, width: 36 },
  { name: "Double", length: 75, width: 48 },
  { name: "Queen", length: 78, width: 60 },
  { name: "King", length: 78, width: 72 },
  { name: "Super King", length: 84, width: 78 },
];

export function fittedNeedsMattress(fitId: string | null | undefined): boolean {
  return fitId === "elastic" || fitId === "deep";
}

export function convertMeasure(
  value: number,
  from: MattressUnit,
  to: MattressUnit
): number {
  if (from === to || !Number.isFinite(value)) return value;
  const next = from === "in" ? value * 2.54 : value / 2.54;
  return Math.round(next * 10) / 10;
}

function formatMeasure(value: number): string {
  return String(Math.round(value * 10) / 10).replace(/\.0$/, "");
}

export function formatMattress(
  length: number,
  width: number,
  height: number,
  unit: MattressUnit
): string {
  return `${formatMeasure(length)} × ${formatMeasure(width)} × ${formatMeasure(height)} ${unit}`;
}

const MATTRESS_RE =
  /^(\d+(?:\.\d+)?) × (\d+(?:\.\d+)?) × (\d+(?:\.\d+)?) (in|cm)$/;

/** Empty for flat sheets. Throws when a fitted sheet is missing a real mattress size. */
export function normalizeMattress(
  value: string | null | undefined,
  fitId: string | null | undefined
): string {
  if (!fittedNeedsMattress(fitId)) return "";
  const match = (value || "").trim().match(MATTRESS_RE);
  if (!match) {
    throw new Error(
      "Enter your mattress length, width and height for a fitted sheet."
    );
  }
  const nums = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (nums.some((n) => !(n > 0) || n > 400)) {
    throw new Error("Enter a mattress size in inches or centimetres.");
  }
  return formatMattress(nums[0], nums[1], nums[2], match[4] as MattressUnit);
}
