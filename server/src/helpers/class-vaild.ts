import "reflect-metadata";
import { validate, ValidationError, validateSync } from "class-validator";

function getError(e: ValidationError, parent?: string) {
    let property = e.property;
    if (parent)
        property = parent + '.' + property;
    let l = [];
    // console.log(e);
    if (e.constraints) {
        for (let key in e.constraints) {
            l.push(`[${property}]:${e.constraints[key]}`);
        }
    }
    if (e.children.length) {
        e.children.forEach(ele => {
            l = [...l, ...getError(ele, property)];
        });
    }
    return l;
}

export function vaild(data) {
    let errors = validateSync(data, { skipMissingProperties: true });
    // console.log(errors)
    let msg = errors.map(e => {
        let l = getError(e);
        return `${l.join(';')}`;
    });
    return msg;
}