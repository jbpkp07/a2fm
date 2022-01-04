import { once } from "events";
import { createReadStream, createWriteStream, ReadStream, WriteStream, rmSync } from "fs";

import CopyParams from "./CopyParams";
import CopyParamsError from "./CopyParamsError";
import FileCopyEventEmitter from "./FileCopyEventEmitter";

interface StreamOptions {
    readonly highWaterMark: number;
}

class FileCopier extends FileCopyEventEmitter {
    private assignErrorListeners(readStream: ReadStream, writeStream: WriteStream): void {
        const destFilePath = writeStream.path;

        const tearDownListener = () => {
            console.log("TEARDOWN CALLED");
            readStream.unpipe(writeStream);
            readStream.destroy();
            writeStream.destroy();
            rmSync(destFilePath, { force: true });
        };

        readStream.on("error", tearDownListener);
        writeStream.on("error", tearDownListener);
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

    private async copyFile(copyParams: CopyParams): Promise<void> {
        const { srcFilePath, destFilePath } = copyParams;

        // const { size: srcFileSizeBytes } = await stat(copyParams.srcFilePath);

        // const srcFileSizeBytes = 1064551156;
        const srcFileSizeBytes = 10;

        const options = this.createStreamOptions(srcFileSizeBytes);
        console.log(options);
        const readStream = createReadStream(srcFilePath, options);

        this.rs = readStream;

        readStream.on("ready", () => {
            console.log("ReadStream ready.");
        });

        readStream.on("open", () => {
            console.log("ReadStream open.");
        });

        readStream.on("end", () => {
            console.log("ReadStream end.");
        });

        readStream.on("close", () => {
            console.log("ReadStream close.");
        });

        readStream.on("data", () => {
            // console.log("ReadStream data.");
        });

        //
        //

        await once(readStream, "ready");

        const writeStream = createWriteStream(destFilePath, options);

        this.ws = writeStream;

        this.assignErrorListeners(readStream, writeStream);

        //
        //

        writeStream.on("ready", () => {
            console.log("WriteStream ready.");
        });

        writeStream.on("open", () => {
            console.log("WriteStream open.");
        });

        writeStream.on("pipe", () => {
            console.log("WriteStream pipe.");
        });

        writeStream.on("unpipe", () => {
            console.log("WriteStream unpipe.");
        });

        writeStream.on("finish", () => {
            console.log("WriteStream finish.");
        });

        writeStream.on("close", () => {
            console.log("WriteStream close.");
        });
        let count = 0;
        writeStream.on("drain", () => {
            count += 1;
            console.log("WriteStream drain.");
            console.log(Math.ceil(writeStream.bytesWritten / 1024));
            if (count === 9000) {
                writeStream.emit("error", new Error("Jesus H Christ"));
            }
        });

        readStream.pipe(writeStream);

        // console.log("before once readstream");
        // await once(readStream, "close");
        // console.log("before once writestream");
        // await once(writeStream, "close");
        // console.log("after once both closed");

        console.log(readStream.destroyed);
        console.log(writeStream.destroyed);

        console.log("before Promise.all()");

        await Promise.all([once(readStream, "close"), once(writeStream, "close")]);

        console.log("---------------- After Promise.All()");

        if (!readStream.destroyed || !writeStream.destroyed) {
            console.log("------------shit!");
        }
    }

    // private async removeDestFile(destFilePath: string): Promise<void> {
    //     return rm(destFilePath, { force: true });
    // }

    public rs!: ReadStream;

    public ws!: WriteStream;

    public async copyFileAsync(copyParams: CopyParams): Promise<void> {
        try {
            await this.copyFile(copyParams);
        } catch (error) {
            throw CopyParamsError.from(copyParams, error);
        }
    }
}

export default FileCopier;

const copier = new FileCopier();

async function app() {
    try {
        const blah = await copier.copyFileAsync({
            // srcFilePath: "----------test.txt",
            // destFilePath: "----------testCopy.txt"
            srcFilePath: "C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/1GB_test_1.mp4",
            destFilePath: "----------testMovieCopy.mp4"
        });
        console.log(blah);
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
