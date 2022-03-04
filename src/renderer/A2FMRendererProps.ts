import { basename } from "path";

import MovingMedian from "../common/MovingMedian";
import { FileCopyParams, ProgressParams, UpdateParams } from "./A2FMRendererTypes";
import A2FMRendererUtils from "./A2FMRendererUtils";
import { MigrationIdleProps } from "./components/MigrationIdle";
import { MigrationProgressProps } from "./components/MigrationProgress";
import { MigrationQueueProps } from "./components/MigrationQueue";

const { calcEtaSeconds, createDefaultProgressProps, toRate, toSize, toTime } = A2FMRendererUtils;

class A2FMRendererProps {
    private readonly cols: number;

    private readonly etaBytesPerSecondHistory: MovingMedian;

    private get etaBytesPerSecond() {
        return this.etaBytesPerSecondHistory.median;
    }

    public idleProps: MigrationIdleProps;

    public progressProps: MigrationProgressProps;

    public queueProps: MigrationQueueProps;

    constructor(cols: number) {
        this.cols = cols;
        this.etaBytesPerSecondHistory = new MovingMedian(15);
        this.etaBytesPerSecondHistory.push(100 * 1024 ** 2);

        this.idleProps = { elapsedTime: toTime(0) };
        this.progressProps = createDefaultProgressProps(cols);
        this.queueProps = { queue: [] };
    }

    private calcProgressEtaSeconds(params: ProgressParams): number {
        const { etaBytesPerSecond } = this;
        const { bytesWritten, fileSizeBytes } = params;

        return calcEtaSeconds({ bytesWritten, etaBytesPerSecond, fileSizeBytes });
    }

    private updateEtaBytesPerSecond(bytesPerSecond: number): void {
        if (bytesPerSecond > 0) {
            this.etaBytesPerSecondHistory.push(bytesPerSecond);
        }
    }

    private updateProgressProps(params: ProgressParams): void {
        const { cols } = this;
        const { bytesPerSecond, bytesWritten, elapsedSeconds, fileCopyParams, fileSizeBytes, percentage } = params;
        const { destFilePath, srcFilePath } = fileCopyParams;

        const etaSeconds = this.calcProgressEtaSeconds(params);

        this.progressProps = {
            cols,
            destFilePath,
            destFileSize: toSize(bytesWritten),
            elapsedTime: toTime(elapsedSeconds),
            eta: toTime(etaSeconds),
            percentage,
            rate: toRate(bytesPerSecond),
            srcFilePath,
            srcFileSize: toSize(fileSizeBytes)
        };
    }

    private updateQueueProps(params: UpdateParams): void {
        const { etaBytesPerSecond } = this;
        const { progress, queue } = params;

        let etaSeconds = this.calcProgressEtaSeconds(progress);

        const toQueueProps = ({ fileSizeBytes, srcFilePath }: FileCopyParams) => {
            etaSeconds += calcEtaSeconds({ etaBytesPerSecond, fileSizeBytes });

            return { eta: toTime(etaSeconds), srcFileName: basename(srcFilePath) };
        };

        this.queueProps = { queue: queue.map(toQueueProps) };
    }

    public updateIdleProps(elapsedSeconds: number): void {
        this.idleProps = { elapsedTime: toTime(elapsedSeconds) };
    }

    public updateProps(params: UpdateParams): void {
        const { progress } = params;
        const { bytesPerSecond } = progress;

        this.updateEtaBytesPerSecond(bytesPerSecond);
        this.updateProgressProps(progress);
        this.updateQueueProps(params);
    }
}

export default A2FMRendererProps;
