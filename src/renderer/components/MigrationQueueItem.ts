import BaseComponent from "./common/BaseComponent";
import ComponentBorders, { BorderProps } from "./common/ComponentBorders";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";
import ValueUnits from "./common/ValueUnits";
import MigrationStat from "./MigrationStat";

const { createTopBorderRow, createLeftRightBorderRow, createJoinBorderRow, createBottomBorderRow } = ComponentBorders;
const { blueM, greenM, purpD } = ComponentColors;
const { padNumber, padText, toStringLength } = ComponentUtils;

interface MigrationQueueItemProps {
    readonly eta: ValueUnits;
    readonly index: number;
    readonly queueLength: number;
    readonly srcFilePath: string;
}

interface MigrationQueueItemParams {
    readonly cols: number;
    readonly margin: string;
}

class MigrationQueueItem extends BaseComponent<MigrationQueueItemProps> {
    private readonly cols: number;

    private readonly margin: string;

    private readonly etaStat: MigrationStat;

    private readonly borderProps: BorderProps;

    private readonly topBorderRow: string;

    private readonly joinBorderRow: string;

    private readonly bottomBorderRow: string;

    constructor({ cols, margin }: MigrationQueueItemParams) {
        super();

        this.cols = cols;
        this.margin = margin;

        this.etaStat = new MigrationStat({ color: "medium", label: "Eta" });

        this.borderProps = { cols, margin, style: "single" as const };

        this.topBorderRow = createTopBorderRow(this.borderProps);
        this.joinBorderRow = createJoinBorderRow(this.borderProps);
        this.bottomBorderRow = createBottomBorderRow(this.borderProps);
    }

    protected createComponent = (): string => {
        const { cols, margin, etaStat, borderProps, topBorderRow, joinBorderRow, bottomBorderRow } = this;
        const { eta, index, queueLength, srcFilePath } = this.props;

        const marginLength = margin.length * 2;
        const posLength = toStringLength(queueLength);
        const etaLength = 9;
        const pathLength = cols - marginLength - posLength - etaLength - 8;

        const pos = padNumber(index + 1, posLength);
        const path = padText(srcFilePath, pathLength);

        const styledQueueItem = greenM(pos + "  ") + blueM(path + "  ") + etaStat.create(eta);

        const isFirstQueueItem = index === 0;
        const isLastQueueItem = index === queueLength - 1;

        const topRow = isFirstQueueItem ? topBorderRow : "";
        const midRow = createLeftRightBorderRow({ ...borderProps, innerText: styledQueueItem });
        const botRow = isLastQueueItem ? bottomBorderRow : joinBorderRow;

        return purpD(topRow + midRow + botRow);
    };
}

export default MigrationQueueItem;
