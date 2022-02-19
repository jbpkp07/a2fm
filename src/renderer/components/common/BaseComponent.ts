import { isDeepStrictEqual as isEqual } from "util";

abstract class BaseComponent<P extends object> {
    private component = "";

    protected props: P = {} as P;

    protected abstract createComponent(): string;

    public create = (props: P): string => {
        if (!isEqual(this.props, props)) {
            this.props = props;
            this.component = this.createComponent();
        }

        return this.component;
    };
}

export default BaseComponent;
