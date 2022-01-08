import MovingMedian from "../src/MovingMedian";

describe("MovingMedian", () => {
    test("bad constructor arg", () => {
        const movMed1 = new MovingMedian(-1);
        const movMed2 = new MovingMedian(0);
        const movMed3 = new MovingMedian(1);
        const movMed4 = new MovingMedian(2.5);
        const movMed5 = new MovingMedian(4294967296);

        const results: number[] = [
            movMed1.push(1),
            movMed1.push(2),
            movMed1.push(3),
            movMed2.push(1),
            movMed2.push(2),
            movMed2.push(3),
            movMed3.push(1),
            movMed3.push(2),
            movMed3.push(3),
            movMed4.push(1),
            movMed4.push(2),
            movMed4.push(3),
            movMed5.push(1),
            movMed5.push(2),
            movMed5.push(3)
        ];

        expect(results).toStrictEqual([1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]);
    });

    test("good constructor arg", () => {
        const movMed = new MovingMedian(5);

        const results: number[] = [
            movMed.push(5),
            movMed.push(10),
            movMed.push(2),
            movMed.push(8),
            movMed.push(4),
            movMed.push(1),
            movMed.push(6),
            movMed.push(3),
            movMed.push(8),
            movMed.push(7),
            movMed.push(9999),
            movMed.push(9999),
            movMed.push(9),
            movMed.push(10),
            movMed.push(9999)
        ];

        expect(results).toStrictEqual([5, 7.5, 5, 6.5, 5, 4, 4, 4, 4, 6, 7, 8, 9, 10, 9999]);
    });
});
