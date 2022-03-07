import { basename, dirname } from "path";

import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";

const { blueL, grayL, greenLM, purpL, purpLM, whiteLM } = ComponentColors;
const { padText } = ComponentUtils;

interface MigrationProgressFilePathProps {
    readonly filePath: string;
}

interface MigrationProgressFilePathParams {
    readonly cols: number;
    readonly margin: string;
    readonly type: "src" | "dest";
}

class MigrationProgressFilePath extends BaseComponent<MigrationProgressFilePathProps> {
    private readonly maxPathLength: number;

    private readonly styledDirLabel: string;

    private readonly styledFileLabel: string;

    private readonly type: "src" | "dest";

    constructor({ cols, margin, type }: MigrationProgressFilePathParams) {
        super();

        this.type = type;

        const typeLabel = type === "src" ? "Source " : "  Dest ";
        const typeLabelFiller = "".padEnd(typeLabel.length, " ");

        this.maxPathLength = cols - margin.length * 2 - 16;
        this.styledDirLabel = margin + purpL(typeLabel) + purpLM("│ ") + grayL("Dir   ");
        this.styledFileLabel = margin + typeLabelFiller + purpLM("│ ") + grayL("File  ");
    }

    protected createComponent = (): string => {
        const { maxPathLength, styledDirLabel, styledFileLabel, type } = this;
        const { filePath } = this.props;

        const dir = dirname(filePath);
        const file = basename(filePath);

        const paddedDir = padText(dir, maxPathLength);
        const paddedFile = padText(file, maxPathLength);

        const styledFile = type === "src" ? blueL(paddedFile) : greenLM(paddedFile);

        const row1 = styledDirLabel + whiteLM(paddedDir) + "\n";
        const row2 = styledFileLabel + styledFile + "\n";

        return row1 + row2;
    };
}

export default MigrationProgressFilePath;
