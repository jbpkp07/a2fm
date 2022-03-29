import { FSWatcher, watch, WatchOptions } from "chokidar";

import ExitOnError from "../common/ExitOnError";
import FileSystemUtils from "../common/FileSystemUtils";
import WaitUtils from "../common/WaitUtils";
import SrcFilesWatcherUtils from "./SrcFilesWatcherUtils";

const { exitOnError } = ExitOnError;
const { exists, readFileSizeBytes, waitWhileModifying } = FileSystemUtils;
const { wait } = WaitUtils;

const TEN_SECONDS = 10 * 1000;
const ONE_MINUTE = 60 * 1000;
const TEN_MINUTES = 600 * 1000;
const ONE_HOUR = 3600 * 1000;

type SrcRootDirPath = string;
type DestRootDirPath = string;
type MigrateHandler = (srcFilePath: string, fileSizeBytes: number) => void;

interface FileWatcherParams {
    readonly migrate: MigrateHandler;
    readonly excludedDirs: string[];
    readonly excludedFiles: string[];
    readonly progressMetadataExts: string[];
    readonly srcDestRootDirPaths: Map<SrcRootDirPath, DestRootDirPath>;
}

class SrcFilesWatcher {
    private readonly migrate: MigrateHandler;

    private readonly srcRootDirPaths: string[];

    private readonly utils: SrcFilesWatcherUtils;

    private readonly watchOptions: WatchOptions;

    private watcher: FSWatcher | undefined;

    constructor(params: FileWatcherParams) {
        this.migrate = params.migrate;

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

    private listener = async (filePath: string): Promise<void> => {
        await wait(ONE_MINUTE);

        const srcFilePath = this.utils.toSrcFilePath(filePath);

        const isEligible = await this.utils.isSrcFileEligible(srcFilePath);

        if (isEligible) {
            await waitWhileModifying(srcFilePath, TEN_MINUTES);

            await this.migrateSrcFile(srcFilePath);
        }
    };

    private migrateSrcFile = async (srcFilePath: string): Promise<void> => {
        if (await exists(srcFilePath)) {
            const fileSizeBytes = await readFileSizeBytes(srcFilePath);

            this.migrate(srcFilePath, fileSizeBytes);
        }
    };

    public startWatching = async (): Promise<void> => {
        await this.closeWatcher();

        this.watcher = watch(this.srcRootDirPaths, this.watchOptions);

        this.watcher.on("add", (filePath) => void this.listener(filePath));
        this.watcher.on("unlink", (filePath) => void this.listener(filePath));
        this.watcher.on("error", exitOnError);
    };
}

export default SrcFilesWatcher;
