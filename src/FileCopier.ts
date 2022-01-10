// import { once } from "events";
// import { createReadStream, createWriteStream, ReadStream, rmSync, WriteStream } from "fs";
// import { stat } from "fs/promises";

// import CopyParams from "./CopyParams";
// import CopyParamsError from "./CopyParamsError";
// import FileCopyEventEmitter from "./FileCopyEventEmitter";
// import CopyProgress from "./FileCopyProgress";
// import NumberUtils from "./NumberUtils";

// interface StreamOptions {
//     readonly highWaterMark: number;
// }

// const { ceil, round } = NumberUtils;

// class FileCopy extends FileCopyEventEmitter {
//     private readonly copyParams: CopyParams;

//     private srcFileSizeBytes = 0;

//     private startTimeMs = 0;

//     public readStream!: ReadStream; // make private, adjust to Readstream | null once coded to see how many null checks

//     public writeStream!: WriteStream; // make private, adjust to Readstream | null once coded to see how many null checks

//     constructor(copyParams: CopyParams) {
//         super();

//         this.copyParams = copyParams;
//     }

//     private abortCopy(): void {
//         console.log("TEARDOWN CALLED");
//         this.readStream.unpipe(this.writeStream);
//         // copier.ws?.removeAllListeners("drain");
//         this.readStream.destroy();
//         this.writeStream.destroy();
//         rmSync(this.writeStream.path, { force: true });
//     }

//     private assignErrorListeners(readStream: ReadStream, writeStream: WriteStream): void {
//         readStream.on("error", () => this.abortCopy());
//         writeStream.on("error", () => this.abortCopy());
//     }

//     private calcElapsedSeconds(): number {
//         const currentTimeMs = Date.now() + 0.5;

//         return (currentTimeMs - this.startTimeMs) / 1000;
//     }

//     private calcHighWaterMark(): number {
//         const defaultHighWaterMark = 65536; // 64 * 1024
//         const drainCount = 100;
//         const isLargeFile = this.srcFileSizeBytes >= defaultHighWaterMark * drainCount;

//         return isLargeFile ? ceil(this.srcFileSizeBytes / drainCount) : defaultHighWaterMark;
//     }

//     private createCopyProgress(): CopyProgress {
//         const { srcFileSizeBytes, copyParams } = this;
//         const { bytesWritten } = this.writeStream;
//         const elapsedSeconds = this.calcElapsedSeconds();
//         const bytesPerSecond = round(bytesWritten / elapsedSeconds);

//         return {
//             bytesPerSecond,
//             bytesWritten,
//             elapsedSeconds,
//             fileSizeBytes: srcFileSizeBytes,
//             ...copyParams
//         };
//     }

//     private createStreamOptions(): StreamOptions {
//         const highWaterMark = this.calcHighWaterMark();

//         return { highWaterMark };
//     }

//     private async setSrcFileSizeBytes(): Promise<void> {
//         const { srcFilePath } = this.copyParams;
//         const { size } = await stat(srcFilePath);

//         this.srcFileSizeBytes = size;
//     }

//     private updateProgress(): void {
//         const progress = this.createCopyProgress();
//         this.emit("progress", progress);
//     }

//     private async copyFile(): Promise<void> {
//         const { srcFilePath, destFilePath } = this.copyParams;

//         this.srcFileSizeBytes = await stat(srcFilePath).size;

//         const options = this.createStreamOptions(srcFileSizeBytes);
//         const readStream = createReadStream(srcFilePath, options);
//         const writeStream = createWriteStream(destFilePath, options);

//         this.readStream = readStream;
//         this.writeStream = writeStream;

//         this.assignErrorListeners(readStream, writeStream);

//         let startTime: number;
//         const movingAverage = new MovingMedian(15); // if throws here, readStream and writeStream are not destroyed. perhpas abort should be called in catch/finally for copyFileAsync to protect agains this?
//         const consec = new Set<number>();

//         writeStream.on("ready", () => {
//             startTime = Date.now();
//         });

//         writeStream.on("drain", () => {
//             const { bytesWritten } = writeStream;
//             const elapsedSeconds = (Date.now() - startTime) / 1000;
//             const bytesPerSecond = bytesWritten / elapsedSeconds; // Need to validate that elapsed time > 0 or it results in a bytesPsec rate of "Infinity"... throws error in MovingAverage

//             const bytesPerSecondAverage = movingAverage.push(bytesPerSecond);

