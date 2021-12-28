/* eslint-disable no-await-in-loop */
import { EventEmitter } from "events";

import Queue from "./Queue";

interface CopyParams {
    srcPath: string;
    destPath: string;
}

interface CopyParamsError {
    error: Error;
    params: CopyParams;
}

interface SequentialFileCopier extends EventEmitter {
    emit(event: "copied", params: CopyParams): boolean;
    emit(event: "error", error: CopyParamsError): boolean;

    on(event: "copied", listener: (params: CopyParams) => void): this;
    on(event: "error", listener: (error: CopyParamsError) => void): this;
}

type CopyFile = (params: CopyParams) => Promise<void>;

class SequentialFileCopier extends EventEmitter {
    private readonly copyFileAsync: CopyFile;

    private readonly queue = new Queue<CopyParams>();

    private worker: Promise<void> | null = null;

    constructor(copyFileAsync: CopyFile) {
        super();

        this.copyFileAsync = async (params: CopyParams) => {
            try {
                await copyFileAsync(params);
                this.emit("copied", params);
                throw new Error("crap");
            } catch (err) {
                const error = err as Error;
                this.emit("error", { error, params });
            }
        };
    }

    private async startWorker(): Promise<void> {
        if (this.worker) return;

        while (!this.queue.isEmpty) {
            const params = this.queue.dequeue() as CopyParams;

            await this.copyFileAsync(params);
        }

        this.worker = null;
    }

    public copyFile(params: CopyParams): this {
        this.queue.enqueue(params);

        this.worker ??= this.startWorker();

        return this;
    }

    public wait(): Promise<void> {
        return this.worker ?? Promise.resolve();
    }
}

const results: string[] = [];

const copyFn = async (params: CopyParams): Promise<void> => {
    return new Promise((resolve) => {
        results.push(params.srcPath);
        console.log(params.srcPath);
        setTimeout(() => {
            results.push(params.srcPath);
            console.log(params.srcPath);
            resolve();
        }, Math.ceil(Math.random() * 1000));
    });
};

const blah = new SequentialFileCopier(copyFn);

const listener = (error: CopyParamsError) => {
    console.log(error.params);
};

const listener2 = (params: CopyParams) => {
    console.log(params);
};

blah.on("error", listener);

blah.on("copied", listener2);

async function doStuff() {
    await blah.wait();

    console.log(results);

    await blah
        .copyFile({ srcPath: "a", destPath: "x" })
        .copyFile({ srcPath: "b", destPath: "y" })
        .copyFile({ srcPath: "c", destPath: "z" })
        .wait();

    console.log(results);

    setTimeout(() => {
        blah.copyFile({ srcPath: "d", destPath: "x" })
            .copyFile({ srcPath: "e", destPath: "y" })
            .copyFile({ srcPath: "f", destPath: "z" })
            .wait()
            .then(() => console.log(results))
            .catch((err) => console.log(err));
    }, 10000);
}

void doStuff();

export default SequentialFileCopier;
