import { randomUUID } from "crypto";
import { once } from "events";
import { existsSync } from "fs";
import { mkdir, rm, writeFile } from "fs/promises";
import { normalize, resolve } from "path";

import FileSystemUtils from "../src/common/FileSystemUtils";

const RANDOM_PATH = resolve(__dirname, ".tmp", randomUUID());

describe("FileSystemUtils", () => {
    test("createReadStream (initialization and destroy)", async () => {
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

        status.push(readStream1.destroyed, readStream2.destroyed, readStream3.destroyed);

        await rm(RANDOM_PATH, { force: true });

        expect(readStream1.readableHighWaterMark).toBe(65536);
        expect(readStream2.readableHighWaterMark).toBe(65536);
        expect(readStream3.readableHighWaterMark).toBe(65537);
        expect(status).toStrictEqual([true, true, true, false, false, false, true, true, true]);
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

    test("deleteDir", async () => {
        await writeFile(RANDOM_PATH, "abc");

        let hasPassed = true;

        try {
            await FileSystemUtils.deleteDir(RANDOM_PATH);

            if (existsSync(RANDOM_PATH)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        try {
            await FileSystemUtils.deleteDir(RANDOM_PATH);
        } catch {
            hasPassed = false;
        }

        await rm(RANDOM_PATH, { force: true });
        await mkdir(`${RANDOM_PATH}/childDir`, { recursive: true });
        await writeFile(`${RANDOM_PATH}/childDir/file.txt`, "abc");

        try {
            await FileSystemUtils.deleteDir(RANDOM_PATH);

            if (existsSync(RANDOM_PATH)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        try {
            await FileSystemUtils.deleteDir(RANDOM_PATH);
        } catch {
            hasPassed = false;
        }

        await rm(RANDOM_PATH, { force: true, recursive: true });

        expect(hasPassed).toBe(true);
    });

    test("deleteDirIfEmpty", async () => {
        let hasPassed = true;

        try {
            await FileSystemUtils.deleteDirIfEmpty(RANDOM_PATH);
        } catch {
            hasPassed = false; // nothing to delete, should not throw
        }

        await writeFile(RANDOM_PATH, "abc");

        try {
            await FileSystemUtils.deleteDirIfEmpty(RANDOM_PATH);

            if (!existsSync(RANDOM_PATH)) {
                hasPassed = false; // It is a file, should not delete
            }
        } catch {
            hasPassed = false; // should not throw
        }

        await rm(RANDOM_PATH, { force: true });
        await mkdir(`${RANDOM_PATH}/childDir`, { recursive: true });
        await writeFile(`${RANDOM_PATH}/childDir/file.txt`, "abc");

        try {
            await FileSystemUtils.deleteDirIfEmpty(RANDOM_PATH);

            if (!existsSync(RANDOM_PATH)) {
                hasPassed = false; // Directory is not empty, should not delete
            }
        } catch {
            hasPassed = false; // should not throw
        }

        await rm(`${RANDOM_PATH}/childDir/file.txt`, { force: true });

        try {
            await FileSystemUtils.deleteDirIfEmpty(RANDOM_PATH);

            if (!existsSync(RANDOM_PATH)) {
                hasPassed = false; // Directory is not empty, should not delete
            }
        } catch {
            hasPassed = false; // should not throw
        }

        await rm(`${RANDOM_PATH}/childDir`, { force: true, recursive: true });

        try {
            await FileSystemUtils.deleteDirIfEmpty(RANDOM_PATH);

            if (existsSync(RANDOM_PATH)) {
                hasPassed = false; // Directory is empty now, should be deleted
            }
        } catch {
            hasPassed = false; // should not throw
        }

        await rm(RANDOM_PATH, { force: true, recursive: true });

        expect(hasPassed).toBe(true);
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
        } catch {
            // Should throw, not a file, it is a directory
        }

        await rm(RANDOM_PATH, { force: true, recursive: true });

        expect(hasPassed).toBe(true);
    });

    test("exists", async () => {
        let hasPassed = true;

        try {
            const exists = await FileSystemUtils.exists(RANDOM_PATH);

            if (exists) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await writeFile(RANDOM_PATH, "abc");

        try {
            const exists = await FileSystemUtils.exists(RANDOM_PATH);

            if (!exists) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await rm(RANDOM_PATH, { force: true, recursive: true });

        expect(hasPassed).toBe(true);
    });

    test("hasParentDir", () => {
        const { hasParentDir } = FileSystemUtils;

        const results: boolean[] = [
            hasParentDir("C:\\a\\"),
            hasParentDir("C:/a\\/"),
            hasParentDir("C:/a/b"),
            hasParentDir("C:/a/b/.."),
            hasParentDir("C:/a/"),
            hasParentDir("C:/a"),
            hasParentDir("C:/a   "),
            hasParentDir("/a/b/"),
            hasParentDir("/a/b"),
            hasParentDir("/a/"),
            hasParentDir("/a"),

            hasParentDir("C:/"),
            hasParentDir("C:\\"),
            hasParentDir("C:/a/b/c/../../.."),
            hasParentDir("C:"),
            hasParentDir("C"),
            hasParentDir("   C:/"),
            hasParentDir("/"),
            hasParentDir("\\"),
            hasParentDir(""),
            hasParentDir("./"),
            hasParentDir("../"),
            hasParentDir("."),
            hasParentDir(".."),
            hasParentDir("~/"),
            hasParentDir("~")
        ];

        const expected: boolean[] = [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,

            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ];

        expect(results).toStrictEqual(expected);
    });

    test("isChildPath", () => {
        const { isChildPath } = FileSystemUtils;

        const results: boolean[] = [
            isChildPath("C:/a/b/c", "C:/a"),
            isChildPath("C://a\\b///c", "C:/a"),
            isChildPath("c:/A/B/C", "C:/a"),
            isChildPath("C:/a/b", "C:/a/"),
            isChildPath("C:/a/b\\", "C:/a/"),
            isChildPath("C:/a/b\\", "C:/a"),
            isChildPath("C:/a", "C:/"),
            isChildPath("/a/b", "/a"),
            isChildPath("/a/b", "/"),
            isChildPath("\\a", "/"),
            isChildPath("C:/a/b/c/../..", "C:/a/.."),

            isChildPath("C:/", "C:/"),
            isChildPath("C:/", "C:/a"),
            isChildPath("C:/", "C:/a/b"),
            isChildPath("C:/a", "C:/a"),
            isChildPath("C:/a", "C"),
            isChildPath("C:/a/b/c/../../..", "C:/a/.."),
            isChildPath("/", "/a"),
            isChildPath("", "/"),
            isChildPath("./", "/"),
            isChildPath("../", "/"),
            isChildPath(".", "/"),
            isChildPath("..", "/"),
            isChildPath("~/", "/"),
            isChildPath("~", "/")
        ];

        const expected: boolean[] = [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,

            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ];

        expect(results).toStrictEqual(expected);
    });

    test("isEmptyDir", async () => {
        await mkdir(RANDOM_PATH);

        let hasPassed = true;

        try {
            const isEmpty = await FileSystemUtils.isEmptyDir(RANDOM_PATH);

            if (!isEmpty) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await writeFile(`${RANDOM_PATH}/test.txt`, "abc");

        try {
            const isEmpty = await FileSystemUtils.isEmptyDir(RANDOM_PATH);

            if (isEmpty) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await rm(`${RANDOM_PATH}/test.txt`, { force: true });

        try {
            const isEmpty = await FileSystemUtils.isEmptyDir(RANDOM_PATH);

            if (!isEmpty) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await mkdir(`${RANDOM_PATH}/extraDir`);

        try {
            const isEmpty = await FileSystemUtils.isEmptyDir(RANDOM_PATH);

            if (isEmpty) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await rm(RANDOM_PATH, { force: true, recursive: true });

        try {
            await FileSystemUtils.isEmptyDir(RANDOM_PATH);

            hasPassed = false;
        } catch {
            // should throw, directory does not exist now
        }

        await writeFile(RANDOM_PATH, "abc");

        try {
            await FileSystemUtils.isEmptyDir(RANDOM_PATH);

            hasPassed = false;
        } catch {
            // should throw, not a directory; is a file
        }

        await rm(RANDOM_PATH, { force: true });

        expect(hasPassed).toBe(true);
    });

    test("isRelative", () => {
        const { isRelative } = FileSystemUtils;

        const results: boolean[] = [
            isRelative("C:\\a\\"),
            isRelative("C:/a\\/"),
            isRelative("C:/a/b"),
            isRelative("C:/a/b/c/../.."),
            isRelative("C:/a/"),
            isRelative("C:/a"),
            isRelative("C:/a   "),
            isRelative("C:/"),
            isRelative("C:\\"),
            isRelative("/a/b/"),
            isRelative("/a/b"),
            isRelative("/a/"),
            isRelative("/a"),
            isRelative("/"),
            isRelative("\\"),

            isRelative("C:"),
            isRelative("C"),
            isRelative("   C:/"),
            isRelative(""),
            isRelative("./a"),
            isRelative("../a"),
            isRelative("."),
            isRelative(".."),
            isRelative("~/"),
            isRelative("~")
        ];

        const expected: boolean[] = [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,

            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ];

        expect(results).toStrictEqual(expected);
    });

    test("makeDestDir", async () => {
        let hasPassed = true;

        try {
            const firstDirCreated = await FileSystemUtils.makeDestDir(`${RANDOM_PATH}/dir1/dir2/test.txt`);

            if (!existsSync(RANDOM_PATH)) {
                hasPassed = false;
            }

            if (firstDirCreated !== RANDOM_PATH) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        try {
            const firstDirCreated = await FileSystemUtils.makeDestDir(`${RANDOM_PATH}/dir1/dir2/test-2.txt`);

            if (!existsSync(RANDOM_PATH)) {
                hasPassed = false;
            }

            if (firstDirCreated !== undefined) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        try {
            const firstDirCreated = await FileSystemUtils.makeDestDir("/test.txt"); // should not create root dir "/"

            if (firstDirCreated !== undefined) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        const driveLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        const badDriveLetter = driveLetters.find((letter) => !existsSync(`${letter}:/`));

        if (badDriveLetter) {
            try {
                await FileSystemUtils.makeDestDir(`${badDriveLetter}:/${randomUUID()}/test.txt`);

                hasPassed = false;
            } catch {
                // should throw, badDriveLetter does not exist
            }
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

    test("readStats", async () => {
        await writeFile(RANDOM_PATH, "0123456789");

        let fileBytes = 99;
        let dirBytes = 99;
        let hasPassed = true;

        try {
            const { size } = await FileSystemUtils.readStats(RANDOM_PATH);

            fileBytes = size;
        } catch {
            hasPassed = false;
        }

        await rm(RANDOM_PATH, { force: true });

        try {
            await FileSystemUtils.readStats(RANDOM_PATH);

            hasPassed = false;
        } catch {
            // Should throw, file missing
        }

        await mkdir(RANDOM_PATH);
        await writeFile(`${RANDOM_PATH}/file.txt`, "0123456789");

        try {
            const { size } = await FileSystemUtils.readStats(RANDOM_PATH);

            dirBytes = size;
        } catch {
            hasPassed = false;
        }

        await rm(RANDOM_PATH, { force: true, recursive: true });

        expect(fileBytes).toBe(10);
        expect(dirBytes).toBe(0);
        expect(hasPassed).toBe(true);
    });

    test("removeFileExt", async () => {
        let hasPassed = true;

        try {
            await FileSystemUtils.removeFileExt(`${RANDOM_PATH}.ext1.ext2`);

            hasPassed = false;
        } catch {
            // Should throw, file missing
        }

        await writeFile(`${RANDOM_PATH}.ext1.ext2`, "abc");

        try {
            await FileSystemUtils.removeFileExt(`${RANDOM_PATH}.ext1.ext2`);

            if (!existsSync(`${RANDOM_PATH}.ext1`)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        try {
            await FileSystemUtils.removeFileExt(`${RANDOM_PATH}.ext1`);

            if (!existsSync(RANDOM_PATH)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        try {
            await FileSystemUtils.removeFileExt(RANDOM_PATH);

            if (!existsSync(RANDOM_PATH)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await rm(RANDOM_PATH, { force: true });

        expect(hasPassed).toBe(true);
    });

    test("traverseBack", () => {
        const { traverseBack } = FileSystemUtils;

        const results: string[][] = [
            traverseBack("C:/a/b/c", "C:/a/b"),
            traverseBack("C:/a/b/c", "C:/a"),
            traverseBack("C:/a/b/c", "C:/"),
            traverseBack("C:/a/b/c/", "C:/"),
            traverseBack("C:/a\\b///c///", "C:/\\\\"),
            traverseBack("/a/b/c", "/"),
            traverseBack("/a/b/c/..", "/"),
            traverseBack("/a/b/c/..", "/../.."),

            traverseBack("C:/a/b/c", "C:/a/b/c"),
            traverseBack("C:/a/b/c", "C:/a/b/c/d"),
            traverseBack("C:/a/b/c", "D:/a"),
            traverseBack("C:/a/b/c", "C:"),
            traverseBack("C:/a/b/c", "C"),
            traverseBack("C:/a/b/c", ""),
            traverseBack("C:/", "C:/"),
            traverseBack("/", "/"),
            traverseBack("C:/abc/def", "C:/ab"),
            traverseBack("a/b/c", "a"),
            traverseBack("./a/b/c", "./a"),
            traverseBack("./a/b/c", ".")
        ];

        const expected: string[][] = [
            [normalize("C:/a/b")],
            [normalize("C:/a/b"), normalize("C:/a")],
            [normalize("C:/a/b"), normalize("C:/a"), normalize("C:/")],
            [normalize("C:/a/b"), normalize("C:/a"), normalize("C:/")],
            [normalize("C:/a/b"), normalize("C:/a"), normalize("C:/")],
            [normalize("/a/b"), normalize("/a"), normalize("/")],
            [normalize("/a"), normalize("/")],
            [normalize("/a"), normalize("/")],

            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];

        expect(results).toStrictEqual(expected);
    });
});
