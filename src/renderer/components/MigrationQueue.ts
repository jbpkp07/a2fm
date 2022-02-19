import NumberUtils from "../../common/NumberUtils";
import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";

const { isInteger } = NumberUtils;
const { chartM, chartL, grayD, grayM, grayL, pinkM, pinkL, white } = ComponentColors;
const { createBottomBorder, createTopBorder, justifyCenter, padNumber, padText } = ComponentUtils;

interface Migration {
    readonly eta: string;
    readonly srcFilePath: string;
}

interface MigrationQueueProps {
    readonly cols: number;
    readonly limit: number;
    readonly migrations: Migration[];
}

class MigrationQueue extends BaseComponent<MigrationQueueProps> {
    private createStyledLabel = (): string => {
        const { cols } = this.props;

        const styledLabel = grayL("Upcoming migrations");
        const styledArrow = chartL("↑\n");

        const margin = "  ";
        const justified = justifyCenter(cols, 21);

        return grayL(margin + styledLabel + justified + styledArrow);
    };

    private createStyledLimit = (): string => {
        const { cols, limit, migrations } = this.props;

        if (migrations.length <= limit) {
            return "";
        }

        const styledNotShownCount = grayL(migrations.length - limit);
        const justified = justifyCenter(cols, 5);

        return grayM(justified + "plus " + styledNotShownCount + " more…\n");
    };

    private createStyledMigration = (migration: Migration, i: number): string => {
        const { cols, limit } = this.props;
        const { eta, srcFilePath } = migration;

        const numberLength = String(limit).length;
        const pathLength = cols - numberLength - eta.length - 12;

        const number = padNumber(i + 1, numberLength);
        const path = padText(srcFilePath, pathLength);

        const styledNumber = i === 0 ? pinkL(number) : pinkM(number);
        const styledPath = i === 0 ? white(path) : grayM(path);
        const styledEta = i === 0 ? chartL(eta) : chartM(eta);

        const margin = "  ";
        const topBorder = createTopBorder("─", cols - 6);
        const botBorder = createBottomBorder("─", cols - 6);

        const row1 = margin + topBorder + margin + "\n";
        const row2 = margin + "│ " + styledNumber + margin + styledPath + margin + styledEta + " │" + margin + "\n";
        const row3 = margin + botBorder + margin + "\n";

        return i === 0 ? grayL(row1 + row2 + row3) : grayD(row2 + row3);
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
