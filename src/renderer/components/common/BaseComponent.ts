import { isDeepStrictEqual as isEqual } from "util";

abstract class BaseComponent<P extends object> {
    private component = "";

    protected props: P = {} as P;

    protected abstract render(): string;

    public create(props: P): string {
        if (!isEqual(this.props, props)) {
            this.props = props;
            this.component = this.render();
        }

        return this.component;
    }
}

export default BaseComponent;
