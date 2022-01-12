import { once } from "events";
import { createReadStream, createWriteStream, ReadStream, WriteStream } from "fs";
import { rm, stat } from "fs/promises";

import CopyParams from "./CopyParams";
import CopyParamsError from "./CopyParamsError";
import CopyProgress from "./CopyProgress";
import FileCopyEventEmitter from "./FileCopyEventEmitter";
import MicrosecondTimer from "./MicrosecondTimer";

interface StreamOptions {
    readonly highWaterMark: number;
}

class FileCopier extends FileCopyEventEmitter {
    private readonly timer = new MicrosecondTimer();

    private progress!: CopyProgress;

    private isActive = false;

    public readStream!: ReadStream; // make private, adjust to Readstream | null once coded to see how many null checks

    public writeStream!: WriteStream; // make private, adjust to Readstream | null once coded to see how many null checks

    private calcHighWaterMark(fileSizeBytes: number): number {
        const defaultHighWaterMark = 65536; // 64 * 1024
        const drainCount = 100;
        const isLargeFile = fileSizeBytes >= defaultHighWaterMark * drainCount;

        return isLargeFile ? Math.ceil(fileSizeBytes / drainCount) : defaultHighWaterMark;
    }

    private createStreamOptions(fileSizeBytes: number): StreamOptions {
        const highWaterMark = this.calcHighWaterMark(fileSizeBytes);

        return { highWaterMark };
    }

    private async getFileSizeBytes(filePath: string): Promise<number> {
        const { size } = await stat(filePath);

        return size;
    }

    private async setup(copyParams: CopyParams): Promise<void> {
        if (this.isActive) return;

        this.isActive = true;

        const { srcFilePath, destFilePath } = copyParams;

        const fileSizeBytes = await this.getFileSizeBytes(srcFilePath);

        const options = this.createStreamOptions(fileSizeBytes);

        this.progress = new CopyProgress(copyParams, fileSizeBytes);
        this.readStream = createReadStream(srcFilePath, options);
        this.writeStream = createWriteStream(destFilePath, options);

        this.writeStream.on("ready", () => this.timer.start());

        this.writeStream.on("drain", () => this.updateProgress());

        this.writeStream.on("finish", () => this.updateProgress());

        this.readStream.pipe(this.writeStream);
    }

    private async tearDown(): Promise<void> {
        console.log("TEARDOWN CALLED");
        if (!this.isActive) return;

        this.readStream.unpipe(this.writeStream);
        // copier.ws?.removeAllListeners("drain");
        this.readStream.destroy();
        this.writeStream.destroy();
        await rm(this.writeStream.path, { force: true });

        this.isActive = false;
    }

    private updateProgress(): void {
        const { bytesWritten } = this.writeStream;
        const elapsed = this.timer.elapsed();

        this.progress.update(bytesWritten, elapsed);
        this.emit("progress", this.progress);
    }

    private async waitForStreamsToClose(): Promise<void> {
        const readStreamClose = once(this.readStream, "close");
        const writeStreamClose = once(this.writeStream, "close");

        await Promise.all([readStreamClose, writeStreamClose]);
    }

    private async copyFile(copyParams: CopyParams): Promise<void> {
        this.emit("start", copyParams);
        await this.setup(copyParams);
        await this.waitForStreamsToClose();
        this.emit("finish", copyParams);
    }

    private async tryCopyFileAsync(copyParams: CopyParams): Promise<void> {
        try {
            await this.copyFile(copyParams);
        } catch (error) {
            throw CopyParamsError.from(copyParams, error);
        } finally {
            await this.tearDown();
        }
    }

    public async copyFileAsync(copyParams: CopyParams): Promise<void> {
        if (this.isActive) return;

        await this.tryCopyFileAsync(copyParams);
    }
}

export default FileCopier;

// const copyParams = {
//     // srcFilePath: "----------test.txt",
//     // destFilePath: "----------testCopy.txt"
//     srcFilePath: "C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/1GB_test_1.mp4",
//     destFilePath: "----------testMovieCopy.mp4"
// };

// const copier = new FileCopy();

// copier.on("progress", (progress: CopyProgress) => {
//     const { bytesPerSecond } = progress;

//     const megaBytesPerSecond = Math.floor(bytesPerSecond / 1024 ** 2);

//     // console.log("______________________________");

//     console.log("MB/s: ", megaBytesPerSecond);
//     // process.stdout.moveCursor(0, -1);
//     // console.log("elap/s: ", elapsedSeconds);
//     // console.log("flSize: ", parseFloat(((elapsedSeconds * bytesPerSecond) / 1024 ** 3).toFixed(2)), "GB");
//     // console.log("count:  ", count);
// });

// async function app() {
//     try {
//         await copier.copyFileAsync(copyParams);
//     } catch (error) {
//         console.log("Error Caught ----------------------------");
//         if (error instanceof CopyParamsError) {
//             console.log();
//             console.log(error.name, "\n");
//             console.log(error.message, "\n");
//             console.log(error.stack, "\n");
//             console.log(error.copyParams, "\n");
//         }
//     }

//     console.log("App Closed.");
// }

// void app();

// setInterval(() => {
//     console.log("alive");
//     console.log(copier.readStream?.destroyed);
//     console.log(copier.writeStream?.destroyed);
//     // console.log(copier.writeStream?.listeners("drain"));
//     // console.log(copier.writeStream?.removeAllListeners("drain"));
//     console.log(copier.writeStream?.path);
// }, 5000);

// console.log("End of code file");

// readStream.on("ready", () => {
//     console.log("ReadStream ready.");
// });

// readStream.on("open", () => {
//     console.log("ReadStream open.");
// });

// readStream.on("end", () => {
//     console.log("ReadStream end.");
// });

// readStream.on("close", () => {
//     console.log("ReadStream close.");
// });

// readStream.on("data", () => {
//     console.log("ReadStream data.");
// });

// //
// //

// writeStream.on("ready", () => {
//     console.log("WriteStream ready.");
// });

// writeStream.on("open", () => {
//     console.log("WriteStream open.");
// });

// writeStream.on("pipe", () => {
//     console.log("WriteStream pipe.");
// });

// writeStream.on("unpipe", () => {
//     console.log("WriteStream unpipe.");
// });

// writeStream.on("finish", () => {
//     console.log("WriteStream finish.");
// });

// writeStream.on("close", () => {
//     console.log("WriteStream close.");
// });

// writeStream.on("drain", () => {
//     console.log("WriteStream drain.");
// });
