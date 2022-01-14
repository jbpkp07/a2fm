import { once } from "events";

import CopyParams from "./CopyParams";
import FileSystemUtils, { ReadStream, WriteStream } from "./FileSystemUtils";

const { createReadStream, createWriteStream, deleteFile } = FileSystemUtils;

class FileCopy {
    private readonly readStreamClosed: Promise<unknown[]>;

    private readonly writeStreamClosed: Promise<unknown[]>;

    private isStarted = false;

    public readonly readStream: ReadStream;

    public readonly writeStream: WriteStream;

    constructor(copyParams: CopyParams, fileSizeBytes: number) {
        const { srcFilePath, destFilePath } = copyParams;

        this.readStream = createReadStream(srcFilePath, fileSizeBytes);
        this.writeStream = createWriteStream(destFilePath, fileSizeBytes);

        this.readStreamClosed = once(this.readStream, "close");
        this.writeStreamClosed = once(this.writeStream, "close");
    }

    private async abort(error: unknown): Promise<void> {
        await this.destroy();

        await deleteFile(this.writeStream.path);
        console.log("****************************** File Deleted");
        throw error;
    }

    private async copyFile(): Promise<void> {
        this.readStream.pipe(this.writeStream);

        await Promise.all([this.readStreamClosed, this.writeStreamClosed]);

        await this.destroy();
    }

    private async destroy(): Promise<void> {
        this.readStream.unpipe(this.writeStream);

        await this.destroyStreams();

        this.removeAllListeners();
    }

    private async destroyStreams(): Promise<void> {
        console.log("RS", this.readStream.destroyed, "WS", this.writeStream.destroyed);

        this.readStream.destroy();
        this.writeStream.destroy();

        await Promise.allSettled([this.readStreamClosed, this.writeStreamClosed]);

        console.log("RS", this.readStream.destroyed, "WS", this.writeStream.destroyed);
    }

    private removeAllListeners(): void {
        const rsEvents = this.readStream.eventNames();
        const wsEvents = this.writeStream.eventNames();

        rsEvents.forEach((event) => this.readStream.removeAllListeners(event));
        wsEvents.forEach((event) => this.writeStream.removeAllListeners(event));
        console.log("****************************** Listeners Removed");
    }

    private async tryCopyFile(): Promise<void> {
        try {
            await this.copyFile();
        } catch (error) {
            console.log("\n\n****************************** Abort Reached");
            await this.abort(error);
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

const copyParams = { srcFilePath: path, destFilePath: "zzzfile.mp4" };

const fileCopy = new FileCopy(copyParams, 1064551156);

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
        console.log("\n\n****************************** Top Level Error Caught");
    }

    console.log("Rs is destroyed after", readStream.destroyed);
    console.log("Ws is destroyed after", writeStream.destroyed);
    console.log("Rs is paused", readStream.isPaused());
}

void start();

// setTimeout(() => {
//     const destroy = async () => {
//         console.log("Rs is destroyed before", readStream.destroyed);
//         console.log("Ws is destroyed before", writeStream.destroyed);

//         try {
//             await streams.destroy();
//         } catch (error) {
//             console.log("------------------Here-----------------");
//         }

//         console.log("Rs is destroyed after", readStream.destroyed);
//         console.log("Ws is destroyed after", writeStream.destroyed);
//     };

//     void destroy();
// }, 5100);

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
