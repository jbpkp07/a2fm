import { basename, dirname } from "path";

import FileSystemUtils from "../common/FileSystemUtils";

const { exists, hasExt, trimFileExt } = FileSystemUtils;

interface SrcFilesWatcherUtilsParams {
    readonly excludedDirs: string[];
    readonly excludedFiles: string[];
    readonly progressMetadataExts: string[];
}

class SrcFilesWatcherUtils {
    private readonly excludedDirs: string[];

    private readonly excludedFiles: string[];

    private readonly progressMetadataExts: string[];

    constructor(params: SrcFilesWatcherUtilsParams) {
        const toLower = (str: string) => str.trim().toLowerCase();
        const toExt = (ext: string) => (ext.startsWith(".") ? ext : "." + ext);

        this.excludedDirs = params.excludedDirs.map(toLower);
        this.excludedFiles = params.excludedFiles.map(toLower);
        this.progressMetadataExts = params.progressMetadataExts.map(toLower).map(toExt);
    }

    private hasProgressMetadataFile = async (srcFilePath: string): Promise<boolean> => {
        const checkingExists = this.progressMetadataExts.map((ext) => exists(srcFilePath + ext));

        const results = await Promise.all(checkingExists);

        return results.some(Boolean);
    };

    private isExcludedFile = (srcFilePath: string): boolean => {
        const srcFileName = basename(srcFilePath).toLowerCase();

        return this.excludedFiles.some((file) => srcFileName.includes(file));
    };

    private isProgressMetadataFile = (srcFilePath: string): boolean => {
        return this.progressMetadataExts.some((ext) => hasExt(srcFilePath, ext));
    };

    public hasExcludedDir = (srcFilePath: string): boolean => {
        const srcDirPath = dirname(srcFilePath).toLowerCase();

        return this.excludedDirs.some((dir) => srcDirPath.includes(dir));
    };

    public isSrcFileEligible = async (srcFilePath: string): Promise<boolean> => {
        const fileExists = await exists(srcFilePath);

        if (!fileExists) {
            return false;
        }

        if (this.isProgressMetadataFile(srcFilePath)) {
            return false;
        }

        if (await this.hasProgressMetadataFile(srcFilePath)) {
            return false;
        }

        if (this.hasExcludedDir(srcFilePath)) {
            return false;
        }

        return !this.isExcludedFile(srcFilePath);
    };

    public toSrcFilePath = (filePath: string): string => {
        const isMetaDataFile = this.isProgressMetadataFile(filePath);

        return isMetaDataFile ? trimFileExt(filePath) : filePath;
    };
}

export default SrcFilesWatcherUtils;
