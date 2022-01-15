import FileCopyParams from "./FileCopyParams";
import FileCopyParamsError from "./FileCopyParamsError";
import Queue from "./Queue";
import SequentialFileCopyEventEmitter from "./SequentialFileCopyEventEmitter";

type CopyFileAsync = (fileCopyParams: FileCopyParams) => Promise<void>;

interface FileCopier {
    readonly copyFileAsync: CopyFileAsync;
}

class SequentialFileCopier extends SequentialFileCopyEventEmitter {
    private readonly copyFileAsync: CopyFileAsync;

    private readonly queue = new Queue<FileCopyParams>();

    private isActive = false;

    constructor(fileCopier: FileCopier) {
        super();

        this.copyFileAsync = async (fileCopyParams: FileCopyParams) => {
            this.emit("copy:start", fileCopyParams);

            await fileCopier.copyFileAsync(fileCopyParams);

            this.emit("copy:finish", fileCopyParams);
        };
    }

    private async activateWorker(): Promise<void> {
        if (this.isActive) return;

        this.updateIsActive();

        while (!this.queue.isEmpty) {
            const fileCopyParams = this.queue.dequeue() as FileCopyParams;

            this.updateQueue();

            await this.tryCopyFileAsync(fileCopyParams); // eslint-disable-line no-await-in-loop
        }

        this.updateIsIdle();
    }

    private async tryCopyFileAsync(fileCopyParams: FileCopyParams): Promise<void> {
        try {
            await this.copyFileAsync(fileCopyParams);
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

const mockedCopyFileAsync = async (): Promise<void> => {
    try {
        await new Promise((_resolve) => {
            // setTimeout(_reject, 10);

            setTimeout(_resolve, 5000);
        });
    } catch (error) {
        throw new Error("Copy didn't work");
    }
};

const fileCopier = new SequentialFileCopier({ copyFileAsync: mockedCopyFileAsync });

const activeListener = () => console.log("Active...");
const queueListener = (upcoming: readonly FileCopyParams[]) => console.log("Upcoming: ", upcoming);
// const errorListener = (error: FileCopyParamsError) => console.log("Error: ", error.message);
// const finishListener = (fileCopyParams: FileCopyParams) => console.log("Finish: ", fileCopyParams);
const idleListener = () => console.log("Idle...");
// const startListener = (fileCopyParams: FileCopyParams) => console.log("Start: ", fileCopyParams);

fileCopier
    .on("active", activeListener)
    .on("queue", queueListener)
    // .on("error", errorListener)
    // .on("finish", finishListener)
    .on("idle", idleListener);
// .on("start", startListener);

async function doStuff() {
    fileCopier
        .copyFile({ srcFilePath: "a", destFilePath: "x", fileSizeBytes: 10 })
        .copyFile({ srcFilePath: "b", destFilePath: "y", fileSizeBytes: 10 })
        .copyFile({ srcFilePath: "c", destFilePath: "z", fileSizeBytes: 10 });

    try {
        const result = await fileCopier.wait("idle");

        console.log("\nResult: ", result, "\n");
    } catch (err) {
        // const error = err instanceof FileCopyParamsError ? err.error : new Error("Dude");
        // const params = JSON.parse(error.message) as CopyParams;
        // // @ts-ignore
        // params.destPath = "zzzzzzzzzzzzzzzzzzzz";
        // console.log(params);
        // // console.log(params);
        // // console.log("\n--------Awaited error: ", JSON.parse(error.message), "\n");
    }

    // setTimeout(() => {
    //     fileCopier
    //         .copyFile({ srcPath: "d", destPath: "j" })
    //         .copyFile({ srcPath: "e", destPath: "k" })
    //         .copyFile({ srcPath: "f", destPath: "l" })
    //         .wait("idle")
    //         .then(() => console.log("------------Done"))
    //         .catch((error: FileCopyParamsError) => {
    //             console.log(error);
    //             // console.log("\n--------ThenC error: ", error.error.message, "\n");
    //         });
    // }, 500);
}

void doStuff();
