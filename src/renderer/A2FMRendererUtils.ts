import ValueUnits, { Units } from "./components/common/ValueUnits";

const { round } = Math;
const { isNaN } = Number;

interface CalcEtaSecondsParams {
    readonly bytesWritten?: number;
    readonly etaBytesPerSecond: number;
    readonly fileSizeBytes: number;
}

class A2FMRendererUtils {
    private constructor() {}

    private static limit = (value: number): number => {
        return value > 999 ? 999 : value;
    };

    public static calcEtaSeconds = (params: CalcEtaSecondsParams): number => {
        const { bytesWritten, etaBytesPerSecond, fileSizeBytes } = params;

        const remainingBytes = fileSizeBytes - (bytesWritten ?? 0);
        const baseEtaSeconds = remainingBytes / etaBytesPerSecond;
        const validationSeconds = 0.25;

        if (baseEtaSeconds <= 0 || isNaN(baseEtaSeconds)) {
            return 0;
        }

        return baseEtaSeconds + validationSeconds;
    };

    public static toRate = (bytesPerSecond: number): ValueUnits => {
        let value = round(bytesPerSecond);
        let units: Units = "B/s ";

        const largerUnits: Units[] = ["KB/s", "MB/s", "GB/s", "TB/s"];

        for (const unit of largerUnits) {
            if (value >= 1000) {
                value = round(value / 1024);
                units = unit;
            }
        }

        value = this.limit(value);

        return { value, units };
    };

    public static toSize = (bytes: number): ValueUnits => {
        let value = round(bytes);
        let units: Units = "B ";

        const largerUnits: Units[] = ["KB", "MB", "GB", "TB"];

        for (const unit of largerUnits) {
            if (value >= 1000) {
                value = round(value / 1024);
                units = unit;
            }
        }

        value = this.limit(value);

        return { value, units };
    };

    public static toTime = (seconds: number): ValueUnits => {
        let value = round(seconds);
        let units: Units = "s";

        const largerUnits: Units[] = ["m", "h"];

        for (const unit of largerUnits) {
            if (value >= 60) {
                value = round(value / 60);
                units = unit;
            }
        }

        value = this.limit(value);

        return { value, units };
    };
}

export default A2FMRendererUtils;
