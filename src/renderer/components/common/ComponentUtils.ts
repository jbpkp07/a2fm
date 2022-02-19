class ComponentUtils {
    private constructor() {}

    public static padPath = (path: string, length: number): string => {
        const trimmedPath = path.length > length ? path.substring(0, length - 1) + "…" : path;

        return trimmedPath.padEnd(length, " ");
    };
}

export default ComponentUtils;
