import FileCopyEventEmitter from "./FileCopyEventEmitter";
import FileCopyParams from "./FileCopyParams";

class FileCopier extends FileCopyEventEmitter {
    private constructor() {
        super();
    }

    // updateStart(progress) {
    //     const { fileCopyParams } = progress;

    //     progress.startTimer();
    //     this.emit("start", fileCopyParams);
    // }

    // updateProgress(progress, writeStream) {
    //     const { bytesWritten } = writeStream;

    //     progress.update(bytesWritten);
    //     this.emit("progress", progress);
    // }

    // updateFinish(progress, writeStream) {
    //     const { fileCopyParams } = progress;

    //     updateProgress(progress, writeStream);

    //     this.emit("finish", fileCopyParams);
    // }

    // assignWriteStreamListeners(progress, writeStream) {

    //     writeStream.once("ready", () => updateStart(progress));
    //     writeStream.on("drain", () => updateProgress(progress, writeStream));
    //     writeStream.once("finish", () => updateFinish(progress, writeStream));
    // }

    // copyFile(fileCopyParams) {
    //     const progress = new FileCopyProgress(fileCopyParams);
    //     const fileCopy = new FileCopy(fileCopyParams);
    //     const { writeStream } = fileCopy;

    //     assignWriteStreamListeners(progress, writeStream);

    //     await fileCopy.start();

    //     await validateCopyWasGood(fileCopyParams); // probably here instead of FileCopy? This does the before (make dirs) and after (delete dirs/file on abort), so should validate copy was good here right?
    // }

    // abort(abortDeletePath, err) {
    //     await rm(abortDeletePath, { force: true, recursive: true }); // can be in FileSystemUtils

    //     throw err;
    // }

    // tryCopyfile(fileCopyParams, abortDeletPath) {
    //     try {
    //         await copyFile(fileCopyParams);
    //     } catch (err) {
    //         await abort(abortDeletePath, err);
    //     }
    // }

    // makeDestDir(destFilePath) {              // Cant be in FileSystemUtils
    //     const dir = dirname(destFilePath);

    //     await mkDir(dir, { recursive: true }};
    // }

    // copyfileAsync(fileCopyParams) {

    //     const { destFilePath } = fileCopyParams;

    //     const abortDeletPath = await makeDestDir(destFilePath) ?? destFilePath;

    //     await tryCopyFile(fileCopyParams, abortDeletPath);
    // }
}

export default FileCopier;
