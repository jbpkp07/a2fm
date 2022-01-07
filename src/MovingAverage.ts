import Queue from "./Queue";
import validate from "./Validator";

class MovingMedian {
    private readonly history = new Queue<number>();

    private readonly maxLength: number = 1;

    private historyMedian = 0;

    public get median(): number {
        return this.historyMedian;
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

    private extractMedian(sorted: number[]): number {
        const medianIndex = (sorted.length - 1) / 2;

        if (validate(medianIndex).isSafeInteger) {
            return sorted[medianIndex] as number;
        }

        const leftValue = sorted[Math.floor(medianIndex)] as number;
        const rightValue = sorted[Math.ceil(medianIndex)] as number;

        return (leftValue + rightValue) / 2;
    }

    private getSortedHistory(): number[] {
        const history = [...this.history.peekQueue()];
        const byAscOrder = (a: number, b: number) => (a > b ? 1 : -1);

        return history.sort(byAscOrder);
    }

    private setHistoryMedian(): void {
        const sorted = this.getSortedHistory();
        this.historyMedian = this.extractMedian(sorted);
    }

    public push(next: number): number {
        this.addToHistory(next);
        this.setHistoryMedian();

        return this.historyMedian;
    }
}

export default MovingMedian;
