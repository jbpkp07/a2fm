import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";
import ValueUnits from "./common/ValueUnits";
import MigrationProgressFilePath from "./MigrationProgressFilePath";

const { grayL, grayD, greenM, greenD, pinkL, whiteL } = ComponentColors;
const { padNumber, padText } = ComponentUtils;

interface MigrationProgressProps {
    readonly cols: number; //
    readonly destFilePath: string; //
    readonly eta: ValueUnits;
    readonly fileSize: ValueUnits; //
    readonly percentage: number;
    readonly rate: ValueUnits; //
    readonly srcFilePath: string; //
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

    private labelLength = 5;

    private numberLength = 3;

    constructor({ cols, marginCols }: MigrationProgressParams) {
        super();

        this.cols = cols;
        const margin = "".padEnd(marginCols, " ");

        const params = { cols, margin };

        this.progressSrcPath = new MigrationProgressFilePath({ ...params, type: "src" });
        this.progressDestPath = new MigrationProgressFilePath({ ...params, type: "dest" });
    }

    private createStyledFileSize = (): string => {
        const { fileSize } = this.props;

        const label = padText("Size", this.labelLength);
        const value = padNumber(fileSize.value, this.numberLength);

        return grayL(label) + pinkL(value) + " " + whiteL(fileSize.units);
    };

    private createStyledElapsedTime = (): string => {
        const { elapsedTime } = this.props;

        const label = padText("Elapsed", this.labelLength + 3);
        const value = padNumber(elapsedTime.value, this.numberLength);

        return grayL(label) + pinkL(value) + " " + whiteL(elapsedTime.units);
    };

    private createStyledRate = (): string => {
        const { rate } = this.props;

        const label = padText("Rate", this.labelLength);
        const value = padNumber(rate.value, this.numberLength);

        return grayL(label) + pinkL(value) + " " + whiteL(rate.units);
    };

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
        const { progressSrcPath, progressDestPath } = this;
        const { srcFilePath, destFilePath } = this.props;

        const time = this.createStyledElapsedTime();
        const size = this.createStyledFileSize();
        const rate = this.createStyledRate();
        const progressBar = this.createStyledProgressBar();

        // const justified = justifyCenter(this.props.cols, 26);
        const justified = "        ";
        // const justified2 = justifyCenter(this.props.cols, 57);
        const justified2 = "       ";
        const sep = grayD("    ┃    ");

        return (
            "\n" +
            progressSrcPath.create({ filePath: srcFilePath }) +
            "\n" +
            progressDestPath.create({ filePath: destFilePath }) +
            "\n" +
            justified +
            size +
            sep +
            time +
            sep +
            rate +
            "\n\n" +
            justified2 +
            progressBar +
            "\n\n"
        );
    };
}

export default MigrationProgress;
