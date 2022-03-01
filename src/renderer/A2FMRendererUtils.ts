const { ceil } = Math;

interface ToEtaSecondsProps {
    readonly bytesPerSecond: number;
    readonly bytesWritten?: number;
    readonly fileSizeBytes: number;
}

class A2FMRendererUtils {
    private constructor() {}

    public static toEtaSeconds = (props: ToEtaSecondsProps): number | undefined => {
        const { bytesPerSecond, bytesWritten, fileSizeBytes } = props;
        const remainingBytes = fileSizeBytes - (bytesWritten ?? 0);

        return bytesPerSecond > 0 ? ceil(remainingBytes / bytesPerSecond) : undefined;
    };
}

export default A2FMRendererUtils;
