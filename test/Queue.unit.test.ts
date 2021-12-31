import Queue from "../src/Queue";

const queue = new Queue<number>();

const expectQueueToEqual = <T>(queueContents: T[]) => {
    const { length } = queueContents;
    const isEmpty = length === 0;

    expect(queue).toEqual({ queue: queueContents });
    expect(queue).toHaveLength(length);
    expect(queue.isEmpty).toEqual(isEmpty);
};

describe("Queue", () => {
    test("initializes empty", () => {
        expectQueueToEqual([]);
    });

    test("enqueue", () => {
        queue.enqueue(1).enqueue(2).enqueue(3);

        expectQueueToEqual([1, 2, 3]);
    });

    test("peek", () => {
        const item = queue.peek();

        expect(item).toBe(1);
        expectQueueToEqual([1, 2, 3]);
    });

    test("peekQueue", () => {
        const contents = queue.peekQueue();

        expect(contents).toEqual([1, 2, 3]);
        expectQueueToEqual([1, 2, 3]);
    });

    test("dequeue", () => {
        const item = queue.dequeue();

        expect(item).toBe(1);
        expectQueueToEqual([2, 3]);
    });

    test("mixed usage", () => {
        const peeked: (number | undefined)[] = [];
        const dequeued: (number | undefined)[] = [];

        queue.enqueue(4);

        for (let n = 1; n <= 4; n++) {
            peeked.push(queue.peek());
            dequeued.push(queue.dequeue());
        }

        queue.enqueue(5).enqueue(6);

        peeked.push(queue.peek());
        dequeued.push(queue.dequeue());

        expect(peeked).toEqual([2, 3, 4, undefined, 5]);
        expect(dequeued).toEqual([2, 3, 4, undefined, 5]);
        expectQueueToEqual([6]);
    });
});
