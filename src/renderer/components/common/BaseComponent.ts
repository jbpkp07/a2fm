import { isDeepStrictEqual as isEqual } from "util";

type Props<P> = Record<keyof P, unknown>;
type EmptyProps = Record<string, never>;

abstract class BaseComponent<P extends Props<P> = EmptyProps> {
    private component = "";

    private hasCreatedOnce = false;

    protected props: P = {} as P;

    protected abstract createComponent: () => string;

    public create = (props: P): string => {
        const hasToCreate = !this.hasCreatedOnce || !isEqual(this.props, props);

        if (hasToCreate) {
            this.hasCreatedOnce = true;
            this.props = props;
            this.component = this.createComponent();
        }

        return this.component;
    };
}

export default BaseComponent;
