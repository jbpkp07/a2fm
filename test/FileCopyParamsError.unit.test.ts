import FileCopyParams from "../src/FileCopyParams";
import FileCopyParamsError from "../src/FileCopyParamsError";

// prettier-ignore
const params: FileCopyParams = { srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10 };

//-----------------------------------------------------------------------------
// Align errors with line numbers
//
/* lineNumber 10 */ const fileCopyParamsError1 = new FileCopyParamsError(params, { msg: "" });
/* lineNumber 11 */ const fileCopyParamsError2 = new FileCopyParamsError(params, { msg: "123" });
/* lineNumber 12 */ const fromError1 = new Error();
/* lineNumber 13 */ const fromError2 = new TypeError("456");
/* lineNumber 14 */ const fromErrorLike1 = { message: 1234 };
/* lineNumber 15 */ const fromErrorLike2 = { message: "" };
/* lineNumber 16 */ const fromErrorLike3 = { message: "789" };
/* lineNumber 17 */ const fromNotErrorLike = { info: "abc" };
//-----------------------------------------------------------------------------

const extractLineNumber = (stack?: string): number | undefined => {
    const lineNumberPatterns = stack?.match(/[0-9]+:[0-9]+\)\n/g);
    const lineNumber = lineNumberPatterns && lineNumberPatterns[0]?.split(":")[0];

    return lineNumber ? parseInt(lineNumber, 10) : undefined;
};

const expectErrorToEqual = (error: FileCopyParamsError, expected: unknown[]) => {
    const { name, message, stack, fileCopyParams } = error;
    const lineNumber = extractLineNumber(stack);

    expect(name).toBe(expected[0]);
    expect(message).toBe(expected[1]);
    expect(lineNumber).toBe(expected[2]);
    expect(fileCopyParams).toStrictEqual(params);
};

const defaultName = "FileCopyParamsError";
const defaultMessage = "File Copy Failed";

describe("FileCopyParamsError", () => {
    test("basic initialization", () => {
        expectErrorToEqual(fileCopyParamsError1, [defaultName, defaultMessage, 10]);
    });

    test("basic initialization w/ msg", () => {
        expectErrorToEqual(fileCopyParamsError2, [defaultName, "123", 11]);
    });

    test("initialization from error", () => {
        const error = new FileCopyParamsError(params, { fromError: fromError1 });

        expectErrorToEqual(error, ["Error", defaultMessage, 12]);
    });

    test("initialization from error w/ msg", () => {
        const error = new FileCopyParamsError(params, { fromError: fromError2 });

        expectErrorToEqual(error, ["TypeError", "456", 13]);
    });

    test("from caught FileCopyParamsError", () => {
        let error: FileCopyParamsError;

        try {
            throw fileCopyParamsError2;
        } catch (err) {
            error = FileCopyParamsError.from(params, err);
        }

        expect(error).toBe(fileCopyParamsError2);
        expectErrorToEqual(error, [defaultName, "123", 11]);
    });

    test("from caught Error", () => {
        let error: FileCopyParamsError;

        try {
            throw fromError2;
        } catch (err) {
            error = FileCopyParamsError.from(params, err);
        }

        expect(error).not.toBe(fromError2);
        expectErrorToEqual(error, ["TypeError", "456", 13]);
    });

    test("from caught Error-like object (message not a string)", () => {
        let error: FileCopyParamsError;

        try {
            throw fromErrorLike1 as unknown;
        } catch (err) {
            error = FileCopyParamsError.from(params, err);
        }

        const { name, message, fileCopyParams } = error;

        expect(error).not.toBe(fromErrorLike1);
        expect(name).toBe(defaultName);
        expect(message).toBe(defaultMessage);
        expect(fileCopyParams).toStrictEqual(params);
    });

    test("from caught Error-like object (empty message)", () => {
        let error: FileCopyParamsError;

        try {
            throw fromErrorLike2 as unknown;
        } catch (err) {
            error = FileCopyParamsError.from(params, err);
        }

        const { name, message, fileCopyParams } = error;

        expect(error).not.toBe(fromErrorLike2);
        expect(name).toBe(defaultName);
        expect(message).toBe(defaultMessage);
        expect(fileCopyParams).toStrictEqual(params);
    });

    test("from caught Error-like object (good message)", () => {
        let error: FileCopyParamsError;

        try {
            throw fromErrorLike3 as unknown;
        } catch (err) {
            error = FileCopyParamsError.from(params, err);
        }

        const { name, message, fileCopyParams } = error;

        expect(error).not.toBe(fromErrorLike3);
        expect(name).toBe(defaultName);
        expect(message).toBe("789");
        expect(fileCopyParams).toStrictEqual(params);
    });

    test("from caught not-Error-like object", () => {
        let error: FileCopyParamsError;

        try {
            throw fromNotErrorLike as unknown;
        } catch (err) {
            error = FileCopyParamsError.from(params, err);
        }

        const { name, message, fileCopyParams } = error;

        expect(error).not.toBe(fromNotErrorLike);
        expect(name).toBe(defaultName);
        expect(message).toBe(defaultMessage);
        expect(fileCopyParams).toStrictEqual(params);
    });

    test("from caught string", () => {
        const stringError = "Error!!!";
        let error: FileCopyParamsError;

        try {
            throw stringError as unknown;
        } catch (err) {
            error = FileCopyParamsError.from(params, err);
        }

        const { name, message, fileCopyParams } = error;

        expect(error).not.toBe(stringError);
        expect(name).toBe(defaultName);
        expect(message).toBe(defaultMessage);
        expect(fileCopyParams).toStrictEqual(params);
    });
});
