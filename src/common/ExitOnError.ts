interface FileCopyParams {
    readonly id: string;
    readonly srcFilePath: string;
    readonly destFilePath: string;
    readonly fileSizeBytes: number;
}

interface CopyError extends Error {
    readonly fileCopyParams: FileCopyParams;
}

class ExitOnError {
    private constructor() {}

    public static exitOnError = (error: unknown) => {
        console.clear();
        console.log(error);
        process.exit(1);
    };

    public static exitOnFileCopyError = ({ fileCopyParams, stack }: CopyError) => {
        console.clear();
        console.log(stack, "\n\nFileCopyParams:", fileCopyParams);
        process.exit(1);
    };
}

export default ExitOnError;
