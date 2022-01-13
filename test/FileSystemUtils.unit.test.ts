import { randomUUID } from "crypto";
import { once } from "events";
import { existsSync } from "fs";
import { mkdir, rm, writeFile } from "fs/promises";
import { resolve } from "path";

import FileSystemUtils from "../src/FileSystemUtils";

const RANDOM_PATH = resolve(__dirname, ".tmp", randomUUID());

describe("FileSystemUtils", () => {
    test("createReadStream (initialization)", async () => {
        await writeFile(RANDOM_PATH, "abc");

        const readStream1 = FileSystemUtils.createReadStream(RANDOM_PATH, 0);
        const readStream2 = FileSystemUtils.createReadStream(RANDOM_PATH, 65536 * 100);
        const readStream3 = FileSystemUtils.createReadStream(RANDOM_PATH, 65536.1 * 100);

        const status = [
            readStream1.isPaused(),
            readStream2.isPaused(),
            readStream3.isPaused(),
            readStream1.destroyed,
            readStream2.destroyed,
            readStream3.destroyed
        ];

        readStream1.destroy();
        readStream2.destroy();
        readStream3.destroy();

        await rm(RANDOM_PATH, { force: true });

        expect(readStream1.readableHighWaterMark).toBe(65536);
        expect(readStream2.readableHighWaterMark).toBe(65536);
        expect(readStream3.readableHighWaterMark).toBe(65537);
        expect(status).toStrictEqual([true, true, true, false, false, false]);
    });

    test("createReadStream (bad file path)", async () => {
        let hasThrown = false;

        try {
            const readStream = FileSystemUtils.createReadStream(RANDOM_PATH, 10);
            await once(readStream, "open");
        } catch {
            hasThrown = true;
        }

        expect(hasThrown).toBe(true);
    });

    test("createWriteStream (initialization and destroy)", async () => {
        const writeStream1 = FileSystemUtils.createWriteStream(RANDOM_PATH, 0);
        writeStream1.destroy();
        await once(writeStream1, "close");

        const writeStream2 = FileSystemUtils.createWriteStream(RANDOM_PATH, 65536 * 100);
        writeStream2.destroy();
        await once(writeStream2, "close");

        const writeStream3 = FileSystemUtils.createWriteStream(RANDOM_PATH, 65537.1 * 100);
        writeStream3.destroy();
        await once(writeStream3, "close");

        const status = [writeStream1.destroyed, writeStream2.destroyed, writeStream3.destroyed];

        await rm(RANDOM_PATH, { force: true });

        expect(writeStream1.writableHighWaterMark).toBe(65536);
        expect(writeStream2.writableHighWaterMark).toBe(65536);
        expect(writeStream3.writableHighWaterMark).toBe(65538);
        expect(status).toStrictEqual([true, true, true]);
    });

    test("createWriteStream (bad file path)", async () => {
        let hasThrown = false;

        try {
            const badFilePath = resolve(RANDOM_PATH, "non-existent-directory");
            const writeStream = FileSystemUtils.createWriteStream(badFilePath, 10);
            await once(writeStream, "open");
        } catch {
            hasThrown = true;
        }

        expect(hasThrown).toBe(true);
    });

    test("deleteFile", async () => {
        await writeFile(RANDOM_PATH, "abc");

        let hasPassed = true;

        try {
            await FileSystemUtils.deleteFile(RANDOM_PATH);

            if (existsSync(RANDOM_PATH)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        try {
            await FileSystemUtils.deleteFile(RANDOM_PATH);
        } catch {
            hasPassed = false;
        }

        await rm(RANDOM_PATH, { force: true });
        await mkdir(RANDOM_PATH);

        try {
            await FileSystemUtils.deleteFile(RANDOM_PATH);

            hasPassed = false;
        } catch (error) {
            // Should throw, not a file, it is a directory
        }

        await rm(RANDOM_PATH, { force: true, recursive: true });

        expect(hasPassed).toBe(true);
    });

    test("readFileSizeBytes", async () => {
        await writeFile(RANDOM_PATH, "0123456789");

        let bytes = 0;

        try {
            bytes = await FileSystemUtils.readFileSizeBytes(RANDOM_PATH);
        } catch {
            // Do nothing
        }

        await rm(RANDOM_PATH, { force: true });

        expect(bytes).toBe(10);
    });

    test("readFileStats", async () => {
        await writeFile(RANDOM_PATH, "0123456789");

        let bytes = 0;
        let hasPassed = true;

        try {
            const { size } = await FileSystemUtils.readFileStats(RANDOM_PATH);

            bytes = size;
        } catch {
            // Do nothing
        }

        await rm(RANDOM_PATH, { force: true });

        try {
            await FileSystemUtils.readFileStats(RANDOM_PATH);

            hasPassed = false;
        } catch {
            // Should throw, file missing
        }

        await mkdir(RANDOM_PATH);

        try {
            await FileSystemUtils.readFileStats(RANDOM_PATH);

            hasPassed = false;
        } catch {
            // Should throw, not a file, it is a directory
        }

        await rm(RANDOM_PATH, { force: true, recursive: true });

        expect(bytes).toBe(10);
        expect(hasPassed).toBe(true);
    });
});
