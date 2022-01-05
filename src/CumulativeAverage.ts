// class CumulativeAverage {
//     private average = 0;

//     private pushCount = 0;

//     private total = 0;

//     private addToTotal(next: number): void {
//         this.total += next;

//         if (this.total < Number.MIN_SAFE_INTEGER || this.total > Number.MAX_SAFE_INTEGER) {
//             throw new Error("cumulative total is out-of-range");
//         }
//     }

//     public get ave(): number {
//         return this.average;
//     }

//     public push(next: number): number {
//         this.addToTotal(next);
//         this.pushCount += 1;
//         this.average = this.total / this.pushCount;

//         return this.average;
//     }
// }

import Queue from "./Queue";

class CumulativeAverage {
    private readonly history = new Queue<number>();

    private readonly maxLength: number;

    private average = 0;

    // public get ave(): number {
    //     return this.average;
    // }

    constructor(maxLength = 1) {
        if (!Number.isSafeInteger(maxLength) || maxLength <= 0) {
            throw new Error("maxLength is out-of-range");
        }

        this.maxLength = maxLength;
    }

    private addToHistory(next: number): void {
        this.history.enqueue(next);

        if (this.history.length > this.maxLength) {
            this.history.dequeue();
        }
    }

    private setAverage(): void {
        const history = this.history.peekQueue();
        const total = history.reduce((a, b) => a + b);

        if (total < Number.MIN_SAFE_INTEGER || total > Number.MAX_SAFE_INTEGER) {
            throw new Error("cumulative total is out-of-range");
        }

        this.average = total / history.length;
    }

    public push(next: number): number {
        this.addToHistory(next);
        this.setAverage();

        return this.average;
    }
}

export default CumulativeAverage;
