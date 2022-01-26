import FileCopyEventEmitter from "./FileCopyEventEmitter";
import FileCopyParams from "./FileCopyParams";
import FileCopyParamsError from "./FileCopyParamsError";
import FileCopyProgress from "./FileCopyProgress";
import FileCopyStreams from "./FileCopyStreams";
import FileSystemUtils from "./FileSystemUtils";

const { deleteFile, deleteDirIfEmpty, makeDestDir, traverseBack } = FileSystemUtils;

class FileCopier extends FileCopyEventEmitter {
    private async tryCopyFileAsync(fileCopyParams: FileCopyParams, rollbackDir?: string): Promise<void> {
        try {
            await this.copyFileAsync(fileCopyParams);
        } catch (error) {
            await this.rollback(fileCopyParams, rollbackDir);
            throw FileCopyParamsError.from(fileCopyParams, error);
        }
    }

    private async copyFileAsync(fileCopyParams: FileCopyParams): Promise<void> {
        const streams = new FileCopyStreams(fileCopyParams);
        const progress = new FileCopyProgress(fileCopyParams);

        this.assignListeners(streams, progress);

        await streams.copyFile();

        // await validateCopyWasGood(fileCopyParams); // probably here instead of FileCopy? This does the before (make dirs) and after (delete dirs/file on abort), so should validate copy was good here right?
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

    private async rollback(fileCopyParams: FileCopyParams, rollbackDir?: string): Promise<void> {
        const { destFilePath } = fileCopyParams;

        await deleteFile(destFilePath);

        if (rollbackDir) {
            await this.rollbackDirs(destFilePath, rollbackDir);
        }
    }

    private async rollbackDirs(destFilePath: string, rollbackDir: string): Promise<void> {
        const rollbackDirs = traverseBack(destFilePath, rollbackDir);

        for await (const dir of rollbackDirs) {
            await deleteDirIfEmpty(dir);
        }
    }

    public async copyFile(fileCopyParams: FileCopyParams): Promise<void> {
        const { destFilePath } = fileCopyParams;

        const firstDirCreated = await makeDestDir(destFilePath);

        await this.tryCopyFileAsync(fileCopyParams, firstDirCreated);
    }
}

export default FileCopier;

const srcFilePath = "C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/1GB_test_1.mp42";
const destFilePath = "C:/Users/jeremy.barnes/Desktop/code/a2fm/test/.tmp/dir1/dir2/zzzfile.mp4";

const fileCopyParams = { srcFilePath, destFilePath, fileSizeBytes: 1064551156 };

const fileCopier = new FileCopier();

fileCopier.on("start", (progress) => {
    console.log(progress.bytesPerSecond);
});

fileCopier.on("progress", (progress) => {
    console.log(progress.bytesPerSecond);
});

fileCopier.on("finish", (progress) => {
    console.log(progress.bytesPerSecond);
});

async function app() {
    try {
        await fileCopier.copyFile(fileCopyParams);
    } catch (error) {
        console.log(error);
    }
}

void app();
