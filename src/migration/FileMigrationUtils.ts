import { basename, dirname } from "path";

import FileSystemUtils from "../common/FileSystemUtils";

const { exists, hasExt, trimFileExt } = FileSystemUtils;

interface FileMigrationUtilsParams {
    readonly excludedDirs: string[];
    readonly excludedFiles: string[];
    readonly progressMetadataExts: string[];
}

class FileMigrationUtils {
    private readonly excludedDirs: string[];

    private readonly excludedFiles: string[];

    private readonly progressMetadataExts: string[];

    constructor(params: FileMigrationUtilsParams) {
        const toLower = (str: string) => str.trim().toLowerCase();
        const toExt = (ext: string) => (ext.startsWith(".") ? ext : "." + ext);

        this.excludedDirs = params.excludedDirs.map(toLower);
        this.excludedFiles = params.excludedFiles.map(toLower);
        this.progressMetadataExts = params.progressMetadataExts.map(toLower).map(toExt);
    }

    private hasExcludedDir = (srcFilePath: string): boolean => {
        const srcDirPath = dirname(srcFilePath).toLowerCase();

        return this.excludedDirs.some((dir) => srcDirPath.includes(dir));
    };

    private hasProgressMetadataFile = async (srcFilePath: string): Promise<boolean> => {
        const checkingExists = this.progressMetadataExts.map((ext) => exists(srcFilePath + ext));

        const results = await Promise.all(checkingExists);

        return results.some(Boolean);
    };

    private isExcludedFile = (srcFilePath: string): boolean => {
        const srcFileName = basename(srcFilePath).toLowerCase();

        return this.excludedFiles.some((file) => srcFileName.includes(file));
    };

    private isProgressMetadataFile = (path: string): boolean => {
        return this.progressMetadataExts.some((ext) => hasExt(path, ext));
    };

    public isSrcFileExcluded = async (srcFilePath: string): Promise<boolean> => {
        const fileExists = await exists(srcFilePath);

        if (!fileExists) {
            return true;
        }

        if (this.isProgressMetadataFile(srcFilePath)) {
            return true;
        }

        if (await this.hasProgressMetadataFile(srcFilePath)) {
            return true;
        }

        if (this.hasExcludedDir(srcFilePath)) {
            return true;
        }

        return this.isExcludedFile(srcFilePath);
    };

    public toSrcFilePath = (path: string): string => {
        const isMetaDataFile = this.isProgressMetadataFile(path);

        return isMetaDataFile ? trimFileExt(path) : path;
    };
}

export default FileMigrationUtils;
