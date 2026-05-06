const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-zinc-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-zinc-700";

interface RangeInputProps {
  label: string;
  minLabel?: string;
  maxLabel?: string;
  minValue: number;
  maxValue: number;
  maxLimited: boolean;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  onMaxLimitedChange: (limited: boolean) => void;
  formatValue?: (v: number) => string;
}

export function RangeInput({
  label,
  minLabel = "Mínimo",
  maxLabel = "Máximo",
  minValue,
  maxValue,
  maxLimited,
  onMinChange,
  onMaxChange,
  onMaxLimitedChange,
  formatValue = String,
}: RangeInputProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-300">
        {label}:{" "}
        <span className="text-zinc-400 font-normal">
          {formatValue(minValue)} –{" "}
          {maxLimited ? formatValue(maxValue) : "Sin límite"}
        </span>
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-zinc-500">{minLabel}</span>
          <input
            type="number"
            min={0}
            value={minValue}
            onChange={(e) => onMinChange(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">{maxLabel}</span>
            <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!maxLimited}
                onChange={(e) => onMaxLimitedChange(!e.target.checked)}
                className="accent-red-500 w-3.5 h-3.5 cursor-pointer"
              />
              Sin límite
            </label>
          </div>
          <input
            type="number"
            min={0}
            value={maxValue}
            disabled={!maxLimited}
            onChange={(e) => onMaxChange(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
