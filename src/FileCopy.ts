import { once } from "events";

import FileCopyParams from "./FileCopyParams";
import FileCopyParamsError from "./FileCopyParamsError";
import FileSystemUtils, { ReadStream, WriteStream } from "./FileSystemUtils";

const { createReadStream, createWriteStream } = FileSystemUtils;

class FileCopy {
    private readonly fileCopyParams: FileCopyParams;

    private readonly readStreamClosed: Promise<unknown[]>;

    private readonly writeStreamClosed: Promise<unknown[]>;

    private isStarted = false;

    public readonly readStream: ReadStream;

    public readonly writeStream: WriteStream;

    constructor(fileCopyParams: FileCopyParams) {
        const { srcFilePath, destFilePath, fileSizeBytes } = fileCopyParams;

        this.fileCopyParams = fileCopyParams;

        this.readStream = createReadStream(srcFilePath, fileSizeBytes);
        this.writeStream = createWriteStream(destFilePath, fileSizeBytes);

        this.readStreamClosed = once(this.readStream, "close");
        this.writeStreamClosed = once(this.writeStream, "close");
    }

    private async copyFile(): Promise<void> {
        this.readStream.pipe(this.writeStream);

        await Promise.all([this.readStreamClosed, this.writeStreamClosed]);
    }

    private async tearDown(): Promise<void> {
        this.readStream.unpipe(this.writeStream);

        await this.destroyStreams();

        this.removeAllListeners();
    }

    private async destroyStreams(): Promise<void> {
        this.readStream.destroy();
        this.writeStream.destroy();

        await Promise.allSettled([this.readStreamClosed, this.writeStreamClosed]);
    }

    private removeAllListeners(): void {
        const rsEvents = this.readStream.eventNames();
        const wsEvents = this.writeStream.eventNames();

        rsEvents.forEach((event) => this.readStream.removeAllListeners(event));
        wsEvents.forEach((event) => this.writeStream.removeAllListeners(event));
    }

    private async tryCopyFile(): Promise<void> {
        try {
            await this.copyFile();
        } catch (error) {
            throw FileCopyParamsError.from(this.fileCopyParams, error);
        } finally {
            await this.tearDown();
        }
    }

    public async start(): Promise<void> {
        if (this.isStarted) return;

        this.isStarted = true;

        await this.tryCopyFile();
    }
}

export default FileCopy;

const path = "C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/1GB_test_1.mp4";

const fileCopyParams = { srcFilePath: path, destFilePath: "./zzzfile.mp4", fileSizeBytes: 1064551156 };

const fileCopy = new FileCopy(fileCopyParams);

const { readStream, writeStream } = fileCopy;

readStream.once("open", () => {
    console.log("ReadStream open.");
});

readStream.once("ready", () => {
    console.log("ReadStream ready.");
});

// on -----------------------------------------
// let count = 0;
readStream.on("data", () => {
    // count += 1;
    // if (count === 10) {
    //     readStream.emit("error");
    // }
    console.log("ReadStream data.");
});

readStream.once("end", () => {
    console.log("ReadStream end.");
});

readStream.once("close", () => {
    console.log("ReadStream close.");
});

//
//

writeStream.once("open", () => {
    console.log("WriteStream open.");
});

writeStream.once("ready", () => {
    console.log("WriteStream ready.");
});

writeStream.once("pipe", () => {
    console.log("WriteStream pipe.");
});

// on -----------------------------------------

writeStream.on("drain", () => {
    // count += 1;
    // if (count === 10) {
    //     readStream.emit("error", new Error("Crap!"));
    //     writeStream.emit("error");
    // }
    console.log("WriteStream drain.");
});

writeStream.once("finish", () => {
    console.log("WriteStream finish.");
});

writeStream.once("unpipe", () => {
    console.log("WriteStream unpipe.");
});

writeStream.once("close", () => {
    console.log("WriteStream close.");
});

async function start() {
    console.log("Rs is destroyed before", readStream.destroyed);
    console.log("Ws is destroyed before", writeStream.destroyed);
    console.log("Rs is paused", readStream.isPaused());

    try {
        await fileCopy.start();
    } catch (error) {
        console.log(error);
    }

    console.log("_______________________________________________________");
    console.log("rs event names", readStream.eventNames());
    console.log("ws event names", writeStream.eventNames());
    console.log("_______________________________________________________");
    console.log("Rs is destroyed after", readStream.destroyed);
    console.log("Ws is destroyed after", writeStream.destroyed);
    console.log("Rs is paused", readStream.isPaused());
}

void start();

setInterval(() => {
    console.log("\n...alive...");
    console.log("_______________________________________________________");
    console.log("rs event names", readStream.eventNames());
    console.log("ws event names", writeStream.eventNames());
    console.log("_______________________________________________________");
    console.log("Rs is destroyed", readStream.destroyed);
    console.log("Ws is destroyed", writeStream.destroyed);
    console.log("Rs paused", readStream.isPaused());
}, 5000);

console.log("End of file");
