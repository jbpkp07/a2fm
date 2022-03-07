class WaitUtils {
    private constructor() {}

    public static wait = async (ms: number): Promise<void> => {
        const waitMs = ms >= 0 ? Math.ceil(ms) : 0;

        return new Promise<void>((resolve) => {
            setTimeout(resolve, waitMs);
        });
    };
}

export default WaitUtils;
