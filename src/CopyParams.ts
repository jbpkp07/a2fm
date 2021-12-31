export interface CopyParams {
    readonly srcPath: string;
    readonly destPath: string;
    readonly error?: never;
}

export interface CopyParamsError {
    readonly srcPath: string;
    readonly destPath: string;
    readonly error: unknown;
}
