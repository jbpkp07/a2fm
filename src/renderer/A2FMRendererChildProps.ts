import { basename } from "path";

import ValueUnits from "./components/common/ValueUnits";

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

    private readonly progressProps: ProgressProps;

    private queueProps: QueueProps;

    private progressParams: ProgressParams | undefined;

    constructor(cols: number) {
        this.cols = cols;
        this.progressProps = this.getDefaultProgressProps();
        this.queueProps = { queue: [] };
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

    public updateProgress(progressParams: ProgressParams): ProgressProps {
        this.progressParams = progressParams;

        return this.progressProps;
    }

    public updateQueue(queueParams: FileCopyParams[]): QueueProps {
        const queue = queueParams.map(({ srcFilePath, fileSizeBytes }) => {
            return {
                srcFileName: basename(srcFilePath),
                eta: { value: 0, units: "" }
            };
        });

        this.queueProps = { queue };

        return this.queueProps;
    }
}

export default A2FMRendererChildProps;
