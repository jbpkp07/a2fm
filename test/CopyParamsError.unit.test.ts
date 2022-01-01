import CopyParams from "../src/CopyParams";
import CopyParamsError from "../src/CopyParamsError";

const params: CopyParams = {
    srcPath: "a",
    destPath: "b"
};

//-----------------------------------------------------------------------------
/* lineNumber 10 */ const copyParamsError1 = new CopyParamsError(params, { msg: "" });
/* lineNumber 11 */ const copyParamsError2 = new CopyParamsError(params, { msg: "123" });
/* lineNumber 12 */ const fromError1 = new Error();
/* lineNumber 13 */ const fromError2 = new TypeError("456");
//-----------------------------------------------------------------------------

const extractLineNumber = (stack?: string): number | undefined => {
    const lineNumberPatterns = stack?.match(/[0-9]+:[0-9]+\)\n/g);
    const lineNumber = lineNumberPatterns && lineNumberPatterns[0]?.split(":")[0];

    return lineNumber ? parseInt(lineNumber, 10) : undefined;
};

const expectCopyParamsErrorToEqual = (error: CopyParamsError, expected: unknown[]) => {
    const { name, message, stack, copyParams } = error;
    const lineNumber = extractLineNumber(stack);

    expect(name).toBe(expected[0]);
    expect(message).toBe(expected[1]);
    expect(lineNumber).toBe(expected[2]);
    expect(copyParams).toStrictEqual({ srcPath: "a", destPath: "b" });
};

const defaultName = copyParamsError1.constructor.name;
const defaultMessage = "Copy Failed";

describe("CopyParamsError", () => {
    test("basic initialization", () => {
        expectCopyParamsErrorToEqual(copyParamsError1, [defaultName, defaultMessage, 10]);
    });

    test("basic initialization w/ msg", () => {
        expectCopyParamsErrorToEqual(copyParamsError2, [defaultName, "123", 11]);
    });

    test("initialization from error", () => {
        const copyParamsError3 = new CopyParamsError(params, { fromError: fromError1 });

        expectCopyParamsErrorToEqual(copyParamsError3, ["Error", defaultMessage, 12]);
    });

    test("initialization from error w/ msg", () => {
        const copyParamsError4 = new CopyParamsError(params, { fromError: fromError2 });

        expectCopyParamsErrorToEqual(copyParamsError4, ["TypeError", "456", 13]);
    });

    test("from caught CopyParamsError", () => {
        let copyParamsError5: CopyParamsError;

        try {
            throw copyParamsError2;
        } catch (error) {
            copyParamsError5 = CopyParamsError.from(params, error);
        }

        expect(copyParamsError5).toBe(copyParamsError2);
        expectCopyParamsErrorToEqual(copyParamsError5, [defaultName, "123", 11]);
    });

    test("from caught Error", () => {
        let copyParamsError6: CopyParamsError;

        try {
            throw fromError2;
        } catch (error) {
            copyParamsError6 = CopyParamsError.from(params, error);
        }

        expect(copyParamsError6).not.toBe(fromError2);
        expectCopyParamsErrorToEqual(copyParamsError6, ["TypeError", "456", 13]);
    });

    test("from caught string", () => {
        const err = "Error!!!";
        let copyParamsError7: CopyParamsError;

        try {
            throw err as unknown as Error;
        } catch (error) {
            copyParamsError7 = CopyParamsError.from(params, error);
        }

        const { name, message, copyParams } = copyParamsError7;

        expect(copyParamsError7).not.toBe(err);
        expect(name).toBe(defaultName);
        expect(message).toBe(defaultMessage);
        expect(copyParams).toStrictEqual({ srcPath: "a", destPath: "b" });
    });
});
