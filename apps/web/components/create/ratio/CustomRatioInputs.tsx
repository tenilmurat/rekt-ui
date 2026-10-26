"use client";

/** Two numbers that define the output ratio; they only appear for Custom. */
export function CustomRatioInputs({
  width,
  height,
  onWidth,
  onHeight,
}: {
  width: number;
  height: number;
  onWidth: (n: number) => void;
  onHeight: (n: number) => void;
}) {
  const field = {
    backgroundColor: "var(--surface-raised)",
    borderColor: "var(--line)",
    color: "var(--ink)",
  } as const;

  return (
    <div className="flex flex-wrap gap-[16px]">
      <div className="flex flex-col gap-[8px]">
        <label htmlFor="rekt-ratio-width" className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
          Width
        </label>
        <input
          id="rekt-ratio-width"
          type="number"
          min={1}
          value={width}
          onChange={(e) => onWidth(Number(e.target.value))}
          className="w-[104px] rounded-[8px] border px-[10px] py-[6px] font-mono text-[12px]"
          style={field}
        />
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="rekt-ratio-height" className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
          Height
        </label>
        <input
          id="rekt-ratio-height"
          type="number"
          min={1}
          value={height}
          onChange={(e) => onHeight(Number(e.target.value))}
          className="w-[104px] rounded-[8px] border px-[10px] py-[6px] font-mono text-[12px]"
          style={field}
        />
      </div>
    </div>
  );
}
