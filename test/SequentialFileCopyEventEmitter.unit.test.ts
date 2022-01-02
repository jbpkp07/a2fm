/* eslint-disable sonarjs/no-duplicate-string */
import CopyParams from "../src/CopyParams";
import CopyParamsError from "../src/CopyParamsError";
import CopyProgress from "../src/CopyProgress";
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
const startListener = (copyParams: CopyParams) => results.push(copyParams);
const progressListener = (copyProgress: CopyProgress) => results.push(copyProgress);
const finishListener = (copyParams: CopyParams) => results.push(copyParams);
const errorListener = (error: CopyParamsError) => results.push(error);
const idleListener = () => results.push("idle");
const queueListener = (upcoming: readonly CopyParams[]) => results.push(upcoming);

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

        eventEmitter.emit("active", undefined);
        eventEmitter.emit("copy:start", { srcPath: "s", destPath: "s" });
        eventEmitter.emit("copy:progress", {
            srcPath: "p",
            destPath: "p",
            bytesPerSecond: 10,
            bytesWritten: 100,
            srcFileSizeBytes: 1000
        });
        eventEmitter.emit("copy:finish", { srcPath: "f", destPath: "f" });
        eventEmitter.emit("error", new CopyParamsError({ srcPath: "e", destPath: "e" }));
        eventEmitter.emit("idle", undefined);
        eventEmitter.emit("queue", [
            { srcPath: "c1", destPath: "c1" },
            { srcPath: "c2", destPath: "c2" }
        ]);

        expect(results).toStrictEqual([
            "active",
            { srcPath: "s", destPath: "s" },
            {
                srcPath: "p",
                destPath: "p",
                bytesPerSecond: 10,
                bytesWritten: 100,
                srcFileSizeBytes: 1000
            },
            { srcPath: "f", destPath: "f" },
            new CopyParamsError({ srcPath: "e", destPath: "e" }),
            "idle",
            [
                { srcPath: "c1", destPath: "c1" },
                { srcPath: "c2", destPath: "c2" }
            ]
        ]);
    });

    test("wait", async () => {
        process.nextTick(() => {
            eventEmitter.emit("queue", [
                { srcPath: "c3", destPath: "c3" },
                { srcPath: "c4", destPath: "c4" }
            ]);
        });

        const result = await eventEmitter.wait("queue");

        expect(result).toStrictEqual([
            { srcPath: "c3", destPath: "c3" },
            { srcPath: "c4", destPath: "c4" }
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
