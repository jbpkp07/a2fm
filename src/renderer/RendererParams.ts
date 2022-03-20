export interface FileCopyParams {
    readonly srcFilePath: string;
    readonly destFilePath: string;
    readonly fileSizeBytes: number;
}

export interface ProgressParams {
    readonly bytesPerSecond: number;
    readonly bytesWritten: number;
    readonly elapsedSeconds: number;
    readonly fileCopyParams: FileCopyParams;
    readonly fileSizeBytes: number;
    readonly percentage: number;
}

export type QueueParams = readonly FileCopyParams[];

export interface ProgressQueueParams {
    readonly progress: ProgressParams;
    readonly queue: QueueParams;
}
