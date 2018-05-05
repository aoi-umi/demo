/**
 * Created by bang on 2017-7-29.
 */
var config = require('../../config');
var common = require('./common');
var errorConfig = require('./errorConfig');
var myEnum = exports;

exports.enumDict = {};
exports.enumChangeDict = {};

exports.init = function (opt) {
    myEnum.enumDict = opt.enumDict;
    myEnum.enumChangeDict = opt.enumChangeDict;
};

exports.getEnum = function (enumName, notThrowError) {
    var enumType = myEnum.enumDict[enumName];
    if (!enumType && !notThrowError) throw common.error('enum "' + enumName + '" not exist!', errorConfig.CODE_ERROR);
    return enumType;
};

exports.getKey = function (enumName, value) {
    var enumType = this.getEnum(enumName);
    for (var i in enumType) {
        if (enumType[i] == value) return i;
    }
    return '';
};

exports.getValue = function (enumName, key) {
    var enumType = this.getEnum(enumName);
    return enumType[key];
};

//状态变更
exports.enumChangeCheck = function (enumType, srcEnum, destEnum) {
    if (enumType == undefined)
        throw common.error('enumType can not be empty!');

    var enumOperateType = enumType + 'Operate';
    var matchEnum = myEnum.getEnum(enumType);
    var operateEnum = myEnum.getEnum(enumOperateType, true);
    var changeDict = myEnum.enumChangeDict[enumType];
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
        var srcEnumName = myEnum.getValue(enumType, srcEnum) || myEnum.getValue(enumOperateType, srcEnum);
        var destEnumName = myEnum.getValue(enumType, destEnum) || myEnum.getValue(enumOperateType, destEnum);
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
