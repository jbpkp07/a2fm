import A2FMRenderer from "./renderer/A2FMRenderer";

const renderer = new A2FMRenderer();

const MB50 = 50 * 1024 ** 2;
const GB5 = 5 * 1024 ** 3;

let percentage = 0;
let bytesWritten = 0;
let elapsedSeconds = 0;

function getParams() {
    return {
        progress: {
            bytesPerSecond: Math.random() * (2 * MB50),
            bytesWritten: bytesWritten % (GB5 + MB50),
            elapsedSeconds: elapsedSeconds % 101,
            fileCopyParams: {
                srcFilePath:
                    "srcDir1alksjdflak;sjdfalskdjfalsk;dfjalal;aksdjflkasdjfasl;kdjsk;dfj/la;ksdjfal;ksjdfalksdfjasldk;fjasdlkfjlaksdjfal;sdkfjasldkf;jsrcFile1",
                destFilePath: "destDir1/destFile1",
                fileSizeBytes: -123
            },
            fileSizeBytes: GB5,
            percentage: percentage % 101
        },
        queue: [
            {
                srcFilePath: "srcDir2/srcFile2",
                destFilePath: "destDir2/destFile2",
                fileSizeBytes: MB50
            },
            {
                srcFilePath: "srcDir3/srcFile3",
                destFilePath: "destDir3/destFile3",
                fileSizeBytes: MB50
            }
        ]
    };
}

setInterval(() => {
    renderer.renderMigrationScreen(getParams());
    percentage += 1;
    bytesWritten += MB50;
    elapsedSeconds += 1;
}, 1000);

// const a2fmProps = new A2FMRendererProps({ cols: 80 });

// let props = a2fmProps.toProgressQueueProps(params);
// params.progress.bytesPerSecond = 1024 ** 2;
// props = a2fmProps.toProgressQueueProps(params);

// console.log(props.progressProps);
// console.dir(props.queueProps, { depth: null });

// import A2FMRenderer from "./renderer/A2FMRenderer";

// const renderer = new A2FMRenderer({ cols: 151, queueLimit: 10, rows: 40 });
// const screen = renderer.createScreen();
// renderer.render(screen);

//* eslint-disable sonarjs/no-duplicate-string */
// import Header from "./renderer/components/Header";
// import MigrationProgress from "./renderer/components/MigrationProgress";
// import MigrationQueue from "./renderer/components/MigrationQueue";
// import ConsoleRenderer from "./renderer/console/ConsoleRenderer";

// const cols = 151;

// const renderer = new ConsoleRenderer({ cols, rows: 40, hideCursor: true });

// function getMigrations() {
//     return [
//         {
//             srcFilePath: "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "s" }
//         },
//         {
//             srcFilePath:
//                 "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "m" }
//         },
//         {
//             srcFilePath:
//                 "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "m" }
//         },
//         {
//             srcFilePath:
//                 "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "m" }
//         },
//         {
//             srcFilePath:
//                 "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "m" }
//         },
//         {
//             srcFilePath:
//                 "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "m" }
//         },
//         {
//             srcFilePath:
//                 "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "m" }
//         },
//         {
//             srcFilePath:
//                 "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "m" }
//         },
//         {
//             srcFilePath:
//                 "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "m" }
//         },
//         {
//             srcFilePath: "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "h" }
//         },
//         {
//             srcFilePath:
//                 "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "m" }
//         },
//         {
//             srcFilePath: "Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345.mp4",
//             eta: { value: Math.floor(Math.random() * 200), units: "h" }
//         }
//     ];
// }

// let eta = 47;
// let size = 250;
// let percent = 95;
// let rate = 120;
// let elapsed = 123;

// function getProps() {
//     return {
//         cols,
//         destFilePath:
//             "I:/Some really long directory name/directory/Some_random_file_path_1_abcdefghij_123_Some_random_file_path_12345Some_random_file_path_1_abcdefghij_123_Some_random_file_path_SomeFilePath_12345678.a2fm",
//         destFileSize: { value: size, units: "GB" },
//         eta: { value: eta, units: "s" },
//         percentage: percent % 101,
//         rate: { value: rate, units: "MB/s" },
//         srcFilePath:
//             "S:/Some really long directory name/directory1/directory2/directory3/directory4/directory5/directory6/directory7/The_file_to_migrate.mp4.a2fm",
//         srcFileSize: { value: size, units: "TB" },
//         elapsedTime: { value: elapsed, units: "s" },
//         isIdle: false
//     };
// }

// const header = new Header({ cols, marginCols: 1 });
// const progress = new MigrationProgress({ cols, marginCols: 2 });
// const queue = new MigrationQueue({ cols, limit: 10, marginCols: 2 });

// setInterval(() => {
//     percent += 1;
//     eta = Math.floor(Math.random() * 200);
//     size = Math.floor(Math.random() * 200);
//     rate = Math.floor(Math.random() * 200);
//     elapsed = Math.floor(Math.random() * 200);

//     const screen = header.create({}) + progress.create(getProps()) + queue.create({ queue: getMigrations() });

//     renderer.render(screen);
// }, 1000);

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
