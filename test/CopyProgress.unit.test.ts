import CopyProgress from "../src/CopyProgress";

describe("CopyProgress", () => {
    test("initialization", () => {
        const copyProgressParams = {
            copyParams: { srcFilePath: "a", destFilePath: "b" },
            fileSizeBytes: 10000,
            startTimeMs: 0
        };

        const progress = new CopyProgress(copyProgressParams);

        expect(progress.bytesPerSecond).toBe(0);
        expect(progress.bytesWritten).toBe(0);
        expect(progress.elapsedSeconds).toBe(0);
        expect(progress.fileSizeBytes).toBe(10000);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(0);
        expect(progress.copyParams).toStrictEqual({ srcFilePath: "a", destFilePath: "b" });
    });

    test("update (no elapsed time, no bytes written)", () => {
        const copyProgressParams = {
            copyParams: { srcFilePath: "a", destFilePath: "b" },
            fileSizeBytes: 10000,
            startTimeMs: 0
        };

        const progress = new CopyProgress(copyProgressParams);
        progress.update(0, 0);

        expect(progress.bytesPerSecond).toBe(0);
        expect(progress.bytesWritten).toBe(0);
        expect(progress.elapsedSeconds).toBe(0.0005);
        expect(progress.fileSizeBytes).toBe(10000);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(0);
    });

    test("update (no elapsed time, bytes written)", () => {
        const copyProgressParams = {
            copyParams: { srcFilePath: "a", destFilePath: "b" },
            fileSizeBytes: 10000,
            startTimeMs: 0
        };

        const progress = new CopyProgress(copyProgressParams);
        progress.update(10, 0);

        expect(progress.bytesPerSecond).toBe(20000);
        expect(progress.bytesWritten).toBe(10);
        expect(progress.elapsedSeconds).toBe(0.0005);
        expect(progress.fileSizeBytes).toBe(10000);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(0);
    });

    test("update (zero fileSizeBytes, no bytes written)", () => {
        const copyProgressParams = {
            copyParams: { srcFilePath: "a", destFilePath: "b" },
            fileSizeBytes: 0,
            startTimeMs: 0
        };

        const progress = new CopyProgress(copyProgressParams);
        progress.update(0, 500);

        expect(progress.bytesPerSecond).toBe(0);
        expect(progress.bytesWritten).toBe(0);
        expect(progress.elapsedSeconds).toBe(0.5005);
        expect(progress.fileSizeBytes).toBe(0);
        expect(progress.inProgress).toBe(false);
        expect(progress.percentage).toBe(100);
    });

    test("update (zero fileSizeBytes, bytes written)", () => {
        const copyProgressParams = {
            copyParams: { srcFilePath: "a", destFilePath: "b" },
            fileSizeBytes: 0,
            startTimeMs: 0
        };

        const progress = new CopyProgress(copyProgressParams);
        progress.update(10, 500);

        expect(progress.bytesPerSecond).toBe(20);
        expect(progress.bytesWritten).toBe(10);
        expect(progress.elapsedSeconds).toBe(0.5005);
        expect(progress.fileSizeBytes).toBe(0);
        expect(progress.inProgress).toBe(false);
        expect(progress.percentage).toBe(100);
    });

    test("update (non-integer inputs)", () => {
        const copyProgressParams = {
            copyParams: { srcFilePath: "a", destFilePath: "b" },
            fileSizeBytes: 10000.789,
            startTimeMs: 0
        };

        const progress = new CopyProgress(copyProgressParams);
        progress.update(120.789, 1000.789); // 120.69 bps

        expect(progress.bytesPerSecond).toBe(121);
        expect(progress.bytesWritten).toBe(120.789);
        expect(progress.elapsedSeconds).toBe(1.000789);
        expect(progress.fileSizeBytes).toBe(10000.789);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(1);
    });

    test("update (no elapsed time, non-integer inputs)", () => {
        const copyProgressParams = {
            copyParams: { srcFilePath: "a", destFilePath: "b" },
            fileSizeBytes: 10000.789,
            startTimeMs: 1000.789
        };

        const progress = new CopyProgress(copyProgressParams);
        progress.update(220.789, 1000.789); // 120.69 bps

        expect(progress.bytesPerSecond).toBe(0);
        expect(progress.bytesWritten).toBe(220.789);
        expect(progress.elapsedSeconds).toBe(0);
        expect(progress.fileSizeBytes).toBe(10000.789);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(2);
    });

    test("update (multiple)", () => {
        const copyProgressParams = {
            copyParams: { srcFilePath: "a", destFilePath: "b" },
            fileSizeBytes: 10000,
            startTimeMs: 0
        };

        const progress = new CopyProgress(copyProgressParams);
        progress.update(5, 90); // 55 Bps
        progress.update(100, 100); // 1000 Bps
        progress.update(200, 1000); // 200 Bps
        progress.update(240, 1234); // 194.4 Bps <- median
        progress.update(390, 3000); // 130 Bps

        expect(progress.bytesPerSecond).toBe(194);
        expect(progress.bytesWritten).toBe(390);
        expect(progress.elapsedSeconds).toBe(3.0005);
        expect(progress.fileSizeBytes).toBe(10000);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(3);
    });
});
