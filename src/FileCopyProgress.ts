import FileCopyParams from "./FileCopyParams";
import MicrosecondTimer from "./MicrosecondTimer";
import MovingMedian from "./MovingMedian";
import NumberUtils from "./NumberUtils";

const { floor, isZero, round, toIntegerPercentage, toSeconds } = NumberUtils;

class FileCopyProgress {
    private readonly _bytesPerSecond = new MovingMedian(15);

    private readonly timer = new MicrosecondTimer();

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

        this.bytesPerSecond = round(this._bytesPerSecond.median);
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

    public startTimer(): void {
        this.timer.start();
    }

    public update(bytesWritten: number, elapsedMicroseconds?: number): void {
        const elapsed = this.timer.elapsed();

        this.bytesWritten = floor(bytesWritten);
        this.elapsedSeconds = toSeconds(elapsedMicroseconds ?? elapsed);

        this.updateBytesPerSecond();
        this.updateInProgress();
        this.updatePercentage();
    }
}

export default FileCopyProgress;
