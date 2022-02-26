import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";

const { grayL, greenM } = ComponentColors;

interface MigrationQueueLimitProps {
    readonly queueLength: number;
}

interface MigrationQueueLimitParams {
    readonly cols: number;
    readonly limit: number;
    readonly margin: string;
}

class MigrationQueueLimit extends BaseComponent<MigrationQueueLimitProps> {
    private readonly limit: number;

    private readonly margin: string;

    private readonly styledPlusLabel: string;

    private readonly styledMoreLabel: string;

    constructor({ cols, limit, margin }: MigrationQueueLimitParams) {
        super();

        this.limit = limit;
        this.margin = margin;

        const plusLabel = "Plus ";
        const moreLabel = " more…";

        const justifyLength = cols / 2 - margin.length - plusLabel.length;
        const justifyCenter = "".padEnd(justifyLength, " ");

        this.styledPlusLabel = grayL(justifyCenter + plusLabel);
        this.styledMoreLabel = grayL(moreLabel);
    }

    protected createComponent = (): string => {
        const { limit, margin, styledPlusLabel, styledMoreLabel } = this;
        const { queueLength } = this.props;

        if (queueLength <= limit) {
            return "";
        }

        const styledHiddenCount = greenM(queueLength - limit);

        return margin + styledPlusLabel + styledHiddenCount + styledMoreLabel + "\n";
    };
}

export default MigrationQueueLimit;
