import SimplifiedEventEmitter from "../common/SimplifiedEventEmitter";

interface FileReady {
    readonly srcFilePath: string;
    readonly fileSizeBytes: number;
}

// prettier-ignore
type EventValues = {
    readonly "file:ready": FileReady;
    readonly "error": unknown; 
};
type Events = keyof EventValues;
type EventListener<E extends Events> = (value: EventValues[E]) => void;

interface SrcFilesWatchEventEmitter {
    emit<E extends Events>(event: E, value: EventValues[E]): boolean;
    listeners<E extends Events>(event: E): EventListener<E>[];
    off<E extends Events>(event: E, listener: EventListener<E>): this;
    on<E extends Events>(event: E, listener: EventListener<E>): this;
    wait<E extends Events>(event: E): Promise<EventValues[E]>;
}

class SrcFilesWatchEventEmitter extends SimplifiedEventEmitter {}

export default SrcFilesWatchEventEmitter;
export type { Events };
