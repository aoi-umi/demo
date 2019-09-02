import { ClassType } from "class-transformer/ClassTransformer";

export function arrayTransform(value: any, cls: ClassType<any>) {
    return value instanceof Array ? value.map(ele => new cls(ele)) : value;
}