import config from '../../config';
import * as common from './common';
import errorConfig from './errorConfig';

export type MyEnumInstance<T1, T2> = {
    [P in keyof T1]?: EnumInstance<T1>
} & MyEnum<T1, T2>;

class EnumInstance<T1> {
    private enumName: keyof T1;
    private instance: MyEnumInstance<T1, any>;
    constructor(enumName: keyof T1, instance: MyEnumInstance<T1, any>) {
        function getKey(value) {
            return this.instance.getKey(this.enumName, value);
        }
        function getValue(key) {
            return this.instance.getValue(this.enumName, key);
        }
        function enumChangeCheck(srcEnum, destEnum) {
            return this.instance.enumChangeCheck(this.enumName, srcEnum, destEnum);
        }
        Object.defineProperties(this, {
            enumName: {
                enumerable: false,
                value: enumName
            },
            instance: {
                enumerable: false,
                value: instance
            },
            getKey: {
                enumerable: false,
                value: getKey
            },
            getValue: {
                enumerable: false,
                value: getValue
            },
            enumChangeCheck: {
                enumerable: false,
                value: enumChangeCheck
            }
        });
        let clone = common.clone(this.instance.enumDict[enumName]);
        for (let key in clone) {
            this[key as string] = clone[key];
        }
    }

    getKey: (value) => any;
    getValue: (key) => any;
    enumChangeCheck: (srcEnum, destEnum) => void;
}

export class MyEnum<T1, T2>{
    static createInstance<T1, T2>(enumDict: T1, enumChangeDict: T2) {
        let instance: MyEnumInstance<T1, T2> = new MyEnum(enumDict, enumChangeDict) as any;
        for (let enumName in enumDict) {
            instance[enumName] = new EnumInstance(enumName, instance) as any;
        }

        return instance;
    }
    constructor(public enumDict: T1, public enumChangeDict: T2) {

    }
    getEnum(enumName: keyof T1, notThrowError?) {
        var enumType = this.enumDict[enumName];
        if (!enumType && !notThrowError) throw common.error('enum "' + enumName + '" not exist!', errorConfig.CODE_ERROR);
        return enumType;
    }
    getKey(enumName: keyof T1, value) {
        var enumType = this.getEnum(enumName);
        for (var i in enumType) {
            if (enumType[i] == value) return i;
        }
        return '';
    }
    getValue(enumName: keyof T1, key) {
        var enumType = this.getEnum(enumName);
        return enumType[key];
    }

    enumChangeCheck(enumType: keyof T1, srcEnum, destEnum) {
        if (enumType == undefined)
            throw common.error('enumType can not be empty!');

        var enumOperateType = enumType + 'Operate';
        var matchEnum = this.getEnum(enumType);
        var operateEnum = this.getEnum(enumOperateType as any, true);
        var changeDict = this.enumChangeDict[enumType as any];
        if (srcEnum == undefined || srcEnum == null || destEnum == undefined || destEnum == null)
            throw common.error('', errorConfig.ARGS_ERROR);
        srcEnum = srcEnum.toString();
        destEnum = destEnum.toString();
        var undefinedOrNull = [undefined, null];
        if (common.isInArray(matchEnum[srcEnum], undefinedOrNull)
            && (!operateEnum && common.isInArray(operateEnum[srcEnum], undefinedOrNull))
        )
            throw common.error(common.stringFormat('no match src enum [{0}] in [{1}]!', srcEnum, enumType), errorConfig.CODE_ERROR);

        if (common.isInArray(matchEnum[destEnum], undefinedOrNull)
            && (!operateEnum && common.isInArray(operateEnum[destEnum], undefinedOrNull))
        )
            throw common.error(common.stringFormat('no match dest enum [{0}] in [{1}]!', destEnum, enumType), errorConfig.CODE_ERROR);

        if (!changeDict[srcEnum] || !changeDict[srcEnum][destEnum]) {
            var srcEnumName = this.getValue(enumType, srcEnum) || this.getValue(enumOperateType as any, srcEnum);
            var destEnumName = this.getValue(enumType, destEnum) || this.getValue(enumOperateType as any, destEnum);
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