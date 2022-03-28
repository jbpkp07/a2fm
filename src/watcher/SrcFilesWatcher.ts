import { Stats } from "fs";
import { join } from "path";

import { FSWatcher, watch, WatchOptions } from "chokidar";

import ExitOnError from "../common/ExitOnError";
import FileSystemUtils from "../common/FileSystemUtils";
import WaitUtils from "../common/WaitUtils";
import ConfigReader from "../configuration";

const { exitOnError } = ExitOnError;
const { exists, isFileModifying } = FileSystemUtils;
const { wait } = WaitUtils;

const TEN_SECONDS = 10 * 1000;
const ONE_MINUTE = 60 * 1000;
const TEN_MINUTES = 600 * 1000;
const ONE_HOUR = 3600 * 1000;

type SrcRootDirPath = string;
type DestRootDirPath = string;
type Handler = (filePath: string, stats?: Stats) => void | Promise<void>;

interface FileWatcherParams {
    readonly watchHandler: Handler;
    readonly srcDestRootDirPaths: Map<SrcRootDirPath, DestRootDirPath>;
}

class SrcFilesWatcher {
    private readonly handler: Handler;

    private readonly srcRootDirPaths: string[];

    private readonly watcherOptions: WatchOptions;

    private watcher: FSWatcher | undefined;

    constructor({ watchHandler, srcDestRootDirPaths }: FileWatcherParams) {
        this.handler = watchHandler;

        this.srcRootDirPaths = [...srcDestRootDirPaths.keys()];

        this.watcherOptions = {
            alwaysStat: true,
            awaitWriteFinish: { stabilityThreshold: ONE_MINUTE, pollInterval: TEN_SECONDS },
            followSymlinks: false
        };

        setInterval(() => void this.startWatching(), ONE_HOUR);
    }

    private closeWatcher = async (): Promise<void> => {
        if (this.watcher) {
            await this.watcher.close();
        }
    };

    private onAddListener = async (filePath: string, stats?: Stats): Promise<void> => {
        const isModifying = async () => isFileModifying(filePath, TEN_MINUTES);

        while (await isModifying()) {
            await wait(TEN_SECONDS);
        }

        if (await exists(filePath)) {
            await this.handler(filePath, stats);
        }
    };

    private onUnlinkListener = async (filePath: string): Promise<void> => {
        await wait(TEN_SECONDS);

        await this.handler(filePath);
    };

    public startWatching = async (): Promise<void> => {
        await this.closeWatcher();

        this.watcher = watch(this.srcRootDirPaths, this.watcherOptions);

        this.watcher.on("add", (filePath, stats) => void this.onAddListener(filePath, stats));
        this.watcher.on("unlink", (filePath) => void this.onUnlinkListener(filePath));
        this.watcher.on("error", exitOnError);
    };
}

export default SrcFilesWatcher;

console.clear();

const { readConfig } = ConfigReader;

const configPath = join(__dirname, "../config.json");
const config = readConfig(configPath);

const watchHandler = (path: string, stats?: Stats) => {
    console.log(path, stats?.size);
};

const watcher = new SrcFilesWatcher({ watchHandler, ...config });

void watcher.startWatching();
