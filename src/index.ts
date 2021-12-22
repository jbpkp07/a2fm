import { watch } from "chokidar";
import { Stats } from "fs";

const watchDirectory = (dir: string) => {
    try {
        const standardDelay = 10000;

        const watcher = watch(dir, {
            alwaysStat: true,
            atomic: standardDelay,
            awaitWriteFinish: { stabilityThreshold: standardDelay, pollInterval: 100 },
            followSymlinks: false,
            ignoreInitial: true
        });

        console.log("starting...");

        const listener = (event: "add" | "addDir" | "change" | "unlink" | "unlinkDir", path: string, stats: Stats) => {
            watcher.off("all", listener);

            console.log(`event: ${event}\t:   path: ${path}`);
            console.log(stats);

            watcher.on("all", listener);
        };

        watcher.on("all", listener);

        watcher.on("error", (error) => {
            console.log(error);
        });

        watcher.on("ready", () => {
            console.log("Initial scan complete. Ready for changes...");
            console.log(watcher.options);
            console.log(watcher.getWatched());
            console.log(watcher.eventNames());
        });
    } catch (error) {
        console.log(error);
    }
};

watchDirectory("Z:\\watch");
