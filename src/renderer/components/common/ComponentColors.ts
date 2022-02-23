import * as chalk from "chalk";

import NumberUtils from "../../../common/NumberUtils";

const { floor } = NumberUtils;

type RGB = [number, number, number];

const green: RGB = [5, 255, 161];
const gray: RGB = [150, 150, 150];
const pink: RGB = [255, 87, 136];
const purple: RGB = [185, 103, 255];
const white: RGB = [255, 255, 255];

const dim = (rgb: RGB, alpha: number): RGB => {
    return [floor(rgb[0] * alpha), floor(rgb[1] * alpha), floor(rgb[2] * alpha)];
};

const rgb = chalk.rgb.bind(chalk);

class ComponentColors {
    private constructor() {}

    public static greenL = rgb(...dim(green, 0.875));

    public static greenM = rgb(...dim(green, 0.675));

    public static greenD = rgb(...dim(green, 0.175));

    public static grayA = (text: string, alpha: number) => rgb(...dim(gray, alpha))(text);

    public static grayL = rgb(...gray);

    public static grayM = rgb(...dim(gray, 0.85));

    public static grayD = rgb(...dim(gray, 0.3));

    public static pinkL = rgb(...pink);

    public static pinkM = rgb(...dim(pink, 0.675));

    public static pinkD = rgb(...dim(pink, 0.2));

    public static purpL = rgb(...dim(purple, 0.9));

    public static purpM = rgb(...dim(purple, 0.8));

    public static purpD = rgb(...dim(purple, 0.5));

    // public static whiteL = rgb(...white);

    public static whiteM = rgb(...dim(white, 0.925));

    public static whiteD = rgb(...dim(white, 0.875));

    public static whiteXD = rgb(...dim(white, 0.675));
}

export default ComponentColors;
