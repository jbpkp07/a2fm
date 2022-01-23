import { createReadStream, createWriteStream, ReadStream, Stats, WriteStream } from "fs";
import { mkdir, readdir, rename, rm, rmdir, stat } from "fs/promises";
import { dirname, isAbsolute, join, normalize, parse, sep } from "path";

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

    public static createReadStream = (filePath: string, fileSizeBytes: number): ReadStream => {
        const options = this.createStreamOptions(fileSizeBytes);

        return createReadStream(filePath, options).pause();
    };

    public static createWriteStream = (filePath: string, fileSizeBytes: number): WriteStream => {
        const options = this.createStreamOptions(fileSizeBytes);

        return createWriteStream(filePath, options);
    };

    public static deleteDir = async (dirPath: string): Promise<void> => {
        try {
            await rm(dirPath, { force: true, recursive: true });
        } catch (error) {
            throw this.newError(error, `Failed to delete directory at: ${dirPath}`);
        }
    };

    public static deleteDirIfEmpty = async (dirPath: string): Promise<void> => {
        await rmdir(dirPath).catch(() => null);
    };

    public static deleteFile = async (filePath: string): Promise<void> => {
        try {
            await rm(filePath, { force: true });
        } catch (error) {
            throw this.newError(error, `Failed to delete file at: ${filePath}`);
        }
    };

    public static hasParentDir = (path: string): boolean => {
        if (this.isRelative(path)) return false;

        const normPath = normalize(path);

        return normPath !== dirname(normPath);
    };

    public static isChildPath = (testPath: string, parentPath: string): boolean => {
        if (!this.hasParentDir(testPath)) return false;

        const childPath = dirname(testPath);
        const normChildPath = normalize(childPath + sep).toLowerCase();
        const normParentPath = normalize(parentPath + sep).toLowerCase();

        return normChildPath.startsWith(normParentPath);
    };

    public static isEmptyDir = async (dirPath: string): Promise<boolean> => {
        try {
            const contents = await readdir(dirPath);

            return contents.length === 0;
        } catch (error) {
            throw this.newError(error, `Failed to read directory contents at: ${dirPath}`);
        }
    };

    public static isRelative = (path: string): boolean => {
        return !isAbsolute(path);
    };

    public static makeDestDir = async (destFilePath: string): Promise<string | undefined> => {
        try {
            const destDirPath = dirname(destFilePath);

            return await mkdir(destDirPath, { recursive: true });
        } catch (error) {
            throw this.newError(error, `Failed to make directory for: ${destFilePath}`);
        }
    };

    public static readFileSizeBytes = async (filePath: string): Promise<number> => {
        const { size } = await this.readStats(filePath);

        return size;
    };

    public static readStats = async (path: string): Promise<Stats> => {
        try {
            return await stat(path);
        } catch (error) {
            throw this.newError(error, `Failed to read stats at: ${path}`);
        }
    };

    public static removeFileExt = async (filePath: string): Promise<void> => {
        const { dir, name } = parse(filePath);
        const newPath = join(dir, name);

        await this.renamePath(filePath, newPath);
    };

    public static renamePath = async (oldPath: string, newPath: string): Promise<void> => {
        try {
            await rename(oldPath, newPath);
        } catch (error) {
            throw this.newError(error, `Failed to rename file at: ${oldPath}`);
        }
    };

    public static traverseBack = (fromChildPath: string, toParentPath: string): string[] => {
        if (this.isRelative(fromChildPath) || this.isRelative(toParentPath)) return [];

        let traversedPath = normalize(fromChildPath);
        const traversedPaths: string[] = [];

        const canTraverse = () => this.isChildPath(traversedPath, toParentPath);

        while (canTraverse()) {
            traversedPath = dirname(traversedPath);
            traversedPaths.push(traversedPath);
        }

        return traversedPaths;
    };
}

export default FileSystemUtils;
