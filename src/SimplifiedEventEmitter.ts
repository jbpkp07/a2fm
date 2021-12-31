import { EventEmitter } from "events";

type Listener = (value?: unknown) => void;

interface EventEmitterOptions {
    captureRejections?: boolean | undefined;
}

abstract class SimplifiedEventEmitter {
    private readonly eventEmitter: EventEmitter;

    constructor(options?: EventEmitterOptions) {
        this.eventEmitter = new EventEmitter(options);
    }

    protected emit(event: string, value?: unknown): boolean {
        return this.eventEmitter.emit(event, value);
    }

    protected listeners(event: string): Function[] {
        return this.eventEmitter.listeners(event);
    }

    protected off(event: string, listener: Listener): this {
        this.eventEmitter.off(event, listener);

        return this;
    }

    protected on(event: string, listener: Listener): this {
        this.eventEmitter.on(event, listener);

        return this;
    }

    protected async wait(event: string): Promise<unknown> {
        const result = await EventEmitter.once(this.eventEmitter, event);
        const [value] = result as [unknown];

        return value;
    }
}

export default SimplifiedEventEmitter;
