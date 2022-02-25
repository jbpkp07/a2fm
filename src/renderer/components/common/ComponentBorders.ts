type BorderStyle = "single" | "double";

interface BorderProps {
    readonly cols: number;
    readonly margin: string;
    readonly style: BorderStyle;
}

interface LeftRightBorderProps {
    readonly innerText?: string;
    readonly margin: string;
    readonly style: BorderStyle;
}

class ComponentBorders {
    private constructor() {}

    private static createBorder = (props: BorderProps): string => {
        const { cols, margin, style } = props;

        const width = cols - margin.length * 2 - 2;
        const borderChar = style === "single" ? "─" : "═";

        return "".padEnd(width, borderChar);
    };

    public static createTopBorderRow = (props: BorderProps): string => {
        const { margin, style } = props;

        const border = this.createBorder(props);

        return margin + (style === "single" ? `┌${border}┐` : `╔${border}╗`) + margin + "\n";
    };

    public static createLeftRightBorderRow = (props: LeftRightBorderProps): string => {
        const { innerText, margin, style } = props;

        const border = style === "single" ? "│" : "║";

        return margin + border + " " + (innerText ?? "") + " " + border + margin + "\n";
    };

    public static createJoinBorderRow = (props: BorderProps): string => {
        const { margin, style } = props;

        const border = this.createBorder(props);

        return margin + (style === "single" ? `├${border}┤` : `╠${border}╣`) + margin + "\n";
    };

    public static createBottomBorderRow = (props: BorderProps): string => {
        const { margin, style } = props;

        const border = this.createBorder(props);

        return margin + (style === "single" ? `└${border}┘` : `╚${border}╝`) + margin + "\n";
    };
}

export default ComponentBorders;
