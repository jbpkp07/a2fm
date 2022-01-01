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
