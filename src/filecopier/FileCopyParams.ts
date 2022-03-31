interface FileCopyParams {
    readonly id: string;
    readonly srcFilePath: string;
    readonly destFilePath: string;
    readonly fileSizeBytes: number;
    readonly modifiedTimeMs: number;
}

export default FileCopyParams;
