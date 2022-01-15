import FileCopyParams from "./FileCopyParams";
import MovingMedian from "./MovingMedian";
import NumberUtils from "./NumberUtils";

const { isZero, round, toIntegerPercentage, toSeconds } = NumberUtils;

class FileCopyProgress {
    private readonly _bytesPerSecond = new MovingMedian(15);

    public readonly fileCopyParams: FileCopyParams;

    public bytesPerSecond = 0;

    public bytesWritten = 0;

    public elapsedSeconds = 0;

    public inProgress = true;

    public percentage = 0;

    public get fileSizeBytes(): number {
        return this.fileCopyParams.fileSizeBytes;
    }

    constructor(fileCopyParams: FileCopyParams) {
        this.fileCopyParams = fileCopyParams;
    }

    private updateBytesPerSecond(): void {
        if (isZero(this.elapsedSeconds)) {
            this._bytesPerSecond.push(0);
        } else {
            const next = round(this.bytesWritten / this.elapsedSeconds);
            this._bytesPerSecond.push(next);
        }

        this.bytesPerSecond = this._bytesPerSecond.median;
    }

    private updateInProgress(): void {
        this.inProgress = this.bytesWritten < this.fileSizeBytes;
    }

    private updatePercentage(): void {
        if (isZero(this.fileSizeBytes)) {
            this.percentage = 100;
        } else {
            const ratio = this.bytesWritten / this.fileSizeBytes;
            this.percentage = toIntegerPercentage(ratio);
        }
    }

    public update(bytesWritten: number, elapsedMicroseconds: number): void {
        this.bytesWritten = bytesWritten;
        this.elapsedSeconds = toSeconds(elapsedMicroseconds);

        this.updateBytesPerSecond();
        this.updateInProgress();
        this.updatePercentage();
    }
}

export default FileCopyProgress;
