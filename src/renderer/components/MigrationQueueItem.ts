import BaseComponent from "./common/BaseComponent";
import ComponentBorders, { BorderProps } from "./common/ComponentBorders";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";
import ValueUnits from "./common/ValueUnits";
import MigrationStat from "./MigrationStat";

const { createLeftRightBorderRow } = ComponentBorders;
const { blueM, greenM, purpD } = ComponentColors;
const { padNumber, padText, toStringLength } = ComponentUtils;

interface MigrationQueueBorders {
    readonly borderProps: BorderProps;
    readonly topBorderRow: string;
    readonly joinBorderRow: string;
    readonly bottomBorderRow: string;
}

interface MigrationQueueItemProps {
    readonly eta: ValueUnits;
    readonly index: number;
    readonly queueLength: number;
    readonly srcFilePath: string;
}

interface MigrationQueueItemParams {
    readonly cols: number;
    readonly margin: string;
    readonly queueBorders: MigrationQueueBorders;
}

class MigrationQueueItem extends BaseComponent<MigrationQueueItemProps> {
    private readonly etaStat: MigrationStat;

    private readonly posPathLength: number;

    private readonly queueBorders: MigrationQueueBorders;

    constructor({ cols, margin, queueBorders }: MigrationQueueItemParams) {
        super();

        const marginLength = margin.length * 2;
        const etaLength = 9;

        this.etaStat = new MigrationStat({ color: "medium", label: "Eta" });
        this.posPathLength = cols - marginLength - etaLength - 8;
        this.queueBorders = queueBorders;
    }

    protected createComponent = (): string => {
        const { etaStat, posPathLength } = this;
        const { eta, index, queueLength, srcFilePath } = this.props;
        const { borderProps, topBorderRow, joinBorderRow, bottomBorderRow } = this.queueBorders;

        const posLength = toStringLength(queueLength);
        const pathLength = posPathLength - posLength;

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
