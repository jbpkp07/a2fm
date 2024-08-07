// prettier-ignore
import { createReadStream, createWriteStream, existsSync, readFileSync, ReadStream, Stats, writeFileSync, WriteStream } from "fs";
import { mkdir, readdir, rename, rm, rmdir, stat } from "fs/promises";
import { dirname, extname, isAbsolute, join, normalize, parse, sep } from "path";

import WaitUtils from "./WaitUtils";

const { ceil, min } = Math;
const { wait } = WaitUtils;

interface StreamOptions {
    readonly highWaterMark: number;
}

class FileSystemUtils {
    private constructor() {}

    private static readonly illegalPathChars = /[\t\n\r*?"<>|:]/g;

    private static readonly illegalRootChars = /[\t\n\r*?"<>|]/g;

    private static createStreamOptions = (fileSizeBytes: number): StreamOptions => {
        const highWaterMark = this.calcHighWaterMark(fileSizeBytes);

        return { highWaterMark };
    };

    private static newError = (error: unknown, defaultMessage: string): Error => {
        const msg = error instanceof Error ? `\n${defaultMessage}\n${error.message}` : defaultMessage;

        return new Error(msg);
    };

    public static calcHighWaterMark = (fileSizeBytes: number): number => {
        const defaultHighWaterMark = 65536; // 64 * 1024 (Node.js default)
        const maxHighWaterMark = 2147483647; // 2^31 - 1 (Node.js limit; Bug fix for file sizes > 214 GB)
        const drainCount = 100;

        const isLargeFile = fileSizeBytes >= defaultHighWaterMark * drainCount;

        const highWaterMark = isLargeFile ? ceil(fileSizeBytes / drainCount) : defaultHighWaterMark;

        return min(highWaterMark, maxHighWaterMark);
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

    public static exists = async (path: string): Promise<boolean> => {
        try {
            await this.readStats(path);

            return true;
        } catch {
            return false;
        }
    };

    public static existsSync = (path: string): boolean => {
        return existsSync(path);
    };

    public static extractLeadingSeps = (path: string): string => {
        const leadingSeps = new RegExp(`^\\${sep}+`);
        const leadingSepsMatch = normalize(path).match(leadingSeps);

        return leadingSepsMatch?.index === 0 ? leadingSepsMatch[0] ?? "" : "";
    };

    public static hasExt = (filePath: string, ext: string): boolean => {
        const fileExtLower = extname(filePath).toLowerCase();
        const extLower = ext.toLowerCase();

        return extLower.startsWith(".") ? extLower === fileExtLower : `.${extLower}` === fileExtLower;
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

    public static isFileModifying = async (filePath: string, stabilityMs: number): Promise<boolean> => {
        const { exists, readFileMtimeMs } = this;

        if (await exists(filePath)) {
            const currentTimeMs = Date.now();
            const modifiedTimeMs = await readFileMtimeMs(filePath);

            return currentTimeMs - modifiedTimeMs < stabilityMs;
        }

        return false;
    };

    public static isRelative = (path: string): boolean => {
        return !isAbsolute(path);
    };

    public static makeDestDir = async (destFilePath: string): Promise<string | undefined> => {
        try {
            const destDirPath = dirname(destFilePath);
            const isRootDir = !this.hasParentDir(destDirPath);

            return !isRootDir ? await mkdir(destDirPath, { recursive: true }) : undefined;
        } catch (error) {
            throw this.newError(error, `Failed to make directory for: ${destFilePath}`);
        }
    };

    public static readFileMtimeMs = async (filePath: string): Promise<number> => {
        const { mtimeMs } = await this.readStats(filePath);

        return mtimeMs;
    };

    public static readFileSizeBytes = async (filePath: string): Promise<number> => {
        const { size } = await this.readStats(filePath);

        return size;
    };

    public static readFileSync = (filePath: string): string => {
        try {
            return readFileSync(filePath, { encoding: "utf8" });
        } catch (error) {
            throw this.newError(error, `Failed to read file at: ${filePath}`);
        }
    };

    public static readFileSyncJSON = <T>(filePath: string): T => {
        try {
            const json = this.readFileSync(filePath);

            return JSON.parse(json) as T;
        } catch (error) {
            throw this.newError(error, `Failed to read/parse JSON at: ${filePath}`);
        }
    };

    public static readStats = async (path: string): Promise<Stats> => {
        try {
            return await stat(path);
        } catch (error) {
            throw this.newError(error, `Failed to read stats at: ${path}`);
        }
    };

    public static removeFileExt = async (filePath: string): Promise<void> => {
        const newPath = this.trimFileExt(filePath);

        await this.renamePath(filePath, newPath);
    };

    public static removeIllegalChars = (path: string): string => {
        const segments = normalize(path).split(sep);

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i] as string;
            const illegalChars = i === 0 ? this.illegalRootChars : this.illegalPathChars;

            segments[i] = segment.replace(illegalChars, "");
        }

        return this.extractLeadingSeps(path) + join(...segments);
    };

    public static renamePath = async (oldPath: string, newPath: string): Promise<void> => {
        try {
            await rename(oldPath, newPath);
        } catch (error) {
            throw this.newError(error, `Failed to rename file at: ${oldPath}`);
        }
    };

    public static sanitize = (path: string): string => {
        const legalPath = this.removeIllegalChars(path);

        return this.trimSegments(legalPath);
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

    public static trimFileExt = (filePath: string): string => {
        if (filePath.endsWith("/") || filePath.endsWith("\\")) {
            return normalize(filePath);
        }

        const { dir, name } = parse(filePath);

        return join(dir, name);
    };

    public static trimSegments = (path: string): string => {
        const segments = normalize(path).split(sep);

        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i]?.trim() as string;

            while (segment.endsWith(".")) {
                segment = segment.substring(0, segment.length - 1).trimEnd();
            }

            segments[i] = segment;
        }

        return this.extractLeadingSeps(path) + join(...segments);
    };

    public static waitWhileModifying = async (filePath: string, stabilityMs: number): Promise<void> => {
        const isModifying = async () => this.isFileModifying(filePath, stabilityMs);

        const pollMs = stabilityMs >= 1000 ? ceil(stabilityMs / 10) : 100;

        while (await isModifying()) {
            await wait(pollMs);
        }
    };

    public static writeFileSync = (filePath: string, data: string): void => {
        try {
            writeFileSync(filePath, data, { encoding: "utf8" });
        } catch (error) {
            throw this.newError(error, `Failed to write file at: ${filePath}`);
        }
    };
}

export default FileSystemUtils;
export { ReadStream, WriteStream } from "fs";
