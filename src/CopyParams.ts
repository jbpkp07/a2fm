export interface CopyParams {
    srcPath: string;
    destPath: string;
    error?: never;
}

export interface CopyParamsError {
    srcPath: string;
    destPath: string;
    error: unknown;
}
