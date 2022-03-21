import { Stats } from "fs";
import { join } from "path";

import { FSWatcher, watch, WatchOptions } from "chokidar";

import FileSystemUtils from "../common/FileSystemUtils";
import WaitUtils from "../common/WaitUtils";
import ConfigReader from "../configuration";

const { exists, readFileMtimeMs } = FileSystemUtils;
const { wait } = WaitUtils;

const TEN_SECONDS = 10 * 1000;
const ONE_MINUTE = 60 * 1000;
const TEN_MINUTES = 600 * 1000;
const ONE_HOUR = 3600 * 1000;

type SrcRootDirPath = string;
type DestRootDirPath = string;
type Handler = (path: string, stats?: Stats) => void | Promise<void>;

interface FileWatcherParams {
    readonly handler: Handler;
    readonly srcDestRootDirPaths: Map<SrcRootDirPath, DestRootDirPath>;
}

class SrcFilesWatcher {
    private readonly handler: Handler;

    private readonly srcRootDirPaths: string[];

    private readonly watcherOptions: WatchOptions;

    private watcher!: FSWatcher;

    constructor({ handler, srcDestRootDirPaths }: FileWatcherParams) {
        this.handler = handler;

        this.srcRootDirPaths = [...srcDestRootDirPaths.keys()];

        this.watcherOptions = {
            alwaysStat: true,
            awaitWriteFinish: { stabilityThreshold: ONE_MINUTE, pollInterval: TEN_SECONDS },
            followSymlinks: false
        };

        this.initWatcher();

        setInterval(() => void this.restartWatcher(), ONE_HOUR);
    }

    private addListener = async (path: string, stats?: Stats): Promise<void> => {
        let pathExists: boolean;

        const lastModified = async () => Date.now() - (await readFileMtimeMs(path));

        do {
            await wait(ONE_MINUTE);

            pathExists = await exists(path);

            if (!pathExists) break;
        } while ((await lastModified()) < TEN_MINUTES);

        if (pathExists) {
            void this.handler(path, stats);
        }
    };

    private unlinkListener = (path: string): void => {
        setTimeout(() => void this.handler(path), ONE_MINUTE);
    };

    private errorListener = async (error: Error): Promise<void> => {
        await this.watcher.close();

        console.log(error);

        setTimeout(() => void this.restartWatcher(), TEN_MINUTES);
    };

    private initWatcher(): void {
        this.watcher = watch(this.srcRootDirPaths, this.watcherOptions);

        this.watcher.on("add", (path, stats) => void this.addListener(path, stats));
        this.watcher.on("unlink", (path) => this.unlinkListener(path));
        this.watcher.on("error", (error) => void this.errorListener(error));
    }

    private async restartWatcher(): Promise<void> {
        await this.watcher.close();

        this.initWatcher();
    }
}

export default SrcFilesWatcher;

console.clear();

const configPath = join(__dirname, "..", "config.json");
const config = ConfigReader.readConfig(configPath);

const handler = (path: string, stats?: Stats) => {
    console.log(path, stats?.size);
};

const watcher = new SrcFilesWatcher({ handler, ...config });
