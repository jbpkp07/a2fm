import BaseComponent from "./common/BaseComponent";
import ValueUnits from "./common/ValueUnits";
import MigrationProgressBar from "./MigrationProgressBar";
import MigrationProgressFilePath from "./MigrationProgressFilePath";
import MigrationProgressStats from "./MigrationProgressStats";

interface MigrationProgressProps {
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

interface MigrationProgressParams {
    readonly cols: number;
    readonly marginCols: number;
}

class MigrationProgress extends BaseComponent<MigrationProgressProps> {
    private readonly progressSrcPath: MigrationProgressFilePath;

    private readonly progressDestPath: MigrationProgressFilePath;

    private readonly progressStats: MigrationProgressStats;

    private readonly progressBar: MigrationProgressBar;

    constructor({ cols, marginCols }: MigrationProgressParams) {
        super();

        const margin = "".padEnd(marginCols, " ");
        const params = { cols, margin };

        this.progressSrcPath = new MigrationProgressFilePath({ ...params, type: "src" });
        this.progressDestPath = new MigrationProgressFilePath({ ...params, type: "dest" });
        this.progressStats = new MigrationProgressStats(params);
        this.progressBar = new MigrationProgressBar(params);
    }

    protected createComponent = (): string => {
        const { progressSrcPath, progressDestPath, progressStats, progressBar } = this;
        const { destFilePath, destFileSize, elapsedTime, eta, percentage, rate, srcFilePath, srcFileSize } = this.props;

        return (
            "\n" +
            progressSrcPath.create({ filePath: srcFilePath }) +
            "\n" +
            progressDestPath.create({ filePath: destFilePath }) +
            "\n" +
            progressStats.create({ destFileSize, elapsedTime, rate, srcFileSize }) +
            "\n" +
            progressBar.create({ eta, percentage }) +
            "\n\n"
        );
    };
}

export default MigrationProgress;
