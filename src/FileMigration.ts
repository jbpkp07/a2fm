import { randomUUID } from "crypto";
import { join, normalize } from "path";

import FileSystemUtils from "./common/FileSystemUtils";

const { deleteDirIfEmpty, deleteFile, removeFileExt, sanitize, traverseBack } = FileSystemUtils;

interface FileCopier {
    copyFile: (params: FileMigration) => void;
}

interface FileMigrationParams {
    readonly fileCopier: FileCopier;
    readonly destRootDirPath: string;
    readonly srcRootDirPath: string;
    readonly srcFilePath: string;
    readonly srcFileSizeBytes: number;
}

class FileMigration {
    private readonly fileCopier: FileCopier;

    private readonly srcTopDirPath: string | undefined;

    private readonly srcSubDirPaths: string[];

    public readonly id: string;

    public readonly srcFilePath: string;

    public readonly destFilePath: string;

    public readonly fileSizeBytes: number;

    constructor(params: FileMigrationParams) {
        this.fileCopier = params.fileCopier;

        const srcDirPaths = traverseBack(params.srcFilePath, params.srcRootDirPath);

        srcDirPaths.pop(); // srcRootDirPath
        this.srcTopDirPath = srcDirPaths.pop();
        this.srcSubDirPaths = srcDirPaths;

        this.id = randomUUID();
        this.srcFilePath = normalize(params.srcFilePath);
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

    public start(): void {
        this.fileCopier.copyFile(this);
    }

    public async finish(): Promise<void> {
        const { srcTopDirPath, srcSubDirPaths, srcFilePath, destFilePath } = this;

        await removeFileExt(destFilePath);
        await deleteFile(srcFilePath);

        for await (const srcSubDirPath of srcSubDirPaths) {
            await deleteDirIfEmpty(srcSubDirPath);
        }

        if (srcTopDirPath?.endsWith(".aspera-package")) {
            await deleteDirIfEmpty(srcTopDirPath);
        }
    }
}

export default FileMigration;
