import { join } from "path";

import { FSWatcher, watch } from "chokidar";

import ConfigReader from "../configuration";

type SrcRootDirPath = string;
type DestRootDirPath = string;

interface FileWatcherParams {
    readonly srcDestRootDirPaths: Map<SrcRootDirPath, DestRootDirPath>;
}

class FileWatcher {
    private readonly srcRootDirPaths: string[];

    private readonly watcher: FSWatcher;

    constructor({ srcDestRootDirPaths }: FileWatcherParams) {
        const options = {
            alwaysStat: true,
            atomic: 1000,
            awaitWriteFinish: { stabilityThreshold: 5000, pollInterval: 1000 },
            followSymlinks: false
        };

        this.srcRootDirPaths = [...srcDestRootDirPaths.keys()];
        this.watcher = new FSWatcher(options);

        this.watcher.add(this.srcRootDirPaths);
        this.watcher.on("add", (path, stats) => console.log("Add event:", path, stats?.size));

        //         watcher.on("error", (error) => {
        //             console.log(error);
        //             process.exit(0);
        //         });

        setInterval(() => {
            this.watcher
                .close()
                .then(() => {
                    this.watcher.add(this.srcRootDirPaths);
                    this.watcher.on("add", (path, stats) => console.log("Add event:", path, stats?.size));
                    console.log(this.watcher.options);
                    console.log(this.watcher.eventNames());
                    console.log(this.watcher.listenerCount("add"));

                    setTimeout(() => {
                        console.log(this.watcher.getWatched());
                    }, 500);

                    return null;
                })
                .catch(() => null);
        }, 5000);
    }
}

export default FileWatcher;

const configPath = join(__dirname, "..", "config.json");
const config = ConfigReader.readConfig(configPath);

const watcher = new FileWatcher(config);
