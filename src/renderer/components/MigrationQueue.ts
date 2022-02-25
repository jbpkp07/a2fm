import BaseComponent from "./common/BaseComponent";
import ValueUnits from "./common/ValueUnits";
import MigrationQueueItem from "./MigrationQueueItem";
import MigrationQueueLabel from "./MigrationQueueLabel";
import MigrationQueueLimit from "./MigrationQueueLimit";

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
    private readonly limit: number;

    private readonly queueLabel: MigrationQueueLabel;

    private readonly queueItems: MigrationQueueItem[];

    private readonly queueLimit: MigrationQueueLimit;

    constructor({ cols, limit }: MigrationQueueParams) {
        super();

        this.limit = limit;

        const params = { cols, limit, margin: "  " };

        this.queueLabel = new MigrationQueueLabel(params);
        this.queueItems = new Array(limit).fill(0).map(() => new MigrationQueueItem(params));
        this.queueLimit = new MigrationQueueLimit(params);
    }

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

        const styledLabel = this.queueLabel.create({});
        const styledQueue = this.createStyledQueue();
        const styledLimit = this.queueLimit.create({ queueLength });

        return styledLabel + styledQueue + styledLimit;
    };
}

export default MigrationQueue;
