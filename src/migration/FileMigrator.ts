import FileSystemUtils from "../common/FileSystemUtils";
import FileMigration from "./FileMigration";

const { deleteDirIfEmpty, deleteFile, exists, isChildPath, removeFileExt } = FileSystemUtils;

type Id = string;
type SrcRootDirPath = string;
type DestRootDirPath = string;

interface MigrateParams {
    readonly srcFilePath: string;
    readonly srcFileSizeBytes: number;
    readonly srcModifiedTimeMs: number;
}

interface FileCopyParams {
    readonly id: string;
    readonly srcFilePath: string;
    readonly destFilePath: string;
    readonly fileSizeBytes: number;
    readonly modifiedTimeMs: number;
}

interface Update {
    readonly progress: {
        readonly fileCopyParams: FileCopyParams;
    };
}

interface FileCopier {
    copyFile(params: FileCopyParams): void;
    on(event: "copy:finish", listener: (update: Update) => void): void;
}

interface FileMigratorParams {
    readonly fileCopier: FileCopier;
    readonly srcDestRootDirPaths: Map<SrcRootDirPath, DestRootDirPath>;
}

class FileMigrator {
    private readonly fileCopier: FileCopier;

    private readonly fileMigrations = new Map<Id, FileMigration>();

    private readonly srcDestRootDirPaths: Map<SrcRootDirPath, DestRootDirPath>;

    private readonly srcRootDirPaths: string[];

    constructor({ fileCopier, srcDestRootDirPaths }: FileMigratorParams) {
        const keys = srcDestRootDirPaths.keys();
        const byLengthDesc = (a: string, b: string) => (a.length < b.length ? 1 : -1);

        this.fileCopier = fileCopier;
        this.srcDestRootDirPaths = srcDestRootDirPaths;
        this.srcRootDirPaths = [...keys].sort(byLengthDesc);

        fileCopier.on("copy:finish", (update) => {
            const { id } = update.progress.fileCopyParams;
            const fileMigration = this.fileMigrations.get(id);

            if (fileMigration) {
                void this.finishMigration(fileMigration);
            }
        });
    }

    private createFileMigration(params: MigrateParams): FileMigration | undefined {
        const { srcFilePath, srcFileSizeBytes, srcModifiedTimeMs } = params;

        const srcRootDirPath = this.getSrcRootDirPath(srcFilePath);
        const destRootDirPath = this.getDestRootDirPath(srcRootDirPath);

        if (!srcRootDirPath || !destRootDirPath) {
            return undefined;
        }

        return new FileMigration({ destRootDirPath, srcRootDirPath, srcFilePath, srcFileSizeBytes, srcModifiedTimeMs });
    }

    private getSrcRootDirPath(srcFilePath: string): string | undefined {
        return this.srcRootDirPaths.find((srcRootDirPath) => isChildPath(srcFilePath, srcRootDirPath));
    }

    private getDestRootDirPath(srcRootDirPath?: string): string | undefined {
        return srcRootDirPath ? this.srcDestRootDirPaths.get(srcRootDirPath) : undefined;
    }

    private isMigrating(srcFilePath: string): boolean {
        const srcFilePathLower = srcFilePath.toLowerCase();
        const migrations = [...this.fileMigrations.values()];

        return migrations.some((migration) => migration.srcFilePath.toLowerCase() === srcFilePathLower);
    }

    private startMigration(fileMigration: FileMigration): void {
        const { id, srcFilePath, destFilePath, fileSizeBytes, modifiedTimeMs } = fileMigration;

        if (this.isMigrating(srcFilePath)) return;

        this.fileMigrations.set(id, fileMigration);
        this.fileCopier.copyFile({ id, srcFilePath, destFilePath, fileSizeBytes, modifiedTimeMs });
    }

    private async finishMigration(fileMigration: FileMigration): Promise<void> {
        const { id, srcTopDirPath, srcSubDirPaths, srcFilePath, destFilePath } = fileMigration;

        if (await exists(destFilePath)) {
            await removeFileExt(destFilePath);
            await deleteFile(srcFilePath);
        }

        for await (const srcSubDirPath of srcSubDirPaths) {
            await deleteDirIfEmpty(srcSubDirPath);
        }

        if (srcTopDirPath?.endsWith(".aspera-package")) {
            await deleteDirIfEmpty(srcTopDirPath);
        }

        this.fileMigrations.delete(id);

        if (global.gc) {
            global.gc();
        }
    }

    public migrate = (params: MigrateParams): void => {
        const { srcFilePath } = params;

        if (this.isMigrating(srcFilePath)) return;

        const fileMigration = this.createFileMigration(params);

        if (fileMigration) {
            this.startMigration(fileMigration);
        }
    };
}

export default FileMigrator;
