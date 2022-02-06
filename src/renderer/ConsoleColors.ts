import * as chalk from "chalk";

const rgb = chalk.rgb.bind(chalk);

class ConsoleColors {
    public static darkPink = rgb(64, 20, 42);

    public static darkTeal = rgb(25, 64, 54);

    public static gray = rgb(153, 153, 153);

    public static green = rgb(100, 210, 100);

    public static pink = rgb(255, 80, 168);

    public static red = rgb(255, 100, 100);

    public static teal = rgb(100, 255, 218);

    public static white = rgb(248, 248, 248);

    public static yellow = rgb(230, 230, 0);
}

export default ConsoleColors;
