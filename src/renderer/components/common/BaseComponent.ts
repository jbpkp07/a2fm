abstract class BaseComponent<P extends object> {
    private component = "";

    private stringProps?: string = undefined;

    protected props: P = {} as P;

    protected abstract render(): string;

    public create(props: P): string {
        const stringProps = JSON.stringify(props);

        if (this.stringProps !== stringProps) {
            this.stringProps = stringProps;
            this.props = props;
            this.component = this.render();
        }

        return this.component;
    }
}

export default BaseComponent;
