import NumberUtils from "../common/NumberUtils";
import ConsoleColors from "./ConsoleColors";
import ConsoleIcons from "./ConsoleIcons";
import ConsoleUtils, { Options } from "./ConsoleUtils";

const { isInteger } = NumberUtils;
const { grayL, green, red, white } = ConsoleColors;
const { errorIcon, successIcon, warnIcon } = ConsoleIcons;
const { clearConsole, getScreenSize, initConsole, onConsoleResize, renderScreen } = ConsoleUtils;

interface ConsoleRendererParams {
    cols: number;
    rows: number;
    hideCursor?: boolean;
}

class ConsoleRenderer {
    private readonly minCols: number;

    private readonly minRows: number;

    private readonly options: Options;

    private isScreenTooSmall = false;

    private screen = white(` ${warnIcon} No screen to render\n`);

    constructor(params: ConsoleRendererParams) {
        const { cols, rows } = params;
        const hideCursor = params.hideCursor ?? false;

        if (!isInteger(cols) || cols < 10) {
            // ****************************************************************************************************************************************** back to 80
            throw new Error("Argument 'cols' must be an integer and >= 80");
        }

        if (!isInteger(rows) || rows < 3) {
            throw new Error("Argument 'rows' must be an integer and >= 3");
        }

        this.minCols = cols;
        this.minRows = rows;
        this.options = { hideCursor };

        initConsole({ cols, rows, hideCursor });
        onConsoleResize(() => this.render(), this.options);
    }

    private createTooSmallScreen(cols: number, rows: number): string {
        const message = white("Console size too small, resize larger:");
        const width = cols < this.minCols ? red(`${cols} ${errorIcon}`) : green(`${cols} ${successIcon}`);
        const height = rows < this.minRows ? red(`${rows} ${errorIcon}`) : green(`${rows} ${successIcon}`);

        return grayL(` ${errorIcon} ${message}  (width: ${width}, height: ${height})\n`);
    }

    private renderScreen(): void {
        if (this.isScreenTooSmall) {
            this.isScreenTooSmall = false;
            clearConsole(this.options);
        }

        renderScreen(this.screen);
    }

    private renderTooSmallScreen(cols: number, rows: number): void {
        const tooSmallScreen = this.createTooSmallScreen(cols, rows);

        if (!this.isScreenTooSmall) {
            this.isScreenTooSmall = true;
            clearConsole(this.options);
        }

        renderScreen(tooSmallScreen);
    }

    public render(screen?: string): void {
        if (screen) this.screen = screen;

        const [cols, rows] = getScreenSize();

        if (cols >= this.minCols && rows >= this.minRows) {
            this.renderScreen();
        } else {
            this.renderTooSmallScreen(cols, rows);
        }
    }
}

export default ConsoleRenderer;
