import CopyParams from "./CopyParams";

interface CopyProgress extends CopyParams {
    readonly bytesPerSecond: number;
    readonly bytesWritten: number;
    readonly elapsedSeconds: number;
    readonly srcFileSizeBytes: number;
}

export default CopyProgress;
