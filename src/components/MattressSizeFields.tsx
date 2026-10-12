"use client";

import { useState } from "react";
import {
  MATTRESS_CHART,
  convertMeasure,
  type MattressUnit,
} from "@/lib/sheet-fit";

type Props = {
  unit: MattressUnit;
  length: string;
  width: string;
  height: string;
  onUnit: (unit: MattressUnit) => void;
  onLength: (value: string) => void;
  onWidth: (value: string) => void;
  onHeight: (value: string) => void;
};

export function MattressSizeFields({
  unit,
  length,
  width,
  height,
  onUnit,
  onLength,
  onWidth,
  onHeight,
}: Props) {
  const [chartOpen, setChartOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);

  function switchUnit(next: MattressUnit) {
    if (next === unit) return;
    const convert = (value: string) => {
      const n = Number(value);
      if (!value.trim() || !Number.isFinite(n)) return value;
      return String(convertMeasure(n, unit, next));
    };
    onLength(convert(length));
    onWidth(convert(width));
    onHeight(convert(height));
    onUnit(next);
  }

  function applyChart(row: (typeof MATTRESS_CHART)[number]) {
    const lengthIn = unit === "in" ? row.length : convertMeasure(row.length, "in", "cm");
    const widthIn = unit === "in" ? row.width : convertMeasure(row.width, "in", "cm");
    onLength(String(lengthIn));
    onWidth(String(widthIn));
    setChartOpen(false);
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="rounded-xl bg-[var(--bg)] px-4 py-3 text-sm leading-relaxed">
        We will add extra <strong>4–5 inches</strong> to your mattress height
        for a snug elastic wrap.
      </p>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Mattress dimensions</p>
          <div className="flex rounded-full bg-[var(--line)] p-0.5 text-xs">
            {(["in", "cm"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => switchUnit(option)}
                className={`min-h-8 rounded-full px-3 ${
                  unit === option
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--muted)]"
                }`}
              >
                {option === "in" ? "inch" : "cm"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 text-right">
          <button
            type="button"
            onClick={() => setChartOpen((open) => !open)}
            className="text-sm text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Standard size chart
          </button>
        </div>

        {chartOpen && (
          <ul className="mt-3 divide-y divide-[var(--line)] border border-[var(--line)] bg-[var(--surface)] text-sm">
            {MATTRESS_CHART.map((row) => (
              <li key={row.name}>
                <button
                  type="button"
                  onClick={() => applyChart(row)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[var(--bg)]"
                >
                  <span>{row.name}</span>
                  <span className="text-[var(--muted)]">
                    {row.length} × {row.width} in
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <DimensionField label="Length" value={length} onChange={onLength} />
          <DimensionField label="Width" value={width} onChange={onWidth} />
          <DimensionField label="Height" value={height} onChange={onHeight} />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
          Enter your mattress size, not bedsheet size —{" "}
          <button
            type="button"
            onClick={() => setHowOpen((open) => !open)}
            className="font-medium text-[var(--ink)] underline"
          >
            how to measure?
          </button>
        </p>
        {howOpen && (
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[var(--muted)]">
            <li>Length: head of the mattress to the foot.</li>
            <li>Width: one side to the other.</li>
            <li>Height: top of the mattress down to the base.</li>
          </ul>
        )}

        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
          Note: If extra fabric is required for your mattress size, plain white
          fabric may be added for proper fitting.
        </p>
      </div>
    </div>
  );
}

function DimensionField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs text-[var(--muted)]">
      {label}
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
        className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
      />
    </label>
  );
}
