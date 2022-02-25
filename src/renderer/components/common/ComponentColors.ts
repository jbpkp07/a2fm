import * as chalk from "chalk";

type RGB = [number, number, number];

const gray: RGB = [150, 150, 150];
const green: RGB = [5, 255, 161];
const pink: RGB = [255, 87, 136];
const purple: RGB = [185, 103, 255];
const white: RGB = [255, 255, 255];

class ComponentColors {
    private constructor() {}

    public static dimRGB = ([r, g, b]: RGB, ratio: number) => {
        const dim = (color: number) => Math.floor(color * ratio);

        return chalk.rgb(dim(r), dim(g), dim(b));
    };

    public static grayL = this.dimRGB(gray, 1.0);

    public static grayM = this.dimRGB(gray, 0.85);

    public static grayD = this.dimRGB(gray, 0.3);

    public static greenL = this.dimRGB(green, 0.875);

    public static greenM = this.dimRGB(green, 0.675);

    public static greenD = this.dimRGB(green, 0.175);

    public static pinkL = this.dimRGB(pink, 1.0);

    public static pinkM = this.dimRGB(pink, 0.675);

    public static purpL = this.dimRGB(purple, 0.9);

    public static purpM = this.dimRGB(purple, 0.8);

    public static purpD = this.dimRGB(purple, 0.5);

    public static whiteL = this.dimRGB(white, 0.925);

    public static whiteM = this.dimRGB(white, 0.875);

    public static whiteD = this.dimRGB(white, 0.675);
}

export default ComponentColors;
