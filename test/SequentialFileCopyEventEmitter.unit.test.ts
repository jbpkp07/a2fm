/* eslint-disable sonarjs/no-duplicate-string */
import FileCopyParamsError from "../src/filecopier/FileCopyParamsError";
import FileCopyProgress from "../src/filecopier/FileCopyProgress";
import SequentialFileCopyEventEmitter, { Update } from "../src/filecopier/SequentialFileCopyEventEmitter";

const eventEmitter = new SequentialFileCopyEventEmitter();

const extractAllListeners = (): Function[] => {
    return ([] as Function[]).concat(
        eventEmitter.listeners("active"),
        eventEmitter.listeners("copy:start"),
        eventEmitter.listeners("copy:progress"),
        eventEmitter.listeners("copy:finish"),
        eventEmitter.listeners("error"),
        eventEmitter.listeners("idle"),
        eventEmitter.listeners("enqueue")
    );
};

let results: unknown[] = [];

const activeListener = () => results.push("active");
const startListener = (update: Update) => results.push(update);
const progressListener = (update: Update) => results.push(update);
const finishListener = (update: Update) => results.push(update);
const errorListener = (error: FileCopyParamsError) => results.push(error);
const idleListener = () => results.push("idle");
const enqueueListener = (update: Update) => results.push(update);

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
            .on("enqueue", enqueueListener);

        const listeners = extractAllListeners();

        expect(listeners).toStrictEqual([
            activeListener,
            startListener,
            progressListener,
            finishListener,
            errorListener,
            idleListener,
            enqueueListener
        ]);
    });

    test("emit returns true w/ listener", () => {
        const result = eventEmitter.emit("active", undefined);

        expect(result).toBe(true);
    });

    test("emit and capture events", () => {
        results = [];

        const progress = new FileCopyProgress({ id: "123", srcFilePath: "p", destFilePath: "p", fileSizeBytes: 1 });
        const queue = [
            { id: "abc", srcFilePath: "q1", destFilePath: "q1", fileSizeBytes: 5 },
            { id: "def", srcFilePath: "q2", destFilePath: "q2", fileSizeBytes: 6 }
        ];

        const update = { progress, queue };

        const error = new FileCopyParamsError({ id: "456", srcFilePath: "e", destFilePath: "e", fileSizeBytes: 2 });

        eventEmitter.emit("active", undefined);
        eventEmitter.emit("copy:start", update);
        eventEmitter.emit("copy:progress", update);
        eventEmitter.emit("copy:finish", update);
        eventEmitter.emit("error", error);
        eventEmitter.emit("idle", undefined);
        eventEmitter.emit("enqueue", update);

        expect(results).toStrictEqual(["active", update, update, update, error, "idle", update]);
    });

    test("wait", async () => {
        const progress = new FileCopyProgress({ id: "123", srcFilePath: "p", destFilePath: "p", fileSizeBytes: 1 });
        const queue = [
            { id: "abc", srcFilePath: "c3", destFilePath: "c3", fileSizeBytes: 1 },
            { id: "def", srcFilePath: "c4", destFilePath: "c4", fileSizeBytes: 2 }
        ];

        process.nextTick(() => {
            eventEmitter.emit("enqueue", { progress, queue });
        });

        const result = await eventEmitter.wait("enqueue");

        expect(result).toStrictEqual({ progress, queue });
    });

    test("off", () => {
        eventEmitter
            .off("active", activeListener)
            .off("copy:start", startListener)
            .off("copy:progress", progressListener)
            .off("copy:finish", finishListener)
            .off("error", errorListener)
            .off("idle", idleListener)
            .off("enqueue", enqueueListener);

        const listeners = extractAllListeners();

        expect(listeners).toStrictEqual([]);
    });
});
