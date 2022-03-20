import FileSystemUtils from "./common/FileSystemUtils";
import FileMigration from "./FileMigration";

const { deleteDirIfEmpty, deleteFile, isChildPath, readFileSizeBytes, removeFileExt } = FileSystemUtils;

type Id = string;
type SrcRootDirPath = string;
type DestRootDirPath = string;

interface FileCopyParams {
    readonly id: string;
    readonly srcFilePath: string;
    readonly destFilePath: string;
    readonly fileSizeBytes: number;
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

class FileMigrator {
    private readonly fileCopier: FileCopier;

    private readonly fileMigrations = new Map<Id, FileMigration>();

    private readonly srcDestRootDirPaths: Map<SrcRootDirPath, DestRootDirPath>;

    private readonly srcRootDirPaths: string[];

    constructor(fileCopier: FileCopier, srcDestRootDirPaths: Map<SrcRootDirPath, DestRootDirPath>) {
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

    private async createFileMigration(srcFilePath: string, fileSizeBytes?: number): Promise<FileMigration | undefined> {
        const srcRootDirPath = this.getSrcRootDirPath(srcFilePath);
        const destRootDirPath = this.getDestRootDirPath(srcRootDirPath);

        if (!srcRootDirPath || !destRootDirPath) {
            return undefined;
        }

        const srcFileSizeBytes = await this.getFileSizeBytes(srcFilePath, fileSizeBytes);

        return new FileMigration({ destRootDirPath, srcRootDirPath, srcFilePath, srcFileSizeBytes });
    }

    private getSrcRootDirPath(srcFilePath: string): string | undefined {
        return this.srcRootDirPaths.find((srcRootDirPath) => isChildPath(srcFilePath, srcRootDirPath));
    }

    private getDestRootDirPath(srcRootDirPath?: string): string | undefined {
        return srcRootDirPath ? this.srcDestRootDirPaths.get(srcRootDirPath) : undefined;
    }

    private async getFileSizeBytes(srcFilePath: string, fileSizeBytes?: number): Promise<number> {
        return fileSizeBytes ?? (await readFileSizeBytes(srcFilePath));
    }

    private startMigration(fileMigration: FileMigration): void {
        const { id } = fileMigration;

        this.fileMigrations.set(id, fileMigration);
        this.fileCopier.copyFile(fileMigration);
    }

    private async finishMigration(fileMigration: FileMigration): Promise<void> {
        const { id, srcTopDirPath, srcSubDirPaths, srcFilePath, destFilePath } = fileMigration;

        this.fileMigrations.delete(id);

        await removeFileExt(destFilePath);
        await deleteFile(srcFilePath);

        for await (const srcSubDirPath of srcSubDirPaths) {
            await deleteDirIfEmpty(srcSubDirPath);
        }

        if (srcTopDirPath?.endsWith(".aspera-package")) {
            await deleteDirIfEmpty(srcTopDirPath);
        }
    }

    public async migrate(srcFilePath: string, fileSizeBytes?: number): Promise<void> {
        const fileMigration = await this.createFileMigration(srcFilePath, fileSizeBytes);

        if (fileMigration) {
            this.startMigration(fileMigration);
        }
    }
}

export default FileMigrator;
