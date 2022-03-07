import { isDeepStrictEqual as isEqual } from "util";

import Queue from "../common/Queue";
import WaitUtils from "../common/WaitUtils";
import FileCopier, { FileCopierEvents } from "./FileCopier";
import FileCopyParams from "./FileCopyParams";
import FileCopyParamsError from "./FileCopyParamsError";
import FileCopyProgress from "./FileCopyProgress";
import SequentialFileCopyEventEmitter, { Events } from "./SequentialFileCopyEventEmitter";

const { wait } = WaitUtils;

type SeqFileCopierEvents = Extract<Events, "copy:start" | "copy:progress" | "copy:finish">;

class SequentialFileCopier extends SequentialFileCopyEventEmitter {
    private readonly fileCopier = new FileCopier();

    private readonly queue = new Queue<FileCopyParams>();

    private isActive = false;

    private progress: FileCopyProgress | undefined;

    constructor() {
        super();

        this.assignListener("start", "copy:start");
        this.assignListener("progress", "copy:progress");
        this.assignListener("finish", "copy:finish");
    }

    private assignListener(event: FileCopierEvents, seqEvent: SeqFileCopierEvents): void {
        this.fileCopier.on(event, (progress) => {
            this.progress = progress;

            const queue = this.queue.peekQueue();

            this.emit(seqEvent, { progress, queue });
        });
    }

    private async activateWorker(): Promise<void> {
        if (this.isActive) return;

        this.updateIsActive();

        while (!this.queue.isEmpty) {
            const fileCopyParams = this.queue.dequeue() as FileCopyParams;

            this.progress = new FileCopyProgress(fileCopyParams);

            await this.tryCopyFile(fileCopyParams); // eslint-disable-line no-await-in-loop

            await wait(2000); // eslint-disable-line no-await-in-loop
        }

        this.updateIsIdle();
    }

    private enqueue(fileCopyParams: FileCopyParams): void {
        const queue = this.queue.peekQueue();
        const inProgressParams = this.progress?.fileCopyParams;

        const isNotInQueue = !queue.find((inQueueParams) => isEqual(inQueueParams, fileCopyParams));
        const isNotInProgress = !isEqual(inProgressParams, fileCopyParams);

        if (isNotInQueue && isNotInProgress) {
            this.queue.enqueue(fileCopyParams);
        }
    }

    private async tryCopyFile(fileCopyParams: FileCopyParams): Promise<void> {
        try {
            await this.fileCopier.copyFile(fileCopyParams);
        } catch (error) {
            this.updateError(fileCopyParams, error);
        }
    }

    private updateEnqueue(): void {
        const { progress } = this;

        if (progress) {
            const queue = this.queue.peekQueue();
            this.emit("enqueue", { progress, queue });
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

    public copyFile(fileCopyParams: FileCopyParams): this {
        this.enqueue(fileCopyParams);

        if (this.isActive) {
            this.updateEnqueue();
        } else {
            void this.activateWorker();
        }

        return this;
    }
}

export default SequentialFileCopier;
