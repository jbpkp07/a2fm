class ComponentUtils {
    private constructor() {}

    public static padNumber = (num: number, length: number): string => {
        return String(num).padStart(length, " ");
    };

    public static padText = (text: string, length: number): string => {
        const truncatedText = text.length > length ? text.substring(0, length - 1) + "…" : text;

        return truncatedText.padEnd(length, " ");
    };

    public static toStringLength = (...args: unknown[]): number => {
        return args.reduce((sum: number, arg: unknown) => sum + String(arg).length, 0);
    };
}

export default ComponentUtils;
