import { randomUUID } from "crypto";
import { existsSync, writeFileSync } from "fs";
import { rm } from "fs/promises";
import { resolve } from "path";

import FileCopyStreams from "../src/filecopier/FileCopyStreams";

const srcFilePath = resolve(__dirname, ".tmp", randomUUID());
const destFilePath = resolve(__dirname, ".tmp", randomUUID());
const fileSizeBytes = 10000000;

writeFileSync(srcFilePath, new Array(fileSizeBytes).fill("*").join(""));

const expectGracefulClose = (streams: FileCopyStreams): void => {
    const { readStream, writeStream } = streams;

    const rsEvents = [...readStream.eventNames()];
    const wsEvents = [...writeStream.eventNames()];

    expect(rsEvents).toStrictEqual([]);
    expect(wsEvents).toStrictEqual([]);

    expect(readStream.isPaused()).toBe(true);
    expect(readStream.destroyed).toBe(true);
    expect(writeStream.destroyed).toBe(true);
};

describe("FileCopyStreams", () => {
    test("good paths", async () => {
        let bytesWritten;
        let hasPassed = true;

        const fileCopyParams = { srcFilePath, destFilePath, fileSizeBytes };
        const streams = new FileCopyStreams(fileCopyParams);

        streams.addStartListener((bytes: number) => {
            bytesWritten = bytes;
        });

        streams.addFinishListener((bytes: number) => {
            bytesWritten = bytes;
        });

        try {
            await streams.copyFile();

            if (!existsSync(destFilePath)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await rm(destFilePath, { force: true });

        expect(hasPassed).toBe(true);
        expect(bytesWritten).toBe(fileSizeBytes);
        expectGracefulClose(streams);
    });

    test("bad readStream path", async () => {
        let bytesWritten;
        let hasPassed = true;

        const fileCopyParams = { srcFilePath: `${srcFilePath}X`, destFilePath, fileSizeBytes };
        const streams = new FileCopyStreams(fileCopyParams);

        streams.addStartListener((bytes: number) => {
            bytesWritten = bytes;
        });

        streams.addFinishListener((bytes: number) => {
            bytesWritten = bytes;
        });

        try {
            await streams.copyFile();

            hasPassed = false;
        } catch {
            // should throw, bad srcFilePath
        }

        await rm(destFilePath, { force: true });

        expect(hasPassed).toBe(true);
        expect(bytesWritten).toBe(0);
        expectGracefulClose(streams);
    });

    test("bad writeStream path", async () => {
        let bytesWritten;
        let hasPassed = true;

        const fileCopyParams = { srcFilePath, destFilePath: `${destFilePath}/X`, fileSizeBytes };
        const streams = new FileCopyStreams(fileCopyParams);

        streams.addStartListener((bytes: number) => {
            bytesWritten = bytes;
        });

        streams.addFinishListener((bytes: number) => {
            bytesWritten = bytes;
        });

        try {
            await streams.copyFile();

            hasPassed = false;
        } catch {
            // should throw, bad destFilePath
        }

        await rm(destFilePath, { force: true });

        expect(hasPassed).toBe(true);
        expect(bytesWritten).toBeUndefined();
        expectGracefulClose(streams);
    });

    test("bad readStream and writeStream paths", async () => {
        let bytesWritten;
        let hasPassed = true;

        const fileCopyParams = { srcFilePath: `${srcFilePath}X`, destFilePath: `${destFilePath}/X`, fileSizeBytes };
        const streams = new FileCopyStreams(fileCopyParams);

        streams.addStartListener((bytes: number) => {
            bytesWritten = bytes;
        });

        streams.addFinishListener((bytes: number) => {
            bytesWritten = bytes;
        });

        try {
            await streams.copyFile();

            hasPassed = false;
        } catch {
            // should throw, bad srcFilePath and destFilePath
        }

        await rm(destFilePath, { force: true });

        expect(hasPassed).toBe(true);
        expect(bytesWritten).toBeUndefined();
        expectGracefulClose(streams);
    });

    test("mid-copy readStream failure", async () => {
        let bytesWritten;
        let hasPassed = true;

        const fileCopyParams = { srcFilePath, destFilePath, fileSizeBytes };
        const streams = new FileCopyStreams(fileCopyParams);

        streams.addStartListener((bytes: number) => {
            bytesWritten = bytes;
        });

        streams.addProgressListener((bytes: number) => {
            bytesWritten = bytes;

            streams.readStream.emit("error");
        });

        streams.addFinishListener((bytes: number) => {
            bytesWritten = bytes;
        });

        try {
            await streams.copyFile();

            hasPassed = false;
        } catch {
            // should throw, mid-copy readStream failure
        }

        await rm(destFilePath, { force: true });

        expect(hasPassed).toBe(true);
        expect(bytesWritten).toBeGreaterThan(0);
        expect(bytesWritten).toBeLessThan(fileSizeBytes);
        expectGracefulClose(streams);
    });

    test("mid-copy writeStream failure", async () => {
        let bytesWritten;
        let hasPassed = true;

        const fileCopyParams = { srcFilePath, destFilePath, fileSizeBytes };
        const streams = new FileCopyStreams(fileCopyParams);

        streams.addStartListener((bytes: number) => {
            bytesWritten = bytes;
        });

        streams.addProgressListener((bytes: number) => {
            bytesWritten = bytes;

            streams.writeStream.emit("error");
        });

        streams.addFinishListener((bytes: number) => {
            bytesWritten = bytes;
        });

        try {
            await streams.copyFile();

            hasPassed = false;
        } catch {
            // should throw, mid-copy writeStream failure
        }

        await rm(destFilePath, { force: true });

        expect(hasPassed).toBe(true);
        expect(bytesWritten).toBeGreaterThan(0);
        expect(bytesWritten).toBeLessThan(fileSizeBytes);
        expectGracefulClose(streams);
    });

    test("mid-copy readStream and writeStream failures", async () => {
        let bytesWritten;
        let hasPassed = true;

        const fileCopyParams = { srcFilePath, destFilePath, fileSizeBytes };
        const streams = new FileCopyStreams(fileCopyParams);

        streams.addStartListener((bytes: number) => {
            bytesWritten = bytes;
        });

        streams.addProgressListener((bytes: number) => {
            bytesWritten = bytes;

            streams.readStream.emit("error");
            streams.writeStream.emit("error");
        });

        streams.addFinishListener((bytes: number) => {
            bytesWritten = bytes;
        });

        try {
            await streams.copyFile();

            hasPassed = false;
        } catch {
            // should throw, mid-copy readStream and writeStream failures
        }

        await rm(srcFilePath, { force: true });
        await rm(destFilePath, { force: true });

        expect(hasPassed).toBe(true);
        expect(bytesWritten).toBeGreaterThan(0);
        expect(bytesWritten).toBeLessThan(fileSizeBytes);
        expectGracefulClose(streams);
    });
});
