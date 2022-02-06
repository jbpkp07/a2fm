import ConsoleColors from "./renderer/ConsoleColors";
import ConsoleRenderer from "./renderer/ConsoleRenderer";

const renderer = new ConsoleRenderer({ minCols: 104, minRows: 42, hideCursor: true });

const { darkPink, darkTeal, pink, teal } = ConsoleColors;

let index = 0;

setInterval(() => {
    index += 1;

    const length = index % 100;

    const bar = "".padEnd(length, "■");

    const lines1 = new Array(10).fill([
        pink(`  ${bar}`) + darkPink(`${"".padEnd(100 - length, "■")}\n`),
        teal(`  ${index}`)
    ]) as string[][];
    const lines2 = new Array(10).fill([
        teal(`  ${bar}`) + darkTeal(`${"".padEnd(100 - length, "■")}\n`),
        pink(`  ${index}`)
    ]) as string[][];
    const lines: string[][] = [];

    for (let i = 0; i < 10; i++) {
        lines.push(lines1[i] as string[], lines2[i] as string[]);
    }

    const stuff = lines.map(([a, b]) => {
        return (a as string) + (b as string);
    });

    const screen = stuff.join("\n").concat("\n");

    renderer.render(screen);
}, 33);

// import { watch } from "chokidar";

// const watchDirectory = (dir: string) => {
//     try {
//         const standardDelayMs = 1000;
//         const stabilityThreshold = 5 * standardDelayMs;

//         const watcher = watch(dir, {
//             alwaysStat: true,
//             atomic: standardDelayMs,
//             awaitWriteFinish: { stabilityThreshold, pollInterval: standardDelayMs },
//             followSymlinks: false,
//             ignoreInitial: true
//         });

//         console.log("starting...");

//         const listener = (event: "add" | "addDir" | "change" | "unlink" | "unlinkDir", path: string, stats: Stats) => {
//             // watcher.off("all", listener);

//             // console.log(watcher.getWatched());
//             console.log(`event: ${event}\t:   path: ${path}`);
//             console.log(stats);

//             // watcher.on("all", listener);
//         };

//         watcher.on("all", listener);

//         watcher.on("error", (error) => {
//             console.log(error);
//             process.exit(0);
//         });

//         watcher.on("ready", () => {
//             console.log("Initial scan complete. Ready for changes...");
//             console.log(watcher.options);
//             console.log(watcher.getWatched());
//             console.log(watcher.eventNames());
//             void copyTest();
//         });
//     } catch (error) {
//         console.log(error);
//     }
// };

// watchDirectory("Z:/watch");
