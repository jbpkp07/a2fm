import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ValueUnits from "./common/ValueUnits";
import MigrationStat from "./MigrationStat";

const { greenM, greenXD } = ComponentColors;

interface MigrationProgressBarProps {
    readonly eta: ValueUnits;
    readonly percentage: number;
}

interface MigrationProgressBarParams {
    readonly cols: number;
    readonly margin: string;
}

class MigrationProgressBar extends BaseComponent<MigrationProgressBarProps> {
    private readonly margin: string;

    private readonly justifyCenter: string;

    private readonly etaStat: MigrationStat;

    private readonly percentageStat: MigrationStat;

    constructor({ cols, margin }: MigrationProgressBarParams) {
        super();

        this.margin = margin;

        const color = "light";
        const barLength = 118;
        const justifyLength = cols / 2 - barLength / 2 - margin.length + 2;

        this.justifyCenter = "".padEnd(justifyLength, " ");

        this.etaStat = new MigrationStat({ color, label: "Eta" });
        this.percentageStat = new MigrationStat({ color });
    }

    protected createComponent = (): string => {
        const { margin, justifyCenter, etaStat, percentageStat } = this;
        const { eta, percentage } = this.props;

        const doneBar = "".padEnd(percentage, "■");
        const toGoBar = "".padEnd(100 - percentage, "■");

        const styledPercentage = percentageStat.create({ value: percentage, units: "%" });
        const styledBar = "  " + greenM(doneBar) + greenXD(toGoBar) + "  ";
        const styledEta = etaStat.create(eta);

        return margin + justifyCenter + styledPercentage + styledBar + styledEta + "\n";
    };
}

export default MigrationProgressBar;
