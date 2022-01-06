export class Validator {
    private readonly value: unknown;

    constructor(value: unknown) {
        this.value = value;
    }

    public get isPositiveSafeInteger(): boolean {
        if (typeof this.value !== "number") return false;

        return Number.isSafeInteger(this.value) && this.value > 0;
    }

    public get isSafeInteger(): boolean {
        if (typeof this.value !== "number") return false;

        return Number.isSafeInteger(this.value);
    }

    public get isSafeNumber(): boolean {
        if (typeof this.value !== "number") return false;

        const isAboveMin = this.value >= Number.MIN_SAFE_INTEGER;
        const isBelowMax = this.value <= Number.MAX_SAFE_INTEGER;

        return isAboveMin && isBelowMax;
    }
}

const validate = (value: unknown): Validator => {
    return new Validator(value);
};

export default validate;
