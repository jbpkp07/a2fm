import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";
import ValueUnits from "./common/ValueUnits";

const { grayL, grayM, pinkL, pinkM, whiteL, whiteM } = ComponentColors;
const { padNumber } = ComponentUtils;

interface MigrationStatProps {
    readonly stat: ValueUnits;
}

interface MigrationStatParams {
    readonly color: "light" | "medium";
    readonly label: string;
}

class MigrationStat extends BaseComponent<MigrationStatProps> {
    private readonly isLight: boolean;

    private readonly paddedLabel: string;

    private readonly styledLabel: string;

    public length = 0;

    constructor({ color, label }: MigrationStatParams) {
        super();

        this.isLight = color === "light";
        this.paddedLabel = label + " ";
        this.styledLabel = this.isLight ? grayL(this.paddedLabel) : grayM(this.paddedLabel);
    }

    protected createComponent = (): string => {
        const { isLight, paddedLabel, styledLabel } = this;
        const { value, units } = this.props.stat;

        const paddedValue = padNumber(value, 3);
        const paddedUnits = " " + units;

        this.length = paddedLabel.length + paddedValue.length + paddedUnits.length;

        const styledValue = isLight ? pinkL(paddedValue) : pinkM(paddedValue);
        const styledUnits = isLight ? whiteL(paddedUnits) : whiteM(paddedUnits);

        return styledLabel + styledValue + styledUnits;
    };
}

export default MigrationStat;
