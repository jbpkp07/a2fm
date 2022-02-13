import * as chalk from "chalk";

const rgb = chalk.rgb.bind(chalk);

class ConsoleColors {
    public static chartM = rgb(85, 153, 17);

    public static chartL = rgb(142, 255, 28);

    public static grayD = rgb(60, 60, 60);

    public static grayM = rgb(110, 110, 110);

    public static grayL = rgb(150, 150, 150);

    public static green = chalk.greenBright;

    // public static pinkD = rgb(64, 20, 42);

    // public static pinkM = rgb(128, 40, 84);

    // public static pinkL = rgb(255, 80, 168);

    public static purp = rgb(127, 28, 255);

    public static red = chalk.redBright;

    // public static tealD = rgb(33, 85, 72);

    // public static tealM = rgb(80, 204, 173);

    // public static tealL = rgb(100, 255, 216);

    public static white = rgb(255, 255, 255);

    public static yellow = chalk.yellow;
}

export default ConsoleColors;
