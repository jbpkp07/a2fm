import { basename } from "path";

import MovingMedian from "../common/MovingMedian";
import A2FMRendererUtils from "./A2FMRendererUtils";
import ValueUnits from "./components/common/ValueUnits";

const { toEtaSeconds, toTime } = A2FMRendererUtils;

interface FileCopyParams {
    readonly srcFilePath: string;
    readonly destFilePath: string;
    readonly fileSizeBytes: number;
}

interface ProgressParams {
    readonly bytesPerSecond: number;
    readonly bytesWritten: number;
    readonly elapsedSeconds: number;
    readonly fileCopyParams: FileCopyParams;
    readonly fileSizeBytes: number;
    readonly percentage: number;
}

interface ProgressProps {
    readonly cols: number;
    readonly destFilePath: string;
    readonly destFileSize: ValueUnits;
    readonly elapsedTime: ValueUnits;
    readonly eta: ValueUnits;
    readonly percentage: number;
    readonly rate: ValueUnits;
    readonly srcFilePath: string;
    readonly srcFileSize: ValueUnits;
}

interface QueueProps {
    readonly queue: {
        readonly eta: ValueUnits;
        readonly srcFileName: string;
    }[];
}

class A2FMRendererChildProps {
    private readonly cols: number;

    private readonly etaBytesPerSecondHistory = new MovingMedian(15);

    private etaSeconds = 0;

    private progressParams: ProgressParams | undefined;

    private queueParams: FileCopyParams[] = [];

    public progressProps: ProgressProps;

    public queueProps: QueueProps;

    private get etaBytesPerSecond(): number {
        return this.etaBytesPerSecondHistory.median;
    }

    constructor(cols: number) {
        this.cols = cols;
        this.progressProps = this.getDefaultProgressProps();
        this.queueProps = this.createQueueProps();

        this.etaBytesPerSecondHistory.push(100000000);
    }

    private calcProgressEtaSeconds(): number {
        const { etaBytesPerSecond, progressParams } = this;

        return progressParams ? toEtaSeconds({ etaBytesPerSecond, ...progressParams }) : 0;
    }

    private toQueueProps = (params: FileCopyParams) => {
        const { fileSizeBytes, srcFilePath } = params;
        const { etaBytesPerSecond } = this;

        let eta: ValueUnits = { value: 0, units: "?" };

        if (this.etaSeconds > 0) {
            this.etaSeconds += toEtaSeconds({ etaBytesPerSecond, fileSizeBytes });
            eta = toTime(this.etaSeconds);
        }
    };

    private createQueueProps(): QueueProps {
        let etaSeconds = this.calcProgressEtaSeconds();

        const toQueueProps = ({ fileSizeBytes, srcFilePath }: FileCopyParams) => {
            const { etaBytesPerSecond } = this;

            etaSeconds += toEtaSeconds({ etaBytesPerSecond, fileSizeBytes });

            return { eta: toTime(etaSeconds), srcFileName: basename(srcFilePath) };
        };

        const queue = this.queueParams.map(toQueueProps);

        return { queue };
    }

    private getDefaultProgressProps(): ProgressProps {
        return {
            cols: this.cols,
            destFilePath: "???/???",
            destFileSize: { value: 0, units: "??" },
            elapsedTime: { value: 0, units: "?" },
            eta: { value: 0, units: "?" },
            percentage: 0,
            rate: { value: 0, units: "??/?" },
            srcFilePath: "???/???",
            srcFileSize: { value: 0, units: "??" }
        };
    }

    public updateProgressProps(progressParams: ProgressParams): void {
        this.progressParams = progressParams;
    }

    public updateQueueProps(queueParams: FileCopyParams[]): void {
        this.queueParams = queueParams;

        const { etaBytesPerSecond, progressParams } = this;

        if (progressParams) {
            let etaSeconds = this.calcProgressEtaSeconds();

            const queue = queueParams.map(({ fileSizeBytes, srcFilePath }) => {
                etaSeconds += toEtaSeconds({ etaBytesPerSecond, fileSizeBytes });
                const eta = toTime(etaSeconds);

                return { eta, srcFileName: basename(srcFilePath) };
            });

            this.queueProps = { queue };

            return;
        }

        this.queueProps = this.createQueueProps();
    }
}

export default A2FMRendererChildProps;
