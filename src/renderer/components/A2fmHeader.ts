import ConsoleColors from "../ConsoleColors";

const { grayM, grayL, pinkL, tealD, tealM, white } = ConsoleColors;

interface A2fmHeaderProps {
    readonly cols: number;
    readonly version: string;
}

const A2fmHeader = (props: A2fmHeaderProps): string => {
    const { cols, version } = props;

    const border = "═".repeat(cols);
    const justifyRight = " ".repeat(cols - version.length - 40);

    const dot = white("·");
    const logoStyled = pinkL(`A${dot}2${dot}F${dot}M`);
    const sepStyled = grayL(" » ");
    const titleStyled = tealM("Aspera To Facilis Migration");
    const versionStyled = grayM("v" + version);

    const header = [
        " ╔" + border + "╗",
        " ║ " + logoStyled + sepStyled + titleStyled + justifyRight + versionStyled + " ║",
        " ╚" + border + "╝",
        ""
    ];

    return tealD(header.join("\n"));
};

export default A2fmHeader;
