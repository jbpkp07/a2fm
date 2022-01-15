import CopyParams from "./CopyParams";
import FileCopyParamsError from "./FileCopyParamsError";
import FileCopyProgress from "./FileCopyProgress";
import SimplifiedEventEmitter from "./SimplifiedEventEmitter";

// prettier-ignore
type EventValues = {
    readonly "active": undefined;
    readonly "copy:start": CopyParams;
    readonly "copy:progress": FileCopyProgress;
    readonly "copy:finish": CopyParams;
    readonly "error": FileCopyParamsError; 
    readonly "idle": undefined;
    readonly "queue": readonly CopyParams[];
};
type Events = keyof EventValues;
type EventListener<E extends Events> = (value: EventValues[E]) => void;

interface SequentialFileCopyEventEmitter {
    emit<E extends Events>(event: E, value: EventValues[E]): boolean;
    listeners<E extends Events>(event: E): EventListener<E>[];
    off<E extends Events>(event: E, listener: EventListener<E>): this;
    on<E extends Events>(event: E, listener: EventListener<E>): this;
    wait<E extends Events>(event: E): Promise<EventValues[E]>;
}

class SequentialFileCopyEventEmitter extends SimplifiedEventEmitter {}

export default SequentialFileCopyEventEmitter;
