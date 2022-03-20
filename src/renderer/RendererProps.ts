import { basename } from "path";

import MovingMedian from "../common/MovingMedian";
import RendererUtils from "./RendererUtils";

import type { MigrationIdleProps } from "./components/MigrationIdle";
import type { MigrationProgressProps } from "./components/MigrationProgress";
import type { MigrationQueueProps } from "./components/MigrationQueue";
import type { FileCopyParams, ProgressParams, ProgressQueueParams, QueueParams } from "./RendererParams";

const { calcEtaSeconds, toRate, toSize, toTime } = RendererUtils;

interface ProgressQueueProps {
    readonly progressProps: MigrationProgressProps;
    readonly queueProps: MigrationQueueProps;
}

class RendererProps {
    private readonly cols: number;

    private readonly etaBytesPerSecondHistory = new MovingMedian(15);

    private progressEtaSeconds = 0;

    private get etaBytesPerSecond() {
        return this.etaBytesPerSecondHistory.median;
    }

    constructor(cols: number) {
        this.cols = cols;
    }

    private pushBytesPerSecond(bytesPerSecond: number): void {
        if (bytesPerSecond > 0) {
            this.etaBytesPerSecondHistory.push(bytesPerSecond);
        }
    }

    private setProgressEtaSeconds(params: ProgressParams): void {
        const { etaBytesPerSecond } = this;
        const { bytesWritten, fileSizeBytes } = params;

        this.progressEtaSeconds = calcEtaSeconds({ bytesWritten, etaBytesPerSecond, fileSizeBytes });
    }

    private toProgressProps(params: ProgressParams): MigrationProgressProps {
        const { cols, etaBytesPerSecond, progressEtaSeconds } = this;
        const { bytesPerSecond, bytesWritten, elapsedSeconds, fileCopyParams, fileSizeBytes, percentage } = params;
        const { destFilePath, srcFilePath } = fileCopyParams;

        return {
            cols,
            destFilePath,
            destFileSize: toSize(bytesWritten),
            elapsedTime: toTime(elapsedSeconds),
            eta: toTime(progressEtaSeconds),
            percentage,
            rate: toRate(bytesPerSecond || etaBytesPerSecond),
            srcFilePath,
            srcFileSize: toSize(fileSizeBytes)
        };
    }

    private toQueueProps(params: QueueParams): MigrationQueueProps {
        const { etaBytesPerSecond, progressEtaSeconds } = this;

        let queueEtaSeconds = progressEtaSeconds;
        const waitSeconds = 2;

        const toProps = ({ fileSizeBytes, srcFilePath }: FileCopyParams) => {
            queueEtaSeconds += waitSeconds + calcEtaSeconds({ etaBytesPerSecond, fileSizeBytes });

            return { eta: toTime(queueEtaSeconds), srcFileName: basename(srcFilePath) };
        };

        return { queue: params.map(toProps) };
    }

    public toIdleProps = (elapsedSeconds: number): MigrationIdleProps => {
        return { elapsedTime: toTime(elapsedSeconds) };
    };

    public toProgressQueueProps = (params: ProgressQueueParams): ProgressQueueProps => {
        const { progress, queue } = params;
        const { bytesPerSecond } = progress;

        this.pushBytesPerSecond(bytesPerSecond);
        this.setProgressEtaSeconds(progress);

        const progressProps = this.toProgressProps(progress);
        const queueProps = this.toQueueProps(queue);

        return { progressProps, queueProps };
    };
}

export default RendererProps;
