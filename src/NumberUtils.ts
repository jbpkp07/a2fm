abstract class NumberUtils {
    public static ceil(this: void, num: number): number {
        return Math.ceil(num);
    }

    public static floor(this: void, num: number): number {
        return Math.floor(num);
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
}

export default NumberUtils;
