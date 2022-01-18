import FileCopyEventEmitter from "./FileCopyEventEmitter";
import FileCopyParams from "./FileCopyParams";
import FileCopyProgress from "./FileCopyProgress";
import FileCopyStreams from "./FileCopyStreams";
import FileSystemUtils from "./FileSystemUtils";

const { makeDestDir } = FileSystemUtils;

class FileCopier extends FileCopyEventEmitter {
    private async tryCopyFileAsync(fileCopyParams: FileCopyParams): Promise<void> {
        try {
            await this.copyFileAsync(fileCopyParams);
        } catch (error) {
            // await abort(abortDeletePath, err);
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

    // abort(abortDeletePath, err) {
    //     await rm(abortDeletePath, { force: true, recursive: true }); // can be in FileSystemUtils

    //     throw err;
    // }

    public copyFile = async (fileCopyParams: FileCopyParams): Promise<void> => {
        const { destFilePath } = fileCopyParams;

        const firstDirPathCreated = await makeDestDir(destFilePath);

        const rollbackToPath = firstDirPathCreated ?? destFilePath;

        await this.tryCopyFileAsync(fileCopyParams);
    };
}

export default FileCopier;

const path = "C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/1GB_test_1.mp4";

const fileCopyParams = { srcFilePath: path, destFilePath: "./zzzfile.mp4", fileSizeBytes: 1064551156 };

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
