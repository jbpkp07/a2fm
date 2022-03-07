import SimplifiedEventEmitter from "../common/SimplifiedEventEmitter";
import FileCopyParams from "./FileCopyParams";
import FileCopyParamsError from "./FileCopyParamsError";
import FileCopyProgress from "./FileCopyProgress";

interface Update {
    readonly progress: FileCopyProgress;
    readonly queue: readonly FileCopyParams[];
}

// prettier-ignore
type EventValues = {
    readonly "active": undefined;
    readonly "copy:start": Update;
    readonly "copy:progress": Update;
    readonly "copy:finish": Update;
    readonly "enqueue": Update;
    readonly "error": FileCopyParamsError; 
    readonly "idle": undefined;
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
export type { Events, Update };
