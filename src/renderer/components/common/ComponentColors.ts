import * as chalk from "chalk";

const rgb = chalk.rgb.bind(chalk);

class ComponentColors {
    private constructor() {}

    public static chartM = rgb(85, 153, 17);

    public static chartL = rgb(142, 255, 28);

    public static grayD = rgb(60, 60, 60);

    public static grayM = rgb(105, 105, 105);

    public static grayL = rgb(150, 150, 150);

    public static pinkD = rgb(64, 20, 42);

    public static pinkM = rgb(153, 48, 100);

    public static pinkL = rgb(255, 80, 168);

    public static purpM = rgb(96, 21, 192);

    public static purpL = rgb(128, 28, 255);

    public static tealD = rgb(33, 85, 72);

    public static tealM = rgb(80, 204, 173);

    public static tealL = rgb(100, 255, 216);

    public static whiteD = rgb(192, 192, 192);

    public static whiteL = rgb(255, 255, 255);
}

export default ComponentColors;
