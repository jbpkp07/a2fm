import ConsoleColors from "./ConsoleColors";

const { green, red, yellow } = ConsoleColors;

class ConsoleIcons {
    public static errorIcon = red("[×]");

    public static successIcon = green("[√]");

    public static warnIcon = yellow("[‼]");
}

export default ConsoleIcons;
