import NumberUtils from "../../common/NumberUtils";
import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";
import ValueUnits from "./common/ValueUnits";

const { isInteger } = NumberUtils;
const { greenM, grayL, grayM, pinkM, purpL, purpM, purpD, whiteD } = ComponentColors;
const { createBottomBorder, createInnerBorder, createTopBorder, justifyCenter, padNumber, padText } = ComponentUtils;

interface Migration {
    readonly eta: ValueUnits;
    readonly srcFilePath: string;
}

interface MigrationQueueProps {
    readonly cols: number;
    readonly limit: number;
    readonly migrations: Migration[];
}

class MigrationQueue extends BaseComponent<MigrationQueueProps> {
    private margin = "  ";

    private createStyledLabel = (): string => {
        const { cols } = this.props;

        const styledLabel = purpL("Upcoming migrations");
        const styledArrow = purpM("▲\n");

        const justified = justifyCenter(cols, 21);

        return this.margin + styledLabel + justified + styledArrow;
    };

    private createStyledLimit = (): string => {
        const { cols, limit, migrations } = this.props;

        if (migrations.length <= limit) {
            return "";
        }

        const styledNotShownCount = greenM(migrations.length - limit);
        const justified = justifyCenter(cols, 5);

        return grayL(justified + "Plus " + styledNotShownCount + " more…\n");
    };

    private createStyledMigration = (migration: Migration, i: number, { length }: Migration[]): string => {
        const { cols, limit } = this.props;
        const { eta, srcFilePath } = migration;

        const numberLength = String(limit).length;
        const etaValue = String(eta.value) + " ";
        const etaLength = String(etaValue + eta.units).length;
        const pathLength = cols - numberLength - etaLength - 12;

        const number = padNumber(i + 1, numberLength);
        const path = padText(srcFilePath, pathLength);

        const styledNumber = greenM(number);
        const styledPath = grayM(path);
        const styledEta = pinkM(etaValue) + whiteD(eta.units);

        const { margin } = this;
        const topBorder = createTopBorder("─", cols - 6);
        const innerBorder = createInnerBorder("─", cols - 6);
        const botBorder = createBottomBorder("─", cols - 6);

        const topRow = margin + topBorder + margin + "\n";
        const infoRow = margin + "│ " + styledNumber + margin + styledPath + margin + styledEta + " │" + margin + "\n";
        const innerBotRow = margin + innerBorder + margin + "\n";
        const botRow = margin + botBorder + margin + "\n";

        const isFirst = i === 0;
        const isLast = i === length - 1;

        return purpD((isFirst ? topRow : "") + infoRow + (isLast ? botRow : innerBotRow));
    };

    private createStyledQueue = (): string => {
        const { limit, migrations } = this.props;
        const { createStyledMigration } = this;

        const limitedMigrations = migrations.slice(0, limit);

        return limitedMigrations.map(createStyledMigration).join("");
    };

    protected createComponent = (): string => {
        const { limit, migrations } = this.props;

        if (!isInteger(limit) || limit < 0) {
            throw new Error("Prop 'limit' must be an integer and >= 0");
        }

        if (limit === 0 || migrations.length === 0) {
            return "";
        }

        return this.createStyledLabel() + this.createStyledQueue() + this.createStyledLimit();
    };
}

export default MigrationQueue;
