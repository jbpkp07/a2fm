import FileCopyEventEmitter from "./FileCopyEventEmitter";
import FileCopyParams from "./FileCopyParams";
import FileCopyParamsError from "./FileCopyParamsError";
import FileCopyProgress from "./FileCopyProgress";
import FileCopyStreams from "./FileCopyStreams";
import FileSystemUtils from "./FileSystemUtils";

const { deleteDirIfEmpty, deleteFile, makeDestDir, readFileSizeBytes, traverseBack } = FileSystemUtils;

class FileCopier extends FileCopyEventEmitter {
    private async tryCopyFileAsync(fileCopyParams: FileCopyParams, rollbackDirPath?: string): Promise<void> {
        try {
            await this.copyFileAsync(fileCopyParams);
        } catch (error) {
            await this.rollback(fileCopyParams, rollbackDirPath);

            throw FileCopyParamsError.from(fileCopyParams, error);
        }
    }

    private async copyFileAsync(fileCopyParams: FileCopyParams): Promise<void> {
        const progress = new FileCopyProgress(fileCopyParams);
        const streams = new FileCopyStreams(fileCopyParams);

        this.assignListeners(streams, progress);

        await streams.copyFile();

        await this.validateFileCopy(fileCopyParams);
    }

    private assignListeners(streams: FileCopyStreams, progress: FileCopyProgress): void {
        streams.addStartListener(() => {
            progress.startTimer();
            this.emit("start", progress);
        });

        streams.addProgressListener((bytesWritten: number) => {
            progress.update(bytesWritten);
            this.emit("progress", progress);
        });

        streams.addFinishListener((bytesWritten: number) => {
            progress.update(bytesWritten);
            this.emit("finish", progress);
        });
    }

    private async validateFileCopy(fileCopyParams: FileCopyParams): Promise<void> {
        const { srcFilePath, destFilePath, fileSizeBytes } = fileCopyParams;

        const [srcFileSizeBytes, destFileSizeBytes] = await this.readFileSizes(srcFilePath, destFilePath);

        if (srcFileSizeBytes !== fileSizeBytes) {
            throw new Error(`Source file size (${srcFileSizeBytes}) has changed, original size: ${fileSizeBytes}`);
        }

        if (srcFileSizeBytes !== destFileSizeBytes) {
            throw new Error(`Source file size (${srcFileSizeBytes}) !== destination file size (${destFileSizeBytes})`);
        }
    }

    private async readFileSizes(srcFilePath: string, destFilePath: string): Promise<[number, number]> {
        const readSrcFileSizeBytes = readFileSizeBytes(srcFilePath);
        const readDestFileSizeBytes = readFileSizeBytes(destFilePath);

        return Promise.all([readSrcFileSizeBytes, readDestFileSizeBytes]);
    }

    private async rollback(fileCopyParams: FileCopyParams, rollbackDirPath?: string): Promise<void> {
        const { destFilePath } = fileCopyParams;

        await deleteFile(destFilePath);

        if (rollbackDirPath) {
            await this.rollbackDirs(destFilePath, rollbackDirPath);
        }
    }

    private async rollbackDirs(destFilePath: string, rollbackDirPath: string): Promise<void> {
        const rollbackDirPaths = traverseBack(destFilePath, rollbackDirPath);

        for await (const dirPath of rollbackDirPaths) {
            await deleteDirIfEmpty(dirPath);
        }
    }

    public async copyFile(fileCopyParams: FileCopyParams): Promise<void> {
        const { destFilePath } = fileCopyParams;

        const firstDirPathCreated = await makeDestDir(destFilePath);

        await this.tryCopyFileAsync(fileCopyParams, firstDirPathCreated);
    }
}

export default FileCopier;