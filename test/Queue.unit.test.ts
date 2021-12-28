import Queue from "../src/Queue";

const expectQueueProperties = <T>(queue: Queue<T>, queueContents: T[]) => {
    const { length } = queueContents;
    const isEmpty = queueContents.length === 0;

    expect(queue).toEqual({ queue: queueContents });
    expect(queue).toHaveLength(length);
    expect(queue.isEmpty).toBe(isEmpty);
};

test("Queue initialization", () => {
    const queue = new Queue<number>();
    const peeked = queue.peek();
    const dequeued = queue.dequeue();

    expectQueueProperties(queue, []);
    expect(peeked).toBeUndefined();
    expect(dequeued).toBeUndefined();
});

test("Queue usage", () => {
    const queue = new Queue<number>();
    const peeked: (number | undefined)[] = [];
    const dequeued: (number | undefined)[] = [];

    queue.enqueue(1).enqueue(2).enqueue(3);

    expectQueueProperties(queue, [1, 2, 3]);

    peeked.push(queue.peek());
    dequeued.push(queue.dequeue());

    expectQueueProperties(queue, [2, 3]);

    queue.enqueue(4);

    expectQueueProperties(queue, [2, 3, 4]);

    peeked.push(queue.peek());
    dequeued.push(queue.dequeue());

    expectQueueProperties(queue, [3, 4]);

    peeked.push(queue.peek());
    dequeued.push(queue.dequeue());

    expectQueueProperties(queue, [4]);

    peeked.push(queue.peek());
    dequeued.push(queue.dequeue());

    expectQueueProperties(queue, []);

    peeked.push(queue.peek());
    dequeued.push(queue.dequeue());

    expectQueueProperties(queue, []);
    expect(peeked).toEqual([1, 2, 3, 4, undefined]);
    expect(dequeued).toEqual([1, 2, 3, 4, undefined]);
});
