import BaseComponent from "./common/BaseComponent";
import ComponentBorders from "./common/ComponentBorders";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";
import ValueUnits from "./common/ValueUnits";

const { createLeftRightBorderRow, createTopBorderRow, createJoinBorderRow, createBottomBorderRow } = ComponentBorders;
const { grayM, greenM, pinkM, purpD, whiteD } = ComponentColors;
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

    private readonly topBorder: string;

    private readonly joinBorder: string;

    private readonly botBorder: string;

    constructor(params: MigrationQueueItemParams) {
        super();

        const { cols, margin } = params;

        this.cols = cols;
        this.margin = margin;
        this.topBorder = createTopBorderRow({ cols, margin, style: "single" });
        this.joinBorder = createJoinBorderRow({ cols, margin, style: "single" });
        this.botBorder = createBottomBorderRow({ cols, margin, style: "single" });
    }

    protected createComponent = (): string => {
        const { eta, index, queueLength, srcFilePath } = this.props;

        const posLength = toStringLength(queueLength);
        const etaLength = toStringLength(eta.value, " ", eta.units);
        const pathLength = this.cols - posLength - etaLength - 12;

        const pos = padNumber(index + 1, posLength);
        const path = padText(srcFilePath, pathLength);

        const styledPos = greenM(pos);
        const styledPath = grayM(path);
        const styledEta = pinkM(eta.value) + " " + whiteD(eta.units);

        const isFirstItem = index === 0;
        const isLastItem = index === queueLength - 1;

        const { margin, topBorder, joinBorder, botBorder } = this;

        const topRow = isFirstItem ? topBorder : "";
        const text = styledPos + margin + styledPath + margin + styledEta;
        const textRow = createLeftRightBorderRow({ margin, style: "single", innerText: text });
        const botRow = isLastItem ? botBorder : joinBorder;

        return purpD(topRow + textRow + botRow);
    };
}

export default MigrationQueueItem;
