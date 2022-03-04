import ValueUnits, { Units } from "./components/common/ValueUnits";
import { MigrationProgressProps } from "./components/MigrationProgress";

const { ceil, round } = Math;

interface CalcEtaSecondsProps {
    readonly bytesWritten?: number;
    readonly etaBytesPerSecond: number;
    readonly fileSizeBytes: number;
}

class A2FMRendererUtils {
    private constructor() {}

    private static toLimitedInteger = (value: number): number => {
        const num = ceil(value);

        return num > 999 ? 999 : num;
    };

    public static calcEtaSeconds = (props: CalcEtaSecondsProps): number => {
        const { bytesWritten, etaBytesPerSecond, fileSizeBytes } = props;
        const remainingBytes = fileSizeBytes - (bytesWritten ?? 0);

        if (etaBytesPerSecond === 0) {
            throw new Error("etaBytesPerSecond === 0, divide by zero");
        }

        return ceil(remainingBytes / etaBytesPerSecond);
    };

    public static createDefaultProgressProps = (cols: number): MigrationProgressProps => {
        return {
            cols,
            destFilePath: "???/???",
            destFileSize: { value: 0, units: "??" },
            elapsedTime: { value: 0, units: "?" },
            eta: { value: 0, units: "?" },
            percentage: 0,
            rate: { value: 0, units: "??/?" },
            srcFilePath: "???/???",
            srcFileSize: { value: 0, units: "??" }
        };
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

        value = this.toLimitedInteger(value);

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

        value = this.toLimitedInteger(value);

        return { value, units };
    };

    public static toTime = (seconds: number): ValueUnits => {
        let value = ceil(seconds);
        let units: Units = "s";

        const largerUnits: Units[] = ["m", "h"];

        for (const unit of largerUnits) {
            if (value >= 60) {
                value = ceil(value / 60);
                units = unit;
            }
        }

        value = this.toLimitedInteger(value);

        return { value, units };
    };
}

export default A2FMRendererUtils;
