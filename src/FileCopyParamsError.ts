import CopyParams from "./CopyParams";

type FileCopyParamsErrorOptions =
    | { readonly fromError: Error; readonly msg?: never }
    | { readonly fromError?: never; readonly msg: string };

class FileCopyParamsError extends Error {
    public readonly copyParams: CopyParams;

    constructor(copyParams: CopyParams, options?: FileCopyParamsErrorOptions) {
        super();

        this.copyParams = copyParams;

        this.name = options?.fromError?.name || "FileCopyParamsError";
        this.message = options?.fromError?.message || options?.msg || "File Copy Failed";

        if (options?.fromError?.stack) {
            this.stack = options.fromError.stack;
        }
    }

    public static from(copyParams: CopyParams, caughtError: unknown): FileCopyParamsError {
        if (caughtError instanceof FileCopyParamsError) {
            return caughtError;
        }

        if (caughtError instanceof Error) {
            return new FileCopyParamsError(copyParams, { fromError: caughtError });
        }

        return new FileCopyParamsError(copyParams);
    }
}

export default FileCopyParamsError;
