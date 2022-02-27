import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ValueUnits from "./common/ValueUnits";
import MigrationStat from "./MigrationStat";

const { grayD } = ComponentColors;

interface MigrationProgressStatsProps {
    readonly destFileSize: ValueUnits;
    readonly elapsedTime: ValueUnits;
    readonly rate: ValueUnits;
    readonly srcFileSize: ValueUnits;
}

interface MigrationProgressStatsParams {
    readonly cols: number;
    readonly margin: string;
}

class MigrationProgressStats extends BaseComponent<MigrationProgressStatsProps> {
    private readonly margin: string;

    private readonly justifyCenter: string;

    private readonly destFileSizeStat: MigrationStat;

    private readonly elapsedTimeStat: MigrationStat;

    private readonly transferRateStat: MigrationStat;

    private readonly srcFileSizeStat: MigrationStat;

    private readonly styledSep = grayD("    ┃    ");

    constructor({ cols, margin }: MigrationProgressStatsParams) {
        super();

        this.margin = margin;

        const color = "light";
        const statsLength = 77;
        const justifyLength = cols / 2 - statsLength / 2 - margin.length + 1;

        this.justifyCenter = "".padEnd(justifyLength, " ");

        this.destFileSizeStat = new MigrationStat({ color, label: "Dest" });
        this.elapsedTimeStat = new MigrationStat({ color, label: "Elapsed" });
        this.transferRateStat = new MigrationStat({ color, label: "Rate" });
        this.srcFileSizeStat = new MigrationStat({ color, label: "Source" });
    }

    protected createComponent = (): string => {
        const { margin, justifyCenter, styledSep } = this;
        const { destFileSize, elapsedTime, rate, srcFileSize } = this.props;

        const statProps = [
            { stat: this.srcFileSizeStat, props: srcFileSize },
            { stat: this.destFileSizeStat, props: destFileSize },
            { stat: this.transferRateStat, props: rate },
            { stat: this.elapsedTimeStat, props: elapsedTime }
        ];

        const styledStats = statProps.map(({ stat, props }) => stat.create(props)).join(styledSep);

        return margin + justifyCenter + styledStats + "\n";
    };
}

export default MigrationProgressStats;
