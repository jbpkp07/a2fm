import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";

const { chartL, grayM, purp, white } = ComponentColors;
const { justifyCenter, padNumber, padText } = ComponentUtils;

interface MigrationProgressProps {
    readonly cols: number;
    readonly destFilePath: string;
    readonly eta: string;
    readonly fileSize: string;
    readonly percentage: number;
    readonly srcFilePath: string;
}

class MigrationProgress extends BaseComponent<MigrationProgressProps> {
    private createStyledPaths = (): string => {
        const { cols, srcFilePath, destFilePath } = this.props;

        const justified = justifyCenter(cols, 0);

        return justified + "|\n\n\n\n";
    };

    protected createComponent = (): string => {
        return this.createStyledPaths();
    };
}

export default MigrationProgress;
