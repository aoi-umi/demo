/**
 * Created by bang on 2017-7-29.
 */
var common = require('./common');
var myEnum = exports;
exports.getEnum = function (enumName) {
    var enumType = this.enumDict[enumName];
    if (!enumType) throw new Error('enum "' + enumName + '" not exist!');
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

exports.enumDict = {
    main_content_status_enum: {'-1': '已删除', '0': '草稿', '1': '待审核', '2': '审核中', '3': '通过', '4': '退回',},
};

exports.enumChangeDict = {
    statusEnum: {
        //源状态
        '0': {
            //目标状态
            '0': '',//不可变更
            '1': '状态0变为状态1',
        },
    },
    main_content_status_enum: {
        //初始状态
        '0': {'0': '保存', '1': '提交', '-1': '删除'},
        '1': {'2': '审核', '-1': '删除'},
        '2': {'3': '审核通过', '4': '审核不通过', '-1': '删除'},
        '3': {'-1': '删除'},
        '4': {'-1': '删除'},
    }
};

//状态变更
exports.enumChangeCheck = function (srcEnum, destEnum, enumType) {
    if (enumType == undefined)
        throw new Error('enumType can not be empty!');

    var matchEnum = myEnum.getEnum(enumType);
    var changeDict = myEnum.enumChangeDict[enumType];
    srcEnum = srcEnum.toString();
    destEnum = destEnum.toString();
    if (typeof matchEnum[srcEnum] == 'undefined')
        throw common.error(common.stringFormat('no match src enum [{0}] in [{1}]!', srcEnum, enumType));

    if (typeof matchEnum[destEnum] == 'undefined')
        throw common.error(common.stringFormat('no match dest enum [{0}] in [{1}]!', destEnum, enumType));

    if (!changeDict[srcEnum] || !changeDict[srcEnum][destEnum]) {
        throw common.error(null, 'ENUM_CHANGED_INVALID', {
            //lang:'en',
            format: function (msg) {
                return common.stringFormat(msg,
                    enumType + ':[' + srcEnum + '](' + myEnum.getValue(enumType, srcEnum) + ')',
                    '[' + destEnum + '](' + myEnum.getValue(enumType, destEnum) + ')');
            }
        });
    }
};
