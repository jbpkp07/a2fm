import { basename } from "path";

import A2FMRendererUtils from "./A2FMRendererUtils";
import ValueUnits from "./components/common/ValueUnits";

const { toEtaSeconds } = A2FMRendererUtils;

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

    private progressParams: ProgressParams | undefined;

    private queueParams: FileCopyParams[] = [];

    public progressProps: ProgressProps;

    public queueProps: QueueProps;

    constructor(cols: number) {
        this.cols = cols;
        this.progressProps = this.getDefaultProgressProps();
        this.queueProps = this.getDefaultQueueProps();
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

    private getDefaultQueueProps(): QueueProps {
        const eta = { value: 0, units: "?" };
        const queue = this.queueParams.map(({ srcFilePath }) => ({ eta, srcFileName: basename(srcFilePath) }));

        return { queue };
    }

    public updateProgressProps(progressParams: ProgressParams): void {
        this.progressParams = progressParams;
    }

    public updateQueueProps(queueParams: FileCopyParams[]): void {
        this.queueParams = queueParams;

        if (this.progressParams) {
            const { bytesWritten, fileCopyParams } = this.progressParams;
            const { fileSizeBytes } = fileCopyParams;

            const etaSeconds = toEtaSeconds({ bytesPerSecond, bytesWritten, fileSizeBytes });
        }

        this.queueProps = this.getDefaultQueueProps();
    }
}

export default A2FMRendererChildProps;
