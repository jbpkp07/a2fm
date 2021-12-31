import { CopyParams, CopyParamsError } from "../src/CopyParams";
import FileCopyEventEmitter from "../src/FileCopyEventEmitter";

const eventEmitter = new FileCopyEventEmitter();

const extractAllListeners = (): Function[] => {
    return ([] as Function[]).concat(
        eventEmitter.listeners("active"),
        eventEmitter.listeners("error"),
        eventEmitter.listeners("finish"),
        eventEmitter.listeners("idle"),
        eventEmitter.listeners("start")
    );
};

let results: unknown[] = [];

const activeListener = () => results.push("active");
const errorListener = (error: CopyParamsError) => results.push(error);
const finishListener = (copyParams: CopyParams) => results.push(copyParams);
const idleListener = () => results.push("idle");
const startListener = (copyParams: CopyParams) => results.push(copyParams);

describe("FileCopyEventEmitter", () => {
    test("emit returns false w/o listener", () => {
        const result = eventEmitter.emit("active", undefined);

        expect(result).toBe(false);
    });

    test("on", () => {
        eventEmitter
            .on("active", activeListener)
            .on("error", errorListener)
            .on("finish", finishListener)
            .on("idle", idleListener)
            .on("start", startListener);

        const listeners = extractAllListeners();

        expect(listeners).toHaveLength(5);
        expect(listeners).toEqual([activeListener, errorListener, finishListener, idleListener, startListener]);
    });

    test("emit returns true w/ listener", () => {
        const result = eventEmitter.emit("active", undefined);

        expect(result).toBe(true);
    });

    test("emit and capture events", () => {
        const error = new Error("test");

        results = [];

        eventEmitter.emit("active", undefined);
        eventEmitter.emit("error", { srcPath: "e", destPath: "e", error });
        eventEmitter.emit("finish", { srcPath: "f", destPath: "f" });
        eventEmitter.emit("idle", undefined);
        eventEmitter.emit("start", { srcPath: "s", destPath: "s" });

        expect(results).toEqual([
            "active",
            { srcPath: "e", destPath: "e", error },
            { srcPath: "f", destPath: "f" },
            "idle",
            { srcPath: "s", destPath: "s" }
        ]);
    });

    test("wait", async () => {
        results = [];

        process.nextTick(() => {
            eventEmitter.emit("start", { srcPath: "s", destPath: "s" });
        });

        const result = await eventEmitter.wait("start");

        expect(result).toEqual({ srcPath: "s", destPath: "s" });
        expect(results).toEqual([{ srcPath: "s", destPath: "s" }]);
    });

    test("off", () => {
        eventEmitter
            .off("active", activeListener)
            .off("error", errorListener)
            .off("finish", finishListener)
            .off("idle", idleListener)
            .off("start", startListener);

        const listeners = extractAllListeners();

        expect(listeners).toHaveLength(0);
        expect(listeners).toEqual([]);
    });
});
