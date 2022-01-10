import CopyParams from "./CopyParams";
import MovingMedian from "./MovingMedian";
import NumberUtils from "./NumberUtils";

interface CopyProgressParams {
    readonly copyParams: CopyParams;
    readonly fileSizeBytes: number;
    readonly startTimeMs: number;
}

const { isInteger, isZero, round, toIntegerPercentage, toSeconds } = NumberUtils;

class CopyProgress {
    private readonly _bytesPerSecond = new MovingMedian(15);

    private readonly startTimeMs: number;

    public readonly copyParams: CopyParams;

    public readonly fileSizeBytes: number;

    public bytesWritten = 0;

    public elapsedSeconds = 0;

    public percentage = 0;

    public inProgress = true;

    public get bytesPerSecond(): number {
        return this._bytesPerSecond.median;
    }

    constructor(params: CopyProgressParams) {
        this.copyParams = params.copyParams;
        this.fileSizeBytes = params.fileSizeBytes;
        this.startTimeMs = params.startTimeMs;
    }

    private updateElapsedSeconds(currentTimeMs: number): void {
        let aveCurrentTimeMs = currentTimeMs;

        if (isInteger(currentTimeMs)) {
            aveCurrentTimeMs += 0.5;
        }

        const elapsedMs = aveCurrentTimeMs - this.startTimeMs;
        this.elapsedSeconds = toSeconds(elapsedMs);
    }

    private updatePercentage(): void {
        if (isZero(this.fileSizeBytes)) {
            this.percentage = 100;
        } else {
            const ratio = this.bytesWritten / this.fileSizeBytes;
            this.percentage = toIntegerPercentage(ratio);
        }
    }

    private updateInProgress(): void {
        this.inProgress = this.bytesWritten < this.fileSizeBytes;
    }

    private updateBytesPerSecond(): void {
        if (isZero(this.elapsedSeconds)) {
            this._bytesPerSecond.push(0);
        } else {
            const bytesPerSecond = round(this.bytesWritten / this.elapsedSeconds);

            this._bytesPerSecond.push(bytesPerSecond);
        }
    }

    public update(bytesWritten: number, currentTimeMs: number): void {
        this.bytesWritten = bytesWritten;

        this.updateElapsedSeconds(currentTimeMs);
        this.updatePercentage();
        this.updateInProgress();
        this.updateBytesPerSecond();
    }
}

export default CopyProgress;
