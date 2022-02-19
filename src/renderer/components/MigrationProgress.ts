import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";

const { chartL, grayM, purp, white } = ComponentColors;

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
        const { srcFilePath, destFilePath } = this.props;

        return "blah\n\n\n\n";
    };

    protected createComponent = (): string => {
        return this.createStyledPaths();
    };
}

export default MigrationProgress;
