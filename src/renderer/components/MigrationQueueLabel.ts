import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";

const { purpL, purpLM } = ComponentColors;

interface MigrationQueueLabelParams {
    readonly cols: number;
    readonly margin: string;
}

class MigrationQueueLabel extends BaseComponent {
    private readonly cols: number;

    private readonly margin: string;

    private readonly label = "Upcoming migrations";

    constructor({ cols, margin }: MigrationQueueLabelParams) {
        super();

        this.cols = cols;
        this.margin = margin;
    }

    protected createComponent = (): string => {
        const { cols, label, margin } = this;

        const labelLength = cols / 2 - margin.length;
        const paddedLabel = label.padEnd(labelLength, " ");

        const styledLabel = purpL(paddedLabel);
        const styledArrow = purpLM("▲");

        return margin + styledLabel + styledArrow + "\n";
    };
}

export default MigrationQueueLabel;
