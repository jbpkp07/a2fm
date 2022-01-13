class NumberUtils {
    private constructor() {}

    public static ceil = (num: number): number => {
        return Math.ceil(num);
    };

    public static floor = (num: number): number => {
        return Math.floor(num);
    };

    public static round = (num: number): number => {
        return Math.round(num);
    };

    public static isInteger = (num: number): boolean => {
        return Number.isInteger(num);
    };

    public static isNegative = (num: number): boolean => {
        return num < 0;
    };

    public static isPositiveArrayIndex = (num: number): boolean => {
        return Number.isInteger(num) && num >= 1 && num < 4294967296;
    };

    public static isZero = (num: number): boolean => {
        return num === 0;
    };

    public static toIntegerPercentage = (ratio: number): number => {
        return Math.floor(ratio * 100);
    };

    public static toSeconds = (microseconds: number): number => {
        return microseconds / 1000000;
    };
}

export default NumberUtils;
