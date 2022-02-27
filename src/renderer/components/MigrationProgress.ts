import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";
import ValueUnits from "./common/ValueUnits";
import MigrationProgressFilePath from "./MigrationProgressFilePath";
import MigrationProgressStats from "./MigrationProgressStats";

const { grayL, greenM, greenD, pinkL, whiteL } = ComponentColors;
const { padNumber } = ComponentUtils;

interface MigrationProgressProps {
    readonly cols: number; //
    readonly destFilePath: string; //
    readonly destFileSize: ValueUnits; //
    readonly eta: ValueUnits;
    readonly percentage: number;
    readonly transferRate: ValueUnits; //
    readonly srcFilePath: string; //
    readonly srcFileSize: ValueUnits; //
    readonly elapsedTime: ValueUnits;
}

interface MigrationProgressParams {
    readonly cols: number;
    readonly marginCols: number;
}

class MigrationProgress extends BaseComponent<MigrationProgressProps> {
    private readonly cols: number;

    private readonly margin = "  ";

    private readonly progressSrcPath: MigrationProgressFilePath;

    private readonly progressDestPath: MigrationProgressFilePath;

    private readonly progressStats: MigrationProgressStats;

    private numberLength = 3;

    constructor({ cols, marginCols }: MigrationProgressParams) {
        super();

        this.cols = cols;
        const margin = "".padEnd(marginCols, " ");

        const params = { cols, margin };

        this.progressSrcPath = new MigrationProgressFilePath({ ...params, type: "src" });
        this.progressDestPath = new MigrationProgressFilePath({ ...params, type: "dest" });
        this.progressStats = new MigrationProgressStats(params);
    }

    private createStyledProgressBar = (): string => {
        const { eta, percentage } = this.props;

        const pValue = padNumber(percentage, this.numberLength);
        const pUnits = " %" + this.margin;
        const etaValue = padNumber(eta.value, this.numberLength);

        const styledDoneBar = greenM("".padEnd(percentage, "■"));
        const styledToGoBar = greenD("".padEnd(100 - percentage, "■"));
        const styledFullBar = styledDoneBar + styledToGoBar;
        const styledEtaLabel = grayL(this.margin + "Eta ");
        const styledEtaValue = pinkL(etaValue);
        const styledEtaUnits = whiteL(" " + eta.units);

        return pinkL(pValue) + whiteL(pUnits) + styledFullBar + styledEtaLabel + styledEtaValue + styledEtaUnits + "\n";
    };

    protected createComponent = (): string => {
        const { progressSrcPath, progressDestPath, progressStats } = this;
        const { srcFilePath, destFilePath, srcFileSize, destFileSize, transferRate, elapsedTime } = this.props;

        const progressBar = this.createStyledProgressBar();

        const justified2 = "       ";

        return (
            "\n" +
            progressSrcPath.create({ filePath: srcFilePath }) +
            "\n" +
            progressDestPath.create({ filePath: destFilePath }) +
            "\n" +
            progressStats.create({ srcFileSize, destFileSize, transferRate, elapsedTime }) +
            "\n" +
            justified2 +
            progressBar +
            "\n\n"
        );
    };
}

export default MigrationProgress;
