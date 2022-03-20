import { randomUUID } from "crypto";
import { join } from "path";

import FileSystemUtils from "../common/FileSystemUtils";

const { sanitize, traverseBack } = FileSystemUtils;

interface FileMigrationParams {
    readonly destRootDirPath: string;
    readonly srcRootDirPath: string;
    readonly srcFilePath: string;
    readonly srcFileSizeBytes: number;
}

class FileMigration {
    public readonly id: string;

    public readonly srcTopDirPath: string | undefined;

    public readonly srcSubDirPaths: string[];

    public readonly srcFilePath: string;

    public readonly destFilePath: string;

    public readonly fileSizeBytes: number;

    constructor(params: FileMigrationParams) {
        this.id = randomUUID();
        this.srcTopDirPath = this.getSrcTopDirPath(params);
        this.srcSubDirPaths = this.getSrcSubDirPaths(params);
        this.srcFilePath = params.srcFilePath;
        this.destFilePath = this.createDestFilePath(params);
        this.fileSizeBytes = params.srcFileSizeBytes;
    }

    private createDestFilePath(params: FileMigrationParams): string {
        const destRootDirPath = sanitize(params.destRootDirPath);
        const srcRootDirPath = sanitize(params.srcRootDirPath);
        const srcFilePath = sanitize(params.srcFilePath);

        const startIndex = srcRootDirPath.length;
        const subPath = srcFilePath.substring(startIndex);

        return join(destRootDirPath, `${subPath}.a2fm`);
    }

    private getSrcTopDirPath(params: FileMigrationParams): string | undefined {
        const srcDirPaths = traverseBack(params.srcFilePath, params.srcRootDirPath);
        srcDirPaths.pop(); // srcRootDirPath

        return srcDirPaths.pop();
    }

    private getSrcSubDirPaths(params: FileMigrationParams): string[] {
        const srcDirPaths = traverseBack(params.srcFilePath, params.srcRootDirPath);
        srcDirPaths.pop(); // srcRootDirPath
        srcDirPaths.pop(); // srcTopDirPath

        return srcDirPaths;
    }
}

export default FileMigration;
