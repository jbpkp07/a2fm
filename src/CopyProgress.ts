import CopyParams from "./CopyParams";
import MovingMedian from "./MovingMedian";
import NumberUtils from "./NumberUtils";

interface CopyProgressParams {
    readonly copyParams: CopyParams;
    readonly fileSizeBytes: number;
}

const { isZero, round, toIntegerPercentage, toSeconds } = NumberUtils;

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
        this.startTimeMs = Date.now();
    }

    private updateElapsedSeconds(): void {
        const currentTimeMs = Date.now() + 0.5; // average current time
        const elapsedMs = currentTimeMs - this.startTimeMs;
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

    public update(bytesWritten: number): void {
        this.bytesWritten = bytesWritten;

        this.updateElapsedSeconds();
        this.updatePercentage();
        this.updateInProgress();
        this.updateBytesPerSecond();
    }
}

export default CopyProgress;
