import SequentialFileCopier from "./filecopier";
import A2FMRenderer from "./renderer";

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

const srcFilePath =
    "C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/this is an amazing movie with a really long file path that is really cool and stuff 1GB_test_1.mp4";
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
        destFilePath: `${root}/this is an amazing movie with a really long file path that is really cool and stuff tempMovie1.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/this is an amazing movie with a really long file path that is really cool and stuff tempMovie2.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/this is an amazing movie with a really long file path that is really cool and stuff tempMovie3.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/this is an amazing movie with a really long file path that is really cool and stuff tempMovie4.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/this is an amazing movie with a really long file path that is really cool and stuff tempMovie5.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/this is an amazing movie with a really long file path that is really cool and stuff tempMovie6.mp4`,
        fileSizeBytes
    },
    {
        srcFilePath,
        destFilePath: `${root}/this is an amazing movie with a really long file path that is really cool and stuff tempMovie7.mp4`,
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
