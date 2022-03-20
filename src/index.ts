import { Stats } from "fs";
import { join } from "path";

import { watch } from "chokidar";

import FileSystemUtils from "./common/FileSystemUtils";
import ConfigReader from "./configuration";
import SequentialFileCopier from "./filecopier";
import FileMigrationExcluder from "./FileMigrationExcluder";
import FileMigrator from "./FileMigrator";
import A2FMRenderer from "./renderer";

const { readConfig } = ConfigReader;
const { trimFileExt } = FileSystemUtils;

const configPath = join(__dirname, "config.json");
const { excludedDirs, excludedFiles, progressMetadataExts, srcDestRootDirPaths } = readConfig(configPath);

const fileCopier = new SequentialFileCopier();
const fileMigrator = new FileMigrator(fileCopier, srcDestRootDirPaths);
const fileExcluder = new FileMigrationExcluder({ excludedDirs, excludedFiles, progressMetadataExts });
const renderer = new A2FMRenderer();

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
