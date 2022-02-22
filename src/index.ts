/* eslint-disable sonarjs/no-duplicate-string */
import Header from "./renderer/components/Header";
import MigrationProgress from "./renderer/components/MigrationProgress";
import MigrationQueue from "./renderer/components/MigrationQueue";
import ConsoleRenderer from "./renderer/console/ConsoleRenderer";

const cols = 151;

const renderer = new ConsoleRenderer({ cols, rows: 38, hideCursor: true });

function getMigrations() {
    // const index = Math.floor(Math.random() * 12) + 2;

    return [
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "s" }
        },
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "m" }
        },
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "m" }
        },
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "m" }
        },
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "m" }
        },
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "m" }
        },
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "m" }
        },
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "m" }
        },
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "m" }
        },
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "m" }
        },
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "m" }
        },
        {
            srcFilePath:
                "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
            eta: { value: Math.floor(Math.random() * 2000), units: "m" }
        }
    ];
    // return migrations.slice(0, index);
}

let eta = 47;
let size = 250;
let percent = 95;
let rate = 1200;
let elapsed = 123;

function getProps() {
    return {
        cols,
        destFilePath:
            "I:/Some really long directory name/directory/Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345678.a2fm",
        eta: { value: eta, units: "s" },
        fileSize: { value: size, units: "GB" },
        percentage: percent % 101,
        rate: { value: rate, units: "MB/s" },
        srcFilePath:
            "S:/Some really long directory name/directory1/directory2/directory3/directory4/directory5/directory6/directory7/The_file_to_migrate.mp4.a2fm",
        elapsedTime: { value: elapsed, units: "m" }
    };
}

const header = new Header();
const progress = new MigrationProgress();
const queue = new MigrationQueue();

setInterval(() => {
    percent += 1;
    eta = Math.floor(Math.random() * 200);
    size = Math.floor(Math.random() * 200);
    rate = Math.floor(Math.random() * 1000);
    elapsed = Math.floor(Math.random() * 1000);

    const screen =
        header.create({ cols }) +
        progress.create(getProps()) +
        queue.create({ cols, limit: 9, migrations: getMigrations() });

    renderer.render(screen);
}, 100);

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
