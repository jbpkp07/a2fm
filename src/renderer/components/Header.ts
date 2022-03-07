import BaseComponent from "./common/BaseComponent";
import ComponentBorders from "./common/ComponentBorders";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";

const { createTopBorderRow, createLeftRightBorderRow, createBottomBorderRow } = ComponentBorders;
const { grayM, greenL, purpL, purpLM, whiteL } = ComponentColors;
const { padText } = ComponentUtils;

interface HeaderParams {
    readonly cols: number;
    readonly marginCols: number;
}

class Header extends BaseComponent {
    private readonly cols: number;

    private readonly margin: string;

    private readonly logo = process.env.npm_package_name?.toUpperCase() || "???";

    private readonly title = process.env.npm_package_description || "???";

    private readonly version = process.env.npm_package_version || "?.?.?";

    constructor({ cols, marginCols }: HeaderParams) {
        super();

        this.cols = cols;
        this.margin = "".padEnd(marginCols, " ");
    }

    protected createComponent = (): string => {
        const { cols, margin, logo, title, version } = this;

        const marginLength = margin.length * 2;
        const logoLength = logo.length * 2 - 1;
        const versionLength = version.length + 2;
        const titleLength = cols - marginLength - logoLength - versionLength - 7;

        const paddedTitle = padText(title, titleLength);

        const styledDot = whiteL("·");
        const styledLogo = greenL(logo.split("").join(styledDot));
        const styledSep = purpL(" ► ");
        const styledTitle = whiteL(paddedTitle);
        const styledVersion = grayM(" v" + version);

        const borderProps = {
            cols,
            innerText: styledLogo + styledSep + styledTitle + styledVersion,
            margin,
            style: "double" as const
        };

        const topBorderRow = createTopBorderRow(borderProps);
        const leftRightBorderRow = createLeftRightBorderRow(borderProps);
        const bottomBorderRow = createBottomBorderRow(borderProps);

        return purpLM(topBorderRow + leftRightBorderRow + bottomBorderRow);
    };
}

export default Header;
