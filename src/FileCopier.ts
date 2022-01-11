import { once } from "events";
import { createReadStream, createWriteStream, ReadStream, rmSync, WriteStream } from "fs";
import { stat } from "fs/promises";

import CopyParams from "./CopyParams";
import CopyParamsError from "./CopyParamsError";
import CopyProgress from "./CopyProgress";
import FileCopyEventEmitter from "./FileCopyEventEmitter";
import MicrosecondTimer from "./MicrosecondTimer";
import NumberUtils from "./NumberUtils";

interface StreamOptions {
    readonly highWaterMark: number;
}

const { ceil, round } = NumberUtils;

class FileCopy extends FileCopyEventEmitter {
    private readonly timer = new MicrosecondTimer();

    private progress!: CopyProgress;

    private isActive = false;

    public readStream!: ReadStream; // make private, adjust to Readstream | null once coded to see how many null checks

    public writeStream!: WriteStream; // make private, adjust to Readstream | null once coded to see how many null checks

    private abortCopy(): void {
        console.log("TEARDOWN CALLED");
        this.readStream.unpipe(this.writeStream);
        // copier.ws?.removeAllListeners("drain");
        this.readStream.destroy();
        this.writeStream.destroy();
        rmSync(this.writeStream.path, { force: true });
    }

    private assignErrorListeners(readStream: ReadStream, writeStream: WriteStream): void {
        readStream.on("error", () => this.abortCopy());
        writeStream.on("error", () => this.abortCopy());
    }

    private calcHighWaterMark(fileSizeBytes: number): number {
        const defaultHighWaterMark = 65536; // 64 * 1024
        const drainCount = 100;
        const isLargeFile = fileSizeBytes >= defaultHighWaterMark * drainCount;

        return isLargeFile ? ceil(fileSizeBytes / drainCount) : defaultHighWaterMark;
    }

    private createStreamOptions(fileSizeBytes: number): StreamOptions {
        const highWaterMark = this.calcHighWaterMark(fileSizeBytes);

        return { highWaterMark };
    }

    private async getFileSizeBytes(filePath: string): Promise<number> {
        const { size } = await stat(filePath);

        return size;
    }

    private updateProgress(): void {
        const { bytesWritten } = this.writeStream;
        const elapsedMicroseconds = this.timer.elapsed();

        this.progress.update(bytesWritten, elapsedMicroseconds);
        this.emit("progress", this.progress);
    }

    private async copyFile(copyParams: CopyParams): Promise<void> {
        const { srcFilePath, destFilePath } = copyParams;

        const fileSizeBytes = await this.getFileSizeBytes(srcFilePath);

        const options = this.createStreamOptions(fileSizeBytes);

        this.progress = new CopyProgress({ copyParams, fileSizeBytes });
        this.readStream = createReadStream(srcFilePath, options);
        this.writeStream = createWriteStream(destFilePath, options);

        this.assignErrorListeners(readStream, writeStream);

        let startTime: number;
        const movingAverage = new MovingMedian(15); // if throws here, readStream and writeStream are not destroyed. perhpas abort should be called in catch/finally for copyFileAsync to protect agains this?
        const consec = new Set<number>();

        writeStream.on("ready", () => {
            startTime = Date.now();
        });

        writeStream.on("drain", () => {
            const { bytesWritten } = writeStream;
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            const bytesPerSecond = bytesWritten / elapsedSeconds; // Need to validate that elapsed time > 0 or it results in a bytesPsec rate of "Infinity"... throws error in MovingAverage

            const bytesPerSecondAverage = movingAverage.push(bytesPerSecond);

            const progress: CopyProgress = {
                bytesPerSecond: Math.floor(bytesPerSecondAverage),
                bytesWritten,
                elapsedSeconds,
                fileSizeBytes: srcFileSizeBytes,
                srcFilePath,
                destFilePath
            };

            this.emit("progress", progress);
        });

        writeStream.on("finish", () => {
            // console.log("WriteStream finish.");
            const { bytesWritten } = writeStream;
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            const bytesPerSecond = bytesWritten / elapsedSeconds;

            const progress: CopyProgress = {
                bytesPerSecond: Math.floor(bytesPerSecond),
                bytesWritten,
                elapsedSeconds,
                fileSizeBytes: srcFileSizeBytes,
                srcFilePath,
                destFilePath
            };

            console.log("unique-----: ", consec.size);

            this.emit("progress", progress);
        });

        this.on("progress", (progress: CopyProgress) => {
            const { bytesPerSecond } = progress;

            const megaBytesPerSecond = Math.floor(bytesPerSecond / 1024 ** 2);
            // megaBytesPerSecond = Math.floor(megaBytesPerSecond / 10) * 10;

            consec.add(megaBytesPerSecond);

            // console.log("______________________________");

            console.log("byte/s: ", megaBytesPerSecond);
            // process.stdout.moveCursor(0, -1);
            // console.log("elap/s: ", elapsedSeconds);
            // console.log("flSize: ", parseFloat(((elapsedSeconds * bytesPerSecond) / 1024 ** 3).toFixed(2)), "GB");
            // console.log("count:  ", count);
        });

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

        writeStream.on("ready", () => {
            console.log("WriteStream ready.");
        });

        writeStream.on("open", () => {
            console.log("WriteStream open.");
        });

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

        readStream.pipe(writeStream);

        await Promise.all([once(readStream, "close"), once(writeStream, "close")]);
    }

    public async copyFileAsync(copyParams: CopyParams): Promise<void> {
        try {
            this.emit("start", copyParams);

            await this.copyFile(copyParams);

            this.emit("finish", copyParams);
        } catch (error) {
            throw CopyParamsError.from(copyParams, error);
        }
    }
}

export default FileCopy;

// const copyParams = {
//     // srcFilePath: "----------test.txt",
//     // destFilePath: "----------testCopy.txt"
//     srcFilePath: "C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/1GB_test_1.mp4",
//     destFilePath: "----------testMovieCopy.mp4"
// };

// const copier = new FileCopy(copyParams);

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
