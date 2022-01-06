import Queue from "./Queue";
import validate from "./Validator";

class MovingAverage {
    private readonly history = new Queue<number>();

    private readonly maxLength: number = 1;

    private average = 0;

    public get ave() {
        return this.average;
    }

    constructor(maxLength: number) {
        if (validate(maxLength).isPositiveSafeInteger) {
            this.maxLength = maxLength;
        }
    }

    private addToHistory(next: number): void {
        this.history.enqueue(next);

        if (this.history.length > this.maxLength) {
            this.history.dequeue();
        }
    }

    private getTotal(): number {
        const history = this.history.peekQueue();

        return history.reduce((total, num) => total + num, 0);
    }

    private setAverage(): void {
        const total = this.getTotal();

        if (!validate(total).isSafeNumber) {
            throw new Error("total is out-of-range");
        }

        this.average = total / this.history.length;
    }

    public push(next: number): number {
        this.addToHistory(next);
        this.setAverage();

        return this.average;
    }
}

export default MovingAverage;

const bytesPerSecond = new MovingAverage(10);
bytesPerSecond.push(20);
console.log(bytesPerSecond.ave);
