export * from './utils';
import * as _convert from './convert';
export const convert = _convert;

export const mathjs = {
    round(x: number, n?: number) {
        if (n) {
            let r = 10 ** n;
            return Math.round(x * r) / r;
        }
        return Math.round(x);
    }
};