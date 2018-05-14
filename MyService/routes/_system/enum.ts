import config from '../../config';
import * as common from './common';
import errorConfig from './errorConfig';

export let enumDict = {};
export let enumChangeDict = {};

export let init = function (opt) {
    enumDict = opt.enumDict;
    enumChangeDict = opt.enumChangeDict;
};

export let getEnum = function (enumName, notThrowError?) {
    var enumType = enumDict[enumName];
    if (!enumType && !notThrowError) throw common.error('enum "' + enumName + '" not exist!', errorConfig.CODE_ERROR);
    return enumType;
};

export let getKey = function (enumName, value) {
    var enumType = this.getEnum(enumName);
    for (var i in enumType) {
        if (enumType[i] == value) return i;
    }
    return '';
};

export let getValue = function (enumName, key) {
    var enumType = this.getEnum(enumName);
    return enumType[key];
};

//状态变更
export let enumChangeCheck = function (enumType, srcEnum, destEnum) {
    if (enumType == undefined)
        throw common.error('enumType can not be empty!');

    var enumOperateType = enumType + 'Operate';
    var matchEnum = getEnum(enumType);
    var operateEnum = getEnum(enumOperateType, true);
    var changeDict = enumChangeDict[enumType];
    if (srcEnum == undefined || srcEnum == null || destEnum == undefined || destEnum == null)
        throw common.error('', 'ARGS_ERROR');
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
        var srcEnumName = getValue(enumType, srcEnum) || getValue(enumOperateType, srcEnum);
        var destEnumName = getValue(enumType, destEnum) || getValue(enumOperateType, destEnum);
        throw common.error(null, errorConfig.ENUM_CHANGED_INVALID, {
            //lang:'en',
            format: function (msg) {
                if (config.env == 'dev') {
                    return common.stringFormat(msg,
                        `${enumType}:` + `[${srcEnum}](${srcEnumName})`,
                        `[${destEnum}](${destEnumName})`);
                } else {
                    return common.stringFormat(msg,
                        `[${srcEnumName}]`,
                        `[${destEnumName}]`);
                }
            }
        });
    }
};
