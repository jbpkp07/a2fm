import { Stats } from "fs";
import { join } from "path";

import ExitOnError from "./common/ExitOnError";
import WaitUtils from "./common/WaitUtils";
import ConfigReader from "./configuration";
import SequentialFileCopier from "./filecopier";
import { FileMigrationUtils, FileMigrator } from "./migration";
import Renderer from "./renderer";
import SrcFilesWatcher from "./watcher";

const { readConfig } = ConfigReader;
const { exitOnError, exitOnFileCopyError } = ExitOnError;
const { waitForever } = WaitUtils;

const app = async (): Promise<void> => {
    const configPath = join(__dirname, "config.json");
    const config = readConfig(configPath);

    const fileCopier = new SequentialFileCopier();
    const fileMigrator = new FileMigrator({ fileCopier, ...config });

    const { isSrcFileExcluded, toSrcFilePath } = new FileMigrationUtils(config);
    const { renderIdleScreen, renderMigrationScreen } = new Renderer();

    fileCopier.on("enqueue", renderMigrationScreen);
    fileCopier.on("copy:start", renderMigrationScreen);
    fileCopier.on("copy:progress", renderMigrationScreen);
    fileCopier.on("copy:finish", renderMigrationScreen);
    fileCopier.on("idle", renderIdleScreen);
    fileCopier.on("error", exitOnFileCopyError);

    const watchHandler = async (path: string, stats?: Stats) => {
        const srcFilePath = toSrcFilePath(path);
        const isExcluded = await isSrcFileExcluded(srcFilePath);

        if (!isExcluded) {
            void fileMigrator.migrate(srcFilePath, stats?.size);
        }
    };

    const watcher = new SrcFilesWatcher({ watchHandler, ...config });

    await watcher.startWatching();

    await waitForever();
};

const runApp = async (): Promise<void> => {
    try {
        await app();
    } catch (error) {
        exitOnError(error);
    }
};

void runApp();
