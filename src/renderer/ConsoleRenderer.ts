import NumberUtils from "../common/NumberUtils";
import ConsoleColors from "./ConsoleColors";
import ConsoleIcons from "./ConsoleIcons";
import ConsoleUtils from "./ConsoleUtils";

const { isInteger } = NumberUtils;
const { gray, green, red, white } = ConsoleColors;
const { errorIcon, successIcon, warnIcon } = ConsoleIcons;
const { getWindowSize, onResize, renderScreen, resetConsole, restoreCursorOnExit, setEncodingUTF8 } = ConsoleUtils;

type Options = { hideCursor: boolean };

interface ConsoleRendererParams {
    minCols: number;
    minRows: number;
    hideCursor?: boolean;
}

class ConsoleRenderer {
    private readonly minCols: number;

    private readonly minRows: number;

    private readonly options: Options;

    private isTooSmall = false;

    private screen = white(`  ${warnIcon} No screen to render\n`);

    constructor(params: ConsoleRendererParams) {
        const { minCols, minRows, hideCursor } = params;

        if (!isInteger(minCols) || minCols < 80) {
            throw new Error("Argument 'minCols' must be an integer and >= 80");
        }

        if (!isInteger(minRows) || minRows < 3) {
            throw new Error("Argument 'minRows' must be an integer and >= 3");
        }

        this.minCols = minCols;
        this.minRows = minRows;
        this.options = { hideCursor: hideCursor ?? false };

        this.initializeConsole();
    }

    private initializeConsole(): void {
        setEncodingUTF8();
        restoreCursorOnExit();
        onResize(() => this.render(), this.options);
        resetConsole(this.options);
    }

    private createTooSmallScreen(cols: number, rows: number): string {
        const message = white("Console size too small, resize larger:");
        const width = cols < this.minCols ? red(`${cols} ${errorIcon}`) : green(`${cols} ${successIcon}`);
        const height = rows < this.minRows ? red(`${rows} ${errorIcon}`) : green(`${rows} ${successIcon}`);

        return gray(`  ${errorIcon} ${message}  (width: ${width}, height: ${height})\n`);
    }

    private renderTooSmallScreen(cols: number, rows: number): void {
        const tooSmallScreen = this.createTooSmallScreen(cols, rows);

        if (!this.isTooSmall) {
            this.isTooSmall = true;
            resetConsole(this.options);
        }

        renderScreen(tooSmallScreen);
    }

    private renderScreen(): void {
        if (this.isTooSmall) {
            this.isTooSmall = false;
            resetConsole(this.options);
        }

        renderScreen(this.screen);
    }

    public render(screen?: string): void {
        if (screen) this.screen = screen;

        const [cols, rows] = getWindowSize();

        if (cols < this.minCols || rows < this.minRows) {
            this.renderTooSmallScreen(cols, rows);
        } else {
            this.renderScreen();
        }
    }
}

export default ConsoleRenderer;
