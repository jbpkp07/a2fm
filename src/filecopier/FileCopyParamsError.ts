import FileCopyParams from "./FileCopyParams";

type FileCopyParamsErrorOptions =
    | { readonly fromError: Error; readonly msg?: never }
    | { readonly fromError?: never; readonly msg: string };

class FileCopyParamsError extends Error {
    public readonly fileCopyParams: FileCopyParams;

    constructor(fileCopyParams: FileCopyParams, options?: FileCopyParamsErrorOptions) {
        super();

        this.fileCopyParams = fileCopyParams;

        this.name = options?.fromError?.name || "FileCopyParamsError";
        this.message = options?.fromError?.message || options?.msg || "File Copy Failed";

        if (options?.fromError?.stack) {
            this.stack = options.fromError.stack;
        }
    }

    private static extractMessageFrom(errorLike: unknown): string {
        const msg = (errorLike as Error)?.message;

        return typeof msg === "string" ? msg : "";
    }

    public static from(fileCopyParams: FileCopyParams, caughtError: unknown): FileCopyParamsError {
        if (caughtError instanceof FileCopyParamsError) {
            return caughtError;
        }

        if (caughtError instanceof Error) {
            return new FileCopyParamsError(fileCopyParams, { fromError: caughtError });
        }

        const msg = this.extractMessageFrom(caughtError);

        return new FileCopyParamsError(fileCopyParams, { msg });
    }
}

export default FileCopyParamsError;
