import Header from "./renderer/components/Header";
import MigrationProgress from "./renderer/components/MigrationProgress";
import MigrationQueue from "./renderer/components/MigrationQueue";
import ConsoleRenderer from "./renderer/console/ConsoleRenderer";

const cols = 181;

const renderer = new ConsoleRenderer({ cols, rows: 40, hideCursor: true });

const migrations = [
    { srcFilePath: "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345.mp4", eta: "123m" },
    { srcFilePath: "Some_random_file_path_1_abcdefghi_12345.mp4", eta: "1800m" },
    { srcFilePath: "Some_random_file_path_1_abcdefgh_12345.mp4", eta: "0123456789m" },
    { srcFilePath: "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_1234.mp4", eta: "123m" },
    { srcFilePath: "Some_random_file_path_1_abcdefghi_1234.mp4", eta: "1800m" },
    { srcFilePath: "Some_random_file_path_1_abcdefgh_1234.mp4", eta: "0123456789m" },
    { srcFilePath: "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_123.mp4", eta: "123m" },
    { srcFilePath: "Some_random_file_path_1_abcdefghi_123.mp4", eta: "1800m" },
    { srcFilePath: "Some_random_file_path_1_abcdefgh_123.mp4", eta: "0123456789m" },
    { srcFilePath: "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12.mp4", eta: "123m" },
    { srcFilePath: "Some_random_file_path_1_abcdefghi_123.mp4", eta: "1800m" },
    { srcFilePath: "Some_random_file_path_1_abcdefgh_123.mp4", eta: "0123456789m" }
];

const props = {
    cols,
    destFilePath: "I:/Some_random_long_path_that_will_be_the_destination_file_path_12345.mp4.a2fm",
    eta: "38s",
    fileSize: "20.2 GB",
    percentage: 72,
    rate: { value: "161", units: "MB/s" },
    srcFilePath: "S:/Some_random_long_path_that_will_be_the_destination_file_path_12345.mp4.a2fm"
};

const header = new Header();
const progress = new MigrationProgress();
const queue = new MigrationQueue();

setInterval(() => {
    const screen = header.create({ cols }) + progress.create(props) + queue.create({ cols, limit: 10, migrations });

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
