import FileCopyParams from "./FileCopyParams";
import FileCopyProgress from "./FileCopyProgress";
import SimplifiedEventEmitter from "./SimplifiedEventEmitter";

// prettier-ignore
type EventValues = {
    readonly "start": FileCopyParams;
    readonly "progress": FileCopyProgress;
    readonly "finish": FileCopyParams;
};
type Events = keyof EventValues;
type EventListener<E extends Events> = (value: EventValues[E]) => void;

interface FileCopyEventEmitter {
    emit<E extends Events>(event: E, value: EventValues[E]): boolean;
    listeners<E extends Events>(event: E): EventListener<E>[];
    off<E extends Events>(event: E, listener: EventListener<E>): this;
    on<E extends Events>(event: E, listener: EventListener<E>): this;
    wait<E extends Events>(event: E): Promise<EventValues[E]>;
}

class FileCopyEventEmitter extends SimplifiedEventEmitter {}

export default FileCopyEventEmitter;
