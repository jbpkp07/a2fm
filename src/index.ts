import { readFileSync, Stats } from "fs";
import { extname, join, normalize } from "path";

import { watch } from "chokidar";

import FileSystemUtils from "./common/FileSystemUtils";
import SequentialFileCopier from "./filecopier";
import { Update } from "./filecopier/SequentialFileCopyEventEmitter";
import FileMigration from "./FileMigration";
import FileMigrationExcluder from "./FileMigrationExcluder";
import FileMigrator from "./FileMigrator";
import A2FMRenderer from "./renderer";

const { deleteFile, exists, readFileJSON, readFileSizeBytes, removeFileExt, trimFileExt } = FileSystemUtils;

const srcDestRootDirPaths = new Map([["C:/AAA/Aspera", "C:/AAA/Facilis Sunset"]]);

const renderer = new A2FMRenderer();
const fileCopier = new SequentialFileCopier();
const fileMigrator = new FileMigrator(fileCopier, srcDestRootDirPaths);
const fileExcluder = new FileMigrationExcluder({ excludedDirs: [], excludedFiles: [], progressMetadataExts: [] });

// interface Config {
//     migrationRoutes: {
//         defaultDest: string;
//         routes: { src: string; dest: string | null }[];
//     };
// }

// async function getConfig() {
//     const path = join(__dirname, "config.json");

//     const config = await readFileJSON<Config>(path);
//     const { defaultDest, routes } = config.migrationRoutes;

//     const test2 = routes.map(({ src, dest }) => {
//         return [normalize(src), normalize(dest ?? defaultDest)] as [string, string];
//     });

//     const srcDestRootDirPaths = new Map(test2);

//     console.log(srcDestRootDirPaths);

//     const migrator = new FileMigrator({ fileCopier, srcDestRootDirPaths });
// }

// void getConfig();

fileCopier.on("enqueue", renderer.renderMigrationScreen);

fileCopier.on("copy:start", renderer.renderMigrationScreen);

fileCopier.on("copy:progress", renderer.renderMigrationScreen);

fileCopier.on("copy:finish", renderer.renderMigrationScreen);

fileCopier.on("idle", renderer.renderIdleScreen);

fileCopier.on("error", ({ stack, fileCopyParams }) => {
    console.clear();
    console.log(stack, "\n\nFileCopyParams:", fileCopyParams);
});

const srcRootDirPath = "C:/AAA/Aspera";
// const destRootDirPath = "C:/AAA/Facilis Sunset";

const standardDelayMs = 1000;
const stabilityThreshold = 5 * standardDelayMs;

const watcher = watch(srcRootDirPath, {
    alwaysStat: true,
    // atomic: standardDelayMs,
    awaitWriteFinish: { stabilityThreshold, pollInterval: standardDelayMs },
    followSymlinks: false
    // ignoreInitial: true
});

watcher.on("ready", () => {
    console.log("Initial scan complete. Ready for changes...");
    console.log(watcher.options);
    console.log(watcher.getWatched());
    console.log(watcher.eventNames());
});

const onAddListener = async (filePath: string, stats?: Stats) => {
    const isExcluded = await fileExcluder.isExcluded(filePath);

    if (!isExcluded) {
        void fileMigrator.migrate(filePath, stats?.size);
    }
};

const onUnlinkListener = async (filePath: string) => {
    const isMetaDataFile = fileExcluder.isProgressMetadataFile(filePath);

    if (!isMetaDataFile) return;

    const srcFilePath = trimFileExt(filePath);

    const isExcluded = await fileExcluder.isExcluded(srcFilePath);

    if (!isExcluded) {
        void fileMigrator.migrate(srcFilePath);
    }
};

watcher.on("add", (srcFilePath, stats) => void onAddListener(srcFilePath, stats));
watcher.on("change", (srcFilePath, stats) => void onAddListener(srcFilePath, stats));
watcher.on("unlink", (srcFilePath) => void onUnlinkListener(srcFilePath));

