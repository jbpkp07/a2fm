import { createReadStream, createWriteStream, PathLike, ReadStream, Stats, WriteStream } from "fs";
import { mkdir, rm, stat } from "fs/promises";
import { dirname } from "path";

export { ReadStream, WriteStream } from "fs";

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

    private static newError = (error: unknown, defaultMessage: string): Error => {
        const msg = error instanceof Error ? `\n${defaultMessage}\n${error.message}` : defaultMessage;

        return new Error(msg);
    };

    private static throwIfNotFile = (stats: Stats, path: PathLike): void => {
        if (!stats.isFile()) {
            throw new Error(`Entity is not a file at: ${String(path)}`);
        }
    };

    public static createReadStream = (filePath: PathLike, fileSizeBytes: number): ReadStream => {
        const options = this.createStreamOptions(fileSizeBytes);

        return createReadStream(filePath, options).pause();
    };

    public static createWriteStream = (filePath: PathLike, fileSizeBytes: number): WriteStream => {
        const options = this.createStreamOptions(fileSizeBytes);

        return createWriteStream(filePath, options);
    };

    public static deleteFile = async (filePath: PathLike): Promise<void> => {
        try {
            await rm(filePath, { force: true });
        } catch (error) {
            throw this.newError(error, `Failed to delete at: ${String(filePath)}`);
        }
    };

    public static makeDestDir = async (destFilePath: string): Promise<string | undefined> => {
        // Needs test -----------------------------------------------------------------------------------------------
        try {
            const destDirectoryPath = dirname(destFilePath);

            return await mkdir(destDirectoryPath, { recursive: true });
        } catch (error) {
            throw this.newError(error, `Failed to make directory for: ${destFilePath}`);
        }
    };

    public static readFileSizeBytes = async (filePath: PathLike): Promise<number> => {
        const { size } = await this.readFileStats(filePath);

        return size;
    };

    public static readFileStats = async (filePath: PathLike): Promise<Stats> => {
        try {
            const stats = await stat(filePath);

            this.throwIfNotFile(stats, filePath);

            return stats;
        } catch (error) {
            throw this.newError(error, `Failed to read stats at: ${String(filePath)}`);
        }
    };
}

export default FileSystemUtils;
