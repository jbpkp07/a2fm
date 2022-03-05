import * as chalk from "chalk";

type RGB = [number, number, number];

const blue: RGB = [1, 205, 255];
const gray: RGB = [145, 145, 145];
const green: RGB = [5, 255, 161];
const pink: RGB = [255, 113, 206];
const purple: RGB = [185, 103, 255];
const white: RGB = [255, 255, 255];

const light = 1.0;
const lightMedium = 0.825;
const medium = 0.65;
const dark = 0.35;
const extraDark = 0.175;

class ComponentColors {
    private constructor() {}

    private static dimRGB = ([r, g, b]: RGB, ratio: number) => {
        const dim = (color: number) => Math.floor(color * ratio);

        return chalk.rgb(dim(r), dim(g), dim(b));
    };

    public static blueL = this.dimRGB(blue, light);

    public static blueM = this.dimRGB(blue, medium);

    public static grayL = this.dimRGB(gray, light);

    public static grayM = this.dimRGB(gray, medium);

    public static grayD = this.dimRGB(gray, dark);

    public static greenL = this.dimRGB(green, light);

    public static greenM = this.dimRGB(green, medium);

    public static greenXD = this.dimRGB(green, extraDark);

    public static pinkL = this.dimRGB(pink, light);

    public static pinkM = this.dimRGB(pink, medium);

    public static purpL = this.dimRGB(purple, light);

    public static purpLM = this.dimRGB(purple, lightMedium);

    public static purpD = this.dimRGB(purple, dark);

    public static whiteL = this.dimRGB(white, light);

    public static whiteLM = this.dimRGB(white, lightMedium);

    public static whiteM = this.dimRGB(white, medium);
}

export default ComponentColors;
