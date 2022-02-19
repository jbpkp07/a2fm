import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";

const { chartL, grayM, purp, white } = ComponentColors;

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

        const styledDot = white("·");
        const styledLogo = chartL(logo.split("").join(styledDot));
        const styledSep = grayM(" ┃ ");
        const styledTitle = white(title);
        const styledVersion = grayM("v" + version);

        const margin = " ";
        const border = "".padEnd(cols - 4, "═");
        const justifyRight = "  ".padEnd(cols - version.length - 44, " ");

        const header = [
            margin + "╔" + border + "╗" + margin,
            margin + "║ " + styledLogo + styledSep + styledTitle + justifyRight + styledVersion + " ║" + margin,
            margin + "╚" + border + "╝" + margin,
            ""
        ].join("\n");

        return purp(header);
    };
}

export default Header;
