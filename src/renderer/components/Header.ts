import ComponentColors from "./common/ComponentColors";

const { chartL, grayM, purp, white } = ComponentColors;

const logo = process.env.npm_package_name?.toUpperCase() || "???";
const title = process.env.npm_package_description || "???";
const version = process.env.npm_package_version || "?.?.?";

interface HeaderProps {
    readonly cols: number;
}

const Header = (props: HeaderProps): string => {
    const { cols } = props;

    const margin = " ";
    const border = "".padEnd(cols - 4, "═");
    const justifyRight = "  ".padEnd(cols - version.length - 44, " ");

    const styledDot = white("·");
    const styledLogo = chartL(logo.split("").join(styledDot));
    const styledSep = grayM(" ┃ ");
    const styledTitle = white(title);
    const styledVersion = grayM("v" + version);

    const header = [
        margin + "╔" + border + "╗" + margin,
        margin + "║ " + styledLogo + styledSep + styledTitle + justifyRight + styledVersion + " ║" + margin,
        margin + "╚" + border + "╝" + margin,
        ""
    ];

    return purp(header.join("\n"));
};

export default Header;
