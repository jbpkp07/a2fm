export type Units = "?" | "??" | "??/?" | "%" | "s" | "m" | "h";

interface ValueUnits {
    value: number;
    units: Units;
}

export default ValueUnits;
