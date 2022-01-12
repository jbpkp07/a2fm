import MicrosecondTimer from "../src/MicrosecondTimer";
import DeferredPromise from "./utils/DeferredPromise";

let elapsed: number;

const expectElapsedToBeBetween = (lower: number, upper: number) => {
    expect(elapsed).toBeGreaterThanOrEqual(lower);
    expect(elapsed).toBeLessThanOrEqual(upper);
};

describe("MicrosecondTimer", () => {
    test("no elapsed time w/o start", () => {
        const timer = new MicrosecondTimer();
        elapsed = timer.elapsed();

        expect(elapsed).toBe(0);
    });

    test("elapsed time with start", () => {
        const timer = new MicrosecondTimer();
        timer.start();
        elapsed = timer.elapsed();

        expectElapsedToBeBetween(1, 100);
    });

    test("elapsed time with re-start", async () => {
        const timer = new MicrosecondTimer();
        timer.start();

        const { promise, resolve, reject } = new DeferredPromise<void>();

        const delayedTest = () => {
            try {
                timer.start();
                elapsed = timer.elapsed();

                expectElapsedToBeBetween(1, 100);

                resolve();
            } catch (error) {
                reject(error as Error);
            }
        };

        setTimeout(delayedTest, 10);

        return promise;
    });

    test("multiple", () => {
        const timer = new MicrosecondTimer();
        timer.start();

        const elapsedSequence: readonly number[] = [
            1,
            timer.elapsed(),
            timer.elapsed(),
            timer.elapsed(),
            timer.elapsed(),
            timer.elapsed(),
            timer.elapsed(),
            timer.elapsed(),
            timer.elapsed(),
            timer.elapsed(),
            timer.elapsed(),
            100
        ];

        const byAscOrder = (a: number, b: number) => (a > b ? 1 : -1);

        const expected = [...elapsedSequence].sort(byAscOrder);

        expect(elapsedSequence).toStrictEqual(expected);
    });
});