// const fileCopyParams = [
//     {
//         srcFilePath: `${srcDir}/1GB_test_01.mp4`,
//         destFilePath: `${destDir}/1GB_test_01.mp4.a2fm`,
//         fileSizeBytes
//     },
//     {
//         srcFilePath: `${srcDir}/1GB_test_02.mp4`,
//         destFilePath: `${destDir}/1GB_test_02.mp4.a2fm`,
//         fileSizeBytes
//     },
//     {
//         srcFilePath: `${srcDir}/1GB_test_03.mp4`,
//         destFilePath: `${destDir}/1GB_test_03.mp4.a2fm`,
//         fileSizeBytes
//     },
//     {
//         srcFilePath: `${srcDir}/1GB_test_04.mp4`,
//         destFilePath: `${destDir}/1GB_test_04.mp4.a2fm`,
//         fileSizeBytes
//     },
//     {
//         srcFilePath: `${srcDir}/1GB_test_05.mp4`,
//         destFilePath: `${destDir}/1GB_test_05.mp4.a2fm`,
//         fileSizeBytes
//     },
//     {
//         srcFilePath: `${srcDir}/1GB_test_06.mp4`,
//         destFilePath: `${destDir}/1GB_test_06.mp4.a2fm`,
//         fileSizeBytes
//     },
//     {
//         srcFilePath: `${srcDir}/1GB_test_07.mp4`,
//         destFilePath: `${destDir}/1GB_test_07.mp4.a2fm`,
//         fileSizeBytes
//     },
//     {
//         srcFilePath: `${srcDir}/1GB_test_08.mp4`,
//         destFilePath: `${destDir}/1GB_test_08.mp4.a2fm`,
//         fileSizeBytes
//     },
//     {
//         srcFilePath: `${srcDir}/1GB_test_09.mp4`,
//         destFilePath: `${destDir}/1GB_test_09.mp4.a2fm`,
//         fileSizeBytes
//     },
//     {
//         srcFilePath: `${srcDir}/1GB_test_10.mp4`,
//         destFilePath: `${destDir}/1GB_test_10.mp4.a2fm`,
//         fileSizeBytes
//     },
//     {
//         srcFilePath: `${srcDir}/1GB_test_11.mp4`,
//         destFilePath: `${destDir}/1GB_test_11.mp4.a2fm`,
//         fileSizeBytes
//     },
//     {
//         srcFilePath: `${srcDir}/1GB_test_12.mp4`,
//         destFilePath: `${destDir}/1GB_test_12.mp4.a2fm`,
//         fileSizeBytes
//     }
// ];

// let i = 0;

// setInterval(() => {
//     const params = fileCopyParams[i];
//     i += 1;

//     if (params) {
//         fileCopier.copyFile(params);
//     }
// }, 250);

// const watchDirectory = (watchDirpath: string) => {
//     try {
//         const standardDelayMs = 1000;
//         const stabilityThreshold = 5 * standardDelayMs;

//         const watcher = watch(watchDirpath, {
//             alwaysStat: true,
//             atomic: standardDelayMs,
//             awaitWriteFinish: { stabilityThreshold, pollInterval: standardDelayMs },
//             followSymlinks: false,
//             ignoreInitial: true
//         });

//         const listener = (event: "add" | "addDir" | "change" | "unlink" | "unlinkDir", path: string, stats: Stats) => {
//             console.log(`event: ${event}\t:   path: ${path}`);
//             console.log(stats);

//             const isMetadataFile = extname(path) === ".aspx";

//             console.log(isMetadataFile);

//             const { dir, name } = parse(path);
//             const assetFilePath = join(dir, name);

//             console.log(assetFilePath);
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
//         });
//     } catch (error) {
//         console.log(error);
//     }
// };

// watchDirectory("C:/AAA/Aspera");
