import { join } from "path";

import ExitOnError from "./common/ExitOnError";
import WaitUtils from "./common/WaitUtils";
import ConfigReader from "./configuration";
import SequentialFileCopier from "./filecopier";
import FileMigrator from "./migration";
import Renderer from "./renderer";
import SrcFilesWatcher from "./watcher";

const { readConfig } = ConfigReader;
const { exitOnError, exitOnFileCopyError } = ExitOnError;
const { waitForever } = WaitUtils;

const app = async (): Promise<void> => {
    const configPath = join(__dirname, "config.json");
    const config = readConfig(configPath);

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
