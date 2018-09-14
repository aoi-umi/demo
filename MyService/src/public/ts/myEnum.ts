import * as common from './common';
import { enumerable } from './common';
import errorConfig from './errorConfig';

export type MyEnumInstance<T1, T2> = {
    [P in keyof T1]?: EnumInstance<T1, T1[P]> & T1[P]
} & MyEnum<T1, T2>;

class EnumInstance<T1, T2> {
    readonly enumName: keyof T1;
    readonly instance: MyEnumInstance<T1, any>;

    constructor(enumName: keyof T1, instance: MyEnumInstance<T1, any>) {
        Object.defineProperties(this, {
            enumName: {
                enumerable: false,
                value: enumName
            },
            instance: {
                enumerable: false,
                value: instance
            }
        });

        let clone = common.clone(this.instance.enumDict[enumName]);
        for (let key in clone) {
            this[key as string] = clone[key];
        }
    }

    getKey(value: T2[keyof T2]) {
        return this.instance.getKey(this.enumName, value as any);
    }

    getName(value: T2[keyof T2]) {
        return this.instance.getName(this.enumName, value as any);
    }

    getValue(key: keyof T2) {
        return this.instance.getValue(this.enumName, key as any);
    }

    enumChangeCheck(srcEnum, destEnum) {
        return this.instance.enumChangeCheck(this.enumName, srcEnum, destEnum);
    }
}

enumerable(false)(EnumInstance.prototype, 'getKey');
enumerable(false)(EnumInstance.prototype, 'getName');
enumerable(false)(EnumInstance.prototype, 'getValue');
enumerable(false)(EnumInstance.prototype, 'enumChangeCheck');

type EnumKey<T> = Extract<keyof T[keyof T], string>;
type EnumValue<T> = T[keyof T][EnumKey<T>];

export class MyEnum<T1, T2>{
    static createInstance<T1, T2>(enumDict: T1, enumChangeDict?: T2) {
        let instance: MyEnumInstance<T1, T2> = new MyEnum(enumDict, enumChangeDict) as any;
        for (let enumName in enumDict) {
            instance[enumName] = new EnumInstance(enumName, instance) as any;
        }

        return instance;
    }
    constructor(public enumDict: T1, public enumChangeDict: T2 = {} as any) {

    }
    getEnum(enumName: keyof T1, notThrowError?: boolean) {
        var enumType = this.enumDict[enumName];
        if (!enumType && !notThrowError) throw common.error(`enum "${enumName}" not exist!`, errorConfig.CODE_ERROR);
        return enumType;
    }
    isInEnum(enumName: keyof T1, value: EnumValue<T1>, notThrowError?: boolean) {
        return this.getKey(enumName, value, notThrowError) === null ? false : true;
    }
    getKey(enumName: keyof T1, value: EnumValue<T1>, notThrowError?: boolean) {
        var enumType = this.getEnum(enumName, notThrowError);
        for (var i in enumType) {
            if (enumType[i] == value) {
                return i;
            }
        }
        return null;
    }
    getName(enumName: keyof T1, value: EnumValue<T1>, notThrowError?: boolean) {
        return this.getKey(enumName, value, notThrowError);
    }
    getValue(enumName: keyof T1, key: EnumKey<T1>, notThrowError?: boolean) {
        var enumType = this.getEnum(enumName, notThrowError);
        return enumType[key];
    }

    enumChangeCheck(enumType: keyof T1, srcEnum, destEnum) {
        if (enumType == undefined)
            throw common.error('enumType can not be empty!');

        var enumOperateType = enumType + 'Operate';
        var changeDict = this.enumChangeDict[enumType as any];
        if (srcEnum == undefined || srcEnum == null || destEnum == undefined || destEnum == null)
            throw common.error('', errorConfig.ARGS_ERROR);
        srcEnum = srcEnum.toString();
        destEnum = destEnum.toString();

        var srcEnumName = this.getName(enumType, srcEnum, true);
        var destEnumName = this.getName(enumType, destEnum, true) || this.getName(enumOperateType as any, destEnum, true);
        if (srcEnumName === null)
            throw common.error(common.stringFormat('no match src enum [{0}] in [{1}]!', srcEnum, enumType), errorConfig.CODE_ERROR);

        if (destEnumName === null)
            throw common.error(common.stringFormat('no match dest enum [{0}] in [{1}]!', destEnum, enumType), errorConfig.CODE_ERROR);

        if (!changeDict[srcEnum] || !changeDict[srcEnum][destEnum]) {
            throw common.error(null, errorConfig.ENUM_CHANGED_INVALID, {
                format: function (msg) {
                    return common.stringFormat(msg,
                        `${enumType}:` + `[${srcEnum}](${srcEnumName})`,
                        `[${destEnum}](${destEnumName})`);
                }
            });
        }
    }
}