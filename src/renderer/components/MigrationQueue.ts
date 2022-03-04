import BaseComponent from "./common/BaseComponent";
import ComponentBorders from "./common/ComponentBorders";
import ValueUnits from "./common/ValueUnits";
import MigrationQueueItem from "./MigrationQueueItem";
import MigrationQueueLabel from "./MigrationQueueLabel";
import MigrationQueueLimit from "./MigrationQueueLimit";

const { createTopBorderRow, createJoinBorderRow, createBottomBorderRow } = ComponentBorders;

interface Migration {
    readonly eta: ValueUnits;
    readonly srcFileName: string;
}

interface MigrationQueueProps {
    readonly queue: Migration[];
}

interface MigrationQueueParams {
    readonly cols: number;
    readonly limit: number;
    readonly marginCols: number;
}

class MigrationQueue extends BaseComponent<MigrationQueueProps> {
    private readonly limit: number;

    private readonly queueLabel: MigrationQueueLabel;

    private readonly queueItems: MigrationQueueItem[];

    private readonly queueLimit: MigrationQueueLimit;

    constructor({ cols, limit, marginCols }: MigrationQueueParams) {
        super();

        this.limit = limit;

        const margin = "".padEnd(marginCols, " ");
        const borderProps = { cols, margin, style: "single" as const };
        const queueBorders = {
            borderProps,
            topBorderRow: createTopBorderRow(borderProps),
            joinBorderRow: createJoinBorderRow(borderProps),
            bottomBorderRow: createBottomBorderRow(borderProps)
        };

        const params = { cols, limit, margin, queueBorders };

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
export type { MigrationQueueProps };
