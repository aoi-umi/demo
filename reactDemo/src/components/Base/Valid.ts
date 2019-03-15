export type ValidError = { msg: string };
export type Validator<T=any> = (val: any, field: T) => ValidError | string | void;
export type Validators<T> = {
    [key: string]: {
        name?: string;
        validator: Validator<T>[];
    }
}

export const required: Validator = function (val) {
    if (![0, false].includes(val) && !val)
        return 'required';
}