import validate from "../src/Validator";

const { MIN_SAFE_INTEGER, MAX_SAFE_INTEGER } = Number;

const numberValues: unknown[] = [
    undefined,
    null,
    true,
    false,
    void 10,
    { num: 10 },
    [10],
    "123",
    MIN_SAFE_INTEGER - 1,
    MAX_SAFE_INTEGER + 1,
    MIN_SAFE_INTEGER,
    MAX_SAFE_INTEGER,
    -1.5,
    -1,
    -0.5,
    -0,
    0,
    0.5,
    1,
    1.5,
    Number(100)
];

describe("Validator", () => {
    test("isPositiveSafeInteger", () => {
        const validations = numberValues.map((value) => validate(value).isPositiveSafeInteger);

        const expected = [
            false, // undefined
            false, // null
            false, // true
            false, // false
            false, // void 10
            false, // { num: 10 }
            false, // [10]
            false, // "123"
            false, // MIN_SAFE_INTEGER - 1
            false, // MAX_SAFE_INTEGER + 1
            false, // MIN_SAFE_INTEGER
            true, // MAX_SAFE_INTEGER
            false, // -1.5
            false, // -1
            false, // -0.5
            false, // -0
            false, // 0
            false, // 0.5
            true, // 1
            false, // 1.5
            true // Number(100)
        ];

        expect(validations).toStrictEqual(expected);
    });

    test("isSafeInteger", () => {
        const validations = numberValues.map((value) => validate(value).isSafeInteger);

        const expected = [
            false, // undefined
            false, // null
            false, // true
            false, // false
            false, // void 10
            false, // { num: 10 }
            false, // [10]
            false, // "123"
            false, // MIN_SAFE_INTEGER - 1
            false, // MAX_SAFE_INTEGER + 1
            true, // MIN_SAFE_INTEGER
            true, // MAX_SAFE_INTEGER
            false, // -1.5
            true, // -1
            false, // -0.5
            true, // -0
            true, // 0
            false, // 0.5
            true, // 1
            false, // 1.5
            true // Number(100)
        ];

        expect(validations).toStrictEqual(expected);
    });

    test("isSafeNumber", () => {
        const validations = numberValues.map((value) => validate(value).isSafeNumber);

        const expected = [
            false, // undefined
            false, // null
            false, // true
            false, // false
            false, // void 10
            false, // { num: 10 }
            false, // [10]
            false, // "123"
            false, // MIN_SAFE_INTEGER - 1
            false, // MAX_SAFE_INTEGER + 1
            true, // MIN_SAFE_INTEGER
            true, // MAX_SAFE_INTEGER
            true, // -1.5
            true, // -1
            true, // -0.5
            true, // -0
            true, // 0
            true, // 0.5
            true, // 1
            true, // 1.5
            true // Number(100)
        ];

        expect(validations).toStrictEqual(expected);
    });
});
