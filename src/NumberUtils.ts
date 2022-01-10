class NumberUtils {
    private constructor() {}

    public static ceil(this: void, num: number): number {
        return Math.ceil(num);
    }

    public static floor(this: void, num: number): number {
        return Math.floor(num);
    }

    public static round(this: void, num: number): number {
        return Math.round(num);
    }

    public static isInteger(this: void, num: number): boolean {
        return Number.isInteger(num);
    }

    public static isNegative(this: void, num: number): boolean {
        return num < 0;
    }

    public static isPositiveArrayIndex(this: void, num: number): boolean {
        return Number.isInteger(num) && num >= 1 && num < 4294967296;
    }

    public static isZero(this: void, num: number): boolean {
        return num === 0;
    }

    public static toIntegerPercentage(this: void, ratio: number): number {
        return Math.floor(ratio * 100);
    }

    public static toSeconds(this: void, milliseconds: number): number {
        return milliseconds / 1000;
    }
}

export default NumberUtils;
