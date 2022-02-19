import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";

const { chartL, grayL, pinkL, purpL: purp, whiteL } = ComponentColors;
const { justifyCenter, padNumber, padText } = ComponentUtils;

type ValueUnits = { value: string; units: string };

interface MigrationProgressProps {
    readonly cols: number;
    readonly destFilePath: string;
    readonly eta: string;
    readonly fileSize: string;
    readonly percentage: number;
    readonly rate: ValueUnits;
    readonly srcFilePath: string;
}

class MigrationProgress extends BaseComponent<MigrationProgressProps> {
    private labelLength = 6;

    private createStyledInfo = (): string => {
        const { cols, destFilePath, fileSize, srcFilePath } = this.props;

        const srcLabel = padText("Srce", this.labelLength);
        const destLabel = padText("Dest", this.labelLength);
        const sizeLabel = padText("Size", this.labelLength);

        const srcPath = padText(srcFilePath, cols - srcLabel.length - 4);
        const destPath = padText(destFilePath, cols - destLabel.length - 4);

        const styledSrcLabel = grayL(srcLabel);
        const styledDestLabel = grayL(destLabel);
        const styledSizeLabel = grayL(sizeLabel);

        const styledSrcPath = whiteL(srcPath);
        const styledDestPath = whiteL(destPath);
        const styledFileSize = chartL(fileSize);

        const margin = "  ";
        const row1 = margin + styledSrcLabel + styledSrcPath + "\n";
        const row2 = margin + styledDestLabel + styledDestPath + "\n";
        const row3 = margin + styledSizeLabel + styledFileSize + "\n";

        return row1 + row2 + row3 + "\n";
    };

    private createStyledStats = (): string => {
        const { rate } = this.props;

        const rateLabel = padText("Rate", this.labelLength);

        const styledRateLabel = grayL(rateLabel);
        const styledRateValue = chartL(rate.value);
        const styledRateUnits = whiteL(rate.units);

        const margin = "  ";

        return margin + styledRateLabel + styledRateValue + " " + styledRateUnits + "\n";
    };

    protected createComponent = (): string => {
        return "\n" + this.createStyledInfo() + this.createStyledStats() + "\n\n\n\n";
    };
}

export default MigrationProgress;
