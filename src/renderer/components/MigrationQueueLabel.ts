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
    private readonly margin: string;

    private readonly styledLabel: string;

    private readonly styledArrow: string;

    constructor(params: MigrationQueueLabelParams) {
        super();

        const { cols, margin } = params;

        const label = "Upcoming migrations";
        const labelLength = cols / 2 - margin.length;
        const labelPadded = padText(label, labelLength);

        this.margin = margin;
        this.styledLabel = purpL(labelPadded);
        this.styledArrow = purpM("▲\n");
    }

    protected createComponent = (): string => {
        return this.margin + this.styledLabel + this.styledArrow;
    };
}

export default MigrationQueueLabel;
