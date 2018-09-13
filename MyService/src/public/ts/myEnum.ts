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
            }
        });
        let clone = common.clone(this.instance.enumDict[enumName]);
        for (let key in clone) {
            this[key as string] = clone[key];
        }
    }
    getKey: (value) => any;
    getValue: (key) => any;
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
}