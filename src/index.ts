import { join } from "path";

import ErrorHandler from "./common/ErrorHandler";
import WaitUtils from "./common/WaitUtils";
import ConfigReader from "./configuration";
import SequentialFileCopier from "./filecopier";
import FileMigrator from "./migration";
import Renderer from "./renderer";
import SrcFilesWatcher from "./watcher";

const CONFIG_JSON_PATH = join(__dirname, "config.json");
const ERROR_LOG_PATH = join(__dirname, "error.log");

const { readConfig } = ConfigReader;
const { waitForever } = WaitUtils;
const { exitOnError, exitOnFileCopyError } = new ErrorHandler(ERROR_LOG_PATH);

const app = async (): Promise<void> => {
    const config = readConfig(CONFIG_JSON_PATH);

    const fileCopier = new SequentialFileCopier();
    const { renderIdleScreen, renderMigrationScreen } = new Renderer();

    fileCopier.on("enqueue", renderMigrationScreen);
    fileCopier.on("copy:start", renderMigrationScreen);
    fileCopier.on("copy:progress", renderMigrationScreen);
    fileCopier.on("copy:finish", renderMigrationScreen);
    fileCopier.on("idle", renderIdleScreen);
    fileCopier.on("error", exitOnFileCopyError);

    const watcher = new SrcFilesWatcher(config);
    const { migrate } = new FileMigrator({ fileCopier, ...config });

    watcher.on("file:ready", migrate);
    watcher.on("error", exitOnError);

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
