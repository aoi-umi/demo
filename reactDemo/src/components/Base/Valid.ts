export type ValidError = { msg: string };
type ValidatorResult = ValidError | string | void;
export type Validator = (val: any, model: any) => ValidatorResult | Promise<ValidatorResult>;
export type Validators = {
    [key: string]: {
        name?: string;
        validator: Validator[];
    }
}

export const required: Validator = function (val) {
    if (![0, false].includes(val) && !val)
        return 'required';
}