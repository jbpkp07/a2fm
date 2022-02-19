import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";

const { chartL, grayM, purpL, whiteL } = ComponentColors;
const { createBottomBorder, createTopBorder, justifyRight } = ComponentUtils;

interface HeaderProps {
    readonly cols: number;
}

class Header extends BaseComponent<HeaderProps> {
    protected createComponent = (): string => {
        const { cols } = this.props;
        const { env } = process;

        const logo = env.npm_package_name?.toUpperCase() || "???";
        const title = env.npm_package_description || "???";
        const version = env.npm_package_version || "?.?.?";

        const styledDot = whiteL("·");
        const styledLogo = chartL(logo.split("").join(styledDot));
        const styledSep = grayM(" ┃ ");
        const styledTitle = whiteL(title);
        const styledVersion = grayM("v" + version);

        const margin = " ";
        const topBorder = createTopBorder("═", cols - 4);
        const botBorder = createBottomBorder("═", cols - 4);
        const justified = justifyRight(cols, version.length + 45);

        const header = [
            margin + topBorder + margin,
            margin + "║ " + styledLogo + styledSep + styledTitle + justified + margin + styledVersion + " ║" + margin,
            margin + botBorder + margin,
            ""
        ].join("\n");

        return purpL(header);
    };
}

export default Header;
