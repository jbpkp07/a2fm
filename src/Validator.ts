export class Validator {
    private readonly value: unknown;

    constructor(value: unknown) {
        this.value = value;
    }

    public get isPositiveSafeInteger(): boolean {
        if (typeof this.value !== "number") return false;

        return this.isSafeInteger && this.value > 0;
    }

    public get isSafeInteger(): boolean {
        if (typeof this.value !== "number") return false;

        return Number.isSafeInteger(this.value);
    }

    public get isSafeNumber(): boolean {
        if (typeof this.value !== "number") return false;

        return this.value >= Number.MIN_SAFE_INTEGER && this.value <= Number.MAX_SAFE_INTEGER;
    }
}

const validate = (value: unknown): Validator => {
    return new Validator(value);
};

export default validate;

const value = Number.MIN_SAFE_INTEGER;

if (validate(value).isPositiveSafeInteger) {
    console.log("valid");
} else {
    console.log("Invalid");
}

if (validate(value).isSafeInteger) {
    console.log("valid");
} else {
    console.log("Invalid");
}

if (validate(value).isSafeNumber) {
    console.log("valid");
} else {
    console.log("Invalid");
}
