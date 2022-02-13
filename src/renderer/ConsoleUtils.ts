import { execSync } from "child_process";

import restoreCursorOnExit = require("restore-cursor");

const { platform, stdout } = process;

const clearScreenDown = stdout.clearScreenDown.bind(stdout);
const cursorTo = stdout.cursorTo.bind(stdout);
const getScreenSize = stdout.getWindowSize.bind(stdout);
const write = stdout.write.bind(stdout);

export interface Options {
    hideCursor?: boolean;
}

export interface InitOptions extends Options {
    cols?: number;
    rows?: number;
}

class ConsoleUtils {
    private constructor() {}

    private static clearConsoleANSI = "\u001Bc";

    private static hideCursorANSI = "\u001B[?25l";

    private static initConsoleWin32 = (options?: InitOptions) => {
        if (platform !== "win32") return;

        const cols = options?.cols ?? 80;
        const rows = options?.rows ?? 25;

        execSync(`mode con:cols=${cols} lines=${rows} > nul`, { stdio: "inherit" });
        execSync("mode con:cp select=65001 > nul", { stdio: "inherit" });
    };

    public static clearConsole = (options?: Options): void => {
        if (options?.hideCursor) {
            cursorTo(0, 0, () => write(this.clearConsoleANSI + this.hideCursorANSI));
        } else {
            cursorTo(0, 0, () => write(this.clearConsoleANSI));
        }
    };

    public static getScreenSize = getScreenSize;

    public static initConsole = (options?: InitOptions): void => {
        restoreCursorOnExit();
        this.initConsoleWin32(options);
        this.clearConsole(options);
    };

    public static onConsoleResize = (listener: () => void, options?: Options): void => {
        stdout.on("resize", () => {
            if (options?.hideCursor) {
                write(this.hideCursorANSI);
            }

            listener();
        });
    };

    public static renderScreen = (screen: string): void => {
        cursorTo(0, 0, () => clearScreenDown(() => write(screen)));
    };
}

export default ConsoleUtils;
