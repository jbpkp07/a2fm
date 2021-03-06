import { randomUUID } from "crypto";
import { existsSync, writeFileSync } from "fs";
import { rm, stat } from "fs/promises";
import { resolve } from "path";

import FileCopier from "../src/filecopier/FileCopier";
import FileCopyProgress from "../src/filecopier/FileCopyProgress";

let hasPassed: boolean;
let progressCount: number;
let fileSizeBytes: number;

const fileCopier = new FileCopier();
const id = randomUUID();
const srcFilePath = resolve(__dirname, ".tmp", randomUUID());
const destFilePath = resolve(__dirname, ".tmp", randomUUID());

const writeSrcFile = () => {
    writeFileSync(srcFilePath, new Array(fileSizeBytes).fill("*").join(""));
};

const isCorrectStartProgress = (progress: FileCopyProgress): boolean => {
    return (
        progress.bytesPerSecond === 0 &&
        progress.bytesWritten === 0 &&
        progress.elapsedSeconds === 0 &&
        progress.inProgress === true &&
        progress.percentage === 0
    );
};

const isCorrectUpdateProgress = (progress: FileCopyProgress): boolean => {
    return (
        progress.bytesPerSecond > 0 &&
        progress.bytesWritten > 0 &&
        progress.elapsedSeconds > 0 &&
        progress.percentage > 0
    );
};

const isCorrectFinishProgress = (progress: FileCopyProgress): boolean => {
    const { bytesPerSecond } = progress;
    const isCorrectBytesPerSecond = fileSizeBytes > 0 ? bytesPerSecond > 0 : bytesPerSecond === 0;

    return (
        isCorrectBytesPerSecond &&
        progress.bytesWritten === fileSizeBytes &&
        progress.elapsedSeconds > 0 &&
        progress.inProgress === false &&
        progress.percentage === 100
    );
};

fileCopier.on("start", (progress) => {
    if (!isCorrectStartProgress(progress)) {
        hasPassed = false;
    }
});

fileCopier.on("progress", (progress) => {
    progressCount += 1;

    if (!isCorrectUpdateProgress(progress)) {
        hasPassed = false;
    }
});

fileCopier.on("finish", (progress) => {
    if (!isCorrectFinishProgress(progress)) {
        hasPassed = false;
    }
});

describe("FileCopier", () => {
    test("copyFile (0 bytes size)", async () => {
        hasPassed = true;
        progressCount = 0;
        fileSizeBytes = 0;

        writeSrcFile();

        try {
            const modifiedTimeMs = (await stat(srcFilePath)).mtimeMs;

            await fileCopier.copyFile({ id, srcFilePath, destFilePath, fileSizeBytes, modifiedTimeMs });

            if (!existsSync(srcFilePath) || !existsSync(destFilePath)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await rm(srcFilePath, { force: true });
        await rm(destFilePath, { force: true });

        expect(progressCount).toBe(0);
        expect(hasPassed).toBe(true);
    });

    test("copyFile (1 bytes size)", async () => {
        hasPassed = true;
        progressCount = 0;
        fileSizeBytes = 1;

        writeSrcFile();

        try {
            const modifiedTimeMs = (await stat(srcFilePath)).mtimeMs;

            await fileCopier.copyFile({ id, srcFilePath, destFilePath, fileSizeBytes, modifiedTimeMs });

            if (!existsSync(srcFilePath) || !existsSync(destFilePath)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await rm(srcFilePath, { force: true });
        await rm(destFilePath, { force: true });

        expect(progressCount).toBe(0);
        expect(hasPassed).toBe(true);
    });

    test("copyFile (65,536 bytes size)", async () => {
        hasPassed = true;
        progressCount = 0;
        fileSizeBytes = 65536;

        writeSrcFile();

        try {
            const modifiedTimeMs = (await stat(srcFilePath)).mtimeMs;

            await fileCopier.copyFile({ id, srcFilePath, destFilePath, fileSizeBytes, modifiedTimeMs });

            if (!existsSync(srcFilePath) || !existsSync(destFilePath)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await rm(srcFilePath, { force: true });
        await rm(destFilePath, { force: true });

        expect(progressCount).toBe(1);
        expect(hasPassed).toBe(true);
    });

    test("copyFile (655,359 bytes size)", async () => {
        hasPassed = true;
        progressCount = 0;
        fileSizeBytes = 655359;

        writeSrcFile();

        try {
            const modifiedTimeMs = (await stat(srcFilePath)).mtimeMs;

            await fileCopier.copyFile({ id, srcFilePath, destFilePath, fileSizeBytes, modifiedTimeMs });

            if (!existsSync(srcFilePath) || !existsSync(destFilePath)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await rm(srcFilePath, { force: true });
        await rm(destFilePath, { force: true });

        expect(progressCount).toBe(9);
        expect(hasPassed).toBe(true);
    });

    test("copyFile (655,360 bytes size)", async () => {
        hasPassed = true;
        progressCount = 0;
        fileSizeBytes = 655360;

        writeSrcFile();

        try {
            const modifiedTimeMs = (await stat(srcFilePath)).mtimeMs;

            await fileCopier.copyFile({ id, srcFilePath, destFilePath, fileSizeBytes, modifiedTimeMs });

            if (!existsSync(srcFilePath) || !existsSync(destFilePath)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await rm(srcFilePath, { force: true });
        await rm(destFilePath, { force: true });

        expect(progressCount).toBe(10);
        expect(hasPassed).toBe(true);
    });

    test("copyFile (10,000,000 bytes size)", async () => {
        hasPassed = true;
        progressCount = 0;
        fileSizeBytes = 10000000;

        writeSrcFile();

        try {
            const modifiedTimeMs = (await stat(srcFilePath)).mtimeMs;

            await fileCopier.copyFile({ id, srcFilePath, destFilePath, fileSizeBytes, modifiedTimeMs });

            if (!existsSync(srcFilePath) || !existsSync(destFilePath)) {
                hasPassed = false;
            }
        } catch {
            hasPassed = false;
        }

        await rm(srcFilePath, { force: true });
        await rm(destFilePath, { force: true });

        expect(progressCount).toBe(100);
        expect(hasPassed).toBe(true);
    });

    test("failed copy (missing src file w/ dest file rollback)", async () => {
        hasPassed = true;
        progressCount = 0;
        fileSizeBytes = 1000;

        const baseDestFilePath = resolve(__dirname, ".tmp", "dir1");
        const altDestFilePath = resolve(baseDestFilePath, "dir2", "dir3", randomUUID());

        try {
            await fileCopier.copyFile({
                id,
                srcFilePath,
                destFilePath: altDestFilePath,
                fileSizeBytes,
                modifiedTimeMs: Date.now()
            });

            hasPassed = false; // should throw, missing src file
        } catch {
            if (existsSync(srcFilePath) || existsSync(altDestFilePath) || existsSync(baseDestFilePath)) {
                hasPassed = false;
            }
        }

        await rm(srcFilePath, { force: true });
        await rm(baseDestFilePath, { force: true, recursive: true });

        expect(progressCount).toBe(0);
        expect(hasPassed).toBe(true);
    });
});
