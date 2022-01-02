// import { createReadStream, createWriteStream } from "fs";
// import { stat } from "fs/promises";

// import CopyParams from "./CopyParams";
// import CopyParamsError from "./CopyParamsError";
// import ExternalPromise from "./ExternalPromise";
// import FileCopyEventEmitter from "./FileCopyEventEmitter";

// class FileCopier extends FileCopyEventEmitter {
//     private readonly defaultHighWaterMark = 64 * 1024;

//     private static async getSrcFileSize(srcPath: string): Promise<number> {
//         const { size } = await stat(srcPath);

//         return size;
//     }

//     public static async copyFileAsync(copyParams: CopyParams): Promise<void> {
//         const { promise, resolve } = new ExternalPromise<void>();

//         return promise;
//     }
// }

// export default FileCopier;

// const copier = new FileCopier();
// console.log(copier);
