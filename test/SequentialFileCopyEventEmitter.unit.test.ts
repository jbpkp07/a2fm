/* eslint-disable sonarjs/no-duplicate-string */
import FileCopyParams from "../src/FileCopyParams";
import FileCopyParamsError from "../src/FileCopyParamsError";
import FileCopyProgress from "../src/FileCopyProgress";
import SequentialFileCopyEventEmitter from "../src/SequentialFileCopyEventEmitter";

const eventEmitter = new SequentialFileCopyEventEmitter();

const extractAllListeners = (): Function[] => {
    return ([] as Function[]).concat(
        eventEmitter.listeners("active"),
        eventEmitter.listeners("copy:start"),
        eventEmitter.listeners("copy:progress"),
        eventEmitter.listeners("copy:finish"),
        eventEmitter.listeners("error"),
        eventEmitter.listeners("idle"),
        eventEmitter.listeners("queue")
    );
};

let results: unknown[] = [];

const activeListener = () => results.push("active");
const startListener = (progress: FileCopyProgress) => results.push(progress);
const progressListener = (progress: FileCopyProgress) => results.push(progress);
const finishListener = (progress: FileCopyProgress) => results.push(progress);
const errorListener = (error: FileCopyParamsError) => results.push(error);
const idleListener = () => results.push("idle");
const queueListener = (upcoming: readonly FileCopyParams[]) => results.push(upcoming);

describe("SequentialFileCopyEventEmitter", () => {
    test("emit returns false w/o listener", () => {
        const result = eventEmitter.emit("active", undefined);

        expect(result).toBe(false);
    });

    test("on", () => {
        eventEmitter
            .on("active", activeListener)
            .on("copy:start", startListener)
            .on("copy:progress", progressListener)
            .on("copy:finish", finishListener)
            .on("error", errorListener)
            .on("idle", idleListener)
            .on("queue", queueListener);

        const listeners = extractAllListeners();

        expect(listeners).toStrictEqual([
            activeListener,
            startListener,
            progressListener,
            finishListener,
            errorListener,
            idleListener,
            queueListener
        ]);
    });

    test("emit returns true w/ listener", () => {
        const result = eventEmitter.emit("active", undefined);

        expect(result).toBe(true);
    });

    test("emit and capture events", () => {
        results = [];

        const progress = new FileCopyProgress({ srcFilePath: "p", destFilePath: "p", fileSizeBytes: 1 });

        const error = new FileCopyParamsError({ srcFilePath: "e", destFilePath: "e", fileSizeBytes: 2 });

        eventEmitter.emit("active", undefined);
        eventEmitter.emit("copy:start", progress);
        eventEmitter.emit("copy:progress", progress);
        eventEmitter.emit("copy:finish", progress);
        eventEmitter.emit("error", error);
        eventEmitter.emit("idle", undefined);
        eventEmitter.emit("queue", [
            { srcFilePath: "q1", destFilePath: "q1", fileSizeBytes: 5 },
            { srcFilePath: "q2", destFilePath: "q2", fileSizeBytes: 6 }
        ]);

        expect(results).toStrictEqual([
            "active",
            progress,
            progress,
            progress,
            error,
            "idle",
            [
                { srcFilePath: "q1", destFilePath: "q1", fileSizeBytes: 5 },
                { srcFilePath: "q2", destFilePath: "q2", fileSizeBytes: 6 }
            ]
        ]);
    });

    test("wait", async () => {
        process.nextTick(() => {
            eventEmitter.emit("queue", [
                { srcFilePath: "c3", destFilePath: "c3", fileSizeBytes: 1 },
                { srcFilePath: "c4", destFilePath: "c4", fileSizeBytes: 2 }
            ]);
        });

        const result = await eventEmitter.wait("queue");

        expect(result).toStrictEqual([
            { srcFilePath: "c3", destFilePath: "c3", fileSizeBytes: 1 },
            { srcFilePath: "c4", destFilePath: "c4", fileSizeBytes: 2 }
        ]);
    });

    test("off", () => {
        eventEmitter
            .off("active", activeListener)
            .off("copy:start", startListener)
            .off("copy:progress", progressListener)
            .off("copy:finish", finishListener)
            .off("error", errorListener)
            .off("idle", idleListener)
            .off("queue", queueListener);

        const listeners = extractAllListeners();

        expect(listeners).toStrictEqual([]);
    });
});
