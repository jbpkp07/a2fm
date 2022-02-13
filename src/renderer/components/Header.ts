import ComponentColors from "./common/ComponentColors";

const { chartL, grayL, purp, white } = ComponentColors;

interface HeaderProps {
    readonly cols: number;
    readonly version: string;
}

const Header = (props: HeaderProps): string => {
    const { cols, version } = props;

    const dot = white("·");
    const logoStyled = chartL(`A${dot}2${dot}F${dot}M`);
    const sepStyled = grayL(" » ");
    const titleStyled = white("Aspera To Facilis Migration");
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
