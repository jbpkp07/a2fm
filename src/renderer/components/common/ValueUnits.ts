type UnitsPercent = "%";
type UnitsTime = "?" | "s" | "m" | "h";
type UnitsSize = "??" | "B " | "KB" | "MB" | "GB" | "TB";
type UnitsRate = "??/?" | "B/s " | "KB/s" | "MB/s" | "GB/s" | "TB/s";

type Units = UnitsPercent | UnitsTime | UnitsSize | UnitsRate;

interface ValueUnits {
    value: number;
    units: Units;
}

export default ValueUnits;
export type { Units };
