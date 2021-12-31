import { CopyParams, CopyParamsError } from "./CopyParams";
import FileCopyEventEmitter from "./FileCopyEventEmitter";
import Queue from "./Queue";

type CopyFileAsync = (params: CopyParams) => Promise<void>;

export class SequentialFileCopier extends FileCopyEventEmitter {
    private readonly copyFileAsync: CopyFileAsync;

    private readonly queue = new Queue<CopyParams>();

    private isWorking = false;

    constructor(copyFileAsync: CopyFileAsync) {
        super();

        this.copyFileAsync = async (params: CopyParams) => {
            this.emit("start", params);
            await copyFileAsync(params);
            this.emit("finish", params);
        };
    }

    private async startWorker(): Promise<void> {
        if (this.isWorking) return;

        this.setIsWorking(true);

        while (!this.queue.isEmpty) {
            const params = this.queue.dequeue() as CopyParams;
            // eslint-disable-next-line no-await-in-loop
            await this.tryCopyFileAsync(params);
        }

        this.setIsWorking(false);
    }

    private setIsWorking(isWorking: boolean): void {
        if (isWorking) {
            this.isWorking = true;
            this.emit("active", undefined);
        } else {
            this.isWorking = false;
            this.emit("idle", undefined);
        }
    }

    private async tryCopyFileAsync(params: CopyParams): Promise<void> {
        try {
            await this.copyFileAsync(params);
        } catch (error) {
            this.emit("error", { ...params, error });
        }
    }

    public copyFile(params: CopyParams): this {
        this.queue.enqueue(params);

        if (!this.isWorking) {
            void this.startWorker();
        }

        return this;
    }
}

export default SequentialFileCopier;

const mockedCopyFileAsync = async (): Promise<void> => {
    try {
        await new Promise((resolve) => {
            // setTimeout(reject, 10);

            setTimeout(resolve, 10);
        });
    } catch (error) {
        throw new Error("Copy Failed");
    }
};

const fileCopier = new SequentialFileCopier(mockedCopyFileAsync);

const activeListener = () => console.log("Active...");
const errorListener = (error: CopyParamsError) => console.log("Error: ", error);
const finishListener = (params: CopyParams) => console.log("Finish: ", params);
const idleListener = () => console.log("Idle...");
const startListener = (params: CopyParams) => console.log("Start: ", params);

fileCopier
    .on("active", activeListener)
    .on("error", errorListener)
    .on("finish", finishListener)
    .on("idle", idleListener)
    .on("start", startListener);

async function doStuff() {
    fileCopier
        .copyFile({ srcPath: "a", destPath: "x" })
        .copyFile({ srcPath: "b", destPath: "y" })
        .copyFile({ srcPath: "c", destPath: "z" });

    // fileCopier.emit("drained", undefined); // -----------------

    try {
        const result = await fileCopier.wait("idle");

        console.log("\nResult: ", result, "\n");
    } catch (error) {
        console.log("\n--------Awaited error: ", error, "\n");
    }

    setTimeout(() => {
        fileCopier
            .copyFile({ srcPath: "d", destPath: "j" })
            .copyFile({ srcPath: "e", destPath: "k" })
            .copyFile({ srcPath: "f", destPath: "l" })
            .wait("idle")
            .then(() => console.log("------------Done"))
            .catch((error) => {
                console.log("\n--------ThenC error: ", error, "\n");
            });
    }, 500);
}

void doStuff();
