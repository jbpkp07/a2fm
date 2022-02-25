import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";

const { grayL, greenM } = ComponentColors;
const { padText } = ComponentUtils;

interface MigrationQueueLimitProps {
    readonly queueLength: number;
}

interface MigrationQueueLimitParams {
    readonly cols: number;
    readonly limit: number;
}

class MigrationQueueLimit extends BaseComponent<MigrationQueueLimitProps> {
    private readonly limit: number;

    private readonly styledPlusLabel: string;

    private readonly styledMoreLabel: string;

    constructor({ cols, limit }: MigrationQueueLimitParams) {
        super();

        this.limit = limit;

        const plusLabel = "Plus ";
        const moreLabel = " more…";
        const justifyCenter = padText("", cols / 2 - plusLabel.length);

        this.styledPlusLabel = grayL(justifyCenter + plusLabel);
        this.styledMoreLabel = grayL(moreLabel);
    }

    protected createComponent = (): string => {
        const { limit, styledPlusLabel, styledMoreLabel } = this;
        const { queueLength } = this.props;

        if (queueLength <= limit) {
            return "";
        }

        const styledHiddenCount = greenM(queueLength - limit);

        return styledPlusLabel + styledHiddenCount + styledMoreLabel + "\n";
    };
}

export default MigrationQueueLimit;
