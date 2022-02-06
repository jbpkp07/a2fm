import NumberUtils from "./common/NumberUtils";
import Queue from "./Queue";

const { ceil, floor, isInteger, isNegative, isPositiveArrayIndex } = NumberUtils;

class MovingMedian {
    private readonly history = new Queue<number>();

    private readonly maxLength: number = 1;

    private _median = 0;

    public get median(): number {
        return this._median;
    }

    constructor(maxLength: number) {
        if (isPositiveArrayIndex(maxLength)) {
            this.maxLength = maxLength;
        }
    }

    private addToHistory(next: number): void {
        this.history.enqueue(next);

        if (this.history.length > this.maxLength) {
            this.history.dequeue();
        }
    }

    private extractMedian(sorted: number[]): number {
        const medianIndex = (sorted.length - 1) / 2;

        if (isNegative(medianIndex)) {
            throw new Error("medianIndex is negative");
        }

        if (isInteger(medianIndex)) {
            return sorted[medianIndex] as number;
        }

        const leftValue = sorted[floor(medianIndex)] as number;
        const rightValue = sorted[ceil(medianIndex)] as number;

        return (leftValue + rightValue) / 2;
    }

    private getSortedHistory(): number[] {
        const history = [...this.history.peekQueue()];
        const byAscOrder = (a: number, b: number) => (a > b ? 1 : -1);

        return history.sort(byAscOrder);
    }

    private setMedian(): void {
        const sorted = this.getSortedHistory();
        this._median = this.extractMedian(sorted);
    }

    public push(next: number): this {
        this.addToHistory(next);
        this.setMedian();

        return this;
    }
}

export default MovingMedian;
