import NumberUtils from "../src/NumberUtils";

const { ceil, floor, isInteger, isNegative, isPositiveArrayIndex } = NumberUtils;

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
        const results = numbers.map(ceil);

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
        const results = numbers.map(floor);

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

    test("isInteger", () => {
        const results = numbers.map(isInteger);

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
        const results = numbers.map(isNegative);

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
        const results = numbers.map(isPositiveArrayIndex);

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
});
