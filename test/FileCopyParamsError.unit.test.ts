import CopyParams from "../src/CopyParams";
import FileCopyParamsError from "../src/FileCopyParamsError";

// prettier-ignore
const params: CopyParams = { srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10 };

//-----------------------------------------------------------------------------
// Align errors with line numbers
//
/* lineNumber 10 */ const fileCopyParamsError1 = new FileCopyParamsError(params, { msg: "" });
/* lineNumber 11 */ const fileCopyParamsError2 = new FileCopyParamsError(params, { msg: "123" });
/* lineNumber 12 */ const fromError1 = new Error();
/* lineNumber 13 */ const fromError2 = new TypeError("456");
//-----------------------------------------------------------------------------

const extractLineNumber = (stack?: string): number | undefined => {
    const lineNumberPatterns = stack?.match(/[0-9]+:[0-9]+\)\n/g);
    const lineNumber = lineNumberPatterns && lineNumberPatterns[0]?.split(":")[0];

    return lineNumber ? parseInt(lineNumber, 10) : undefined;
};

const expectErrorToEqual = (error: FileCopyParamsError, expected: unknown[]) => {
    const { name, message, stack, copyParams } = error;
    const lineNumber = extractLineNumber(stack);

    expect(name).toBe(expected[0]);
    expect(message).toBe(expected[1]);
    expect(lineNumber).toBe(expected[2]);
    expect(copyParams).toStrictEqual(params);
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

    test("from caught string", () => {
        const stringError = "Error!!!";
        let error: FileCopyParamsError;

        try {
            throw stringError as unknown as Error;
        } catch (err) {
            error = FileCopyParamsError.from(params, err);
        }

        const { name, message, copyParams } = error;

        expect(error).not.toBe(stringError);
        expect(name).toBe(defaultName);
        expect(message).toBe(defaultMessage);
        expect(copyParams).toStrictEqual(params);
    });
});
