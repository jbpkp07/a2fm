import NumberUtils from "../src/NumberUtils";

const { MIN_SAFE_INTEGER, MAX_SAFE_INTEGER } = Number;

const numbers: number[] = [
    -Infinity,
    MIN_SAFE_INTEGER - 1,
    MIN_SAFE_INTEGER,
    -4294967296,
    -1.5,
    -1,
    -0.5,
    -0,
    0,
    0.5,
    1,
    1.5,
    4294967296 - 1,
    4294967296,
    MAX_SAFE_INTEGER,
    MAX_SAFE_INTEGER + 1,
    Infinity
];

describe("NumberUtils", () => {
    test("ceil", () => {
        const results = numbers.map(NumberUtils.ceil);

        const expected = [
            -Infinity, // -Infinity
            MIN_SAFE_INTEGER - 1, // MIN_SAFE_INTEGER - 1
            MIN_SAFE_INTEGER, // MIN_SAFE_INTEGER
            -4294967296, // -4294967296
            -1, // -1.5
            -1, // -1
            -0, // -0.5
            -0, // -0
            0, // 0
            1, // 0.5
            1, // 1
            2, // 1.5
            4294967296 - 1, // 4294967296 - 1
            4294967296, // 4294967296
            MAX_SAFE_INTEGER, // MAX_SAFE_INTEGER
            MAX_SAFE_INTEGER + 1, // MAX_SAFE_INTEGER + 1
            Infinity // Infinity
        ];

        expect(results).toStrictEqual(expected);
    });

    test("floor", () => {
        const results = numbers.map(NumberUtils.floor);

        const expected = [
            -Infinity, // -Infinity
            MIN_SAFE_INTEGER - 1, // MIN_SAFE_INTEGER - 1
            MIN_SAFE_INTEGER, // MIN_SAFE_INTEGER
            -4294967296, // -4294967296
            -2, // -1.5
            -1, // -1
            -1, // -0.5
            -0, // -0
            0, // 0
            0, // 0.5
            1, // 1
            1, // 1.5
            4294967296 - 1, // 4294967296 - 1
            4294967296, // 4294967296
            MAX_SAFE_INTEGER, // MAX_SAFE_INTEGER
            MAX_SAFE_INTEGER + 1, // MAX_SAFE_INTEGER + 1
            Infinity // Infinity
        ];

        expect(results).toStrictEqual(expected);
    });

    test("round", () => {
        const results = numbers.map(NumberUtils.round);

        const expected = [
            -Infinity, // -Infinity
            MIN_SAFE_INTEGER - 1, // MIN_SAFE_INTEGER - 1
            MIN_SAFE_INTEGER, // MIN_SAFE_INTEGER
            -4294967296, // -4294967296
            -1, // -1.5
            -1, // -1
            -0, // -0.5
            -0, // -0
            0, // 0
            1, // 0.5
            1, // 1
            2, // 1.5
            4294967296 - 1, // 4294967296 - 1
            4294967296, // 4294967296
            MAX_SAFE_INTEGER, // MAX_SAFE_INTEGER
            MAX_SAFE_INTEGER + 1, // MAX_SAFE_INTEGER + 1
            Infinity // Infinity
        ];

        expect(results).toStrictEqual(expected);
    });

    test("isInteger", () => {
        const results = numbers.map(NumberUtils.isInteger);

        const expected = [
            false, // -Infinity
            true, // MIN_SAFE_INTEGER - 1
            true, // MIN_SAFE_INTEGER
            true, // -4294967296
            false, // -1.5
            true, // -1
            false, // -0.5
            true, // -0
            true, // 0
            false, // 0.5
            true, // 1
            false, // 1.5
            true, // 4294967296 - 1
            true, // 4294967296
            true, // MAX_SAFE_INTEGER
            true, // MAX_SAFE_INTEGER + 1
            false // Infinity
        ];

        expect(results).toStrictEqual(expected);
    });

    test("isNegative", () => {
        const results = numbers.map(NumberUtils.isNegative);

        const expected = [
            true, // -Infinity
            true, // MIN_SAFE_INTEGER - 1
            true, // MIN_SAFE_INTEGER
            true, // -4294967296
            true, // -1.5
            true, // -1
            true, // -0.5
            false, // -0
            false, // 0
            false, // 0.5
            false, // 1
            false, // 1.5
            false, // 4294967296 - 1
            false, // 4294967296
            false, // MAX_SAFE_INTEGER
            false, // MAX_SAFE_INTEGER + 1
            false // Infinity
        ];

        expect(results).toStrictEqual(expected);
    });

    test("isPositiveArrayIndex", () => {
        const results = numbers.map(NumberUtils.isPositiveArrayIndex);

        const expected = [
            false, // -Infinity
            false, // MIN_SAFE_INTEGER - 1
            false, // MIN_SAFE_INTEGER
            false, // -4294967296
            false, // -1.5
            false, // -1
            false, // -0.5
            false, // -0
            false, // 0
            false, // 0.5
            true, // 1
            false, // 1.5
            true, // 4294967296 - 1
            false, // 4294967296
            false, // MAX_SAFE_INTEGER
            false, // MAX_SAFE_INTEGER + 1
            false // Infinity
        ];

        expect(results).toStrictEqual(expected);
    });

    test("isZero", () => {
        const results = numbers.map(NumberUtils.isZero);

        const expected = [
            false, // -Infinity
            false, // MIN_SAFE_INTEGER - 1
            false, // MIN_SAFE_INTEGER
            false, // -4294967296
            false, // -1.5
            false, // -1
            false, // -0.5
            true, // -0
            true, // 0
            false, // 0.5
            false, // 1
            false, // 1.5
            false, // 4294967296 - 1
            false, // 4294967296
            false, // MAX_SAFE_INTEGER
            false, // MAX_SAFE_INTEGER + 1
            false // Infinity
        ];

        expect(results).toStrictEqual(expected);
    });

    test("toIntegerPercentage", () => {
        const results = numbers.map(NumberUtils.toIntegerPercentage);

        const expected = [
            -Infinity, // -Infinity
            (MIN_SAFE_INTEGER - 1) * 100, // MIN_SAFE_INTEGER - 1
            MIN_SAFE_INTEGER * 100, // MIN_SAFE_INTEGER
            -4294967296 * 100, // -4294967296
            -150, // -1.5
            -100, // -1
            -50, // -0.5
            -0, // -0
            0, // 0
            50, // 0.5
            100, // 1
            150, // 1.5
            (4294967296 - 1) * 100, // 4294967296 - 1
            4294967296 * 100, // 4294967296
            MAX_SAFE_INTEGER * 100, // MAX_SAFE_INTEGER
            (MAX_SAFE_INTEGER + 1) * 100, // MAX_SAFE_INTEGER + 1
            Infinity // Infinity
        ];

        expect(results).toStrictEqual(expected);
    });

    test("toSeconds", () => {
        const results = numbers.map(NumberUtils.toSeconds);

        const expected = [
            -Infinity, // -Infinity
            (MIN_SAFE_INTEGER - 1) / 1000, // MIN_SAFE_INTEGER - 1
            MIN_SAFE_INTEGER / 1000, // MIN_SAFE_INTEGER
            -4294967296 / 1000, // -4294967296
            -0.0015, // -1.5
            -0.001, // -1
            -0.0005, // -0.5
            -0, // -0
            0, // 0
            0.0005, // 0.5
            0.001, // 1
            0.0015, // 1.5
            (4294967296 - 1) / 1000, // 4294967296 - 1
            4294967296 / 1000, // 4294967296
            MAX_SAFE_INTEGER / 1000, // MAX_SAFE_INTEGER
            (MAX_SAFE_INTEGER + 1) / 1000, // MAX_SAFE_INTEGER + 1
            Infinity // Infinity
        ];

        expect(results).toStrictEqual(expected);
    });
});
