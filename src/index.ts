import { watch } from "fs/promises";

const watchDirectory = async (dir: string) => {
    try {
        const watcher = watch(dir, { recursive: true });

        console.log("here");
        // eslint-disable-next-line no-restricted-syntax
        for await (const event of watcher) {
            console.log(event);
        }
    } catch (error) {
        console.log(error);
    }
};

// import { watch, WatchEventType } from "fs";

// console.log("here\n\n");

// const watchDirectory = (dir: string) => {
//     const watcher = watch(dir, { recursive: true });

//     const listener = (a: WatchEventType, b: string) => {
//         // watcher.off("change", listener);
//         console.log(a);
//         console.log(b);
//         // watcher.on("change", listener);
//     };

//     watcher.on("change", listener);
//     // console.log(cool);
// };

void watchDirectory("C:/AAA/watch");
