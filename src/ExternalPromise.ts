type Resolve<T> = (value: T | PromiseLike<T>) => void;
type Reject = (error: Error) => void;
type Executor<T> = (resolve: Resolve<T>, reject: Reject) => void;

class ExternalPromise<T> {
    public readonly promise: Promise<T>;

    public resolve!: Resolve<T>;

    public reject!: Reject;

    constructor() {
        const executor: Executor<T> = (resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        };

        this.promise = new Promise<T>(executor);
    }
}

export default ExternalPromise;
