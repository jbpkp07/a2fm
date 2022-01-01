import { CopyParams, CopyParamsError } from "./CopyParams";
import FileCopyEventEmitter from "./FileCopyEventEmitter";
import Queue from "./Queue";

type CopyFileAsync = (copyParams: CopyParams) => Promise<void>;

interface SequentialFileCopierParams {
    readonly copyFileAsync: CopyFileAsync;
}

export class SequentialFileCopier extends FileCopyEventEmitter {
    private readonly copyFileAsync: CopyFileAsync;

    private readonly queue = new Queue<CopyParams>();

    private isActive = false;

    constructor(params: SequentialFileCopierParams) {
        super();

        this.copyFileAsync = async (copyParams: CopyParams) => {
            this.emit("start", copyParams);

            await params.copyFileAsync(copyParams);

            this.emit("finish", copyParams);
        };
    }

    private async activateWorker(): Promise<void> {
        if (this.isActive) return;

        this.updateIsActive();

        while (!this.queue.isEmpty) {
            const copyParams = this.queue.dequeue() as CopyParams;

            this.updateChange();
            // eslint-disable-next-line no-await-in-loop
            await this.tryCopyFileAsync(copyParams);
        }

        this.updateIsIdle();
    }

    private async tryCopyFileAsync(copyParams: CopyParams): Promise<void> {
        try {
            await this.copyFileAsync(copyParams);
        } catch (error) {
            if (error instanceof CopyParamsError) {
                this.emit("error", error);

                return;
            }

            if (error instanceof Error) {
                this.emit("error", { ...error, ...copyParams });
            }
        }
    }

    private updateChange(): void {
        const queue = this.queue.peekQueue();
        this.emit("change", queue);
    }

    private updateIsActive(): void {
        this.isActive = true;
        this.emit("active", undefined);
    }

    private updateIsIdle(): void {
        this.isActive = false;
        this.emit("idle", undefined);
    }

    public copyFile(copyParams: CopyParams): this {
        this.queue.enqueue(copyParams);

        if (this.isActive) {
            this.updateChange();
        } else {
            void this.activateWorker();
        }

        return this;
    }
}

export default SequentialFileCopier;

const mockedCopyFileAsync = async (params: CopyParams): Promise<void> => {
    try {
        await new Promise((_resolve, reject) => {
            setTimeout(reject, 10);

            // setTimeout(resolve, 10);
        });
    } catch (error) {
        throw new Error(JSON.stringify(params));
    }
};

const fileCopier = new SequentialFileCopier({ copyFileAsync: mockedCopyFileAsync });

const activeListener = () => console.log("Active...");
const changeListener = (upcoming: readonly CopyParams[]) => console.log("Upcoming: ", upcoming);
const errorListener = (error: CopyParamsError) => console.log("Error: ", error);
const finishListener = (copyParams: CopyParams) => console.log("Finish: ", copyParams);
const idleListener = () => console.log("Idle...");
const startListener = (copyParams: CopyParams) => console.log("Start: ", copyParams);

fileCopier
    .on("active", activeListener)
    .on("change", changeListener)
    .on("error", errorListener)
    .on("finish", finishListener)
    .on("idle", idleListener)
    .on("start", startListener);

async function doStuff() {
    fileCopier
        .copyFile({ srcPath: "a", destPath: "x" })
        .copyFile({ srcPath: "b", destPath: "y" })
        .copyFile({ srcPath: "c", destPath: "z" });

    try {
        const result = await fileCopier.wait("idle");

        console.log("\nResult: ", result, "\n");
    } catch (err) {
        // const error = err instanceof CopyParamsError ? err.error : new Error("Dude");
        // const params = JSON.parse(error.message) as CopyParams;
        // // @ts-ignore
        // params.destPath = "zzzzzzzzzzzzzzzzzzzz";
        // console.log(params);
        // // console.log(params);
        // // console.log("\n--------Awaited error: ", JSON.parse(error.message), "\n");
    }

    setTimeout(() => {
        fileCopier
            .copyFile({ srcPath: "d", destPath: "j" })
            .copyFile({ srcPath: "e", destPath: "k" })
            .copyFile({ srcPath: "f", destPath: "l" })
            .wait("idle")
            .then(() => console.log("------------Done"))
            .catch((error: CopyParamsError) => {
                console.log(error);
                // console.log("\n--------ThenC error: ", error.error.message, "\n");
            });
    }, 500);
}

void doStuff();
