import CopyParams from "./CopyParams";

type CopyParamsErrorOptions =
    | { readonly fromError: Error; readonly msg?: never }
    | { readonly fromError?: never; readonly msg: string };

class CopyParamsError extends Error {
    public readonly copyParams: CopyParams;

    constructor(copyParams: CopyParams, options?: CopyParamsErrorOptions) {
        super();

        this.copyParams = copyParams;

        this.name = options?.fromError?.name || "CopyParamsError";
        this.message = options?.fromError?.message || options?.msg || "Copy Failed";

        if (options?.fromError?.stack) {
            this.stack = options.fromError.stack;
        }
    }

    public static from(copyParams: CopyParams, caughtError: unknown): CopyParamsError {
        if (caughtError instanceof CopyParamsError) {
            return caughtError;
        }

        if (caughtError instanceof Error) {
            return new CopyParamsError(copyParams, { fromError: caughtError });
        }

        return new CopyParamsError(copyParams);
    }
}

export default CopyParamsError;

// const copyParams: CopyParams = { srcPath: "a", destPath: "b" };
// const error = new CopyParamsError(copyParams);
// //
// //
// //
// //
// //
// //
// //
// //

// const caughtError: unknown = new TypeError("Crap!");
// console.log(caughtError);
// const newError = CopyParamsError.from(copyParams, caughtError);

// if (caughtError instanceof Error) {
//     console.log(caughtError.name === newError.name, "\n");
//     console.log(caughtError.message === newError.message, "\n");
//     console.log(caughtError.stack === newError.stack, "\n");
// }
// console.log("\n\n");
// if (error instanceof CopyParamsError) {
//     console.log(error.name, "\n");
//     console.log(error.message, "\n");
//     console.log(error.stack, "\n");
//     console.log(error.srcPath, "\n");
//     console.log(error.destPath, "\n");
// }
// console.log("\n\n");
// if (newError instanceof CopyParamsError) {
//     console.log(newError.name, "\n");
//     console.log(newError.message, "\n");
//     console.log(newError.stack, "\n");
//     console.log(newError.srcPath, "\n");
//     console.log(newError.destPath, "\n");
// }
