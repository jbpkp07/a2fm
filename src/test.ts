// import { mkdir, rm, writeFile } from "fs/promises";
import { createHash } from "crypto";
import { once } from "events";

import FileSystemUtils from "./FileSystemUtils";

const { readFileStats, createReadStream } = FileSystemUtils;

// const path = "./.AAA/BBB/CCC";
// const full = "./.AAA/BBB/CCC/junk.txt";

async function app() {
    // const result = await mkdir(path, { recursive: true });

    // console.log(result);

    // const result2 = await writeFile(full, "abc");

    // console.log(result2);

    // setTimeout(() => {
    //     if (result?.length) {
    //         void rm(result, { force: true, recursive: true });
    //     }
    // }, 5000);

    const stats = await readFileStats("C:/Users/jeremy.barnes/Desktop/Sprint Extras/movie1/1GB_test_1.mp4");
    console.log(stats);

    const stats2 = await readFileStats("./zzzfile.mp4");
    console.log(stats2);

    const hash = createHash("sha1");
    const readStream = createReadStream("./zzzfile.mp4", stats2.size);

    readStream.on("data", (chunk) => {
        hash.update(chunk);
        // console.log("data read");
    });

    readStream.resume();

    await once(readStream, "close");

    console.log("done reading");
    const result = hash.digest("hex");
    console.log(result);
    console.log(result === "3485d1ff33874ae723921533e0d333e8684fabeb");
}

void app();

// 3485d1ff33874ae723921533e0d333e8684fabeb
