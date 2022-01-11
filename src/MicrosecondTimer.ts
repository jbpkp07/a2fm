import { hrtime } from "process";

const getNanoseconds = hrtime.bigint.bind(hrtime);

class MicrosecondTimer {
    private isStarted = false;

    private startNanoseconds = 0n;

    public start = (): void => {
        this.isStarted = true;
        this.startNanoseconds = getNanoseconds();
    };

    public elapsed = (): number => {
        return this.isStarted ? Number((getNanoseconds() - this.startNanoseconds) / 1000n) : 0;
    };
}

export default MicrosecondTimer;
