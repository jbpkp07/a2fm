import { CopyParams, CopyParamsError } from "./CopyParams";
import SimplifiedEventEmitter from "./SimplifiedEventEmitter";

type EventValues = {
    active: undefined;
    change: CopyParams[];
    error: CopyParamsError;
    finish: CopyParams;
    idle: undefined;
    start: CopyParams;
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
