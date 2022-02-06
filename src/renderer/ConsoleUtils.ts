import { execSync } from "child_process";

import restoreCursorOnExit = require("restore-cursor");

const { stdout } = process;

const clearScreenDown = stdout.clearScreenDown.bind(stdout);
const cursorTo = stdout.cursorTo.bind(stdout);
const getWindowSize = stdout.getWindowSize.bind(stdout);
const write = stdout.write.bind(stdout);

type Listener = () => void;
type Options = { hideCursor?: boolean };

class ConsoleUtils {
    private constructor() {}

    private static hideCursorANSI = "\u001B[?25l";

    private static resetConsoleANSI = "\u001Bc";

    public static getWindowSize = getWindowSize;

    public static restoreCursorOnExit = restoreCursorOnExit;

    public static onResize = (listener: Listener, options?: Options): void => {
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

    public static resetConsole = (options?: Options): void => {
        if (options?.hideCursor) {
            cursorTo(0, 0, () => write(this.resetConsoleANSI + this.hideCursorANSI));
        } else {
            cursorTo(0, 0, () => write(this.resetConsoleANSI));
        }
    };

    public static setEncodingUTF8 = (): void => {
        if (process.platform === "win32") {
            execSync("chcp 65001");
        }
    };
}

export default ConsoleUtils;
