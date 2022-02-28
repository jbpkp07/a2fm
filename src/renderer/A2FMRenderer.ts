import Header from "./components/Header";
import MigrationIdle from "./components/MigrationIdle";
import MigrationProgress from "./components/MigrationProgress";
import MigrationQueue from "./components/MigrationQueue";
import ConsoleRenderer from "./console/ConsoleRenderer";

// interface A2FMRendererChildProps {
//     progressProps: MigrationProgressProps;
//     queueProps: MigrationQueueProps;
// }

interface A2FMRendererParams {
    readonly cols: number;
    readonly queueLimit: number;
    readonly rows: number;
}

class A2FMRenderer extends ConsoleRenderer {
    // private readonly childProps: A2FMRendererChildProps;

    private readonly header: Header;

    private readonly idle: MigrationIdle;

    private readonly progress: MigrationProgress;

    private readonly queue: MigrationQueue;

    private idleInterval: NodeJS.Timeout | undefined;

    private isIdle = true;

    constructor({ cols, queueLimit, rows }: A2FMRendererParams) {
        super({ cols, rows, hideCursor: true });

        // this.childProps = {
        //     progressProps: {
        //         cols,
        //         destFilePath: "???/???.???",
        //         destFileSize: { value: 0, units: "??" },
        //         elapsedTime: { value: 0, units: "?" },
        //         eta: { value: 0, units: "?" },
        //         percentage: 0,
        //         rate: { value: 0, units: "??/?" },
        //         srcFilePath: "???/???.???",
        //         srcFileSize: { value: 0, units: "??" }
        //     },
        //     queueProps: { queue: [] }
        // };

        const params = { cols, limit: queueLimit, marginCols: 2 };

        this.header = new Header({ ...params, marginCols: 1 });
        this.idle = new MigrationIdle(params);
        this.progress = new MigrationProgress(params);
        this.queue = new MigrationQueue(params);
    }

    private clearIdleInterval(): void {
        if (this.idleInterval) {
            clearInterval(this.idleInterval);
            this.idleInterval = undefined;
        }
    }

    private renderIdleScreen(): void {
        let seconds = 0;

        this.clearIdleInterval();

        this.idleInterval = setInterval(() => {
            seconds += 1;
            const elapsedTime = { value: seconds, units: "s" };
            const screen = this.header.create({}) + this.idle.create({ elapsedTime });

            this.render(screen);

            if (seconds === 10) this.clearIdleInterval();
        }, 1000);
    }

    public updateIsActive(): void {
        this.clearIdleInterval();
        this.isIdle = false;
    }

    public updatedIsIdle(): void {
        this.isIdle = true;
    }

    public createScreen(): string {
        // const { header, progress, queue } = this;
        const { header } = this;

        if (this.isIdle) {
            this.renderIdleScreen();

            return header.create({});
        }

        return "cool";
        // const { progressProps, queueProps } = this.childProps;

        // return header.create({}) + progress.create(progressProps) + queue.create(queueProps);
    }
}

export default A2FMRenderer;
