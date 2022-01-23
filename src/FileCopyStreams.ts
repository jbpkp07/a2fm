import { once } from "events";

import FileCopyParams from "./FileCopyParams";
import FileCopyParamsError from "./FileCopyParamsError";
import FileSystemUtils, { ReadStream, WriteStream } from "./FileSystemUtils";

type Listener = (bytesWritten: number) => void;

class FileCopyStreams {
    private readonly fileCopyParams: FileCopyParams;

    private readonly readStreamClosed: Promise<unknown[]>;

    private readonly writeStreamClosed: Promise<unknown[]>;

    private isStarted = false;

    public readonly readStream: ReadStream;

    public readonly writeStream: WriteStream;

    public get bytesWritten(): number {
        return this.writeStream.bytesWritten;
    }

    constructor(fileCopyParams: FileCopyParams) {
        const { srcFilePath, destFilePath, fileSizeBytes } = fileCopyParams;

        this.fileCopyParams = fileCopyParams;

        this.readStream = FileSystemUtils.createReadStream(srcFilePath, fileSizeBytes);
        this.writeStream = FileSystemUtils.createWriteStream(destFilePath, fileSizeBytes);

        this.readStreamClosed = once(this.readStream, "close");
        this.writeStreamClosed = once(this.writeStream, "close");
    }

    private async tryStartStreaming(): Promise<void> {
        try {
            await this.startStreaming();
        } catch (error) {
            throw FileCopyParamsError.from(this.fileCopyParams, error);
        } finally {
            await this.tearDown();
        }
    }

    private async startStreaming(): Promise<void> {
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

    public addStartListener(listener: Listener): void {
        this.writeStream.once("ready", () => listener(this.bytesWritten));
    }

    public addProgressListener(listener: Listener): void {
        this.writeStream.on("drain", () => listener(this.bytesWritten));
    }

    public addFinishListener(listener: Listener): void {
        this.writeStream.once("finish", () => listener(this.bytesWritten));
    }

    public async copyFile(): Promise<void> {
        if (this.isStarted) return;

        this.isStarted = true;

        await this.tryStartStreaming();
    }
}

export default FileCopyStreams;
