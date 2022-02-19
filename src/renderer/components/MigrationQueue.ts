import NumberUtils from "../../common/NumberUtils";
import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";

const { isInteger } = NumberUtils;
const { chartM, chartL, grayD, grayM, grayL, pinkM, pinkL, white } = ComponentColors;

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
        const styledLabel = grayL("Upcoming migrations");
        const styledArrow = chartL("↑\n");

        const margin = "  ";
        const justifyCenter = this.justifyCenter(22);

        return grayL(margin + styledLabel + justifyCenter + styledArrow);
    };

    private createStyledLimit = (): string => {
        const { limit, migrations } = this.props;

        if (migrations.length <= limit) {
            return "";
        }

        const styledNotShownCount = grayL(migrations.length - limit);
        const justifyCenter = this.justifyCenter(6);

        return grayM(justifyCenter + "plus " + styledNotShownCount + " more…\n");
    };

    private createStyledMigration = (migration: Migration, i: number): string => {
        const { cols } = this.props;
        const { eta, srcFilePath } = migration;

        const number = this.padNumber(i + 1);
        const length = cols - number.length - eta.length - 12;
        const path = this.padPath(srcFilePath, length);

        const styledNumber = i === 0 ? pinkL(number) : pinkM(number);
        const styledPath = i === 0 ? white(path) : grayM(path);
        const styledEta = i === 0 ? chartL(eta) : chartM(eta);

        const margin = "  ";
        const border = "".padEnd(cols - 6, "─");

        const row1 = margin + "┌" + border + "┐" + margin + "\n";
        const row2 = margin + "│ " + styledNumber + margin + styledPath + margin + styledEta + " │" + margin + "\n";
        const row3 = margin + "└" + border + "┘" + margin + "\n";

        return i === 0 ? grayL(row1 + row2 + row3) : grayD(row2 + row3);
    };

    private createStyledQueue = (): string => {
        const limitedMigrations = this.limitMigrations();

        return limitedMigrations.map(this.createStyledMigration).join("");
    };

    private justifyCenter = (offset: number): string => {
        const length = this.props.cols / 2 - offset;

        return " ".padEnd(length, " ");
    };

    private limitMigrations = (): Migration[] => {
        const { limit, migrations } = this.props;

        return migrations.length > limit ? migrations.slice(0, limit) : migrations;
    };

    private padNumber = (num: number): string => {
        const { length } = String(this.props.limit);

        return String(num).padEnd(length, " ");
    };

    private padPath = (path: string, length: number): string => {
        const trimmedPath = path.length > length ? path.substring(0, length - 1) + "…" : path;

        return trimmedPath.padEnd(length, " ");
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
