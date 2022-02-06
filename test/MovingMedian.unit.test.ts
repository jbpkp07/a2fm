import MovingMedian from "../src/filecopier/MovingMedian";

describe("MovingMedian", () => {
    test("bad constructor arg", () => {
        const movMed1 = new MovingMedian(-1);
        const movMed2 = new MovingMedian(0);
        const movMed3 = new MovingMedian(1);
        const movMed4 = new MovingMedian(2.5);
        const movMed5 = new MovingMedian(4294967296);

        const results: number[] = [
            movMed1.push(1).median,
            movMed1.push(2).median,
            movMed1.push(3).median,
            movMed2.push(1).median,
            movMed2.push(2).median,
            movMed2.push(3).median,
            movMed3.push(1).median,
            movMed3.push(2).median,
            movMed3.push(3).median,
            movMed4.push(1).median,
            movMed4.push(2).median,
            movMed4.push(3).median,
            movMed5.push(1).median,
            movMed5.push(2).median,
            movMed5.push(3).median
        ];

        expect(results).toStrictEqual([1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]);
    });

    test("good constructor arg", () => {
        const movMed = new MovingMedian(5);

        const results: number[] = [
            movMed.push(5).median,
            movMed.push(10).median,
            movMed.push(2).median,
            movMed.push(8).median,
            movMed.push(4).median,
            movMed.push(1).median,
            movMed.push(6).median,
            movMed.push(3).median,
            movMed.push(8).median,
            movMed.push(7).median,
            movMed.push(9999).median,
            movMed.push(9999).median,
            movMed.push(9).median,
            movMed.push(10).median,
            movMed.push(9999).median
        ];

        expect(results).toStrictEqual([5, 7.5, 5, 6.5, 5, 4, 4, 4, 4, 6, 7, 8, 9, 10, 9999]);
    });
});
