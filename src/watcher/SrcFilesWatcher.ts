import { Stats } from "fs";

import { FSWatcher, watch, WatchOptions } from "chokidar";

import FileSystemUtils from "../common/FileSystemUtils";
import WaitUtils from "../common/WaitUtils";

const { exists, isFileWriting } = FileSystemUtils;
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

        setInterval(() => void this.restartWatcher(), ONE_HOUR);
    }

    private closeWatcher = async (): Promise<void> => {
        if (this.watcher) {
            await this.watcher.close();
        }
    };

    private onAddListener = async (filePath: string, stats?: Stats): Promise<void> => {
        const isWriting = async () => isFileWriting(filePath, TEN_MINUTES);

        while (await isWriting()) {
            await wait(ONE_MINUTE);
        }

        if (await exists(filePath)) {
            void this.handler(filePath, stats);
        }
    };

    private onErrorListener = async (error: Error): Promise<void> => {
        await this.closeWatcher();

        console.log(error);

        setTimeout(() => void this.restartWatcher(), TEN_MINUTES);
    };

    private onUnlinkListener = (filePath: string): void => {
        setTimeout(() => void this.handler(filePath), ONE_MINUTE);
    };

    private restartWatcher = async (): Promise<void> => {
        await this.closeWatcher();

        this.startWatching();
    };

    public startWatching = (): void => {
        this.watcher = watch(this.srcRootDirPaths, this.watcherOptions);

        this.watcher.on("add", (filePath, stats) => void this.onAddListener(filePath, stats));
        this.watcher.on("error", (error) => void this.onErrorListener(error));
        this.watcher.on("unlink", (filePath) => this.onUnlinkListener(filePath));
    };
}

export default SrcFilesWatcher;
