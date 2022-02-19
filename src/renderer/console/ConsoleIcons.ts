import ConsoleColors from "./ConsoleColors";

const { green, red, yellow } = ConsoleColors;

class ConsoleIcons {
    private constructor() {}

    public static errorIcon = red("[×]");

    public static successIcon = green("[√]");

    public static warnIcon = yellow("[‼]");
}

export default ConsoleIcons;
