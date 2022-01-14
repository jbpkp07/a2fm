import { once } from "events";

import CopyParams from "./CopyParams";
import FileSystemUtils, { ReadStream, Stream, WriteStream } from "./FileSystemUtils";

const { createReadStream, createWriteStream, deleteFile } = FileSystemUtils;

class FileCopyStreams {
    private isDestroyed = false;

    public readonly readStream: ReadStream;

    public readonly readStreamClosed: Promise<void>;

    public readonly writeStream: WriteStream;

    public readonly writeStreamClosed: Promise<void>;

    constructor(copyParams: CopyParams, fileSizeBytes: number) {
        const { srcFilePath, destFilePath } = copyParams;

        this.readStream = createReadStream(srcFilePath, fileSizeBytes);
        this.writeStream = createWriteStream(destFilePath, fileSizeBytes);

        this.readStreamClosed = this.addCloseListener(this.readStream);
        this.writeStreamClosed = this.addCloseListener(this.writeStream);
    }

    private async addCloseListener(stream: Stream): Promise<void> {
        await once(stream, "close");
    }

    private async destroyAllStreams(): Promise<void> {
        this.readStream.unpipe(this.writeStream);

        const rsDestroyed = this.destroyReadStream();
        const wsDestroyed = this.destroyWriteStream();

        await Promise.all([rsDestroyed, wsDestroyed]);
    }

    private async destroyReadStream(): Promise<void> {
        if (!this.readStream.destroyed) {
            this.readStream.destroy();

            await this.readStreamClosed;
        }
    }

    private async destroyWriteStream(): Promise<void> {
        if (!this.writeStream.destroyed) {
            this.writeStream.destroy();

            await this.writeStreamClosed;
        }
    }

    private removeAllListeners(): void {
        const rsEvents = this.readStream.eventNames();
        const wsEvents = this.writeStream.eventNames();
        console.log("rs event names", rsEvents);
        console.log("ws event names", wsEvents);

        rsEvents.forEach((event) => this.readStream.removeAllListeners(event));
        wsEvents.forEach((event) => this.writeStream.removeAllListeners(event));
    }

    public async abort(): Promise<void> {
        await this.destroy();

        await deleteFile(this.writeStream.path);
    }

    public async destroy(): Promise<void> {
        if (!this.isDestroyed) {
            this.isDestroyed = true;

            await this.destroyAllStreams();

            this.removeAllListeners();
        }
    }
}

export default FileCopyStreams;

const path = "C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/1GB_test_1.mp4";

const copyParams = { srcFilePath: path, destFilePath: "b" };

const streams = new FileCopyStreams(copyParams, 1064551156);

const { readStream, writeStream } = streams;

readStream.once("open", () => {
    console.log("ReadStream open.");
});

readStream.once("ready", () => {
    console.log("ReadStream ready.");
});

readStream.on("data", () => {
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

writeStream.on("drain", () => {
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

setTimeout(() => {
    console.log(readStream.isPaused());
    readStream.pipe(writeStream);
    console.log(readStream.isPaused());
}, 5000);

setTimeout(() => {
    console.log("Rs is destroyed before", readStream.destroyed);
    console.log("Ws is destroyed before", writeStream.destroyed);

    void streams.destroy();

    console.log("Rs is destroyed after", readStream.destroyed);
    console.log("Ws is destroyed after", writeStream.destroyed);
}, 5100);

setInterval(() => {
    console.log("\n...alive...");
    console.log("_______________________________________________________");
    console.log("rs event names", readStream.eventNames());
    console.log("ws event names", writeStream.eventNames());
    console.log("_______________________________________________________");
    console.log("Rs is destroyed", readStream.destroyed);
    console.log("Ws is destroyed", writeStream.destroyed);
    console.log(readStream.isPaused());
}, 10000);
