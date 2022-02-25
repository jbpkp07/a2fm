import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";

const { purpL, purpM } = ComponentColors;
const { padText } = ComponentUtils;

interface MigrationQueueLabelParams {
    readonly cols: number;
    readonly margin: string;
}

class MigrationQueueLabel extends BaseComponent {
    private readonly cols: number;

    private readonly margin: string;

    private readonly label = "Upcoming migrations";

    constructor(params: MigrationQueueLabelParams) {
        super();

        this.cols = params.cols;
        this.margin = params.margin;
    }

    protected createComponent = (): string => {
        const { cols, label, margin } = this;

        const labelLength = cols / 2 - margin.length;
        const paddedLabel = padText(label, labelLength);

        const styledLabel = purpL(paddedLabel);
        const styledArrow = purpM("▲");

        return margin + styledLabel + styledArrow + "\n";
    };
}

export default MigrationQueueLabel;
