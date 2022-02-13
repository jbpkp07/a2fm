import ComponentColors from "./common/ComponentColors";

const { chartM, chartL, grayD, grayM, grayL, white } = ComponentColors;

interface CreateRowProps {
    readonly border: string;
    readonly eta: string;
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

const createStyledFirstRow = (props: CreateRowProps): string => {
    const { border, eta, margin, path } = props;

    const styledPath = white(path);
    const styledEta = chartL(eta);

    const rows = [
        margin + "┌" + border + "┐" + margin,
        margin + "│ " + styledPath + margin + styledEta + " │" + margin,
        margin + "└" + border + "┘" + margin
    ];

    return grayL(rows.join("\n"));
};

const createStyledNextRow = (props: CreateRowProps): string => {
    const { border, eta, margin, path } = props;

    const styledPath = grayM(path);
    const styledEta = chartM(eta);

    const rows = [
        margin + "│ " + styledPath + margin + styledEta + " │" + margin,
        margin + "└" + border + "┘" + margin
    ];

    return grayD(rows.join("\n"));
};

const createStyledLabel = (margin: string, cols: number): string => {
    const justifyCenter = " ".padEnd(cols / 2 - 22, " ");

    const styledLabel = grayL("Upcoming migrations");
    const styledArrow = chartL("↑\n");

    return grayL(margin + styledLabel + justifyCenter + styledArrow);
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

        return i === 0
            ? createStyledFirstRow({ border, eta, margin, path })
            : createStyledNextRow({ border, eta, margin, path });
    };

    const styledLabel = createStyledLabel(margin, cols);
    const styledQueue = migrations.map(toStyledQueue);

    return styledLabel + styledQueue.join("\n");
};

export default Queue;
