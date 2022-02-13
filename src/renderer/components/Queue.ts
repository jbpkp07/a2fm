import ComponentColors from "./common/ComponentColors";

const { chartM, chartL, grayD, grayM, grayL, white } = ComponentColors;

interface Migration {
    readonly srcFilePath: string;
    readonly eta: string;
}

interface QueueProps {
    readonly cols: number;
    readonly migrations: Migration[];
}

const getBorder = (cols: number): string => {
    return "─".repeat(cols - 2);
};

const getJustifyRight = (cols: number, path: string, eta: string): string => {
    return " ".repeat(cols - path.length - eta.length - 4);
};

const getTrimmedPath = (cols: number, path: string, eta: string) => {
    const length = cols - path.length - eta.length - 4;

    return length < 2 ? path.substring(0, cols - eta.length - 7) + "…" : path;
};

const firstRow = (migration: Migration, cols: number): string => {
    const { srcFilePath, eta } = migration;

    const path = getTrimmedPath(cols, srcFilePath, eta);
    const border = getBorder(cols);
    const justifyRight = getJustifyRight(cols, path, eta);
    const pathStyled = white(path);
    const etaStyled = chartL(eta);

    // prettier-ignore
    const rows = [
        "   ┌" + border + "┐",
        "   │ " + pathStyled + justifyRight + etaStyled + " │",
        "   └" + border + "┘"
    ];

    return grayL(rows.join("\n"));
};

const nextRow = (migration: Migration, cols: number): string => {
    const { srcFilePath, eta } = migration;

    const path = getTrimmedPath(cols, srcFilePath, eta);
    const border = getBorder(cols);
    const justifyRight = getJustifyRight(cols, path, eta);
    const pathStyled = grayM(path);
    const etaStyled = chartM(eta);

    // prettier-ignore
    const rows = [
        "   │ " + pathStyled + justifyRight + etaStyled + " │",
        "   └" + border + "┘"
    ];

    return grayD(rows.join("\n"));
};

const Queue = (props: QueueProps): string => {
    const { cols, migrations } = props;

    if (migrations.length === 0) {
        return "";
    }

    const toQueue = (migration: Migration, i: number) => {
        return i === 0 ? firstRow(migration, cols) : nextRow(migration, cols);
    };

    const labelStyled = grayL("\n\n\n\n\n\n  Upcoming migrations\n");
    const queue = migrations.map(toQueue);

    return labelStyled + queue.join("\n");
};

export default Queue;
