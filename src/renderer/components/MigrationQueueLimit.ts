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

    private readonly justifyCenter: string;

    private readonly styledPlusLabel: string;

    private readonly styledMoreLabel: string;

    constructor(params: MigrationQueueLimitParams) {
        super();

        const { cols, limit } = params;

        const plusLabel = "Plus ";
        const moreLabel = " more…\n";

        this.limit = limit;
        this.justifyCenter = padText("", cols / 2 - plusLabel.length);
        this.styledPlusLabel = grayL(plusLabel);
        this.styledMoreLabel = grayL(moreLabel);
    }

    protected createComponent = (): string => {
        const { queueLength } = this.props;

        if (queueLength <= this.limit) {
            return "";
        }

        const notShownCount = queueLength - this.limit;
        const styledNotShownCount = greenM(notShownCount);

        return this.justifyCenter + this.styledPlusLabel + styledNotShownCount + this.styledMoreLabel;
    };
}

export default MigrationQueueLimit;
