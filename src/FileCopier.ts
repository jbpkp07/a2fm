import { once } from "events";
import { createReadStream, createWriteStream, ReadStream, rmSync, WriteStream } from "fs";
import { stat } from "fs/promises";

import CopyParams from "./CopyParams";
import CopyParamsError from "./CopyParamsError";
import CopyProgress from "./CopyProgress";
import FileCopyEventEmitter from "./FileCopyEventEmitter";
import MovingAverage from "./MovingAverage";

interface StreamOptions {
    readonly highWaterMark: number;
}

class FileCopier extends FileCopyEventEmitter {
    public rs!: ReadStream;

    public ws!: WriteStream;

    private assignErrorListeners(readStream: ReadStream, writeStream: WriteStream): void {
        const abortCopy = () => {
            console.log("TEARDOWN CALLED");
            readStream.unpipe(writeStream);
            readStream.destroy();
            writeStream.destroy();
            rmSync(writeStream.path, { force: true });
        };

        readStream.on("error", abortCopy);
        writeStream.on("error", abortCopy);
    }

    private calcHighWaterMark(srcFileSizeBytes: number): number {
        const defaultHighWaterMark = 65536; // 64 * 1024
        const isLargeFile = srcFileSizeBytes >= defaultHighWaterMark * 100;

        return isLargeFile ? Math.ceil(srcFileSizeBytes / 100) : defaultHighWaterMark;
    }

    private createStreamOptions(srcFileSizeBytes: number): StreamOptions {
        const highWaterMark = this.calcHighWaterMark(srcFileSizeBytes);

        return { highWaterMark };
    }

    // private stuff(writeStream: WriteStream, startTime: number, srcFileSizeBytes: number, copyParams: CopyParams) {
    //     const { bytesWritten } = writeStream;
    //     const elapsedSeconds = (Date.now() - startTime) / 1000;
    //     const bytesPerSecond = bytesWritten / elapsedSeconds;

    //     const progress: CopyProgress = {
    //         bytesPerSecond: Math.round(bytesPerSecond),
    //         bytesWritten,
    //         elapsedSeconds,
    //         srcFileSizeBytes,
    //         ...copyParams
    //     };

    //     this.emit("progress", progress);
    // }

    private async copyFile(copyParams: CopyParams): Promise<void> {
        const { srcFilePath, destFilePath } = copyParams;

        const { size: srcFileSizeBytes } = await stat(srcFilePath);

        const options = this.createStreamOptions(srcFileSizeBytes);
        const readStream = createReadStream(srcFilePath, options);
        const writeStream = createWriteStream(destFilePath, options);

        this.rs = readStream;
        this.ws = writeStream;

        this.assignErrorListeners(readStream, writeStream);

        let startTime: number;
        const cumulativeAverage = new MovingAverage(20); // if throws here, readStream and writeStream are not destroyed. perhpas abort should be called in catch/finally for copyFileAsync to protect agains this?
        let count = 0;

        writeStream.on("ready", () => {
            startTime = Date.now();
        });

        writeStream.on("drain", () => {
            const { bytesWritten } = writeStream;
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            const bytesPerSecond = bytesWritten / elapsedSeconds;

            const bytesPerSecondAve = cumulativeAverage.push(bytesPerSecond);

            const progress: CopyProgress = {
                bytesPerSecond: Math.floor(bytesPerSecondAve),
                bytesWritten,
                elapsedSeconds,
                srcFileSizeBytes,
                srcFilePath,
                destFilePath
            };
            count += 1;
            this.emit("progress", progress);
        });

        writeStream.on("finish", () => {
            console.log("WriteStream finish.");
            const { bytesWritten } = writeStream;
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            const bytesPerSecond = bytesWritten / elapsedSeconds;

            const progress: CopyProgress = {
                bytesPerSecond: Math.floor(bytesPerSecond),
                bytesWritten,
                elapsedSeconds,
                srcFileSizeBytes,
                srcFilePath,
                destFilePath
            };
            count += 1;
            this.emit("progress", progress);
        });

        this.on("progress", (progress: CopyProgress) => {
            const { bytesPerSecond, elapsedSeconds } = progress;

            let megaBytesPerSecond = Math.floor(bytesPerSecond / 1024 ** 2);
            megaBytesPerSecond = Math.floor(megaBytesPerSecond / 10) * 10;

            console.log("______________________________");
            console.log("byte/s: ", megaBytesPerSecond);
            console.log("elap/s: ", elapsedSeconds);
            console.log("flSize: ", parseFloat(((elapsedSeconds * bytesPerSecond) / 1024 ** 3).toFixed(2)), "GB");
            console.log("count:  ", count);
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

export default FileCopier;

const copier = new FileCopier();

async function app() {
    try {
        await copier.copyFileAsync({
            // srcFilePath: "----------test.txt",
            // destFilePath: "----------testCopy.txt"
            srcFilePath: "C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/1GB_test_1.mp4",
            destFilePath: "----------testMovieCopy.mp4"
        });
    } catch (error) {
        console.log("Error Caught ----------------------------");
        if (error instanceof CopyParamsError) {
            console.log();
            console.log(error.name, "\n");
            console.log(error.message, "\n");
            console.log(error.stack, "\n");
            console.log(error.copyParams, "\n");
        }
    }

    console.log("App Closed.");
}

void app();

setInterval(() => {
    console.log("alive");
    console.log(copier.rs?.destroyed);
    console.log(copier.ws?.destroyed);
    console.log(copier.ws?.path);
}, 5000);

console.log("End of code file");
