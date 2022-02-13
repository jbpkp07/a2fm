import ComponentColors from "./common/ComponentColors";

const { chartL, grayL, purp, white } = ComponentColors;

const logo = process.env.npm_package_name?.toUpperCase() || "???";
const title = process.env.npm_package_description || "???";
const version = process.env.npm_package_version || "?.?.?";

interface HeaderProps {
    readonly cols: number;
}

const Header = (props: HeaderProps): string => {
    const { cols } = props;

    const dot = white("·");
    const logoStyled = chartL(logo.split("").join(dot));
    const sepStyled = grayL(" » ");
    const titleStyled = white(title);
    const versionStyled = grayL("v" + version);

    const border = "".padEnd(cols - 4, "═");
    const justifyRight = "  ".padEnd(cols - version.length - 44, " ");

    const header = [
        " ╔" + border + "╗ ",
        " ║ " + logoStyled + sepStyled + titleStyled + justifyRight + versionStyled + " ║ ",
        " ╚" + border + "╝ ",
        ""
    ];

    return purp(header.join("\n"));
};

export default Header;
