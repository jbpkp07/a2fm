import { createReadStream, createWriteStream, ReadStream, Stats, WriteStream } from "fs";
import { mkdir, readdir, rm, stat } from "fs/promises";
import { dirname, isAbsolute, normalize, sep } from "path";

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

    public static deleteDir = async (dirPath: string): Promise<void> => {
        try {
            await rm(dirPath, { force: true, recursive: true });
        } catch (error) {
            throw this.newError(error, `Failed to delete directory at: ${dirPath}`);
        }
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

    public static isEmptyDir = async (dirPath: string): Promise<boolean> => {
        // Needs test -----------------------------------------------------------------------------------------------
        try {
            const contents = await readdir(dirPath);

            return contents.length === 0;
        } catch (error) {
            throw this.newError(error, `Failed to read directory contents at: ${dirPath}`);
        }
    };

    public static isRelative = (path: string): boolean => {
        // Needs test -----------------------------------------------------------------------------------------------
        return !isAbsolute(path);
    };

    public static makeDestDir = async (destFilePath: string): Promise<string | undefined> => {
        // Needs test -----------------------------------------------------------------------------------------------
        try {
            const destDirPath = dirname(destFilePath);

            return await mkdir(destDirPath, { recursive: true });
        } catch (error) {
            throw this.newError(error, `Failed to make directory for: ${destFilePath}`);
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
            throw this.newError(error, `Failed to read stats at: ${filePath}`);
        }
    };

    public static traverseBack = (fromChildPath: string, toParentPath: string): string[] => {
        // Needs test -----------------------------------------------------------------------------------------------
        if (this.isRelative(fromChildPath) || this.isRelative(toParentPath)) return [];

        let traversedPath = normalize(fromChildPath);
        const parentPath = normalize(toParentPath + sep).toLowerCase();
        const traversedPaths: string[] = [];

        const canTraverse = () => (traversedPath + sep).toLowerCase().startsWith(parentPath);

        while (canTraverse()) {
            traversedPaths.push(traversedPath);

            if (!this.hasParentDir(traversedPath)) break;

            traversedPath = dirname(traversedPath);
        }

        return traversedPaths;
    };
}

export default FileSystemUtils;

// // const rollbackPaths = FileSystemUtils.traverseBack("G:/a/////\\/////B/../../a/B/c", "g:/A");
// const rollbackPaths = FileSystemUtils.traverseBack("C:/Users/cool.txt/Desktop/code/a2fm/.AAA/XXX/file.mp4", "/");

// console.log(FileSystemUtils.isDriveRoot("C:\\a\\"));
// console.log(FileSystemUtils.isDriveRoot("C:\\a"));
// console.log(FileSystemUtils.isDriveRoot("/a"));
// console.log(FileSystemUtils.isDriveRoot("C:\\"));
// console.log(FileSystemUtils.isDriveRoot("C:"));
// console.log(FileSystemUtils.isDriveRoot("/"));
// // console.log(rollbackPaths.shift());
// console.log(rollbackPaths);

// async function app() {
//     // const blah = await FileSystemUtils.makeDestDir(".AAA/XXX/cool.txt");

//     try {
//         const blah = await FileSystemUtils.isEmptyDir("./.AAA");
//         console.log("isEmpty", blah);
//     } catch (error) {
//         console.log(error);
//     }
// }

// void app();
