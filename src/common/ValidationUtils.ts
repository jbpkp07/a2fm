class ValidationUtils {
    private constructor() {}

    public static isNullableString = (value: unknown): boolean => {
        const { isString } = this;

        return isString(value) || value === null;
    };

    public static isObject = (value: unknown): boolean => {
        return !!value && typeof value === "object" && !Array.isArray(value);
    };

    public static isObjectArray = (value: unknown): boolean => {
        const { isObject } = this;

        return Array.isArray(value) && value.every(isObject);
    };

    public static isString = (value: unknown): boolean => {
        return typeof value === "string";
    };

    public static isStringArray = (value: unknown): boolean => {
        const { isString } = this;

        return Array.isArray(value) && value.every(isString);
    };
}

export default ValidationUtils;
