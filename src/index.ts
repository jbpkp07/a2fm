import { watch } from "chokidar";
import { copyFileSync, mkdirSync, Stats } from "fs";

const copyTest = () => {
    // const src = "C:/AAA/watch/a/b/c/stuff.txt";
    const src =
        // "C:/AAA/BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB/CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC/DDDDDDDDDD DDDDDDDDD/EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE/YYY.txt";
        "C:/AAA/watch/jbtest-x.mp4";
    // const dest = "Z:/watch/a/b/c/stuff2.txt";
    const dir =
        "Z:/watch/AAA/BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB/CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC/DDDDDDDDDD DDDDDDDDD/EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE/FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF/GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG/HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH/IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII/JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ/KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK";
    const dest = `${dir}/movie.mp4`;

    try {
        const result = mkdirSync(dir, { recursive: true });
        console.log(`mkdir results:  ${result || "Did not need to create"}`);

        console.log("starting copy...");
        copyFileSync(src, dest);
        console.log("Copied...");
    } catch (error) {
        console.log(error);
    }
};

const watchDirectory = (dir: string) => {
    try {
        const standardDelayMs = 1000;
        const stabilityThreshold = 5 * standardDelayMs;

        const watcher = watch(dir, {
            alwaysStat: true,
            atomic: standardDelayMs,
            awaitWriteFinish: { stabilityThreshold, pollInterval: standardDelayMs },
            followSymlinks: false,
            ignoreInitial: true
        });

        console.log("starting...");

        const listener = (event: "add" | "addDir" | "change" | "unlink" | "unlinkDir", path: string, stats: Stats) => {
            // watcher.off("all", listener);

            // console.log(watcher.getWatched());
            console.log(`event: ${event}\t:   path: ${path}`);
            console.log(stats);

            // watcher.on("all", listener);
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
            copyTest();
        });
    } catch (error) {
        console.log(error);
    }
};

watchDirectory("Z:/watch");
