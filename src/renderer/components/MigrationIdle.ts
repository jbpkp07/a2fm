import BaseComponent from "./common/BaseComponent";
import ComponentBorders, { BorderProps } from "./common/ComponentBorders";
import ComponentColors from "./common/ComponentColors";
import ValueUnits from "./common/ValueUnits";
import MigrationStat from "./MigrationStat";

const { createTopBorderRow, createLeftRightBorderRow, createBottomBorderRow } = ComponentBorders;
const { blueM, purpD } = ComponentColors;
const { isInteger } = Number;

interface MigrationBorders {
    readonly borderProps: BorderProps;
    readonly topBorderRow: string;
    readonly bottomBorderRow: string;
}

interface MigrationIdleProps {
    readonly elapsedTime: ValueUnits;
}

interface MigrationIdleParams {
    readonly cols: number;
}

class MigrationIdle extends BaseComponent<MigrationIdleProps> {
    private readonly borders: MigrationBorders;

    private readonly elapsedTimeStat: MigrationStat;

    private readonly styledMessage: string;

    constructor({ cols }: MigrationIdleParams) {
        super();

        const message = "Waiting for migrations…  ";
        const label = "Elapsed";

        const statLength = label.length + 6;
        const marginLength = (cols - message.length - statLength - 4) / 2;

        const margin = "".padEnd(marginLength, " ");
        const padding = isInteger(marginLength) ? "" : " ";
        const borderProps = { cols, margin, style: "single" as const };

        this.borders = {
            borderProps,
            topBorderRow: "\n\n\n" + createTopBorderRow(borderProps),
            bottomBorderRow: createBottomBorderRow(borderProps)
        };
        this.elapsedTimeStat = new MigrationStat({ color: "medium", label });
        this.styledMessage = blueM(message + padding);
    }

    protected createComponent = (): string => {
        const { styledMessage, elapsedTimeStat } = this;
        const { elapsedTime } = this.props;
        const { borderProps, topBorderRow, bottomBorderRow } = this.borders;

        const innerText = styledMessage + elapsedTimeStat.create(elapsedTime);

        const midRow = createLeftRightBorderRow({ ...borderProps, innerText });

        return purpD(topBorderRow + midRow + bottomBorderRow);
    };
}

export default MigrationIdle;
export type { MigrationIdleProps };
