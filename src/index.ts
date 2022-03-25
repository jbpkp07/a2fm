import { Stats } from "fs";
import { join } from "path";

import ConfigReader from "./configuration";
import SequentialFileCopier from "./filecopier";
import { FileMigrationUtils, FileMigrator } from "./migration";
import Renderer from "./renderer";
import SrcFilesWatcher from "./watcher";

const configPath = join(__dirname, "config.json");
const config = ConfigReader.readConfig(configPath);

const { isFileExcluded, toSrcFilePath } = new FileMigrationUtils(config);

const fileCopier = new SequentialFileCopier();
const fileMigrator = new FileMigrator({ fileCopier, ...config });
const renderer = new Renderer();

fileCopier.on("enqueue", renderer.renderMigrationScreen);

fileCopier.on("copy:start", renderer.renderMigrationScreen);

fileCopier.on("copy:progress", renderer.renderMigrationScreen);

fileCopier.on("copy:finish", renderer.renderMigrationScreen);

fileCopier.on("idle", renderer.renderIdleScreen);

fileCopier.on("error", ({ stack, fileCopyParams }) => {
    console.clear();
    console.log(stack, "\n\nFileCopyParams:", fileCopyParams);
});

const watchHandler = async (path: string, stats?: Stats) => {
    const srcFilePath = toSrcFilePath(path);

    const isExcluded = await isFileExcluded(srcFilePath);

    if (!isExcluded) {
        void fileMigrator.migrate(srcFilePath, stats?.size);
    }
};

const watcher = new SrcFilesWatcher({ watchHandler, ...config });

watcher.startWatching();
