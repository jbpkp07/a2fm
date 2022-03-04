import ValueUnits, { Units } from "./components/common/ValueUnits";

const { ceil } = Math;

interface ToEtaSecondsProps {
    readonly bytesWritten?: number;
    readonly etaBytesPerSecond: number;
    readonly fileSizeBytes: number;
}

class A2FMRendererUtils {
    private constructor() {}

    public static toEtaSeconds = (props: ToEtaSecondsProps): number => {
        const { bytesWritten, etaBytesPerSecond, fileSizeBytes } = props;
        const remainingBytes = fileSizeBytes - (bytesWritten ?? 0);

        if (etaBytesPerSecond === 0) {
            throw new Error("etaBytesPerSecond === 0, divide by zero");
        }

        return ceil(remainingBytes / etaBytesPerSecond);
    };

    public static toTime = (seconds: number): ValueUnits => {
        let value = ceil(seconds);
        let units: Units = "s";

        if (value >= 60) {
            value = ceil(value / 60);
            units = "m";
        }

        if (value >= 60) {
            value = ceil(value / 60);
            units = "h";
        }

        value = value > 999 ? 999 : value;

        return { value, units };
    };
}

export default A2FMRendererUtils;
