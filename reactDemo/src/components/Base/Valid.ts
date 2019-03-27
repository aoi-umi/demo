export type ValidError = { msg: string };
type ValidatorResult = ValidError | string | void;
export type Validator<T=any> = (val: any, field: T, model: any) => ValidatorResult | Promise<ValidatorResult>;
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