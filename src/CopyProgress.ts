import CopyParams from "./CopyParams";

interface CopyProgress extends CopyParams {
    readonly bytesPerSecond: number;
    readonly bytesWritten: number;
    readonly srcSizeBytes: number;
}

export default CopyProgress;
