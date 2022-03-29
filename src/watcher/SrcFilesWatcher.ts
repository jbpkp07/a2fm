import { FSWatcher, watch, WatchOptions } from "chokidar";

import ExitOnError from "../common/ExitOnError";
import FileSystemUtils from "../common/FileSystemUtils";
import WaitUtils from "../common/WaitUtils";
import SrcFilesWatcherUtils from "./SrcFilesWatcherUtils";
import SrcFilesWatchEventEmitter from "./SrcFilesWatchEventEmitter";

const { exitOnError } = ExitOnError;
const { exists, readFileSizeBytes, waitWhileModifying } = FileSystemUtils;
const { wait } = WaitUtils;

const TEN_SECONDS = 10 * 1000;
const ONE_MINUTE = 60 * 1000;
const TEN_MINUTES = 600 * 1000;
const ONE_HOUR = 3600 * 1000;

type SrcRootDirPath = string;
type DestRootDirPath = string;

interface FileWatcherParams {
    readonly excludedDirs: string[];
    readonly excludedFiles: string[];
    readonly progressMetadataExts: string[];
    readonly srcDestRootDirPaths: Map<SrcRootDirPath, DestRootDirPath>;
}

class SrcFilesWatcher extends SrcFilesWatchEventEmitter {
    private readonly srcRootDirPaths: string[];

    private readonly utils: SrcFilesWatcherUtils;

    private readonly watchOptions: WatchOptions;

    private watcher: FSWatcher | undefined;

    constructor(params: FileWatcherParams) {
        super();

        this.srcRootDirPaths = [...params.srcDestRootDirPaths.keys()];

        this.utils = new SrcFilesWatcherUtils(params);

        this.watchOptions = {
            awaitWriteFinish: { stabilityThreshold: ONE_MINUTE, pollInterval: TEN_SECONDS },
            followSymlinks: false,
            ignored: [this.utils.hasExcludedDir]
        };

        setInterval(() => void this.startWatching(), ONE_HOUR);
    }

    private closeWatcher = async (): Promise<void> => {
        if (this.watcher) {
            await this.watcher.close();
        }
    };

    private emitFileReady = async (srcFilePath: string): Promise<void> => {
        if (await exists(srcFilePath)) {
            const fileSizeBytes = await readFileSizeBytes(srcFilePath);

            this.emit("file:ready", { srcFilePath, fileSizeBytes });
        }
    };

    private listen = async (filePath: string): Promise<void> => {
        await wait(ONE_MINUTE);

        const srcFilePath = this.utils.toSrcFilePath(filePath);

        const isEligible = await this.utils.isSrcFileEligible(srcFilePath);

        if (isEligible) {
            await waitWhileModifying(srcFilePath, TEN_MINUTES);

            await this.emitFileReady(srcFilePath);
        }
    };

    private tryListen = async (filePath: string): Promise<void> => {
        try {
            await this.listen(filePath);
        } catch (error) {
            this.emit("error", error);
        }
    };

    public startWatching = async (): Promise<void> => {
        await this.closeWatcher();

        this.watcher = watch(this.srcRootDirPaths, this.watchOptions);

        this.watcher.on("add", (filePath) => void this.tryListen(filePath));
        this.watcher.on("unlink", (filePath) => void this.tryListen(filePath));
        this.watcher.on("error", exitOnError);
    };
}

export default SrcFilesWatcher;
