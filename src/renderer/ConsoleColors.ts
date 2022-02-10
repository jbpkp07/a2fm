import * as chalk from "chalk";

const rgb = chalk.rgb.bind(chalk);

class ConsoleColors {
    public static grayM = rgb(100, 100, 100);

    public static grayL = rgb(150, 150, 150);

    public static green = rgb(100, 210, 100);

    public static pinkD = rgb(64, 20, 42);

    public static pinkM = rgb(128, 40, 84);

    public static pinkL = rgb(255, 80, 168);

    public static red = rgb(255, 100, 100);

    public static tealD = rgb(33, 85, 72);

    public static tealM = rgb(80, 204, 173);

    public static tealL = rgb(100, 255, 216);

    public static white = rgb(248, 248, 248);

    public static yellow = rgb(230, 230, 0);
}

export default ConsoleColors;
