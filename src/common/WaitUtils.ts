class WaitUtils {
    private constructor() {}

    public static wait = async (ms: number): Promise<void> => {
        const waitMs = ms >= 0 ? Math.ceil(ms) : 0;

        const executor = (resolve: () => void) => setTimeout(resolve, waitMs);

        return new Promise(executor);
    };
}

export default WaitUtils;
