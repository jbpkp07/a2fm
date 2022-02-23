import { basename, dirname } from "path";

import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";
import ValueUnits from "./common/ValueUnits";

const { greenL, greenM, greenD, grayL, grayD, pinkL, purpL, purpM, whiteM, whiteD } = ComponentColors;
const { justifyCenter, padNumber, padText } = ComponentUtils;

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

class MigrationProgress extends BaseComponent<MigrationProgressProps> {
    private margin = "  ";

    private labelLength = 5;

    private numberLength = 3;

    private createStyledSrcPath = (): string => {
        const { cols, srcFilePath } = this.props;

        const dirLabel = padText("Source", this.labelLength + 2);
        const fileLabel = padText("", this.labelLength + 2);

        const dir = padText(dirname(srcFilePath), cols - dirLabel.length - 13);
        const file = padText(basename(srcFilePath), cols - fileLabel.length - 13);
        const sep = purpM("│ ");

        const row1 = this.margin + purpL(dirLabel) + sep + grayL("Dir   ") + greenL(dir) + "\n";
        const row2 = this.margin + purpL(fileLabel) + sep + grayL("File  ") + whiteD(file) + "\n";

        return row1 + row2;
    };

    private createStyledDestPath = (): string => {
        const { cols, destFilePath } = this.props;

        const dirLabel = padText("  Dest", this.labelLength + 2);
        const fileLabel = padText("", this.labelLength + 2);

        const dir = padText(dirname(destFilePath), cols - dirLabel.length - 13);
        const file = padText(basename(destFilePath), cols - fileLabel.length - 13);
        const sep = purpM("│ ");

        const row1 = this.margin + purpL(dirLabel) + sep + grayL("Dir   ") + greenL(dir) + "\n";
        const row2 = this.margin + purpL(fileLabel) + sep + grayL("File  ") + whiteD(file) + "\n";

        return row1 + row2;
    };

    private createStyledFileSize = (): string => {
        const { fileSize } = this.props;

        const label = padText("Size", this.labelLength);
        const value = padNumber(fileSize.value, this.numberLength);

        return grayL(label) + pinkL(value) + " " + whiteM(fileSize.units);
    };

    private createStyledElapsedTime = (): string => {
        const { elapsedTime } = this.props;

        const label = padText("Elapsed", this.labelLength + 3);
        const value = padNumber(elapsedTime.value, this.numberLength);

        return grayL(label) + pinkL(value) + " " + whiteM(elapsedTime.units);
    };

    private createStyledRate = (): string => {
        const { rate } = this.props;

        const label = padText("Rate", this.labelLength);
        const value = padNumber(rate.value, this.numberLength);

        return grayL(label) + pinkL(value) + " " + whiteM(rate.units);
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
        const styledEtaUnits = whiteM(" " + eta.units);

        return pinkL(pValue) + whiteM(pUnits) + styledFullBar + styledEtaLabel + styledEtaValue + styledEtaUnits + "\n";
    };

    protected createComponent = (): string => {
        const srcPath = this.createStyledSrcPath();
        const destPath = this.createStyledDestPath();
        const time = this.createStyledElapsedTime();
        const size = this.createStyledFileSize();
        const rate = this.createStyledRate();
        const progressBar = this.createStyledProgressBar();

        const justified = justifyCenter(this.props.cols, 26);
        const justified2 = justifyCenter(this.props.cols, 57);
        const sep = grayD("    ┃    ");

        return (
            "\n" +
            srcPath +
            "\n" +
            destPath +
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
