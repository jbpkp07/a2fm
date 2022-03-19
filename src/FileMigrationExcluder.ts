import { basename, dirname } from "path";

import FileSystemUtils from "./common/FileSystemUtils";

const { exists, hasExt } = FileSystemUtils;

interface FileMigrationExcluderParams {
    readonly excludedDirs: string[];
    readonly excludedFiles: string[];
    readonly progressMetadataExts: string[];
}

class FileMigrationExcluder {
    private readonly excludedDirs: string[];

    private readonly excludedFiles: string[];

    private readonly progressMetadataExts: string[];

    constructor(params: FileMigrationExcluderParams) {
        const toLower = (str: string) => str.trim().toLowerCase();
        const toExt = (ext: string) => (ext.startsWith(".") ? ext : "." + ext);

        this.excludedDirs = params.excludedDirs.map(toLower);
        this.excludedFiles = params.excludedFiles.map(toLower);
        this.progressMetadataExts = params.progressMetadataExts.map(toLower).map(toExt);
    }

    private hasExcludedDir(srcFilePath: string): boolean {
        const srcDirPath = dirname(srcFilePath).toLowerCase();

        return this.excludedDirs.some((dir) => srcDirPath.includes(dir));
    }

    private async hasProgressMetadataFile(srcFilePath: string): Promise<boolean> {
        const checkingExists = this.progressMetadataExts.map((ext) => exists(srcFilePath + ext));

        const results = await Promise.all(checkingExists);

        return results.some(Boolean);
    }

    private isExcludedFile(srcFilePath: string): boolean {
        const srcFileName = basename(srcFilePath).toLowerCase();

        return this.excludedFiles.some((file) => srcFileName.includes(file));
    }

    public isProgressMetadataFile(srcFilePath: string): boolean {
        return this.progressMetadataExts.some((ext) => hasExt(srcFilePath, ext));
    }

    public async isExcluded(srcFilePath: string): Promise<boolean> {
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

        if (this.isExcludedFile(srcFilePath)) {
            return true;
        }

        return false;
    }
}

export default FileMigrationExcluder;
