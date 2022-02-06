class Queue<T> {
    private readonly queue: T[] = [];

    public get isEmpty(): boolean {
        return this.queue.length === 0;
    }

    public get length(): number {
        return this.queue.length;
    }

    public dequeue(): T | undefined {
        return this.queue.shift();
    }

    public enqueue(item: T): this {
        this.queue.push(item);

        return this;
    }

    public peek(): T | undefined {
        return this.queue[0];
    }

    public peekQueue(): readonly T[] {
        return this.queue;
    }
}

export default Queue;
