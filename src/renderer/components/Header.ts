import BaseComponent from "./common/BaseComponent";
import ComponentBorders from "./common/ComponentBorders";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";

const { createLeftRightBorderRow, createTopBorderRow, createBottomBorderRow } = ComponentBorders;
const { grayM, greenL, purpL, purpM, whiteL, whiteM } = ComponentColors;
const { padText, toStringLength } = ComponentUtils;

interface HeaderParams {
    readonly cols: number;
}

class Header extends BaseComponent {
    private readonly margin = " ";

    private readonly cols: number;

    private readonly topBorder: string;

    private readonly botBorder: string;

    constructor(params: HeaderParams) {
        super();

        const { cols } = params;
        const { margin } = this;

        this.cols = cols;
        this.topBorder = createTopBorderRow({ cols, margin, style: "double" });
        this.botBorder = createBottomBorderRow({ cols, margin, style: "double" });
    }

    protected createComponent = (): string => {
        const { env } = process;

        const logo = env.npm_package_name?.toUpperCase() || "???";
        const title = env.npm_package_description || "???";
        const version = env.npm_package_version || "?.?.?";

        const logoLength = toStringLength(logo.split("").join("·"));
        const versionLength = toStringLength("v", version);
        const titleLength = this.cols - logoLength - versionLength - 10;

        const titlePadded = padText(title, titleLength);

        const styledDot = whiteL("·");
        const styledLogo = greenL(logo.split("").join(styledDot));
        const styledSep = purpL(" ► ");
        const styledTitle = whiteM(titlePadded);
        const styledVersion = grayM("v" + version);

        const { margin, topBorder, botBorder } = this;

        const text = styledLogo + styledSep + styledTitle + margin + styledVersion;
        const textRow = createLeftRightBorderRow({ innerText: text, margin, style: "double" });

        return purpM(topBorder + textRow + botBorder);
    };
}

export default Header;
