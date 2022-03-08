import { Stats } from "fs";
import { extname, join, normalize, parse } from "path";

import { watch } from "chokidar";

import FileSystemUtils from "./common/FileSystemUtils";
import SequentialFileCopier from "./filecopier";
import A2FMRenderer from "./renderer";

const { deleteFile, exists, readFileSizeBytes, removeFileExt, trimFileExt } = FileSystemUtils;

// const renderer = new A2FMRenderer();
// const fileCopier = new SequentialFileCopier();

// fileCopier.on("enqueue", renderer.renderMigrationScreen);

// fileCopier.on("copy:start", renderer.renderMigrationScreen);

// fileCopier.on("copy:progress", renderer.renderMigrationScreen);

// fileCopier.on("copy:finish", (params) => {
//     const { srcFilePath, destFilePath } = params.progress.fileCopyParams;

//     renderer.renderMigrationScreen(params);
//     void removeFileExt(destFilePath);
//     void deleteFile(srcFilePath);
// });

// fileCopier.on("idle", renderer.renderIdleScreen);

// fileCopier.on("error", ({ stack, fileCopyParams }) => {
//     console.clear();
//     console.log(stack, "\n\nFileCopyParams:", fileCopyParams);
// });

// const srcRootDir = "P:/faspex01packages";
// const destRootDir = "S:/_From_Aspera/Aspera";
const srcRootDir = "C:/AAA/Aspera///";
const destRootDir = "C:/AAA/Facilis Sunset\\//";

const standardDelayMs = 1000;
const stabilityThreshold = 5 * standardDelayMs;

const watcher = watch(srcRootDir, {
    alwaysStat: true,
    // atomic: standardDelayMs,
    awaitWriteFinish: { stabilityThreshold, pollInterval: standardDelayMs },
    followSymlinks: false
    // ignoreInitial: true
});

const createDestPath = (srcFilePath: string): string => {
    const normSrcFilePath = normalize(srcFilePath);
    const startIndex = normalize(srcRootDir).length;

    const subPath = normSrcFilePath.substring(startIndex);

    return normalize(`${destRootDir}/${subPath}.a2fm`);
};

const isOutbound = (srcFilePath: string): boolean => {
    return srcFilePath.toLowerCase().includes("outbound");
};

const onAddCopyFile = async (srcFilePath: string, stats?: Stats) => {
    console.log(createDestPath(srcFilePath));

    if (isOutbound(srcFilePath)) return;

    const isMetadataFile = extname(srcFilePath) === ".aspx";

    if (isMetadataFile) return;

    const hasMetadataTwin = await exists(`${srcFilePath}.aspx`);

    if (hasMetadataTwin) return;

    const params = {
        srcFilePath,
        destFilePath: createDestPath(srcFilePath),
        fileSizeBytes: stats?.size ?? (await readFileSizeBytes(srcFilePath))
    };

    // fileCopier.copyFile(params);
};

const onUnlinkCopyFile = async (srcFilePath: string) => {
    if (isOutbound(srcFilePath)) return;

    const isMetadataFile = extname(srcFilePath) === ".aspx";

    if (!isMetadataFile) return;

    const assetFilePath = trimFileExt(srcFilePath);

    const hasAssetFile = await exists(assetFilePath);

    if (!hasAssetFile) return;

    const params = {
        srcFilePath: assetFilePath,
        destFilePath: createDestPath(assetFilePath),
        fileSizeBytes: await readFileSizeBytes(assetFilePath)
    };

    // fileCopier.copyFile(params);
};

watcher.on("add", (srcFilePath, stats) => void onAddCopyFile(srcFilePath, stats));
watcher.on("change", (srcFilePath, stats) => void onAddCopyFile(srcFilePath, stats));
watcher.on("unlink", (srcFilePath) => void onUnlinkCopyFile(srcFilePath));

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