//             const progress: CopyProgress = {
//                 bytesPerSecond: Math.floor(bytesPerSecondAverage),
//                 bytesWritten,
//                 elapsedSeconds,
//                 fileSizeBytes: srcFileSizeBytes,
//                 srcFilePath,
//                 destFilePath
//             };

//             this.emit("progress", progress);
//         });

//         writeStream.on("finish", () => {
//             // console.log("WriteStream finish.");
//             const { bytesWritten } = writeStream;
//             const elapsedSeconds = (Date.now() - startTime) / 1000;
//             const bytesPerSecond = bytesWritten / elapsedSeconds;

//             const progress: CopyProgress = {
//                 bytesPerSecond: Math.floor(bytesPerSecond),
//                 bytesWritten,
//                 elapsedSeconds,
//                 fileSizeBytes: srcFileSizeBytes,
//                 srcFilePath,
//                 destFilePath
//             };

//             console.log("unique-----: ", consec.size);

//             this.emit("progress", progress);
//         });

//         this.on("progress", (progress: CopyProgress) => {
//             const { bytesPerSecond } = progress;

//             const megaBytesPerSecond = Math.floor(bytesPerSecond / 1024 ** 2);
//             // megaBytesPerSecond = Math.floor(megaBytesPerSecond / 10) * 10;

//             consec.add(megaBytesPerSecond);

//             // console.log("______________________________");

//             console.log("byte/s: ", megaBytesPerSecond);
//             // process.stdout.moveCursor(0, -1);
//             // console.log("elap/s: ", elapsedSeconds);
//             // console.log("flSize: ", parseFloat(((elapsedSeconds * bytesPerSecond) / 1024 ** 3).toFixed(2)), "GB");
//             // console.log("count:  ", count);
//         });

//         // readStream.on("ready", () => {
//         //     console.log("ReadStream ready.");
//         // });

//         // readStream.on("open", () => {
//         //     console.log("ReadStream open.");
//         // });

//         // readStream.on("end", () => {
//         //     console.log("ReadStream end.");
//         // });

//         // readStream.on("close", () => {
//         //     console.log("ReadStream close.");
//         // });

//         // readStream.on("data", () => {
//         //     console.log("ReadStream data.");
//         // });

//         // //
//         // //

//         writeStream.on("ready", () => {
//             console.log("WriteStream ready.");
//         });

//         writeStream.on("open", () => {
//             console.log("WriteStream open.");
//         });

//         // writeStream.on("pipe", () => {
//         //     console.log("WriteStream pipe.");
//         // });

//         // writeStream.on("unpipe", () => {
//         //     console.log("WriteStream unpipe.");
//         // });

//         // writeStream.on("finish", () => {
//         //     console.log("WriteStream finish.");
//         // });

//         // writeStream.on("close", () => {
//         //     console.log("WriteStream close.");
//         // });

//         // writeStream.on("drain", () => {
//         //     console.log("WriteStream drain.");
//         // });

//         readStream.pipe(writeStream);

//         await Promise.all([once(readStream, "close"), once(writeStream, "close")]);
//     }

//     public async copyFileAsync(copyParams: CopyParams): Promise<void> {
//         try {
//             this.emit("start", copyParams);

//             await this.copyFile(copyParams);

//             this.emit("finish", copyParams);
//         } catch (error) {
//             throw CopyParamsError.from(copyParams, error);
//         }
//     }
// }

// export default FileCopy;

// const copyParams = {
//     // srcFilePath: "----------test.txt",
//     // destFilePath: "----------testCopy.txt"
//     srcFilePath: "C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/1GB_test_1.mp4",
//     destFilePath: "----------testMovieCopy.mp4"
// };

// const copier = new FileCopy(copyParams);

// async function app() {
//     try {
//         await copier.copyFileAsync(copyParams);
//     } catch (error) {
//         console.log("Error Caught ----------------------------");
//         if (error instanceof CopyParamsError) {
//             console.log();
//             console.log(error.name, "\n");
//             console.log(error.message, "\n");
//             console.log(error.stack, "\n");
//             console.log(error.copyParams, "\n");
//         }
//     }

//     console.log("App Closed.");
// }

// void app();

// setInterval(() => {
//     console.log("alive");
//     console.log(copier.readStream?.destroyed);
//     console.log(copier.writeStream?.destroyed);
//     // console.log(copier.writeStream?.listeners("drain"));
//     // console.log(copier.writeStream?.removeAllListeners("drain"));
//     console.log(copier.writeStream?.path);
// }, 5000);

// console.log("End of code file");
