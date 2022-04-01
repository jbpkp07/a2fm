import FileSystemUtils from "./FileSystemUtils";
import ValidationUtils from "./ValidationUtils";

const { existsSync, readFileSync, writeFileSync } = FileSystemUtils;
const { isObject } = ValidationUtils;

const MAX_LINES = 1000;

type Entry = [string, unknown];

interface CopyError extends Error {
    readonly fileCopyParams: object;
}

class ErrorHandler {
    private readonly logFilePath: string;

    constructor(logFilePath: string) {
        this.logFilePath = logFilePath;
    }

    private extractErrorProps = (error: Error): string => {
        const { name, message, stack } = error;

        return stack || `${name}: ${message}`;
    };

    private extractOtherProps = (error: unknown): string => {
        if (!isObject(error)) return "";

        const errorKeys = ["name", "message", "stack"];
        const entries = Object.entries(error as object);

        const forOtherKeys = ([key]: Entry) => !errorKeys.includes(key);
        const toString = ([key, val]: Entry) => key + ": " + this.stringifyValue(val);

        return entries.filter(forOtherKeys).map(toString).join(",\n");
    };

    private readLogFileLines = (): string[] => {
        if (!existsSync(this.logFilePath)) {
            return [];
        }

        return readFileSync(this.logFilePath).split("\n");
    };

    private stringifyError = (error: unknown): string => {
        let errorString = new Date().toLocaleString() + "\n\n";

        if (error instanceof Error) {
            errorString += this.extractErrorProps(error) + "\n\n";
            errorString += this.extractOtherProps(error) + "\n";
        } else {
            errorString += this.stringifyValue(error) + "\n";
        }

        return errorString + "─".repeat(120);
    };

    private stringifyValue = (value: unknown): string => {
        return JSON.stringify(value, undefined, 4);
    };

    private updateLogFile = (error: unknown): void => {
        const errorLines = this.stringifyError(error).split("\n");
        const logLines = this.readLogFileLines();

        const updatedLogLines = errorLines.concat(logLines);

        this.writeLogFileLines(updatedLogLines);
    };

    private writeLogFileLines = (lines: string[]): void => {
        const data = lines.slice(0, MAX_LINES).join("\n");

        writeFileSync(this.logFilePath, data);
    };

    public exitOnError = (error: unknown): never => {
        this.updateLogFile(error);
        console.clear();
        console.log(error);
        process.exit(1);
    };

    public exitOnFileCopyError = (error: CopyError): never => {
        const { fileCopyParams, stack } = error;

        this.updateLogFile(error);
        console.clear();
        console.log(stack, "\n\nFileCopyParams:", fileCopyParams);
        process.exit(1);
    };
}

export default ErrorHandler;
