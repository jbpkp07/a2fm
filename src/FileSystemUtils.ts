import { createReadStream, createWriteStream, ReadStream, Stats, WriteStream } from "fs";
import { rm, stat } from "fs/promises";

interface StreamOptions {
    readonly highWaterMark: number;
}

class FileSystemUtils {
    private constructor() {}

    private static calcHighWaterMark = (fileSizeBytes: number): number => {
        const defaultHighWaterMark = 65536; // 64 * 1024
        const drainCount = 100;
        const isLargeFile = fileSizeBytes >= defaultHighWaterMark * drainCount;

        return isLargeFile ? Math.ceil(fileSizeBytes / drainCount) : defaultHighWaterMark;
    };

    private static createStreamOptions = (fileSizeBytes: number): StreamOptions => {
        const highWaterMark = this.calcHighWaterMark(fileSizeBytes);

        return { highWaterMark };
    };

    private static extractMessage = (error: unknown): string | undefined => {
        return error instanceof Error ? error.message : undefined;
    };

    private static throwIfNotFile = (stats: Stats, path: string): void => {
        if (!stats.isFile()) {
            throw new Error(`Entity is not a file at: ${path}`);
        }
    };

    public static createReadStream = (filePath: string, fileSizeBytes: number): ReadStream => {
        const options = this.createStreamOptions(fileSizeBytes);

        return createReadStream(filePath, options).pause();
    };

    public static createWriteStream = (filePath: string, fileSizeBytes: number): WriteStream => {
        const options = this.createStreamOptions(fileSizeBytes);

        return createWriteStream(filePath, options);
    };

    public static deleteFile = async (filePath: string): Promise<void> => {
        try {
            await rm(filePath, { force: true });
        } catch (error) {
            const msg = this.extractMessage(error) || `Failed to delete at: ${filePath}`;
            throw new Error(msg);
        }
    };

    public static readFileSizeBytes = async (filePath: string): Promise<number> => {
        const { size } = await this.readFileStats(filePath);

        return size;
    };

    public static readFileStats = async (filePath: string): Promise<Stats> => {
        try {
            const stats = await stat(filePath);

            this.throwIfNotFile(stats, filePath);

            return stats;
        } catch (error) {
            const msg = this.extractMessage(error) || `Failed to read stats at: ${filePath}`;
            throw new Error(msg);
        }
    };
}

export default FileSystemUtils;
