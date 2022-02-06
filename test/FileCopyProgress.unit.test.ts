import FileCopyProgress from "../src/filecopier/FileCopyProgress";

describe("FileCopyProgress", () => {
    test("initialization", () => {
        const progress = new FileCopyProgress({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10000 });

        expect(progress.bytesPerSecond).toBe(0);
        expect(progress.bytesWritten).toBe(0);
        expect(progress.elapsedSeconds).toBe(0);
        expect(progress.fileSizeBytes).toBe(10000);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(0);
        expect(progress.fileCopyParams).toStrictEqual({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10000 });
    });

    test("update (timer not started, no provided elapsed time)", () => {
        const progress = new FileCopyProgress({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10000 });
        progress.update(10);

        expect(progress.bytesPerSecond).toBe(0);
        expect(progress.bytesWritten).toBe(10);
        expect(progress.elapsedSeconds).toBe(0);
        expect(progress.fileSizeBytes).toBe(10000);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(0);
    });

    test("update (timer started, no provided elapsed time)", () => {
        const progress = new FileCopyProgress({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10000 });
        progress.startTimer();
        progress.update(10);

        expect(progress.bytesPerSecond).toBe(Math.round(progress.bytesWritten / progress.elapsedSeconds));
        expect(progress.bytesWritten).toBe(10);
        expect(progress.elapsedSeconds).toBeGreaterThan(0);
        expect(progress.elapsedSeconds).toBeLessThan(0.0001);
        expect(progress.fileSizeBytes).toBe(10000);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(0);
    });

    test("update (timer started, provided elapsed time)", () => {
        const progress = new FileCopyProgress({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10000 });
        progress.startTimer();
        progress.update(5031.174256, 500);

        expect(progress.bytesPerSecond).toBe(10062000);
        expect(progress.bytesWritten).toBe(5031);
        expect(progress.elapsedSeconds).toBe(0.0005);
        expect(progress.fileSizeBytes).toBe(10000);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(50);
    });

    test("update (no elapsed time, no bytes written)", () => {
        const progress = new FileCopyProgress({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10000 });
        progress.update(0, 0);

        expect(progress.bytesPerSecond).toBe(0);
        expect(progress.bytesWritten).toBe(0);
        expect(progress.elapsedSeconds).toBe(0);
        expect(progress.fileSizeBytes).toBe(10000);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(0);
    });

    test("update (no elapsed time, bytes written)", () => {
        const progress = new FileCopyProgress({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10000 });
        progress.update(10, 0);

        expect(progress.bytesPerSecond).toBe(0);
        expect(progress.bytesWritten).toBe(10);
        expect(progress.elapsedSeconds).toBe(0);
        expect(progress.fileSizeBytes).toBe(10000);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(0);
    });

    test("update (zero fileSizeBytes, no bytes written)", () => {
        const progress = new FileCopyProgress({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 0 });
        progress.update(0, 500);

        expect(progress.bytesPerSecond).toBe(0);
        expect(progress.bytesWritten).toBe(0);
        expect(progress.elapsedSeconds).toBe(0.0005);
        expect(progress.fileSizeBytes).toBe(0);
        expect(progress.inProgress).toBe(false);
        expect(progress.percentage).toBe(100);
    });

    test("update (zero fileSizeBytes, bytes written)", () => {
        const progress = new FileCopyProgress({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 0 });
        progress.update(10, 500);

        expect(progress.bytesPerSecond).toBe(20000);
        expect(progress.bytesWritten).toBe(10);
        expect(progress.elapsedSeconds).toBe(0.0005);
        expect(progress.fileSizeBytes).toBe(0);
        expect(progress.inProgress).toBe(false);
        expect(progress.percentage).toBe(100);
    });

    test("update (non-integer inputs)", () => {
        const progress = new FileCopyProgress({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10000.789 });
        progress.update(120.789, 1000.789); // 120,693.77 Bps

        expect(progress.bytesPerSecond).toBe(119905);
        expect(progress.bytesWritten).toBe(120);
        expect(progress.elapsedSeconds).toBe(0.001000789);
        expect(progress.fileSizeBytes).toBe(10000.789);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(1);
    });

    test("update (no elapsed time, non-integer inputs)", () => {
        const progress = new FileCopyProgress({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10000.789 });
        progress.update(220.789, 0);

        expect(progress.bytesPerSecond).toBe(0);
        expect(progress.bytesWritten).toBe(220);
        expect(progress.elapsedSeconds).toBe(0);
        expect(progress.fileSizeBytes).toBe(10000.789);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(2);
    });

    test("update (multiple)", () => {
        const progress = new FileCopyProgress({ srcFilePath: "a", destFilePath: "b", fileSizeBytes: 10000 });
        progress.update(5, 90000); // 55 Bps
        progress.update(100, 100000); // 1000 Bps
        progress.update(200, 1000000); // 200 Bps
        progress.update(240, 1234000); // 194.4 Bps <- median
        progress.update(390, 3000000); // 130 Bps

        expect(progress.bytesPerSecond).toBe(194);
        expect(progress.bytesWritten).toBe(390);
        expect(progress.elapsedSeconds).toBe(3);
        expect(progress.fileSizeBytes).toBe(10000);
        expect(progress.inProgress).toBe(true);
        expect(progress.percentage).toBe(3);
    });
});
