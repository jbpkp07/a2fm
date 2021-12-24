// import { watch } from "chokidar";
import { createReadStream, createWriteStream, statSync } from "fs";
import { stat } from "fs/promises";

const copyTest = async () => {
    // const src = "C:/AAA/watch/a/b/c/stuff.txt";
    const src =
        // "C:/AAA/BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB/CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC/DDDDDDDDDD DDDDDDDDD/EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE/YYY.txt";
        "C:/AAA/watch/jbtest-x.mp4";
    // "C:/AAA/watch/1GB_test_1.mp4";
    // "C:/AAA/watch/jbtest.txt";
    // const dest = "Z:/watch/a/b/c/stuff2.txt";
    const dir =
        "Z:/watch/AAA/BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB BBBBBBBBBB/CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC CCCCCCCCCC/DDDDDDDDDD DDDDDDDDD/EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE EEEEEEEEEE/FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF FFFFFFFFFF/GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG GGGGGGGGGG/HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH HHHHHHHHHH/IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII IIIIIIIIII/JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ JJJJJJJJJJ/KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK KKKKKKKKKK";
    // "C:/AAA/watch";
    const dest = `${dir}/movie.mp4`;

    try {
        // const result = mkdirSync(dir, { recursive: true });
        // console.log(`mkdir results:  ${result || "Did not need to create"}`);

        const { size: srcSize } = await stat(src);
        console.log(srcSize / 1024 ** 3);

        const defaultHighWaterMark = 64 * 1024;
        const options = srcSize > defaultHighWaterMark ? { highWaterMark: Math.ceil(srcSize / 100) } : {};

        console.log(options);
        const readStream = createReadStream(src, options);
        const writeStream = createWriteStream(dest, options);

        readStream.on("error", (error) => {
            throw error;
        });

        // let bytesCopied = 0;
        readStream.on("data", () => {
            // bytesCopied += buffer.length;
            // const percentage = ((bytesCopied / srcSize) * 100).toFixed(0);
            // console.log("----------------------------------");
            // console.log(`${percentage}%`);
            // writeStream.write(buffer);
            // console.log(`src size:       ${srcSize}`);
            // console.log(`bytes written:  ${writeStream.bytesWritten}`);
            // console.log(srcSize === writeStream.bytesWritten);
        });

        readStream.on("ready", () => {
            console.log("Ready reached.");
        });

        readStream.on("open", () => {
            console.log("Open reached.");
        });

        readStream.on("close", () => {
            console.log("Close reached.");
            // console.log(`src size:       ${srcSize}`);
            // console.log(`bytes written:  ${writeStream.bytesWritten}`);
            // console.log(srcSize === writeStream.bytesWritten);
        });

        readStream.on("end", () => {
            console.log("End reached.");
        });

        writeStream.on("error", (error) => {
            throw error;
        });

        writeStream.on("ready", () => {
            console.log("WriteStream ready.");
        });

        writeStream.on("open", () => {
            console.log("WriteStream open.");
        });

        writeStream.on("close", () => {
            console.log("WriteStream closed.");
        });

        writeStream.on("finish", () => {
            console.log("WriteStream finish.");
            const percentage = Math.floor((writeStream.bytesWritten / srcSize) * 100);
            console.log(`${percentage}%`);
            // console.log(`src size:       ${srcSize}`);
            // console.log(`bytes written:  ${writeStream.bytesWritten}`);
            console.log(srcSize === statSync(dest).size);
        });

        writeStream.on("pipe", () => {
            console.log("WriteStream pipe.");
        });

        writeStream.on("unpipe", () => {
            console.log("WriteStream unpipe.");
            // console.log(`src size:       ${srcSize}`);
            // console.log(`bytes written:  ${writeStream.bytesWritten}`);
            // console.log(srcSize === writeStream.bytesWritten);
        });

        writeStream.on("drain", () => {
            // console.log("WriteStream drain.");
            const percentage = Math.floor((writeStream.bytesWritten / srcSize) * 100);
            console.log(`${percentage}%`);
            console.log(writeStream.bytesWritten === statSync(dest).size);
        });

        readStream.pipe(writeStream);

        // copyFileSync(src, dest);

        // console.log("Copied...");
    } catch (error) {
        console.log(error);
    }
};

void copyTest();

// const watchDirectory = (dir: string) => {
//     try {
//         const standardDelayMs = 1000;
//         const stabilityThreshold = 5 * standardDelayMs;

//         const watcher = watch(dir, {
//             alwaysStat: true,
//             atomic: standardDelayMs,
//             awaitWriteFinish: { stabilityThreshold, pollInterval: standardDelayMs },
//             followSymlinks: false,
//             ignoreInitial: true
//         });

//         console.log("starting...");

//         const listener = (event: "add" | "addDir" | "change" | "unlink" | "unlinkDir", path: string, stats: Stats) => {
//             // watcher.off("all", listener);

//             // console.log(watcher.getWatched());
//             console.log(`event: ${event}\t:   path: ${path}`);
//             console.log(stats);

//             // watcher.on("all", listener);
//         };

//         watcher.on("all", listener);

//         watcher.on("error", (error) => {
//             console.log(error);
//             process.exit(0);
//         });

//         watcher.on("ready", () => {
//             console.log("Initial scan complete. Ready for changes...");
//             console.log(watcher.options);
//             console.log(watcher.getWatched());
//             console.log(watcher.eventNames());
//             void copyTest();
//         });
//     } catch (error) {
//         console.log(error);
//     }
// };

// watchDirectory("Z:/watch");
