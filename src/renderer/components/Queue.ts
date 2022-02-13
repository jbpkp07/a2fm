import ComponentColors from "./common/ComponentColors";

const { chartM, chartL, grayD, grayM, grayL, white } = ComponentColors;

interface CreateRowProps {
    readonly border: string;
    readonly eta: string;
    readonly isFirstRow: boolean;
    readonly margin: string;
    readonly path: string;
}

interface Migration {
    readonly srcFilePath: string;
    readonly eta: string;
}

interface QueueProps {
    readonly cols: number;
    readonly migrations: Migration[];
}

const createStyledLabel = (margin: string, cols: number): string => {
    const justifyCenter = " ".padEnd(cols / 2 - 22, " ");

    const styledLabel = grayL("Upcoming migrations");
    const styledArrow = chartL("↑\n");

    return grayL(margin + styledLabel + justifyCenter + styledArrow);
};

const createStyledRow = (props: CreateRowProps): string => {
    const { border, eta, isFirstRow, margin, path } = props;

    const styledPath = isFirstRow ? white(path) : grayM(path);
    const styledEta = isFirstRow ? chartL(eta) : chartM(eta);

    const row1 = margin + "┌" + border + "┐" + margin + "\n";
    const row2 = margin + "│ " + styledPath + margin + styledEta + " │" + margin + "\n";
    const row3 = margin + "└" + border + "┘" + margin;

    return isFirstRow ? grayL(row1 + row2 + row3) : grayD(row2 + row3);
};

const padPath = (path: string, length: number): string => {
    const trimmedPath = length < path.length ? path.substring(0, length - 1) + "…" : path;

    return trimmedPath.padEnd(length, " ");
};

const Queue = (props: QueueProps): string => {
    const { cols, migrations } = props;

    if (migrations.length === 0) {
        return "";
    }

    const margin = "  ";
    const border = "".padEnd(cols - 6, "─");

    const toStyledQueue = ({ srcFilePath, eta }: Migration, i: number) => {
        const length = cols - eta.length - 10;
        const path = padPath(srcFilePath, length);
        const isFirstRow = i === 0;

        return createStyledRow({ border, eta, isFirstRow, margin, path });
    };

    const styledLabel = createStyledLabel(margin, cols);
    const styledQueue = migrations.map(toStyledQueue);

    return styledLabel + styledQueue.join("\n");
};

export default Queue;
