import { execSync } from "child_process";

import restoreCursorOnExit = require("restore-cursor");

const { stdout } = process;

const clearScreenDown = stdout.clearScreenDown.bind(stdout);
const cursorTo = stdout.cursorTo.bind(stdout);
const getScreenSize = stdout.getWindowSize.bind(stdout);
const write = stdout.write.bind(stdout);

export type Options = { hideCursor?: boolean };

class ConsoleUtils {
    private constructor() {}

    private static clearConsoleANSI = "\u001Bc";

    private static hideCursorANSI = "\u001B[?25l";

    private static setConsoleEncodingUTF8 = (): void => {
        if (process.platform === "win32") {
            execSync("chcp 65001");
        }
    };

    public static clearConsole = (options?: Options): void => {
        if (options?.hideCursor) {
            cursorTo(0, 0, () => write(this.clearConsoleANSI + this.hideCursorANSI));
        } else {
            cursorTo(0, 0, () => write(this.clearConsoleANSI));
        }
    };

    public static getScreenSize = getScreenSize;

    public static initConsoleUTF8 = (options?: Options): void => {
        restoreCursorOnExit();
        this.setConsoleEncodingUTF8();
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
