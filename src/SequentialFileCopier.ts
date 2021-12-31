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
            // eslint-disable-next-line no-await-in-loop
            await this.tryCopyFileAsync(copyParams);
        }

        this.updateIsIdle();
    }

    private async tryCopyFileAsync(copyParams: CopyParams): Promise<void> {
        try {
            await this.copyFileAsync(copyParams);
        } catch (error) {
            this.emit("error", { ...copyParams, error });
        }
    }

    private updateEnqueue(copyParams: CopyParams): void {
        this.queue.enqueue(copyParams);
        this.emit("change", this.queue.peekQueue());
    }

    private updateDequeue(): void {
        this.isActive = false;
        this.emit("idle", undefined);
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

        if (!this.isActive) {
            void this.activateWorker();
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

const fileCopier = new SequentialFileCopier({ copyFileAsync: mockedCopyFileAsync });

const activeListener = () => console.log("Active...");
const errorListener = (error: CopyParamsError) => console.log("Error: ", error);
const finishListener = (copyParams: CopyParams) => console.log("Finish: ", copyParams);
const idleListener = () => console.log("Idle...");
const startListener = (copyParams: CopyParams) => console.log("Start: ", copyParams);

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
