import A2FMRendererProps from "./A2FMRendererProps";
import Header from "./components/Header";
import MigrationIdle from "./components/MigrationIdle";
import MigrationProgress from "./components/MigrationProgress";
import MigrationQueue from "./components/MigrationQueue";
import ConsoleRenderer from "./console/ConsoleRenderer";

import type { ProgressQueueParams } from "./A2FMRendererParams";

interface Components {
    readonly header: Header;
    readonly idle: MigrationIdle;
    readonly progress: MigrationProgress;
    readonly queue: MigrationQueue;
}

class A2FMRenderer extends ConsoleRenderer {
    private readonly components: Components;

    private readonly props: A2FMRendererProps;

    private idleInterval: NodeJS.Timeout | undefined;

    constructor(cols = 151, rows = 40, limit = 10) {
        super({ cols, rows, hideCursor: true });

        this.components = {
            header: new Header({ cols, marginCols: 1 }),
            idle: new MigrationIdle({ cols }),
            progress: new MigrationProgress({ cols, marginCols: 2 }),
            queue: new MigrationQueue({ cols, limit, marginCols: 2 })
        };

        this.props = new A2FMRendererProps(cols);

        this.renderIdleScreen();
    }

    private clearIdleInterval(): void {
        if (!this.idleInterval) return;

        clearInterval(this.idleInterval);

        this.idleInterval = undefined;
    }

    private createIdleScreen(elapsedSeconds: number): string {
        const { header, idle } = this.components;
        const idleProps = this.props.toIdleProps(elapsedSeconds);

        return header.create({}) + idle.create(idleProps);
    }

    private createMigrationScreen(params: ProgressQueueParams): string {
        const { header, progress, queue } = this.components;
        const { progressProps, queueProps } = this.props.toProgressQueueProps(params);

        return header.create({}) + progress.create(progressProps) + queue.create(queueProps);
    }

    public renderIdleScreen(): void {
        if (this.idleInterval) return;

        let elapsedSeconds = 0;

        const renderScreen = () => {
            const screen = this.createIdleScreen(elapsedSeconds);

            this.render(screen);

            elapsedSeconds += 1;
        };

        renderScreen();

        this.idleInterval = setInterval(renderScreen, 1000);
    }

    public renderMigrationScreen(params: ProgressQueueParams): void {
        this.clearIdleInterval();

        const screen = this.createMigrationScreen(params);

        this.render(screen);
    }
}

export default A2FMRenderer;
