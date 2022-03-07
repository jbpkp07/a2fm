import SequentialFileCopier from "./filecopier";
import A2FMRenderer from "./renderer/A2FMRenderer";

const renderer = new A2FMRenderer();
const copier = new SequentialFileCopier();

copier.on("idle", () => {
    renderer.renderIdleScreen();
});

copier.on("copy:start", (params) => {
    renderer.renderMigrationScreen(params);
});

copier.on("copy:progress", (params) => {
    renderer.renderMigrationScreen(params);
});

copier.on("copy:finish", (params) => {
    renderer.renderMigrationScreen(params);
});

copier.on("enqueue", (params) => {
    renderer.renderMigrationScreen(params);
});

const srcFilePath = "C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/1GB_test_1.mp4";
const root = __dirname;
const fileSizeBytes = 1064551156;

// const srcFilePath = "C:/Users/jeremy.barnes/Desktop/Sprint Extras/jbtest/Movies/movie4/jbtest-x.mp4";
// const srcFilePath = "C:/Users/jeremy.barnes/Desktop/Sprint Extras/jbtest/Movies/movie4/2021 Turkey Shoot Doubles Winners.jpg";
// const root = "Z:";
// const fileSizeBytes = 108663259;
// const fileSizeBytes = 695157;

const fileCopyParams = [
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie1.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie2.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie3.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie4.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie5.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie6.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie7.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie8.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie9.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie10.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie11.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie12.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie13.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie14.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/tempMovie15.mp4`,
        fileSizeBytes
    }
];

let i = 0;

const int1 = setInterval(() => {
    const params = fileCopyParams[i];
    i += 1;

    if (params) {
        copier.copyFile(params);
    }
}, 100);

setTimeout(() => {
    clearInterval(int1);
    i = 0;

    setInterval(() => {
        i += 1;
        const params = fileCopyParams[i];

        if (params) {
            copier.copyFile(params);
        }
    }, 250);
}, 60000);

// import A2FMRenderer from "./renderer/A2FMRenderer";

// const renderer = new A2FMRenderer();

// const MB50 = 50 * 1024 ** 2;
// const GB5 = 5 * 1024 ** 3;

// let percentage = 0;
// let bytesWritten = 0;
// let elapsedSeconds = 0;

// function getParams() {
//     return {
//         progress: {
//             bytesPerSecond: Math.random() * (2 * MB50),
//             bytesWritten: bytesWritten % (GB5 + MB50),
//             elapsedSeconds: elapsedSeconds % 101,
//             fileCopyParams: {
//                 srcFilePath:
//                     "srcDir1alksjdflak;sjdfalskdjfalsk;dfjalal;aksdjflkasdjfasl;kdjsk;dfj/la;ksdjfal;ksjdfalksdfjasldk;fjasdlkfjlaksdjfal;sdkfjasldkf;jsrcFile1",
//                 destFilePath: "destDir1/destFile1",
//                 fileSizeBytes: -123
//             },
//             fileSizeBytes: GB5,
//             percentage: percentage % 101
//         },
//         queue: [
//             {
//                 srcFilePath: "srcDir2/srcFile2",
//                 destFilePath: "destDir2/destFile2",
//                 fileSizeBytes: MB50
//             },
//             {
//                 srcFilePath: "srcDir3/srcFile3",
//                 destFilePath: "destDir3/destFile3",
//                 fileSizeBytes: MB50
//             }
//         ]
//     };
// }

// setInterval(() => {
//     renderer.renderMigrationScreen(getParams());
//     percentage += 1;
//     bytesWritten += MB50;
//     elapsedSeconds += 1;
// }, 1000);

// const a2fmProps = new A2FMRendererProps({ cols: 80 });

// let props = a2fmProps.toProgressQueueProps(params);
// params.progress.bytesPerSecond = 1024 ** 2;
// props = a2fmProps.toProgressQueueProps(params);

// console.log(props.progressProps);
// console.dir(props.queueProps, { depth: null });

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
