"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { formatINR } from "@/lib/utils";
import {
  normalizeCustomName,
  lineUnitPaise,
  namePrintFeePaise,
  namePrintNoun,
  supportsNamePrint,
} from "@/lib/name-print";
import {
  fittedNeedsMattress,
  formatMattress,
  isBedsheet,
  SHEET_FITS,
  sheetFitExtraPaise,
  type MattressUnit,
} from "@/lib/sheet-fit";
import { MattressSizeFields } from "./MattressSizeFields";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    priceInPaise: number;
    stock: number;
    category?: string;
  };
  image: string;
  sizes: string[];
};

export function AddToCart({ product, image, sizes }: Props) {
  const { addItem } = useCart();
  const [size, setSize] = useState(sizes[0] || "One size");
  const [added, setAdded] = useState(false);
  const [namePrint, setNamePrint] = useState(false);
  const [customName, setCustomName] = useState("");
  const [sheetFit, setSheetFit] = useState<(typeof SHEET_FITS)[number]["id"]>("flat");
  const [mattressUnit, setMattressUnit] = useState<MattressUnit>("in");
  const [mattressLength, setMattressLength] = useState("");
  const [mattressWidth, setMattressWidth] = useState("");
  const [mattressHeight, setMattressHeight] = useState("");
  const [error, setError] = useState("");

  const canNamePrint = supportsNamePrint(product.category);
  const nameFee = namePrintFeePaise(product.category);
  const bedsheet = isBedsheet(product.category);
  const fit = SHEET_FITS.find((f) => f.id === sheetFit) || SHEET_FITS[0];
  const needsMattress = bedsheet && fittedNeedsMattress(sheetFit);
  const unitPaise =
    lineUnitPaise(product.priceInPaise, namePrint ? customName : "", product.category) +
    sheetFitExtraPaise(product.category, sheetFit);

  function onAdd() {
    setError("");
    const name = namePrint ? normalizeCustomName(customName) : "";
    if (namePrint && !name) {
      setError("Enter the name for customisation, or turn it off.");
      return;
    }

    let mattress = "";
    if (needsMattress) {
      const length = Number(mattressLength);
      const width = Number(mattressWidth);
      const height = Number(mattressHeight);
      if (![length, width, height].every((n) => n > 0 && n <= 400)) {
        setError("Enter your mattress length, width and height.");
        return;
      }
      mattress = formatMattress(length, width, height, mattressUnit);
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      size,
      priceInPaise:
        lineUnitPaise(product.priceInPaise, name, product.category) +
        sheetFitExtraPaise(product.category, sheetFit),
      customName: name,
      sheetFit: bedsheet ? sheetFit : "",
      mattress,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm font-medium text-emerald-700">
        ✓ {product.stock} in stock
      </p>
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`min-h-11 min-w-16 border px-3 py-2.5 text-sm transition-colors ${
                size === s
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--line)] hover:border-[var(--ink)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {bedsheet && (
        <div>
          <p className="mb-3 font-[family-name:var(--font-display)] text-xl">
            Select Flat/Fitted
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SHEET_FITS.map((option) => {
              const selected = sheetFit === option.id;
              const wide = option.id === "flat";
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSheetFit(option.id)}
                  className={`relative rounded-xl border p-4 text-left ${
                    wide ? "sm:col-span-2" : ""
                  } ${
                    selected
                      ? "border-[var(--ink)] bg-[var(--bg)]"
                      : "border-[var(--line)] bg-[var(--surface)]"
                  }`}
                >
                  <span
                    className={`absolute right-3 top-3 h-4 w-4 rounded-full border-2 ${
                      selected
                        ? "border-[var(--ink)] bg-[var(--ink)] shadow-[inset_0_0_0_3px_white]"
                        : "border-[var(--line)]"
                    }`}
                  />
                  {"badge" in option && option.badge ? (
                    <span className="mb-2 inline-block rounded-full bg-[var(--line)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
                      {option.badge}
                    </span>
                  ) : null}
                  <span className="block pr-6 text-base font-semibold">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--muted)]">
                    {option.help}
                  </span>
                  {option.extraPaise > 0 && (
                    <span className="mt-2 block text-sm font-medium text-emerald-700">
                      + {formatINR(option.extraPaise)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {needsMattress && (
            <MattressSizeFields
              unit={mattressUnit}
              length={mattressLength}
              width={mattressWidth}
              height={mattressHeight}
              onUnit={setMattressUnit}
              onLength={setMattressLength}
              onWidth={setMattressWidth}
              onHeight={setMattressHeight}
            />
          )}
          <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{fit.label}</span>
              <span className="font-[family-name:var(--font-display)] text-2xl">
                {formatINR(unitPaise)}
              </span>
            </div>
            {fit.extraPaise > 0 && (
              <p className="mt-1 text-sm text-emerald-700">
                {formatINR(product.priceInPaise)} base + {formatINR(fit.extraPaise)}{" "}
                for fitted
              </p>
            )}
          </div>
        </div>
      )}

      {canNamePrint && (
        <div className="border border-[var(--line)] bg-[var(--bg)] p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[var(--accent)]"
              checked={namePrint}
              onChange={(e) => {
                setNamePrint(e.target.checked);
                setError("");
                if (!e.target.checked) setCustomName("");
              }}
            />
            <span>
              <span className="block text-sm font-medium text-[var(--ink)]">
                Add name customisation (+{formatINR(nameFee)})
              </span>
              <span className="mt-0.5 block text-xs text-[var(--muted)]">
                Personalise this {namePrintNoun(product.category)} with any
                name.
              </span>
            </span>
          </label>
          {namePrint && (
            <div className="mt-3">
              <label className="block text-xs text-[var(--muted)]">
                Name for customisation
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    setError("");
                  }}
                  maxLength={40}
                  placeholder="e.g. Aanya"
                  className="mt-1.5 w-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                />
              </label>
            </div>
          )}
        </div>
      )}

      <div>
        {!bedsheet && (
          <p className="font-[family-name:var(--font-display)] text-3xl">
            {formatINR(unitPaise)}
          </p>
        )}
        {canNamePrint && namePrint && normalizeCustomName(customName) && (
          <p className="mt-1 text-xs text-[var(--muted)]">
            Includes name customisation {formatINR(nameFee)}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={onAdd}
        disabled={product.stock < 1}
        className="btn btn-dark min-h-12 w-full disabled:opacity-40"
      >
        {product.stock < 1
          ? "Out of stock"
          : added
            ? "Added to cart"
            : "Add to cart"}
      </button>
    </div>
  );
}
