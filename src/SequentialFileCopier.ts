import FileCopier from "./FileCopier";
import FileCopyParams from "./FileCopyParams";
import FileCopyParamsError from "./FileCopyParamsError";
import Queue from "./Queue";
import SequentialFileCopyEventEmitter from "./SequentialFileCopyEventEmitter";

class SequentialFileCopier extends SequentialFileCopyEventEmitter {
    private readonly fileCopier = new FileCopier();

    private readonly queue = new Queue<FileCopyParams>();

    private isActive = false;

    constructor() {
        super();

        this.fileCopier.on("start", (progress) => this.emit("copy:start", progress));

        this.fileCopier.on("progress", (progress) => this.emit("copy:progress", progress));

        this.fileCopier.on("finish", (progress) => this.emit("copy:finish", progress));
    }

    private async activateWorker(): Promise<void> {
        if (this.isActive) return;

        this.updateIsActive();

        while (!this.queue.isEmpty) {
            const fileCopyParams = this.queue.dequeue() as FileCopyParams;

            this.updateQueue();

            await this.tryCopyFile(fileCopyParams); // eslint-disable-line no-await-in-loop
        }

        this.updateIsIdle();
    }

    private async tryCopyFile(fileCopyParams: FileCopyParams): Promise<void> {
        try {
            await this.fileCopier.copyFile(fileCopyParams);
        } catch (error) {
            this.updateError(fileCopyParams, error);
        }
    }

    private updateError(fileCopyParams: FileCopyParams, error: unknown): void {
        const fileCopyParamsError = FileCopyParamsError.from(fileCopyParams, error);
        this.emit("error", fileCopyParamsError);
    }

    private updateIsActive(): void {
        this.isActive = true;
        this.emit("active", undefined);
    }

    private updateIsIdle(): void {
        this.isActive = false;
        this.emit("idle", undefined);
    }

    private updateQueue(): void {
        const queue = this.queue.peekQueue();
        this.emit("queue", queue);
    }

    public copyFile(fileCopyParams: FileCopyParams): this {
        this.queue.enqueue(fileCopyParams);

        if (this.isActive) {
            this.updateQueue();
        } else {
            void this.activateWorker();
        }

        return this;
    }
}

export default SequentialFileCopier;
