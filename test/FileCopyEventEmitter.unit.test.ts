import { CopyParams, CopyParamsError } from "../src/CopyParams";
import FileCopyEventEmitter from "../src/FileCopyEventEmitter";

const eventEmitter = new FileCopyEventEmitter();

const extractAllListeners = (): Function[] => {
    return ([] as Function[]).concat(
        eventEmitter.listeners("active"),
        eventEmitter.listeners("change"),
        eventEmitter.listeners("error"),
        eventEmitter.listeners("finish"),
        eventEmitter.listeners("idle"),
        eventEmitter.listeners("start")
    );
};

let results: unknown[] = [];

const activeListener = () => results.push("active");
const changeListener = (upcoming: readonly CopyParams[]) => results.push(upcoming);
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
            .on("change", changeListener)
            .on("error", errorListener)
            .on("finish", finishListener)
            .on("idle", idleListener)
            .on("start", startListener);

        const listeners = extractAllListeners();

        expect(listeners).toStrictEqual([
            activeListener,
            changeListener,
            errorListener,
            finishListener,
            idleListener,
            startListener
        ]);
    });

    test("emit returns true w/ listener", () => {
        const result = eventEmitter.emit("active", undefined);

        expect(result).toBe(true);
    });

    test("emit and capture events", () => {
        results = [];

        const error = new Error("test");

        eventEmitter.emit("active", undefined);
        eventEmitter.emit("change", [
            { srcPath: "c1", destPath: "c1" },
            { srcPath: "c2", destPath: "c2" }
        ]);
        eventEmitter.emit("error", { srcPath: "e", destPath: "e", error });
        eventEmitter.emit("finish", { srcPath: "f", destPath: "f" });
        eventEmitter.emit("idle", undefined);
        eventEmitter.emit("start", { srcPath: "s", destPath: "s" });

        expect(results).toStrictEqual([
            "active",
            [
                { srcPath: "c1", destPath: "c1" },
                { srcPath: "c2", destPath: "c2" }
            ],
            { srcPath: "e", destPath: "e", error },
            { srcPath: "f", destPath: "f" },
            "idle",
            { srcPath: "s", destPath: "s" }
        ]);
    });

    test("wait", async () => {
        process.nextTick(() => {
            eventEmitter.emit("change", [
                { srcPath: "c3", destPath: "c3" },
                { srcPath: "c4", destPath: "c4" }
            ]);
        });

        const result = await eventEmitter.wait("change");

        expect(result).toStrictEqual([
            { srcPath: "c3", destPath: "c3" },
            { srcPath: "c4", destPath: "c4" }
        ]);
    });

    test("off", () => {
        eventEmitter
            .off("active", activeListener)
            .off("change", changeListener)
            .off("error", errorListener)
            .off("finish", finishListener)
            .off("idle", idleListener)
            .off("start", startListener);

        const listeners = extractAllListeners();

        expect(listeners).toStrictEqual([]);
    });
});
