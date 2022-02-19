class ComponentUtils {
    private constructor() {}

    public static createBottomBorder = (char: "═" | "─", width: number): string => {
        const border = "".padEnd(width, char);

        return char === "═" ? `╚${border}╝` : `└${border}┘`;
    };

    public static createTopBorder = (char: "═" | "─", width: number): string => {
        const border = "".padEnd(width, char);

        return char === "═" ? `╔${border}╗` : `┌${border}┐`;
    };

    public static justifyCenter = (cols: number, offset: number): string => {
        const length = cols / 2 - offset;

        return "".padEnd(length, " ");
    };

    public static justifyRight = (cols: number, offset: number): string => {
        const length = cols - offset;

        return "".padEnd(length, " ");
    };

    public static padNumber = (num: number, length: number): string => {
        return String(num).padEnd(length, " ");
    };

    public static padText = (text: string, length: number): string => {
        const trimmedPath = text.length > length ? text.substring(0, length - 1) + "…" : text;

        return trimmedPath.padEnd(length, " ");
    };
}

export default ComponentUtils;
