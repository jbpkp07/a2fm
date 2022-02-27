import BaseComponent from "./common/BaseComponent";
import ComponentColors from "./common/ComponentColors";
import ComponentUtils from "./common/ComponentUtils";
import ValueUnits from "./common/ValueUnits";

const { grayL, grayM, pinkL, pinkM, whiteL, whiteM } = ComponentColors;
const { padNumber } = ComponentUtils;

type MigrationStatProps = ValueUnits;

interface MigrationStatParams {
    readonly color: "light" | "medium";
    readonly label?: string;
}

class MigrationStat extends BaseComponent<MigrationStatProps> {
    private readonly isLight: boolean;

    private readonly styledLabel: string;

    constructor({ color, label }: MigrationStatParams) {
        super();

        const paddedLabel = label ? label + " " : "";

        this.isLight = color === "light";
        this.styledLabel = this.isLight ? grayL(paddedLabel) : grayM(paddedLabel);
    }

    protected createComponent = (): string => {
        const { isLight, styledLabel } = this;
        const { value, units } = this.props;

        const paddedValue = padNumber(value, 3);
        const paddedUnits = " " + units;

        const styledValue = isLight ? pinkL(paddedValue) : pinkM(paddedValue);
        const styledUnits = isLight ? whiteL(paddedUnits) : whiteM(paddedUnits);

        return styledLabel + styledValue + styledUnits;
    };
}

export default MigrationStat;
