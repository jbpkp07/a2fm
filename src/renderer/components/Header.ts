import BaseComponent from "./common/BaseComponent";
import ComponentBorders from "./common/ComponentBorders";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";

const { createLeftRightBorderRow, createTopBorderRow, createBottomBorderRow } = ComponentBorders;
const { grayM, greenL, purpL, purpM, whiteL, whiteM } = ComponentColors;
const { padText } = ComponentUtils;

const { env } = process;

class Header extends BaseComponent {
    private readonly cols: number;

    private readonly margin = " ";

    private readonly logo = env.npm_package_name?.toUpperCase() || "???";

    private readonly title = env.npm_package_description || "???";

    private readonly version = env.npm_package_version || "?.?.?";

    constructor(cols: number) {
        super();
        this.cols = cols;
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
        const styledTitle = whiteM(paddedTitle);
        const styledVersion = grayM(" v" + version);

        const borderProps = {
            cols,
            innerText: styledLogo + styledSep + styledTitle + styledVersion,
            margin,
            style: "double" as const
        };

        const topBorderRow = createTopBorderRow(borderProps);
        const leftRightBorderRow = createLeftRightBorderRow(borderProps);
        const botBorderRow = createBottomBorderRow(borderProps);

        return purpM(topBorderRow + leftRightBorderRow + botBorderRow);
    };
}

export default Header;
