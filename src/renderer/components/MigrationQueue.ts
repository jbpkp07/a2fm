import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";
import ValueUnits from "./common/ValueUnits";
import MigrationQueueItem from "./MigrationQueueItem";
import MigrationQueueLabel from "./MigrationQueueLabel";
import MigrationQueueLimit from "./MigrationQueueLimit";

const { grayL, greenM } = ComponentColors;
const { padText } = ComponentUtils;

interface Migration {
    readonly eta: ValueUnits;
    readonly srcFilePath: string;
}

interface MigrationQueueProps {
    readonly queue: Migration[];
}

interface MigrationQueueParams {
    readonly cols: number;
    readonly limit: number;
}

class MigrationQueue extends BaseComponent<MigrationQueueProps> {
    private readonly margin = "  ";

    private readonly cols: number;

    private readonly limit: number;

    private readonly queueLabel: MigrationQueueLabel;

    private readonly queueItems: MigrationQueueItem[];

    private readonly queueLimit: MigrationQueueLimit;

    constructor(params: MigrationQueueParams) {
        super();

        const { cols, limit } = params;
        const { margin } = this;

        this.cols = cols;
        this.limit = limit;
        this.queueLabel = new MigrationQueueLabel({ cols, margin });

        this.queueItems = new Array(limit).fill(0).map(() => new MigrationQueueItem({ cols, margin }));

        this.queueLimit = new MigrationQueueLimit({ cols, limit });
    }

    private createStyledLimit = (): string => {
        const { queue } = this.props;

        if (queue.length <= this.limit) {
            return "";
        }

        const plusLabel = "Plus ";
        const moreLabel = " more…\n";
        const justifyCenter = padText("", this.cols / 2 - plusLabel.length);

        const styledPlusLabel = grayL(plusLabel);
        const styledNotShownCount = greenM(queue.length - this.limit);
        const styledMoreLabel = grayL(moreLabel);

        return justifyCenter + styledPlusLabel + styledNotShownCount + styledMoreLabel;
    };

    private createStyledQueue = (): string => {
        const { queue } = this.props;
        const { limit, createStyledQueueItem } = this;

        const limitedMigrations = queue.slice(0, limit);

        return limitedMigrations.map(createStyledQueueItem).join("");
    };

    private createStyledQueueItem = (migration: Migration, index: number, queue: Migration[]): string => {
        const queueLength = queue.length;
        const queueItem = this.queueItems[index] as MigrationQueueItem;

        return queueItem.create({ ...migration, index, queueLength });
    };

    protected createComponent = (): string => {
        const { queue } = this.props;
        const queueLength = queue.length;

        if (this.limit === 0 || queueLength === 0) {
            return "";
        }

        return this.queueLabel.create({}) + this.createStyledQueue() + this.queueLimit.create({ queueLength });
    };
}

export default MigrationQueue;
