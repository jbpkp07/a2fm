// import { readdir, rename, rm, stat, writeFile } from "fs/promises";
// import { dirname, normalize } from "path";

// import FileSystemUtils from "./FileSystemUtils";

// const { deleteFile, makeDestDir } = FileSystemUtils;

// // const path = "./.AAA/BBB/CCC";
// const destFilePath = "C:/Users/jeremy.barnes/Desktop/code/a2fm/.AAA/BBB/CCC/junk.txt";

// async function isDir(path: string) {
//     const stats = await stat(path);

//     return stats.isDirectory();
// }

// async function isEmpty(dirPath: string) {
//     const dirents = await readdir(dirPath, { withFileTypes: true });

//     return dirents.length === 0;
// }

// async function rollBack(rootPath: string, childPath: string) {
//     const normalizedRootPath = normalize(rootPath).toLowerCase().trim();
//     const normalizedChildPath = normalize(childPath).toLowerCase().trim();

//     const isChildPath = normalizedChildPath.startsWith(normalizedRootPath);

//     console.log("\n");
//     console.log("child   ", normalizedChildPath);
//     console.log("root    ", normalizedRootPath);

//     if (isChildPath) {
//         // and empty
//         // const isDirectory = await isDir(normalizedChildPath);

//         // if (!isDirectory) {
//         //     console.log("Deleting", normalizedChildPath, "\n\n");

//         //     await rm(normalizedChildPath, { force: true, recursive: true });
//         //     console.log("Deleted", normalizedChildPath);
//         // } else {
//         //     const isEmptyDirectory = await isEmpty(normalizedChildPath);
//         //     console.log(isEmptyDirectory);

//         //     if (isEmptyDirectory) {
//         //         console.log("Deleting", normalizedChildPath, "\n\n");

//         //         // await rm(normalizedChildPath, { force: true, recursive: true });
//         //         console.log("Deleted", normalizedChildPath);
//         //     } else {
//         //         return;
//         //     }
//         // }

//         if (normalizedRootPath === normalizedChildPath) return; // stops infinite loop for "Z:/ , Z:/junk.txt" example

//         const prevChildPath = dirname(childPath);

//         await rollBack(rootPath, prevChildPath);
//     }
// }

// async function app() {
//     try {
//         const firstDirPathCreated = await makeDestDir(destFilePath);

//         const rootPath = firstDirPathCreated ?? destFilePath;

//         console.log(rootPath);

//         await writeFile(destFilePath, "abc");
//         await writeFile(`${dirname(dirname(dirname(destFilePath)))}/junk2.txt`, "abc");

//         await rollBack("Z:/", "Z:/a/b/c/junk.txt");
//     } catch (error) {
//         console.log(error);
//     }
// }

// void app();

// const blah = [1, 2, 3];

// blah.forEach((val) => {
//     break;
// });
